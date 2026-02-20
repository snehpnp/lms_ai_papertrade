"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const express_1 = require("express");
const user_register_service_1 = require("../user/user.register.service");
const validate_1 = require("../../middlewares/validate");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        name: zod_1.z.string().min(1),
        referralCode: zod_1.z.string().optional(),
    }),
});
const router = (0, express_1.Router)();
router.post('/register', (0, validate_1.validate)(registerSchema), async (req, res, next) => {
    try {
        const data = await (0, user_register_service_1.registerUser)(req.body);
        res.status(201).json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
exports.registerRoutes = router;
//# sourceMappingURL=register.routes.js.map