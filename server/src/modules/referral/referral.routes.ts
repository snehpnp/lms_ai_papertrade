import { Router } from 'express';
import { referralService } from './referral.service';
import { authenticate } from '../../middlewares/authenticate';
import { adminOrSubadmin } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { ForbiddenError } from '../../utils/errors';
import { z } from 'zod';

const router = Router();
router.use(authenticate, adminOrSubadmin);

const listQuery = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

const signupBonusSchema = z.object({
  body: z.object({
    amount: z.number().min(0),
  }),
});

router.get('/signup-bonus', async (req, res, next) => {
  try {
    const data = await referralService.getSignupBonus(req.user!.id, req.user!.role);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.patch('/signup-bonus', validate(signupBonusSchema), async (req, res, next) => {
  try {
    const data = await referralService.setSignupBonus(req.user!.id, req.user!.role, req.body.amount);
    res.json({ success: true, data, message: 'Referral signup bonus updated' });
  } catch (e) {
    next(e);
  }
});

router.get('/referred-users', validate(listQuery), async (req, res, next) => {
  try {
    const subadminId = req.user!.role === 'SUBADMIN' ? req.user!.id : (req.query.subadminId as string) || req.user!.id;
    const data = await referralService.getReferredUsers(subadminId, req.query as any);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/commission-report', async (req, res, next) => {
  try {
    const data = await referralService.getCommissionReport(req.user!.id, req.user!.role);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/course-revenue', async (req, res, next) => {
  try {
    if (req.user!.role !== 'SUBADMIN') return next(new ForbiddenError('Subadmin only'));
    const data = await referralService.getCourseRevenue(req.user!.id);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export const referralRoutes = router;
