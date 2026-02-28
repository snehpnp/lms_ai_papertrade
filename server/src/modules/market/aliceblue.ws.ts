import WebSocket from 'ws';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { settingsService } from '../settings/settings.service';

/* =====================================================
   CONSTANTS
===================================================== */
const WS_URL = 'wss://ws1.aliceblueonline.com/NorenWS/';
const SESSION_API = 'https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/ws/createWsSession';
const TOKEN_CHECK_API = 'https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/ws/createSocketSess';

/* =====================================================
   TYPES
===================================================== */
interface PriceData {
    exchange: string;
    token: string;
    lp: string;       // last price
    pc?: string;      // percent change
    v?: string;       // volume
    h?: string;       // high
    l?: string;       // low
    o?: string;       // open
    c?: string;       // close
    sp1?: string;     // sell price 1
    bp1?: string;     // buy price 1
    ts?: string;      // timestamp
    tk?: string;      // token
    e?: string;       // exchange
}

type PriceCallback = (data: PriceData) => void;

/* =====================================================
   SINGLETON ALICE BLUE WS MANAGER
===================================================== */
class AliceBlueWSManager {
    private socket: WebSocket | null = null;
    private isInitialized = false;
    private subscribedChannels = new Set<string>();
    private priceListeners = new Map<string, Set<PriceCallback>>();
    private latestPrices = new Map<string, PriceData>();
    private userId: string | null = null;
    private sessionId: string | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private lastChannels: string[] = [];
    private connectPromise: Promise<boolean> | null = null;

    /* ── Get credentials from DB ── */
    async getCredentials(): Promise<{ userId: string; apiKey: string } | null> {
        const userId = await settingsService.getByKey('ALICE_BLUE_USER_ID');
        const apiKey = await settingsService.getByKey('ALICE_BLUE_API_KEY');
        if (!userId || !apiKey) return null;
        return { userId, apiKey };
    }

    /* ── Check token status ── */
    private async checkTokenStatus(userId: string, sessionId: string): Promise<boolean> {
        try {
            const res = await axios.post(
                TOKEN_CHECK_API,
                { loginType: 'API' },
                { headers: { Authorization: `Bearer ${userId} ${sessionId}` } }
            );
            return res.status === 200;
        } catch {
            return false;
        }
    }

    /* ── Create WS session ── */
    private async createWsSession(userId: string, sessionId: string): Promise<void> {
        await axios.post(
            SESSION_API,
            { loginType: 'API' },
            { headers: { Authorization: `Bearer ${userId} ${sessionId}` } }
        );
    }

