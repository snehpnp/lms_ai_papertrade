"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
exports.authController = {
    async login(req, res, next) {
        try {
            const { email, password, role } = req.body;
            const tokens = await auth_service_1.authService.login(email, password, role);
            res.json({
                success: true,
                data: tokens,
                message: 'Login successful',
            });
        }
        catch (e) {
            next(e);
        }
    },
    async adminLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            const tokens = await auth_service_1.authService.adminLogin(email, password);
            res.json({
                success: true,
                data: tokens,
                message: 'Admin login successful',
            });
        }
        catch (e) {
            next(e);
        }
    },
    async subadminLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            const tokens = await auth_service_1.authService.subadminLogin(email, password);
            res.json({
                success: true,
                data: tokens,
                message: 'Subadmin login successful',
            });
        }
        catch (e) {
            next(e);
        }
    },
    async userLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            const tokens = await auth_service_1.authService.userLogin(email, password);
            res.json({
                success: true,
                data: tokens,
                message: 'Login successful',
            });
        }
        catch (e) {
            next(e);
        }
    },
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const tokens = await auth_service_1.authService.refreshTokens(refreshToken);
            res.json({
                success: true,
                data: tokens,
                message: 'Tokens refreshed',
            });
        }
        catch (e) {
            next(e);
        }
    },
    async logout(req, res, next) {
        try {
            const refreshToken = req.body.refreshToken;
            await auth_service_1.authService.logout(refreshToken);
            res.json({ success: true, message: 'Logged out successfully' });
        }
        catch (e) {
            next(e);
        }
    },
    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;
            await auth_service_1.authService.changePassword(userId, currentPassword, newPassword);
            res.json({ success: true, message: 'Password changed successfully' });
        }
        catch (e) {
            next(e);
        }
    },
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const token = await auth_service_1.authService.createResetToken(email);
            // In production, send token via email. For API we return generic message.
            res.json({
                success: true,
                message: 'If the email exists, a reset link has been sent.',
                // Only in dev for testing: token (remove in production)
                ...(process.env.NODE_ENV === 'development' && token ? { resetToken: token } : {}),
            });
        }
        catch (e) {
            next(e);
        }
    },
    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            await auth_service_1.authService.resetPassword(token, newPassword);
            res.json({ success: true, message: 'Password reset successfully' });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map