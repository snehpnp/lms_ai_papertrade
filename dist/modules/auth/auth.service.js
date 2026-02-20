"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../utils/prisma");
const config_1 = require("../../config");
const errors_1 = require("../../utils/errors");
const SALT_ROUNDS = config_1.config.bcrypt.rounds;
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
exports.authService = {
    async hashPassword(password) {
        return bcryptjs_1.default.hash(password, SALT_ROUNDS);
    },
    async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    },
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign({ ...payload, type: 'access' }, config_1.config.jwt.accessSecret, { expiresIn: config_1.config.jwt.accessExpiry });
    },
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign({ ...payload, type: 'refresh' }, config_1.config.jwt.refreshSecret, { expiresIn: config_1.config.jwt.refreshExpiry });
    },
    verifyAccessToken(token) {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.accessSecret);
        if (decoded.type !== 'access')
            throw new errors_1.UnauthorizedError('Invalid token type');
        return decoded;
    },
    verifyRefreshToken(token) {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
        if (decoded.type !== 'refresh')
            throw new errors_1.UnauthorizedError('Invalid token type');
        return decoded;
    },
    getRefreshExpirySeconds() {
        const match = config_1.config.jwt.refreshExpiry.match(/^(\d+)([smhd])$/);
        if (!match)
            return 7 * 24 * 60 * 60;
        const [, n, unit] = match;
        const num = parseInt(n, 10);
        const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
        return num * (multipliers[unit] || 86400);
    },
    async adminLogin(email, password) {
        return this.login(email, password, 'ADMIN');
    },
    async userLogin(email, password) {
        return this.login(email, password, 'USER');
    },
    async subadminLogin(email, password) {
        return this.login(email, password, 'SUBADMIN');
    },
    /** Common login for all roles. If role is provided, validates user has that role. */
    async login(email, password, expectedRole) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new errors_1.UnauthorizedError('Invalid credentials');
        if (user.isBlocked)
            throw new errors_1.ForbiddenError('Account is blocked');
        if (expectedRole && user.role !== expectedRole) {
            throw new errors_1.ForbiddenError(`${expectedRole} access only`);
        }
        const valid = await this.comparePassword(password, user.passwordHash);
        if (!valid)
            throw new errors_1.UnauthorizedError('Invalid credentials');
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const accessToken = this.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = this.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const tokenHash = hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + this.getRefreshExpirySeconds() * 1000);
        await prisma_1.prisma.refreshToken.create({
            data: { userId: user.id, tokenHash, expiresAt },
        });
        return { accessToken, refreshToken, expiresIn: this.getRefreshExpirySeconds() };
    },
    async refreshTokens(refreshToken) {
        const decoded = this.verifyRefreshToken(refreshToken);
        const tokenHash = hashToken(refreshToken);
        const stored = await prisma_1.prisma.refreshToken.findFirst({
            where: { userId: decoded.userId, tokenHash },
        });
        if (!stored)
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
        if (stored.expiresAt < new Date()) {
            await prisma_1.prisma.refreshToken.delete({ where: { id: stored.id } });
            throw new errors_1.UnauthorizedError('Refresh token expired');
        }
        // Rotation: delete used refresh token
        await prisma_1.prisma.refreshToken.delete({ where: { id: stored.id } });
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.isBlocked)
            throw new errors_1.UnauthorizedError('User not found or blocked');
        const newAccessToken = this.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const newRefreshToken = this.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const newTokenHash = hashToken(newRefreshToken);
        const expiresAt = new Date(Date.now() + this.getRefreshExpirySeconds() * 1000);
        await prisma_1.prisma.refreshToken.create({
            data: { userId: user.id, tokenHash: newTokenHash, expiresAt },
        });
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: this.getRefreshExpirySeconds(),
        };
    },
    async logout(refreshToken) {
        if (!refreshToken)
            return;
        const tokenHash = hashToken(refreshToken);
        await prisma_1.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    },
    async logoutAll(userId) {
        await prisma_1.prisma.refreshToken.deleteMany({ where: { userId } });
    },
    async changePassword(userId, currentPassword, newPassword) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        const valid = await this.comparePassword(currentPassword, user.passwordHash);
        if (!valid)
            throw new errors_1.BadRequestError('Current password is incorrect');
        const hash = await this.hashPassword(newPassword);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: hash },
        });
        await this.logoutAll(userId);
    },
    async createResetToken(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return ''; // Don't leak existence
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = hashToken(token);
        const exp = new Date();
        exp.setHours(exp.getHours() + config_1.config.resetToken.expiryHours);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { resetTokenHash: tokenHash, resetTokenExp: exp },
        });
        return token;
    },
    async resetPassword(token, newPassword) {
        const tokenHash = hashToken(token);
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                resetTokenHash: tokenHash,
                resetTokenExp: { gt: new Date() },
            },
        });
        if (!user)
            throw new errors_1.BadRequestError('Invalid or expired reset token');
        const hash = await this.hashPassword(newPassword);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hash,
                resetTokenHash: null,
                resetTokenExp: null,
            },
        });
        await this.logoutAll(user.id);
    },
};
//# sourceMappingURL=auth.service.js.map