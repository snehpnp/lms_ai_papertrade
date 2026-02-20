import { Router } from 'express';
import { paymentService } from './payment.service';
import { authenticate } from '../../middlewares/authenticate';
import { userOnly, adminOrSubadmin } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { z } from 'zod';

const router = Router();

const createOrderSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    provider: z.enum(['RAZORPAY', 'STRIPE']),
    amount: z.number().positive(),
    currency: z.string().length(3).optional(),
  }),
});

const verifyRazorpaySchema = z.object({
  body: z.object({
    paymentId: z.string().uuid(),
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  }),
});

const verifyStripeSchema = z.object({
  body: z.object({
    sessionId: z.string(),
  }),
});

router.post('/create-order', authenticate, userOnly, validate(createOrderSchema), async (req, res, next) => {
  try {
    const data = await paymentService.createOrder(
      req.user!.id,
      req.body.courseId,
      req.body.provider,
      req.body.amount,
      req.body.currency ?? 'INR'
    );
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/verify/razorpay', authenticate, userOnly, validate(verifyRazorpaySchema), async (req, res, next) => {
  try {
    const data = await paymentService.verifyRazorpay(
      req.user!.id,
      req.body.paymentId,
      req.body.razorpayOrderId,
      req.body.razorpayPaymentId,
      req.body.razorpaySignature
    );
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/verify/stripe', authenticate, userOnly, validate(verifyStripeSchema), async (req, res, next) => {
  try {
    const data = await paymentService.verifyStripe(req.body.sessionId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/history', authenticate, adminOrSubadmin, async (req, res, next) => {
  try {
    const data = await paymentService.getPaymentHistory(req.user!.id, req.user!.role);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export const paymentRoutes = router;
