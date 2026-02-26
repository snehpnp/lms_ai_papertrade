import { Request, Response, NextFunction } from 'express';
import { tradeService } from './trade.service';

export const tradeController = {
  async placeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.placeOrder(req.user!.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async closePosition(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.closePosition(
        req.user!.id,
        req.params.positionId,
        req.body.closePrice
      );
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async openPositions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.getOpenPositions(req.user!.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async todayPositions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.getTodayPositions(req.user!.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async holdings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.getHoldings(req.user!.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async orders(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.getOrders(req.user!.id, req.query as any);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async tradeHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.getTradeHistory(req.user!.id, req.query as any);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async pnl(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.getPnL(req.user!.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async portfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.getPortfolioSummary(req.user!.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async adminAllTrades(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.adminGetAllTrades(req.query as any);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async adminAllPositions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.adminGetAllPositions(req.query as any);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async leaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tradeService.getLeaderboard(req.query as any);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
