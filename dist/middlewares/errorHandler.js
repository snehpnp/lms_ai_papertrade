"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
const config_1 = require("../config");
const client_1 = require("@prisma/client");
function errorHandler(err, _req, res, _next) {
    if (err instanceof errors_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
        return;
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            code: 'UNAUTHORIZED',
        });
        return;
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            res.status(409).json({
                success: false,
                message: 'Resource already exists',
                code: 'CONFLICT',
            });
            return;
        }
        if (err.code === 'P2025') {
            res.status(404).json({
                success: false,
                message: 'Resource not found',
                code: 'NOT_FOUND',
            });
            return;
        }
    }
    console.error(err);
    res.status(500).json({
        success: false,
        message: config_1.config.env === 'production' ? 'Internal server error' : err.message,
        code: 'INTERNAL_ERROR',
    });
}
//# sourceMappingURL=errorHandler.js.map