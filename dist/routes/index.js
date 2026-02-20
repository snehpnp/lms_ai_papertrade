"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const config_1 = require("../config");
const auth_routes_1 = require("../modules/auth/auth.routes");
const register_routes_1 = require("../modules/auth/register.routes");
const user_routes_1 = require("../modules/user/user.routes");
const course_routes_1 = require("../modules/course/course.routes");
const wallet_routes_1 = require("../modules/wallet/wallet.routes");
const trade_routes_1 = require("../modules/trade/trade.routes");
const marketConfig_routes_1 = require("../modules/trade/marketConfig.routes");
const referral_routes_1 = require("../modules/referral/referral.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const ai_routes_1 = require("../modules/ai/ai.routes");
const wishlist_routes_1 = require("../modules/wishlist/wishlist.routes");
const userCourse_routes_1 = require("../modules/userCourse/userCourse.routes");
const profile_routes_1 = require("../modules/profile/profile.routes");
const reports_routes_1 = require("../modules/reports/reports.routes");
const router = (0, express_1.Router)();
const prefix = config_1.config.apiPrefix;
// Auth (public + protected)
router.use(`${prefix}/auth`, auth_routes_1.authRoutes);
router.use(`${prefix}/auth`, register_routes_1.registerRoutes);
// Admin / Subadmin (RBAC inside each)
router.use(`${prefix}/users`, user_routes_1.userRoutes);
router.use(`${prefix}/courses`, course_routes_1.courseRoutes);
router.use(`${prefix}/wallet`, wallet_routes_1.walletRoutes);
router.use(`${prefix}/trades`, trade_routes_1.tradeRoutes);
router.use(`${prefix}/config`, marketConfig_routes_1.marketConfigRoutes);
router.use(`${prefix}/referral`, referral_routes_1.referralRoutes);
router.use(`${prefix}/reports`, reports_routes_1.reportsRoutes);
// Payment (user + admin history)
router.use(`${prefix}/payments`, payment_routes_1.paymentRoutes);
// User: AI, wishlist, my courses, profile
router.use(`${prefix}/ai`, ai_routes_1.aiRoutes);
router.use(`${prefix}/wishlist`, wishlist_routes_1.wishlistRoutes);
router.use(`${prefix}/my`, profile_routes_1.profileRoutes);
router.use(`${prefix}/my`, userCourse_routes_1.userCourseRoutes);
// Health
router.get(`${prefix}/health`, (_req, res) => {
    res.json({ success: true, message: 'TradeLearn Pro API', timestamp: new Date().toISOString() });
});
exports.routes = router;
//# sourceMappingURL=index.js.map