"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileService = void 0;
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
const profileSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    referralCode: true,
    referredById: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
};
exports.profileService = {
    async getProfile(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: profileSelect,
        });
        if (!user)
            return null;
        return user;
    },
    async updateProfile(userId, data) {
        if (data.email) {
            const existing = await prisma_1.prisma.user.findFirst({
                where: { email: data.email, NOT: { id: userId } },
            });
            if (existing)
                throw new errors_1.ConflictError('Email already in use');
        }
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.email !== undefined)
            updateData.email = data.email;
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: profileSelect,
        });
    },
};
//# sourceMappingURL=profile.service.js.map