"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../utils/prisma");
const auth_service_1 = require("../auth/auth.service");
const referral_1 = require("../../utils/referral");
const wallet_service_1 = require("../wallet/wallet.service");
const errors_1 = require("../../utils/errors");
async function registerUser(data) {
    const existing = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
    if (existing)
        throw new errors_1.ConflictError('Email already registered');
    const referralCode = (0, referral_1.generateReferralCode)();
    let referredById = null;
    let referrerCode = null;
    if (data.referralCode) {
        const referrer = await prisma_1.prisma.user.findFirst({
            where: {
                referralCode: data.referralCode,
                role: { in: ['SUBADMIN', 'ADMIN'] },
            },
            select: { id: true, referralCode: true },
        });
        if (referrer) {
            referredById = referrer.id;
            referrerCode = referrer.referralCode;
        }
    }
    else {
        const adminUser = await prisma_1.prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { id: true, referralCode: true },
        });
        if (adminUser) {
            referredById = adminUser.id;
            referrerCode = adminUser.referralCode;
        }
    }
    const passwordHash = await auth_service_1.authService.hashPassword(data.password);
    const user = await prisma_1.prisma.user.create({
        data: {
            email: data.email,
            passwordHash,
            name: data.name,
            role: 'USER',
            referralCode,
            referredById,
        },
        select: { id: true, email: true, name: true, role: true, referralCode: true, referredById: true },
    });
    if (referredById && referrerCode) {
        await prisma_1.prisma.referral.create({
            data: {
                referrerId: referredById,
                referredId: user.id,
                code: referrerCode,
            },
        });
    }
    await prisma_1.prisma.wallet.create({ data: { userId: user.id, balance: 0 } });
    // Auto-credit referral signup bonus if referrer has set an amount (raw query so it works even if Prisma client was not regenerated)
    if (referredById) {
        const rows = await prisma_1.prisma.$queryRaw(client_1.Prisma.sql `SELECT referral_signup_bonus_amount FROM "User" WHERE id = ${referredById}`);
        const bonusAmount = rows[0]?.referral_signup_bonus_amount != null ? Number(rows[0].referral_signup_bonus_amount) : 0;
        if (bonusAmount > 0) {
            await wallet_service_1.walletService.credit(user.id, bonusAmount, 'Referral signup bonus', undefined, undefined);
        }
    }
    return user;
}
//# sourceMappingURL=user.register.service.js.map