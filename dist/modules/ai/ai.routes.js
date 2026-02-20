"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRoutes = void 0;
const express_1 = require("express");
const ai_service_1 = require("./ai.service");
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, rbac_1.userOnly);
const askSchema = zod_1.z.object({
    body: zod_1.z.object({
        message: zod_1.z.string().min(1).max(2000),
        context: zod_1.z.object({ type: zod_1.z.string(), data: zod_1.z.any() }).optional(),
    }),
});
const conceptSchema = zod_1.z.object({
    body: zod_1.z.object({ topic: zod_1.z.string().min(1) }),
});
router.post('/ask', (0, validate_1.validate)(askSchema), async (req, res, next) => {
    try {
        const data = await ai_service_1.aiService.ask(req.user.id, req.body.message, req.body.context);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.post('/explain', (0, validate_1.validate)(conceptSchema), async (req, res, next) => {
    try {
        const data = await ai_service_1.aiService.getConceptExplanation(req.body.topic);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.post('/analyze-performance', async (req, res, next) => {
    try {
        const { tradeService } = require('../trade/trade.service');
        const pnl = await tradeService.getPnL(req.user.id);
        const data = await ai_service_1.aiService.analyzePerformance(req.user.id, {
            winRate: 0,
            totalPnl: pnl.netPnl,
            tradeCount: 0,
        });
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
exports.aiRoutes = router;
//# sourceMappingURL=ai.routes.js.map