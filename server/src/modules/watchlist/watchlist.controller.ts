import { Request, Response, NextFunction } from 'express';
import * as watchlistService from './watchlist.service';

export const watchlistController = {
    async getWatchlists(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await watchlistService.getWatchlists(req.user!.id);
            res.json({ success: true, data });
        } catch (e) {
            next(e);
        }
    },

    async createWatchlist(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await watchlistService.createWatchlist(req.user!.id, req.body.name);
            res.status(201).json({ success: true, data });
        } catch (e) {
            next(e);
        }
    },

    async updateWatchlist(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await watchlistService.updateWatchlist(req.params.id, req.user!.id, req.body.name);
            res.json({ success: true, data });
        } catch (e) {
            next(e);
        }
    },

    async deleteWatchlist(req: Request, res: Response, next: NextFunction) {
        try {
            await watchlistService.deleteWatchlist(req.params.id, req.user!.id);
            res.json({ success: true, message: 'Watchlist deleted successfully' });
        } catch (e) {
            next(e);
        }
    },

    async addSymbol(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await watchlistService.addSymbolToWatchlist(req.params.id, req.user!.id, req.body.symbolId);
            res.status(201).json({ success: true, data });
        } catch (e) {
            next(e);
        }
    },

    async removeSymbol(req: Request, res: Response, next: NextFunction) {
        try {
            await watchlistService.removeSymbolFromWatchlist(req.params.id, req.user!.id, req.params.symbolId);
            res.json({ success: true, message: 'Symbol removed from watchlist' });
        } catch (e) {
            next(e);
        }
    },
};
