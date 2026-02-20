"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRoutes = void 0;
const express_1 = require("express");
const user_service_1 = require("../user/user.service");
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, rbac_1.adminOnly);
const userIdParam = zod_1.z.object({ params: zod_1.z.object({ userId: zod_1.z.string().uuid() }) });
router.get('/trade/:userId', (0, validate_1.validate)(userIdParam), async (req, res, next) => {
    try {
        const data = await user_service_1.userService.getTradingReport(req.params.userId);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.get('/wallet/:userId', (0, validate_1.validate)(userIdParam), async (req, res, next) => {
    try {
        const { walletService } = require('../wallet/wallet.service');
        const data = await walletService.getTransactionHistory(req.params.userId, { targetUserId: req.params.userId });
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.get('/course-progress/:userId', (0, validate_1.validate)(userIdParam), async (req, res, next) => {
    try {
        const data = await user_service_1.userService.getCourseProgress(req.params.userId);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.get('/activity/:userId', (0, validate_1.validate)(userIdParam), async (req, res, next) => {
    try {
        const data = await user_service_1.userService.getActivityReport(req.params.userId);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
exports.reportsRoutes = router;
//# sourceMappingURL=reports.routes.js.map