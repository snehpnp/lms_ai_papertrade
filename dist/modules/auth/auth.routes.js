"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const authenticate_1 = require("../../middlewares/authenticate");
const validate_1 = require("../../middlewares/validate");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
// Public
router.post('/admin/login', (0, validate_1.validate)(auth_validation_1.loginSchema), auth_controller_1.authController.adminLogin);
router.post('/subadmin/login', (0, validate_1.validate)(auth_validation_1.loginSchema), auth_controller_1.authController.subadminLogin);
router.post('/user/login', (0, validate_1.validate)(auth_validation_1.loginSchema), auth_controller_1.authController.userLogin);
router.post('/refresh', (0, validate_1.validate)(auth_validation_1.refreshSchema), auth_controller_1.authController.refresh);
router.post('/forgot-password', (0, validate_1.validate)(auth_validation_1.forgotPasswordSchema), auth_controller_1.authController.forgotPassword);
router.post('/reset-password', (0, validate_1.validate)(auth_validation_1.resetPasswordSchema), auth_controller_1.authController.resetPassword);
// Protected - any authenticated user
router.post('/logout', authenticate_1.authenticate, auth_controller_1.authController.logout);
router.post('/change-password', authenticate_1.authenticate, (0, validate_1.validate)(auth_validation_1.changePasswordSchema), auth_controller_1.authController.changePassword);
exports.authRoutes = router;
//# sourceMappingURL=auth.routes.js.map