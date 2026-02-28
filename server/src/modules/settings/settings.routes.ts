import { Router } from 'express';
import { settingsService } from './settings.service';
import { authenticate } from '../../middlewares/authenticate';
import { adminOnly } from '../../middlewares/rbac';
import { z } from 'zod';
import { validate } from '../../middlewares/validate';

import { mailer } from '../../utils/mailer';
import { aliceBlueWS } from '../market/aliceblue.ws';
import { logger } from '../../utils/activity-logger';

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
    const settings = req.body as { key: string; value: string; description?: string }[];
    await settingsService.bulkUpsert(settings);

    // Specific logic for Live Price Toggle
    const livePriceSetting = settings.find(s => s.key === 'LIVE_PRICE_ENABLED');
    if (livePriceSetting) {
      const isEnabled = livePriceSetting.value === 'true';
      if (isEnabled) {
        await aliceBlueWS.connect();
      } else {
        aliceBlueWS.disconnect();
      }

      // Log the manual action
      await logger.log({
        userId: (req as any).user.id,
        action: 'LIVE_PRICE_TOGGLE',
        resource: 'Market',
        details: { enabled: isEnabled, trigger: 'manual' }
      });
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (e) {
    next(e);
  }
});

router.post('/test-email', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ success: false, message: 'Recipient email is required' });

    const appName = await settingsService.getByKey('APP_NAME') || 'TradeAlgo';
    await mailer.sendMail({
      to,
      subject: `Test Email from ${appName}`,
      text: `This is a test email to verify your SMTP configuration for ${appName}. If you received this, your webmail setup is working correctly!`,
      html: `<b>This is a test email</b> to verify your SMTP configuration for <b>${appName}</b>. If you received this, your webmail setup is working correctly!`,
    });

    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (e) {
    next(e);
  }
});

export const settingsRoutes = router;
