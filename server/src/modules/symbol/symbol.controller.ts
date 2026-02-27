import { Request, Response, NextFunction } from 'express';
import { symbolService } from './symbol.service';

export const symbolController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await symbolService.search({
        q: req.query.q as string,
        exchange: req.query.exchange as any,
        // instrument: req.query.instrument as any,
        page: req.query.page as any,
        limit: req.query.limit as any,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await symbolService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async truncate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await symbolService.truncate();
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
