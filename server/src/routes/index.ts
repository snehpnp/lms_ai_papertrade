import { Router } from 'express';
import { config } from '../config';
import { authRoutes } from '../modules/auth/auth.routes';
import { registerRoutes } from '../modules/auth/register.routes';
import { userRoutes } from '../modules/user/user.routes';
import { courseRoutes } from '../modules/course/course.routes';
import { walletRoutes } from '../modules/wallet/wallet.routes';
import { tradeRoutes } from '../modules/trade/trade.routes';
import { marketConfigRoutes } from '../modules/trade/marketConfig.routes';
import { referralRoutes } from '../modules/referral/referral.routes';
import { paymentRoutes } from '../modules/payment/payment.routes';
import { aiRoutes } from '../modules/ai/ai.routes';
import { wishlistRoutes } from '../modules/wishlist/wishlist.routes';
import { userCourseRoutes } from '../modules/userCourse/userCourse.routes';
import { profileRoutes } from '../modules/profile/profile.routes';
import { reportsRoutes } from '../modules/reports/reports.routes';
import { symbolRoutes } from '../modules/symbol/symbol.routes';
import { settingsRoutes } from '../modules/settings/settings.routes';
import { statsRoutes } from '../modules/stats/stats.routes';
import { watchlistRoutes } from '../modules/watchlist/watchlist.routes';
import { marketRoutes } from '../modules/market/market.routes';

const router = Router();
const prefix = config.apiPrefix;

// Auth (public + protected)
router.use(`${prefix}/auth`, authRoutes);
router.use(`${prefix}/auth`, registerRoutes);

// Admin / Subadmin (RBAC inside each)
router.use(`${prefix}/users`, userRoutes);
router.use(`${prefix}/courses`, courseRoutes);
router.use(`${prefix}/wallet`, walletRoutes);
router.use(`${prefix}/trades`, tradeRoutes);
router.use(`${prefix}/config`, marketConfigRoutes);
router.use(`${prefix}/referral`, referralRoutes);
router.use(`${prefix}/reports`, reportsRoutes);
router.use(`${prefix}/symbols`, symbolRoutes);
router.use(`${prefix}/settings`, settingsRoutes);
router.use(`${prefix}/stats`, statsRoutes);

// Payment (user + admin history)
router.use(`${prefix}/payments`, paymentRoutes);

// User: AI, wishlist, my courses, profile
router.use(`${prefix}/ai`, aiRoutes);
router.use(`${prefix}/wishlist`, wishlistRoutes);
router.use(`${prefix}/my`, profileRoutes);
router.use(`${prefix}/my`, userCourseRoutes);
router.use(`${prefix}/watchlists`, watchlistRoutes);
router.use(`${prefix}/market`, marketRoutes);

// Health
router.get(`${prefix}/health`, (_req, res) => {
  res.json({ success: true, message: 'TradeLearn Pro API', timestamp: new Date().toISOString() });
});

export const routes = router;
