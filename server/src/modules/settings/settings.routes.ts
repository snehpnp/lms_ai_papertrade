import { Router } from 'express';
import { settingsService } from './settings.service';
import { authenticate } from '../../middlewares/authenticate';
import { adminOnly } from '../../middlewares/rbac';
import { z } from 'zod';
import { validate } from '../../middlewares/validate';

const router = Router();

const upsertSettingsSchema = z.object({
  body: z.array(
    z.object({
      key: z.string(),
      value: z.string().nullable(),
      description: z.string().optional(),
    })
  ),
});

router.get('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const settings = await settingsService.getAll();
    res.json({ success: true, data: settings });
  } catch (e) {
    next(e);
  }
});

router.post('/bulk', authenticate, adminOnly, validate(upsertSettingsSchema), async (req, res, next) => {
  try {
    await settingsService.bulkUpsert(req.body);
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (e) {
    next(e);
  }
});

export const settingsRoutes = router;
