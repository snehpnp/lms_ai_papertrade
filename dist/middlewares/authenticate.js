"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const auth_service_1 = require("../modules/auth/auth.service");
const errors_1 = require("../utils/errors");
function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        next(new errors_1.UnauthorizedError('Access token required'));
        return;
    }
    try {
        const payload = auth_service_1.authService.verifyAccessToken(token);
        req.user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch {
        next(new errors_1.UnauthorizedError('Invalid or expired token'));
    }
}
/** Optionally attach user if token present; never fail. */
function optionalAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        next();
        return;
    }
    try {
        const payload = auth_service_1.authService.verifyAccessToken(token);
        req.user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
        };
    }
    catch {
        // ignore
    }
    next();
}
//# sourceMappingURL=authenticate.js.map