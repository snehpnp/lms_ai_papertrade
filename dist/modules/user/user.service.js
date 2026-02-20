"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_1 = require("../../utils/prisma");
const auth_service_1 = require("../auth/auth.service");
const referral_1 = require("../../utils/referral");
const errors_1 = require("../../utils/errors");
const defaultUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    isBlocked: true,
    referralCode: true,
    referredById: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
};
exports.userService = {
    async create(data) {
        const existing = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existing)
            throw new errors_1.ConflictError('Email already registered');
        let referredById = null;
        if (data.referralCode && data.role === 'USER') {
            const referrer = await prisma_1.prisma.user.findUnique({
                where: { referralCode: data.referralCode },
            });
            if (referrer)
                referredById = referrer.id;
        }
        const referralCode = (0, referral_1.generateReferralCode)();
        const passwordHash = await auth_service_1.authService.hashPassword(data.password);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                name: data.name,
                role: data.role,
                referralCode,
                referredById,
            },
            select: defaultUserSelect,
        });
        if (referredById) {
            const referred = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
            if (referred)
                await prisma_1.prisma.referral.create({
                    data: {
                        referrerId: referredById,
                        referredId: referred.id,
                        code: data.referralCode,
                    },
                });
        }
        // Create wallet for USER
        if (data.role === 'USER') {
            await prisma_1.prisma.wallet.create({
                data: { userId: user.id, balance: 0 },
            });
        }
        return user;
    },
    async findAll(params) {
        const page = Math.max(1, params.page ?? 1);
        const limit = Math.min(100, Math.max(1, params.limit ?? 20));
        const skip = (page - 1) * limit;
        const where = {};
        if (params.role)
            where.role = params.role;
        if (params.search) {
            where.OR = [
                { email: { contains: params.search, mode: 'insensitive' } },
                { name: { contains: params.search, mode: 'insensitive' } },
                { referralCode: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (params.subadminId) {
            where.referredById = params.subadminId;
        }
        const [items, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                select: defaultUserSelect,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    },
    async findById(id, options) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                ...defaultUserSelect,
                wallet: true,
                _count: {
                    select: {
                        enrollments: true,
                        trades: true,
                        positions: true,
                    },
                },
            },
        });
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        if (options?.forSubadmin && user.referredById !== options.forSubadmin)
            throw new errors_1.NotFoundError('User not found');
        return user;
    },
    async update(id, data, options) {
        await this.findById(id, options);
        if (data.email) {
            const existing = await prisma_1.prisma.user.findFirst({
                where: { email: data.email, NOT: { id } },
            });
            if (existing)
                throw new errors_1.ConflictError('Email already in use');
        }
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.password)
            updateData.passwordHash = await auth_service_1.authService.hashPassword(data.password);
        return prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: defaultUserSelect,
        });
    },
    async delete(id, options) {
        await this.findById(id, options);
        await prisma_1.prisma.user.delete({ where: { id } });
        return { message: 'User deleted' };
    },
    async block(id, options) {
        await this.findById(id, options);
        return prisma_1.prisma.user.update({
            where: { id },
            data: { isBlocked: true },
            select: defaultUserSelect,
        });
    },
    async unblock(id, options) {
        await this.findById(id, options);
        return prisma_1.prisma.user.update({
            where: { id },
            data: { isBlocked: false },
            select: defaultUserSelect,
        });
    },
    async getActivityReport(userId, options) {
        await this.findById(userId, options);
        const logs = await prisma_1.prisma.activityLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 500,
        });
        return { userId, logs };
    },
    async getTradingReport(userId, options) {
        await this.findById(userId, options);
        const [trades, positions, wallet] = await Promise.all([
            prisma_1.prisma.trade.findMany({
                where: { userId },
                orderBy: { executedAt: 'desc' },
                take: 500,
            }),
            prisma_1.prisma.position.findMany({
                where: { userId },
                orderBy: { openedAt: 'desc' },
            }),
            prisma_1.prisma.wallet.findUnique({ where: { userId } }),
        ]);
        const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl ?? 0), 0);
        const winningTrades = trades.filter((t) => Number(t.pnl ?? 0) > 0).length;
        return {
            userId,
            totalTrades: trades.length,
            winningTrades,
            winRate: trades.length ? (winningTrades / trades.length) * 100 : 0,
            totalPnl,
            walletBalance: wallet ? Number(wallet.balance) : 0,
            trades,
            positions,
        };
    },
    async getCourseProgress(userId, options) {
        await this.findById(userId, options);
        const enrollments = await prisma_1.prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: { select: { id: true, title: true, slug: true } },
                progress: { include: { lesson: { select: { id: true, title: true } } } },
                certificate: true,
            },
        });
        const result = enrollments.map((e) => {
            const totalLessons = e.course ? 0 : 0; // would need course.modules.lessons count
            const completed = e.progress.length;
            return {
                courseId: e.course?.id,
                courseTitle: e.course?.title,
                enrolledAt: e.enrolledAt,
                completedLessons: completed,
                completedAt: e.completedAt,
                certificate: e.certificate,
            };
        });
        const courseIds = enrollments.map((e) => e.courseId);
        const lessonCounts = await prisma_1.prisma.lesson.count({
            where: { module: { courseId: { in: courseIds } } },
        });
        // Simplified: return per-enrollment progress
        return { enrollments: result, userId };
    },
};
//# sourceMappingURL=user.service.js.map