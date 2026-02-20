"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradeService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../utils/prisma");
const wallet_service_1 = require("../wallet/wallet.service");
const errors_1 = require("../../utils/errors");
const library_1 = require("@prisma/client/runtime/library");
function toDecimal(n) {
    return new library_1.Decimal(n);
}
exports.tradeService = {
    async getBrokerageCharge(amount) {
        const config = await prisma_1.prisma.brokerageConfig.findFirst({
            where: { isDefault: true },
        });
        if (!config)
            return 0;
        const value = Number(config.value);
        const minCharge = config.minCharge ? Number(config.minCharge) : 0;
        let charge = config.type === 'PERCENTAGE' ? (amount * value) / 100 : value;
        if (minCharge > 0 && charge < minCharge)
            charge = minCharge;
        return Math.round(charge * 100) / 100;
    },
    async validateSymbol(symbol) {
        const config = await prisma_1.prisma.marketConfig.findFirst({
            where: { symbol: symbol.toUpperCase(), isActive: true },
        });
        if (!config)
            throw new errors_1.BadRequestError(`Symbol ${symbol} is not available for trading`);
    },
    async placeOrder(userId, data) {
        const symbol = data.symbol.toUpperCase();
        await this.validateSymbol(symbol);
        const qty = data.quantity;
        if (qty <= 0)
            throw new errors_1.BadRequestError('Quantity must be positive');
        const price = data.price ?? 0;
        if (data.orderType === 'MARKET' && price <= 0)
            throw new errors_1.BadRequestError('Price required for market order execution');
        const orderAmount = price * qty;
        const brokerage = await this.getBrokerageCharge(orderAmount);
        const wallet = await wallet_service_1.walletService.getOrCreateWallet(userId);
        const balance = Number(wallet.balance);
        if (balance < brokerage)
            throw new errors_1.BadRequestError('Insufficient balance for brokerage');
        const order = await prisma_1.prisma.order.create({
            data: {
                userId,
                symbol,
                side: data.side,
                quantity: qty,
                price: price > 0 ? toDecimal(price) : null,
                orderType: data.orderType,
                status: client_1.OrderStatus.PENDING,
                filledQty: 0,
            },
        });
        // Immediate fill for MARKET
        if (data.orderType === 'MARKET' && price > 0) {
            await this.executeMarketOrder(order.id, userId, symbol, data.side, qty, price, brokerage, wallet.id);
        }
        const updated = await prisma_1.prisma.order.findUnique({
            where: { id: order.id },
            include: { trades: true },
        });
        return updated;
    },
    async executeMarketOrder(orderId, userId, symbol, side, quantity, price, brokerage, walletId) {
        await prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: orderId } });
            if (!order || order.status !== client_1.OrderStatus.PENDING)
                return;
            let positionId = null;
            const oppositeSide = side === 'BUY' ? 'SELL' : 'BUY';
            const existingPosition = await tx.position.findFirst({
                where: { userId, symbol, side, status: client_1.PositionStatus.OPEN },
            });
            if (existingPosition) {
                positionId = existingPosition.id;
                const newQty = Number(existingPosition.quantity) + quantity;
                const newAvg = (Number(existingPosition.avgPrice) * Number(existingPosition.quantity) + price * quantity) /
                    newQty;
                await tx.position.update({
                    where: { id: existingPosition.id },
                    data: {
                        quantity: toDecimal(newQty),
                        avgPrice: toDecimal(newAvg),
                    },
                });
            }
            else {
                const pos = await tx.position.create({
                    data: {
                        userId,
                        symbol,
                        side,
                        quantity,
                        avgPrice: price,
                        status: client_1.PositionStatus.OPEN,
                    },
                });
                positionId = pos.id;
            }
            const trade = await tx.trade.create({
                data: {
                    userId,
                    orderId,
                    symbol,
                    side,
                    quantity,
                    price,
                    brokerage,
                    positionId,
                },
            });
            await tx.order.update({
                where: { id: orderId },
                data: { status: client_1.OrderStatus.FILLED, filledQty: quantity },
            });
            // Debit brokerage from wallet
            const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
            if (wallet) {
                const newBal = Number(wallet.balance) - brokerage;
                await tx.wallet.update({
                    where: { id: walletId },
                    data: { balance: newBal },
                });
                await tx.walletTransaction.create({
                    data: {
                        walletId,
                        type: 'DEBIT',
                        amount: -brokerage,
                        balanceAfter: newBal,
                        reference: trade.id,
                        description: 'Brokerage',
                    },
                });
            }
        });
    },
    async closePosition(userId, positionId, closePrice) {
        const position = await prisma_1.prisma.position.findFirst({
            where: { id: positionId, userId, status: client_1.PositionStatus.OPEN },
        });
        if (!position)
            throw new errors_1.NotFoundError('Open position not found');
        const qty = Number(position.quantity);
        const avgPrice = Number(position.avgPrice);
        const pnl = position.side === 'BUY' ? (closePrice - avgPrice) * qty : (avgPrice - closePrice) * qty;
        const brokerage = await this.getBrokerageCharge(closePrice * qty);
        const wallet = await wallet_service_1.walletService.getOrCreateWallet(userId);
        await prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId,
                    symbol: position.symbol,
                    side: position.side === 'BUY' ? 'SELL' : 'BUY',
                    quantity: qty,
                    price: closePrice,
                    orderType: 'MARKET',
                    status: client_1.OrderStatus.FILLED,
                    filledQty: qty,
                },
            });
            const trade = await tx.trade.create({
                data: {
                    userId,
                    orderId: order.id,
                    symbol: position.symbol,
                    side: position.side === 'BUY' ? 'SELL' : 'BUY',
                    quantity: qty,
                    price: closePrice,
                    brokerage,
                    pnl,
                    positionId: position.id,
                },
            });
            await tx.position.update({
                where: { id: positionId },
                data: {
                    status: client_1.PositionStatus.CLOSED,
                    closedAt: new Date(),
                    quantity: 0,
                    currentPrice: closePrice,
                    unrealizedPnl: pnl,
                },
            });
            const netPnl = pnl - brokerage;
            const newBal = Number(wallet.balance) + netPnl;
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: newBal },
            });
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'TRADE_PNL',
                    amount: netPnl,
                    balanceAfter: newBal,
                    reference: trade.id,
                    description: 'Trade P&L',
                },
            });
        });
        return { message: 'Position closed', pnl };
    },
    async getOpenPositions(userId) {
        const positions = await prisma_1.prisma.position.findMany({
            where: { userId, status: client_1.PositionStatus.OPEN },
            orderBy: { openedAt: 'desc' },
        });
        return positions;
    },
    async getOrders(userId, params) {
        const where = { userId };
        if (params?.status)
            where.status = params.status;
        const orders = await prisma_1.prisma.order.findMany({
            where,
            include: { trades: true },
            orderBy: { createdAt: 'desc' },
            take: Math.min(100, params?.limit ?? 50),
        });
        return orders;
    },
    async getTradeHistory(userId, params) {
        const where = { userId };
        if (params?.symbol)
            where.symbol = params.symbol;
        const trades = await prisma_1.prisma.trade.findMany({
            where,
            orderBy: { executedAt: 'desc' },
            take: Math.min(500, params?.limit ?? 100),
        });
        return trades;
    },
    async getPnL(userId) {
        const trades = await prisma_1.prisma.trade.findMany({
            where: { userId, pnl: { not: null } },
        });
        const totalPnl = trades.reduce((s, t) => s + Number(t.pnl ?? 0), 0);
        const totalBrokerage = trades.reduce((s, t) => s + Number(t.brokerage), 0);
        return { totalPnl, totalBrokerage, netPnl: totalPnl - totalBrokerage };
    },
    async getPortfolioSummary(userId) {
        const [positions, pnl, wallet] = await Promise.all([
            prisma_1.prisma.position.findMany({ where: { userId, status: client_1.PositionStatus.OPEN } }),
            this.getPnL(userId),
            wallet_service_1.walletService.getOrCreateWallet(userId),
        ]);
        const totalOpenValue = positions.reduce((s, p) => s + Number(p.quantity) * Number(p.avgPrice), 0);
        return {
            walletBalance: Number(wallet.balance),
            openPositionsCount: positions.length,
            totalOpenValue,
            ...pnl,
        };
    },
    // Admin: all trades, all positions, leaderboard
    async adminGetAllTrades(params) {
        const page = Math.max(1, params.page ?? 1);
        const limit = Math.min(100, params.limit ?? 50);
        const skip = (page - 1) * limit;
        const where = {};
        if (params.userId)
            where.userId = params.userId;
        if (params.symbol)
            where.symbol = params.symbol;
        const [items, total] = await Promise.all([
            prisma_1.prisma.trade.findMany({ where, orderBy: { executedAt: 'desc' }, skip, take: limit }),
            prisma_1.prisma.trade.count({ where }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    },
    async adminGetAllPositions(params) {
        const where = {};
        if (params.userId)
            where.userId = params.userId;
        if (params.status)
            where.status = params.status;
        return prisma_1.prisma.position.findMany({
            where,
            orderBy: { openedAt: 'desc' },
            take: 500,
        });
    },
    async getLeaderboard(params) {
        const limit = Math.min(100, params.limit ?? 20);
        const trades = await prisma_1.prisma.trade.findMany({
            where: { pnl: { not: null } },
            select: { userId: true, pnl: true },
        });
        const byUser = new Map();
        for (const t of trades) {
            const pnl = Number(t.pnl);
            let r = byUser.get(t.userId);
            if (!r)
                r = { totalPnl: 0, wins: 0, total: 0, trades: [] };
            r.totalPnl += pnl;
            r.total++;
            if (pnl > 0)
                r.wins++;
            r.trades.push(pnl);
            byUser.set(t.userId, r);
        }
        const users = await prisma_1.prisma.user.findMany({
            where: { id: { in: Array.from(byUser.keys()) }, role: 'USER' },
            select: { id: true, name: true, email: true },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        let rows = Array.from(byUser.entries()).map(([userId, r]) => {
            const winRate = r.total > 0 ? (r.wins / r.total) * 100 : 0;
            const avgPnl = r.trades.length ? r.trades.reduce((a, b) => a + b, 0) / r.trades.length : 0;
            const variance = r.trades.length > 1
                ? r.trades.reduce((s, p) => s + Math.pow(p - avgPnl, 2), 0) / (r.trades.length - 1)
                : 0;
            const consistency = variance > 0 ? 100 - Math.min(100, Math.sqrt(variance) * 10) : 100;
            return {
                userId,
                name: userMap.get(userId)?.name,
                email: userMap.get(userId)?.email,
                totalPnl: r.totalPnl,
                netProfitPct: 0, // would need initial capital
                winRate,
                tradeCount: r.total,
                consistency,
            };
        });
        if (params.sortBy === 'net_profit_pct' || params.sortBy === 'win_rate')
            rows.sort((a, b) => b.totalPnl - a.totalPnl);
        if (params.sortBy === 'win_rate')
            rows.sort((a, b) => b.winRate - a.winRate);
        if (params.sortBy === 'consistency')
            rows.sort((a, b) => b.consistency - a.consistency);
        return rows.slice(0, limit);
    },
};
//# sourceMappingURL=trade.service.js.map