import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { aliceBlueWS } from './aliceblue.ws';
import { z } from 'zod';

const router = Router();

/* ── GET /market/live-price?exchange=NSE&token=26000 ── */
/* Returns current price snapshot */
router.get('/live-price', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { exchange, token } = req.query as { exchange: string; token: string };

        if (!exchange || !token) {
            res.status(400).json({ success: false, message: 'exchange and token are required' });
            return;
        }

        // Check if we have cached price
        let price = aliceBlueWS.getLatestPrice(exchange, token);
        if (price) {
            res.json({ success: true, data: price });
            return;
        }

        // Subscribe and wait for first price
        const connected = await aliceBlueWS.connect();
        if (!connected) {
            res.status(503).json({ success: false, message: 'Alice Blue connection failed. Check admin credentials.' });
            return;
        }

        // Wait for first price update (max 10s)
        const pricePromise = new Promise<any>((resolve) => {
            const timeout = setTimeout(() => resolve(null), 10000);

            aliceBlueWS.subscribe(exchange, token, (data) => {
                clearTimeout(timeout);
                resolve(data);
            });
        });

        price = await pricePromise;
        if (price) {
            res.json({ success: true, data: price });
        } else {
            res.status(504).json({ success: false, message: 'Timeout waiting for price data' });
        }
    } catch (e) {
        next(e);
    }
});

/* ── GET /market/live-stream?channels=NSE|26000,NSE|26009 ── */
/* SSE (Server-Sent Events) for real-time price streaming */
router.get('/live-stream', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const channelsParam = req.query.channels as string;
        if (!channelsParam) {
            res.status(400).json({ success: false, message: 'channels query parameter required (e.g., NSE|26000,NSE|26009)' });
            return;
        }

        const channels = channelsParam.split(',').map(c => c.trim()).filter(Boolean);
        if (channels.length === 0) {
            res.status(400).json({ success: false, message: 'No valid channels provided' });
            return;
        }

        // Connect first
        const connected = await aliceBlueWS.connect();
        if (!connected) {
            res.status(503).json({ success: false, message: 'Alice Blue connection failed' });
            return;
        }

        // Setup SSE
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        });

        res.write('data: {"type":"connected"}\n\n');

        const unsubscribers: (() => void)[] = [];

        // Subscribe to each channel
        for (const channel of channels) {
            const [exchange, token] = channel.split('|');
            if (!exchange || !token) continue;

            const unsub = await aliceBlueWS.subscribe(exchange, token, (data) => {
                try {
                    res.write(`data: ${JSON.stringify(data)}\n\n`);
                } catch {
                    // Client disconnected
                }
            });
            unsubscribers.push(unsub);
        }

        // Cleanup on close
        req.on('close', () => {
            unsubscribers.forEach((unsub) => unsub());
        });
    } catch (e) {
        next(e);
    }
});

/* ── GET /market/history?exchange=NSE&token=26000&from=...&to=...&resolution=1 ── */
/* Fetch historical chart data */
router.get('/history', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { exchange, token, from, to, resolution } = req.query as {
            exchange: string;
            token: string;
            from: string;
            to: string;
            resolution?: string;
        };

        if (!exchange || !token || !from || !to) {
            res.status(400).json({ success: false, message: 'exchange, token, from, and to are required' });
            return;
        }

        const data = await aliceBlueWS.getHistory(exchange, token, from, to, resolution || '1');
        res.json({ success: true, data });
    } catch (e: any) {
        res.status(500).json({ success: false, message: e.message || 'Failed to fetch historical data' });
    }
});

/* ── GET /market/status ── */
/* Check Alice Blue WebSocket connection status */
router.get('/status', authenticate, async (_req: Request, res: Response) => {
    const status = aliceBlueWS.getStatus();
    const creds = await aliceBlueWS.getCredentials();
    res.json({
        success: true,
        data: {
            ...status,
            credentialsConfigured: !!creds,
        },
    });
});

/* ── POST /market/connect ── */
/* Manually trigger Alice Blue connection */
router.post('/connect', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const connected = await aliceBlueWS.connect();
        res.json({ success: connected, message: connected ? 'Connected to Alice Blue' : 'Failed to connect' });
    } catch (e) {
        next(e);
    }
});

export const marketRoutes = router;