    /* ── Subscribe channels ── */
    private subscribeChannels(channels: string[]) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        channels.forEach((ch) => {
            if (!this.subscribedChannels.has(ch)) {
                this.socket!.send(JSON.stringify({ k: ch, t: 't' }));
                this.subscribedChannels.add(ch);
            }
        });
    }

    /* ── Unsubscribe channels ── */
    unsubscribeChannel(channel: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ k: channel, t: 'u' }));
        }
        this.subscribedChannels.delete(channel);
        this.priceListeners.delete(channel);
        this.latestPrices.delete(channel);
    }

    /* ── Build channel from exchange + token ── */
    static buildChannel(exchange: string, token: string): string {
        return `${exchange}|${token}`;
    }

    /* ── Connect to Alice Blue ── */
    async connect(): Promise<boolean> {
        // Already connected
        if (this.socket && this.socket.readyState === WebSocket.OPEN && this.isInitialized) {
            return true;
        }

        // If a connection attempt is already in progress, return that promise
        if (this.connectPromise) {
            return this.connectPromise;
        }

        this.connectPromise = (async () => {
            try {
                // Get credentials
                const creds = await this.getCredentials();
                if (!creds) {
                    console.error('[AliceBlue] No credentials configured');
                    return false;
                }

                this.userId = creds.userId;
                this.sessionId = creds.apiKey;

                // Check token
                const tokenValid = await this.checkTokenStatus(this.userId, this.sessionId);
                if (!tokenValid) {
                    console.error('[AliceBlue] Invalid credentials/token');
                    return false;
                }

                // Create WS session
                try {
                    await this.createWsSession(this.userId, this.sessionId);
                } catch (e) {
                    console.error('[AliceBlue] Failed to create WS session', e);
                    return false;
                }

                return new Promise<boolean>((resolve) => {
                    this.socket = new WebSocket(WS_URL);

                    this.socket.on('open', () => {
                        const encToken = CryptoJS.SHA256(
                            CryptoJS.SHA256(this.sessionId!).toString()
                        ).toString();

                        this.socket!.send(JSON.stringify({
                            susertoken: encToken,
                            t: 'c',
                            actid: `${this.userId}_API`,
                            uid: `${this.userId}_API`,
                            source: 'API',
                        }));
                    });

                    this.socket.on('message', (rawData) => {
                        let response: any;
                        try {
                            response = JSON.parse(rawData.toString());
                        } catch {
                            return;
                        }

                        // Auth success
                        if (response.s === 'OK' && !this.isInitialized) {
                            this.isInitialized = true;
                            // Re-subscribe
                            if (this.lastChannels.length > 0) {
                                this.subscribeChannels(this.lastChannels);
                            }
                            resolve(true);
                            return;
                        }

                        // Price update
                        if (response.lp || response.sp1) {
                            const channel = response.e && response.tk
                                ? `${response.e}|${response.tk}`
                                : null;

                            if (channel) {
                                const priceData: PriceData = {
                                    exchange: response.e,
                                    token: response.tk,
                                    lp: response.lp,
                                    pc: response.pc,
                                    v: response.v,
                                    h: response.h,
                                    l: response.l,
                                    o: response.o,
                                    c: response.c,
                                    sp1: response.sp1,
                                    bp1: response.bp1,
                                    ts: response.ts,
                                    tk: response.tk,
                                    e: response.e,
                                };

                                // Store latest
                                this.latestPrices.set(channel, priceData);

                                // Notify listeners
                                const listeners = this.priceListeners.get(channel);
                                if (listeners) {
                                    listeners.forEach((cb) => {
                                        try { cb(priceData); } catch (e) { /* ignore listener errors */ }
                                    });
                                }
                            }
                        }
                    });

                    this.socket.on('error', (err) => {
                        console.error('[AliceBlue] WebSocket error:', err.message);
                    });

                    this.socket.on('close', () => {
                        console.warn('[AliceBlue] WebSocket closed. Will reconnect in 5s...');
                        this.isInitialized = false;
                        this.socket = null;
                        this.subscribedChannels.clear();

                        // Save channels for reconnect
                        this.lastChannels = [...this.priceListeners.keys()];

                        // Auto reconnect
                        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
                        this.reconnectTimer = setTimeout(() => {
                            if (this.priceListeners.size > 0) {
                                this.connect();
                            }
                        }, 5000);
                    });

                    // Timeout auth
                    setTimeout(() => {
                        if (!this.isInitialized) {
                            resolve(false);
                        }
                    }, 15000);
                });
            } catch (error) {
                console.error('[AliceBlue] Connection error:', error);
                return false;
            } finally {
                this.connectPromise = null;
            }
        })();

        return this.connectPromise;
    }

    /* ── Subscribe to a channel and get price updates ── */
    async subscribe(exchange: string, token: string, callback: PriceCallback): Promise<() => void> {
        const channel = AliceBlueWSManager.buildChannel(exchange, token);

        // Add listener
        if (!this.priceListeners.has(channel)) {
            this.priceListeners.set(channel, new Set());
        }
        this.priceListeners.get(channel)!.add(callback);

        // Connect if not connected
        if (!this.isInitialized) {
            this.lastChannels = [...this.priceListeners.keys()];
            await this.connect();
        }

        // Subscribe channel
        this.subscribeChannels([channel]);

        // Return unsubscribe function
        return () => {
            const listeners = this.priceListeners.get(channel);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.unsubscribeChannel(channel);
                }
            }
        };
    }

    /* ── Get latest price (cached) ── */
    getLatestPrice(exchange: string, token: string): PriceData | null {
        const channel = AliceBlueWSManager.buildChannel(exchange, token);
        return this.latestPrices.get(channel) || null;
    }

    /* ── Bulk subscribe to multiple symbols (no callbacks) ── */
    async ensureSymbolsSubscribed(symbols: { exchange: string; token: string }[]) {
        if (symbols.length === 0) return;

        // Ensure connected
        if (!this.isInitialized) {
            await this.connect();
        }

        const channels = symbols.map(s => AliceBlueWSManager.buildChannel(s.exchange, s.token));
        this.subscribeChannels(channels);
    }

    /* ── Get Historical Data (REST) ── */
    async getHistory(exchange: string, token: string, from: string, to: string, resolution: string = '1'): Promise<any[]> {
        const creds = await this.getCredentials();
        if (!creds) throw new Error('No credentials configured');

        const fromTs = new Date(from + "T00:00:00.000+05:30").getTime();
        const toTs = new Date(to + "T00:00:00.000+05:30").getTime();

        const payload = {
            exchange,
            token,
            resolution: resolution,
            from: fromTs,
            to: toTs
        };

        try {
            const url = "https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/chart/history";


            const config = {
                method: 'post',
                url: url,
                headers: {
                    'Authorization': `Bearer ${creds.userId} ${creds.apiKey}`,
                    'Content-Type': 'application/json'
                },
                data: payload
            };

            let response = await axios.request(config)

            if (response.data.stat !== 'Ok' && !Array.isArray(response.data)) {
                // Sometimes it returns { stat: 'Not Ok', reason: '...' }
                throw new Error(response.data.reason || 'Failed to fetch historical data');
            }


            const data = Array.isArray(response.data) ? response.data : (response.data.result || []);


            return data.map((item: any) => ({
                time: item?.time, // Alice Blue usually returns timestamp in seconds or ISO
                open: parseFloat(item.open),
                high: parseFloat(item.high),
                low: parseFloat(item?.low),
                close: parseFloat(item?.close),
                volume: item?.volume ? parseFloat(item?.volume) : 0
            }));
        } catch (error: any) {
            console.error('[AliceBlue] REST History Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /* ── Disconnect ── */
    disconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.close();
            this.socket = null;
        }
        this.isInitialized = false;
        this.subscribedChannels.clear();
        this.priceListeners.clear();
        this.latestPrices.clear();
        this.lastChannels = [];
    }

    /* ── Status ── */
    getStatus() {
        return {
            connected: this.isInitialized,
            socketState: this.socket?.readyState ?? -1,
            subscribedChannels: this.subscribedChannels.size,
            activeListeners: this.priceListeners.size,
            cachedPrices: this.latestPrices.size,
        };
    }
}

// Export singleton
export const aliceBlueWS = new AliceBlueWSManager();
