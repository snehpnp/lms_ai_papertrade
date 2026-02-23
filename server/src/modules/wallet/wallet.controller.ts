import { Request, Response, NextFunction } from 'express';
import { walletService } from './wallet.service';

export const walletController = {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await walletService.getBalance(req.user!.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async credit(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await walletService.credit(
        req.params.userId,
        req.body.amount,
        req.body.description,
        undefined,
        { userId: req.user!.id, role: req.user!.role }
      );
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async debit(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await walletService.debit(
        req.params.userId,
        req.body.amount,
        req.body.description
      );
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async transactionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await walletService.getTransactionHistory(req.user!.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async adminTransactionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.query.userId as string;
      const data = await walletService.getTransactionHistory(userId, { targetUserId: userId });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
