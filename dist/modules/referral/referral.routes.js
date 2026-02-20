"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralRoutes = void 0;
const express_1 = require("express");
const referral_service_1 = require("./referral.service");
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const errors_1 = require("../../utils/errors");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, rbac_1.adminOrSubadmin);
const listQuery = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    }),
});
const signupBonusSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().min(0),
    }),
});
router.get('/signup-bonus', async (req, res, next) => {
    try {
        const data = await referral_service_1.referralService.getSignupBonus(req.user.id, req.user.role);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.patch('/signup-bonus', (0, validate_1.validate)(signupBonusSchema), async (req, res, next) => {
    try {
        const data = await referral_service_1.referralService.setSignupBonus(req.user.id, req.user.role, req.body.amount);
        res.json({ success: true, data, message: 'Referral signup bonus updated' });
    }
    catch (e) {
        next(e);
    }
});
router.get('/referred-users', (0, validate_1.validate)(listQuery), async (req, res, next) => {
    try {
        const subadminId = req.user.role === 'SUBADMIN' ? req.user.id : req.query.subadminId || req.user.id;
        const data = await referral_service_1.referralService.getReferredUsers(subadminId, req.query);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.get('/commission-report', async (req, res, next) => {
    try {
        const data = await referral_service_1.referralService.getCommissionReport(req.user.id, req.user.role);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.get('/course-revenue', async (req, res, next) => {
    try {
        if (req.user.role !== 'SUBADMIN')
            return next(new errors_1.ForbiddenError('Subadmin only'));
        const data = await referral_service_1.referralService.getCourseRevenue(req.user.id);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
exports.referralRoutes = router;
//# sourceMappingURL=referral.routes.js.map