"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const payment_service_1 = require("./payment.service");
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.string().uuid(),
        provider: zod_1.z.enum(['RAZORPAY', 'STRIPE']),
        amount: zod_1.z.number().positive(),
        currency: zod_1.z.string().length(3).optional(),
    }),
});
const verifyRazorpaySchema = zod_1.z.object({
    body: zod_1.z.object({
        paymentId: zod_1.z.string().uuid(),
        razorpayOrderId: zod_1.z.string(),
        razorpayPaymentId: zod_1.z.string(),
        razorpaySignature: zod_1.z.string(),
    }),
});
const verifyStripeSchema = zod_1.z.object({
    body: zod_1.z.object({
        sessionId: zod_1.z.string(),
    }),
});
router.post('/create-order', authenticate_1.authenticate, rbac_1.userOnly, (0, validate_1.validate)(createOrderSchema), async (req, res, next) => {
    try {
        const data = await payment_service_1.paymentService.createOrder(req.user.id, req.body.courseId, req.body.provider, req.body.amount, req.body.currency ?? 'INR');
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.post('/verify/razorpay', authenticate_1.authenticate, rbac_1.userOnly, (0, validate_1.validate)(verifyRazorpaySchema), async (req, res, next) => {
    try {
        const data = await payment_service_1.paymentService.verifyRazorpay(req.user.id, req.body.paymentId, req.body.razorpayOrderId, req.body.razorpayPaymentId, req.body.razorpaySignature);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.post('/verify/stripe', authenticate_1.authenticate, rbac_1.userOnly, (0, validate_1.validate)(verifyStripeSchema), async (req, res, next) => {
    try {
        const data = await payment_service_1.paymentService.verifyStripe(req.body.sessionId);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.get('/history', authenticate_1.authenticate, rbac_1.adminOrSubadmin, async (req, res, next) => {
    try {
        const data = await payment_service_1.paymentService.getPaymentHistory(req.user.id, req.user.role);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
exports.paymentRoutes = router;
//# sourceMappingURL=payment.routes.js.map