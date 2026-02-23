import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';

export const userController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
      const data = await userService.findAll({
        role: req.query.role as any,
        search: req.query.search as string,
        page: req.query.page as any,
        limit: req.query.limit as any,
        subadminId,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
      const data = await userService.findById(req.params.id, { forSubadmin });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
      const data = await userService.update(req.params.id, req.body, { forSubadmin });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
      await userService.delete(req.params.id, { forSubadmin });
      res.json({ success: true, message: 'User deleted' });
    } catch (e) {
      next(e);
    }
  },

  async block(req: Request, res: Response, next: NextFunction) {
    try {
      const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
      const data = await userService.block(req.params.id, { forSubadmin });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async unblock(req: Request, res: Response, next: NextFunction) {
    try {
      const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
      const data = await userService.unblock(req.params.id, { forSubadmin });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async activityReport(req: Request, res: Response, next: NextFunction) {
    try {
      const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
      const data = await userService.getActivityReport(req.params.id, { forSubadmin });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async tradingReport(req: Request, res: Response, next: NextFunction) {
    try {
      const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
      const data = await userService.getTradingReport(req.params.id, { forSubadmin });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async courseProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
      const data = await userService.getCourseProgress(req.params.id, { forSubadmin });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
