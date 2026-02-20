"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRoutes = void 0;
const express_1 = require("express");
const profile_controller_1 = require("./profile.controller");
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const profile_validation_1 = require("./profile.validation");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, rbac_1.userOnly);
router.get('/profile', profile_controller_1.profileController.getProfile);
router.patch('/profile', (0, validate_1.validate)(profile_validation_1.updateProfileSchema), profile_controller_1.profileController.updateProfile);
exports.profileRoutes = router;
//# sourceMappingURL=profile.routes.js.map