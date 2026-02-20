"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketConfigRoutes = void 0;
const express_1 = require("express");
const marketConfig_service_1 = require("./marketConfig.service");
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, rbac_1.adminOnly);
const idParam = zod_1.z.object({ params: zod_1.z.object({ id: zod_1.z.string().uuid() }) });
const createMarketSchema = zod_1.z.object({
    body: zod_1.z.object({
        symbol: zod_1.z.string().min(1),
        name: zod_1.z.string().optional(),
        lotSize: zod_1.z.number().positive().optional(),
        tickSize: zod_1.z.number().positive().optional(),
    }),
});
const updateMarketSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        lotSize: zod_1.z.number().positive().optional(),
        tickSize: zod_1.z.number().positive().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
const createBrokerageSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(['PERCENTAGE', 'FIXED']),
        value: zod_1.z.number().min(0),
        minCharge: zod_1.z.number().min(0).optional(),
        isDefault: zod_1.z.boolean().optional(),
    }),
});
router.get('/market', async (_req, res, next) => {
    try {
        const data = await marketConfig_service_1.marketConfigService.list();
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.post('/market', (0, validate_1.validate)(createMarketSchema), async (req, res, next) => {
    try {
        const data = await marketConfig_service_1.marketConfigService.create(req.body);
        res.status(201).json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.patch('/market/:id', (0, validate_1.validate)(updateMarketSchema), async (req, res, next) => {
    try {
        const data = await marketConfig_service_1.marketConfigService.update(req.params.id, req.body);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.delete('/market/:id', (0, validate_1.validate)(idParam), async (req, res, next) => {
    try {
        await marketConfig_service_1.marketConfigService.delete(req.params.id);
        res.json({ success: true, message: 'Deleted' });
    }
    catch (e) {
        next(e);
    }
});
router.get('/brokerage', async (_req, res, next) => {
    try {
        const data = await marketConfig_service_1.brokerageConfigService.list();
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.post('/brokerage', (0, validate_1.validate)(createBrokerageSchema), async (req, res, next) => {
    try {
        const data = await marketConfig_service_1.brokerageConfigService.create(req.body);
        res.status(201).json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.patch('/brokerage/:id', (0, validate_1.validate)(idParam), async (req, res, next) => {
    try {
        const data = await marketConfig_service_1.brokerageConfigService.update(req.params.id, req.body);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.delete('/brokerage/:id', (0, validate_1.validate)(idParam), async (req, res, next) => {
    try {
        await marketConfig_service_1.brokerageConfigService.delete(req.params.id);
        res.json({ success: true, message: 'Deleted' });
    }
    catch (e) {
        next(e);
    }
});
exports.marketConfigRoutes = router;
//# sourceMappingURL=marketConfig.routes.js.map