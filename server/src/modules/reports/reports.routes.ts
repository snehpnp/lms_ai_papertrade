import { Router } from 'express';
import { userService } from '../user/user.service';
import { authenticate } from '../../middlewares/authenticate';
import { adminOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { z } from 'zod';

const router = Router();
router.use(authenticate, adminOnly);

const userIdParam = z.object({ params: z.object({ userId: z.string().uuid() }) });

router.get('/trade/:userId', validate(userIdParam), async (req, res, next) => {
  try {
    const data = await userService.getTradingReport(req.params.userId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/wallet/:userId', validate(userIdParam), async (req, res, next) => {
  try {
    const { walletService } = require('../wallet/wallet.service');
    const data = await walletService.getTransactionHistory(req.params.userId, { targetUserId: req.params.userId });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/course-progress/:userId', validate(userIdParam), async (req, res, next) => {
  try {
    const data = await userService.getCourseProgress(req.params.userId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/activity/:userId', validate(userIdParam), async (req, res, next) => {
  try {
    const data = await userService.getActivityReport(req.params.userId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/full/:userId', validate(userIdParam), async (req, res, next) => {
  try {
    const data = await userService.getFullUserReport(req.params.userId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export const reportsRoutes = router;
