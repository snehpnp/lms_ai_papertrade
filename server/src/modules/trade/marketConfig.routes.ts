import { Router } from 'express';
import { marketConfigService, brokerageConfigService } from './marketConfig.service';
import { authenticate } from '../../middlewares/authenticate';
import { adminOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { z } from 'zod';

const router = Router();
router.use(authenticate, adminOnly);

const idParam = z.object({ params: z.object({ id: z.string().uuid() }) });
const createMarketSchema = z.object({
  body: z.object({
    symbol: z.string().min(1),
    name: z.string().optional(),
    lotSize: z.number().positive().optional(),
    tickSize: z.number().positive().optional(),
  }),
});
const updateMarketSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().optional(),
    lotSize: z.number().positive().optional(),
    tickSize: z.number().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});
const createBrokerageSchema = z.object({
  body: z.object({
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number().min(0),
    minCharge: z.number().min(0).optional(),
    isDefault: z.boolean().optional(),
  }),
});

router.get('/market', async (_req, res, next) => {
  try {
    const data = await marketConfigService.list();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.post('/market', validate(createMarketSchema), async (req, res, next) => {
  try {
    const data = await marketConfigService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.patch('/market/:id', validate(updateMarketSchema), async (req, res, next) => {
  try {
    const data = await marketConfigService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.delete('/market/:id', validate(idParam), async (req, res, next) => {
  try {
    await marketConfigService.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

router.get('/brokerage', async (_req, res, next) => {
  try {
    const data = await brokerageConfigService.list();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.post('/brokerage', validate(createBrokerageSchema), async (req, res, next) => {
  try {
    const data = await brokerageConfigService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.patch('/brokerage/:id', validate(idParam), async (req, res, next) => {
  try {
    const data = await brokerageConfigService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.delete('/brokerage/:id', validate(idParam), async (req, res, next) => {
  try {
    await brokerageConfigService.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

export const marketConfigRoutes = router;
