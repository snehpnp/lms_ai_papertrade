"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistRoutes = void 0;
const express_1 = require("express");
const wishlist_service_1 = require("./wishlist.service");
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const symbolParam = zod_1.z.object({ params: zod_1.z.object({ symbol: zod_1.z.string().min(1) }) });
router.use(authenticate_1.authenticate, rbac_1.userOnly);
router.post('/:symbol', (0, validate_1.validate)(symbolParam), async (req, res, next) => {
    try {
        const data = await wishlist_service_1.wishlistService.add(req.user.id, req.params.symbol);
        res.status(201).json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.delete('/:symbol', (0, validate_1.validate)(symbolParam), async (req, res, next) => {
    try {
        const data = await wishlist_service_1.wishlistService.remove(req.user.id, req.params.symbol);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const data = await wishlist_service_1.wishlistService.list(req.user.id);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
exports.wishlistRoutes = router;
//# sourceMappingURL=wishlist.routes.js.map