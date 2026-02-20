"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralService = void 0;
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
exports.referralService = {
    /** Admin/Subadmin: set the virtual balance amount new users get when they register with their referral code */
    async setSignupBonus(userId, role, amount) {
        if (role !== 'ADMIN' && role !== 'SUBADMIN')
            throw new errors_1.ForbiddenError('Not allowed');
        if (amount < 0)
            throw new errors_1.BadRequestError('Amount cannot be negative');
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { referralSignupBonusAmount: amount },
            select: { id: true, referralCode: true, referralSignupBonusAmount: true },
        });
        return user;
    },
    /** Admin/Subadmin: get their current referral signup bonus amount */
    async getSignupBonus(userId, role) {
        if (role !== 'ADMIN' && role !== 'SUBADMIN')
            throw new errors_1.ForbiddenError('Not allowed');
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true, referralSignupBonusAmount: true },
        });
        return user
            ? {
                referralCode: user.referralCode,
                signupBonusAmount: user.referralSignupBonusAmount ? Number(user.referralSignupBonusAmount) : 0,
            }
            : null;
    },
    async getReferredUsers(subadminId, params) {
        const page = Math.max(1, params?.page ?? 1);
        const limit = Math.min(100, params?.limit ?? 20);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where: { referredById: subadminId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    referralCode: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.prisma.user.count({ where: { referredById: subadminId } }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    },
    async getCommissionReport(userId, role) {
        if (role !== 'SUBADMIN' && role !== 'ADMIN')
            throw new errors_1.ForbiddenError('Not allowed');
        const commissions = await prisma_1.prisma.commission.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        const total = commissions.reduce((s, c) => s + Number(c.amount), 0);
        return { total, commissions };
    },
    async getCourseRevenue(subadminId) {
        const payments = await prisma_1.prisma.payment.findMany({
            where: {
                course: { subadminId },
                status: 'SUCCESS',
            },
            include: { course: { select: { id: true, title: true } } },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        const total = payments.reduce((s, p) => s + Number(p.amount), 0);
        return { total, payments };
    },
};
//# sourceMappingURL=referral.service.js.map