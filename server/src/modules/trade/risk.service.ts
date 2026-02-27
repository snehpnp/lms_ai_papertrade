import { prisma } from '../../utils/prisma';
import { PositionStatus } from '@prisma/client';
import { tradeService } from './trade.service';
import { aliceBlueWS } from '../market/aliceblue.ws';
import redis from '../../utils/redis';

const REDIS_POS_KEY = 'trading:open_positions';

/**
 * Risk Engine Service
 * Handles: Target, Stop Loss (SL), Trailing Stop Loss (TSL), and Expiry.
 * Architecture: Independent worker loop that monitors open positions.
 */
export class RiskEngine {
    private static isRunning = false;
    private static interval: NodeJS.Timeout | null = null;
    private static EXPIRY_CHECK_FREQ = 60 * 60 * 1000; // 1 hour
    private static RISK_CHECK_FREQ = 2000; // 2 seconds (can be increased for lower latency)

    static async init() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[RiskEngine] Initializing background worker...');

        // 1. Initial Sync from DB to Redis
        await this.syncPositionsToRedis();

        // 2. Risk Check Loop (Read from Redis)
        this.interval = setInterval(() => this.runRiskCheck(), this.RISK_CHECK_FREQ);

        // 3. Periodic Full Sync (every 5 mins to ensure data integrity)
        setInterval(() => this.syncPositionsToRedis(), 5 * 60 * 1000);

        // 4. Expiry Check
        await this.runExpiryCheck();
        setInterval(() => this.runExpiryCheck(), this.EXPIRY_CHECK_FREQ);
    }

    /** 
     * Syncs all OPEN positions from Postgres to Redis cache
     */
    private static async syncPositionsToRedis() {
        try {
            const openPositions = await prisma.position.findMany({
                where: { status: PositionStatus.OPEN },
                include: { user: { select: { id: true, name: true } } }
            });

            await redis.del(REDIS_POS_KEY);
            if (openPositions.length > 0) {
                const data = openPositions.map(p => JSON.stringify(p));
                await redis.sadd(REDIS_POS_KEY, ...data);

                // Ensure all symbols for open positions are subscribed for live price updates
                const uniqueSymbols = [...new Set(openPositions.map(p => p.symbol.toUpperCase()))];
                const symbolDetails = await prisma.symbol.findMany({
                    where: { tradingSymbol: { in: uniqueSymbols } },
                    select: { exchange: true, token: true }
                });
                await aliceBlueWS.ensureSymbolsSubscribed(symbolDetails);
            }
            console.log(`[RiskEngine] Synced ${openPositions.length} positions and subscribed to ${openPositions.length} symbols`);
        } catch (error) {
            console.error('[RiskEngine] Redis sync error:', error);
        }
    }

    /**
     * Main Risk Check Logic
     * Monitors active open positions for Target/SL/TSL triggers
     */
    private static async runRiskCheck() {
        try {
            // Read from Redis instead of Postgres
            const cachedPositions = await redis.smembers(REDIS_POS_KEY);
            if (!cachedPositions || cachedPositions.length === 0) return;

            const openPositions = cachedPositions.map(p => JSON.parse(p));

            // 2. Process each position
            for (const pos of openPositions) {
                // Find exchange + token for this symbol to get LTP
                const symbolInfo = await prisma.symbol.findFirst({
                    where: { tradingSymbol: pos.symbol.toUpperCase() }
                });

                if (!symbolInfo) continue;

                const latest = aliceBlueWS.getLatestPrice(symbolInfo.exchange, symbolInfo.token);
                if (!latest || !latest.lp) continue;

                const ltp = parseFloat(latest.lp);
                const side = pos.side;
                const avgPrice = Number(pos.avgPrice);
                const target = pos.target ? Number(pos.target) : null;
                const sl = pos.stopLoss ? Number(pos.stopLoss) : null;

                let shouldExit = false;
                let exitReason = '';

                // Check Target
                if (target) {
                    if (side === 'BUY' && ltp >= target) {
                        shouldExit = true;
                        exitReason = `Target Hit (₹${target})`;
                    } else if (side === 'SELL' && ltp <= target) {
                        shouldExit = true;
                        exitReason = `Target Hit (₹${target})`;
                    }
                }

                // Check SL
                if (!shouldExit && sl) {
                    if (side === 'BUY' && ltp <= sl) {
                        shouldExit = true;
                        exitReason = `Stop Loss Hit (₹${sl})`;
                    } else if (side === 'SELL' && ltp >= sl) {
                        shouldExit = true;
                        exitReason = `Stop Loss Hit (₹${sl})`;
                    }
                }

                // TSL (Trailing SL) - Simple logic: if price moves significantly in favor, move SL
                // (Implementation can be added here)

                if (shouldExit) {
                    console.log(`[RiskEngine] Exiting Position ${pos.id} for user ${pos.user.name}: ${exitReason}`);
                    await tradeService.closePosition(pos.userId, pos.id, ltp, exitReason);

                    // Remove from Redis immediately after closing
                    await redis.srem(REDIS_POS_KEY, JSON.stringify(pos));
                }
            }
        } catch (error) {
            console.error('[RiskEngine] Risk check error:', error);
        }
    }

    /**
     * Expiry Check Logic
     * Automatically exits expired derivative positions (Options/Futures)
     */
    private static async runExpiryCheck() {
        try {
            const now = new Date();
            console.log(`[RiskEngine] Running Expiry Check at ${now.toISOString()}`);

            // Find open positions where symbol expiry has passed
            // We look for positions where the associated symbol in Alice Blue Master has an expiry < current time
            const openPositions = await prisma.position.findMany({
                where: { status: PositionStatus.OPEN }
            });

            for (const pos of openPositions) {
                const symbolInfo = await prisma.symbol.findFirst({
                    where: { tradingSymbol: pos.symbol.toUpperCase() }
                });

                if (symbolInfo?.expiry && new Date(symbolInfo.expiry) < now) {
                    console.log(`[RiskEngine] Expiry reached for ${pos.symbol} (Expiry: ${symbolInfo.expiry}). Auto-exiting...`);

                    // Fetch final LTP before closing
                    const ltp = await tradeService.fetchLivePrice(symbolInfo.id, symbolInfo.tradingSymbol);
                    if (ltp > 0) {
                        await tradeService.closePosition(pos.userId, pos.id, ltp, 'Auto Square-off (Expiry)');
                    } else {
                        // Fallback if LTP can't be fetched (use avg price or something moderate if urgent, 
                        // but usually market-close settling happens at market close)
                        console.warn(`[RiskEngine] Could not fetch final LTP for expired symbol ${pos.symbol}, retrying later.`);
                    }
                }
            }
        } catch (error) {
            console.error('[RiskEngine] Expiry check error:', error);
        }
    }

    static stop() {
        if (this.interval) clearInterval(this.interval);
        this.isRunning = false;
    }
}
