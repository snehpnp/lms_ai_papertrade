"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
exports.walletService = {
    async getOrCreateWallet(userId) {
        let wallet = await prisma_1.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) {
            wallet = await prisma_1.prisma.wallet.create({ data: { userId, balance: 0 } });
        }
        return wallet;
    },
    async getBalance(userId) {
        const wallet = await this.getOrCreateWallet(userId);
        return { balance: Number(wallet.balance) };
    },
    async credit(userId, amount, description, reference, creditedBy) {
        if (amount <= 0)
            throw new errors_1.BadRequestError('Amount must be positive');
        if (creditedBy?.role === 'SUBADMIN') {
            const target = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: { referredById: true },
            });
            if (!target || target.referredById !== creditedBy.userId)
                throw new errors_1.ForbiddenError('You can only add balance to users who registered with your referral code');
        }
        const wallet = await this.getOrCreateWallet(userId);
        const newBalance = Number(wallet.balance) + amount;
        const desc = description ??
            (creditedBy?.role === 'SUBADMIN' ? 'Subadmin credit' : 'Admin credit');
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: newBalance },
            }),
            prisma_1.prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: client_1.WalletTransactionType.CREDIT,
                    amount,
                    balanceAfter: newBalance,
                    reference,
                    description: desc,
                },
            }),
        ]);
        return { balance: newBalance, message: 'Credited successfully' };
    },
    async debit(userId, amount, description, reference) {
        if (amount <= 0)
            throw new errors_1.BadRequestError('Amount must be positive');
        const wallet = await this.getOrCreateWallet(userId);
        const current = Number(wallet.balance);
        if (current < amount)
            throw new errors_1.BadRequestError('Insufficient balance');
        const newBalance = current - amount;
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: newBalance },
            }),
            prisma_1.prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: client_1.WalletTransactionType.DEBIT,
                    amount: -amount,
                    balanceAfter: newBalance,
                    reference,
                    description: description ?? 'Admin debit',
                },
            }),
        ]);
        return { balance: newBalance, message: 'Deducted successfully' };
    },
    async getTransactionHistory(userId, options) {
        const id = options?.targetUserId ?? userId;
        const wallet = await this.getOrCreateWallet(id);
        const transactions = await prisma_1.prisma.walletTransaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        return {
            userId: id,
            balance: Number(wallet.balance),
            transactions,
        };
    },
    /** Internal: add/subtract balance with trade reference (used by trading engine) */
    async addTradePnl(walletId, amount, tradeId) {
        const wallet = await prisma_1.prisma.wallet.findUnique({ where: { id: walletId } });
        if (!wallet)
            throw new errors_1.NotFoundError('Wallet not found');
        const newBalance = Number(wallet.balance) + amount;
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: newBalance },
            }),
            prisma_1.prisma.walletTransaction.create({
                data: {
                    walletId,
                    type: client_1.WalletTransactionType.TRADE_PNL,
                    amount,
                    balanceAfter: newBalance,
                    reference: tradeId,
                    description: 'Trade P&L',
                },
            }),
        ]);
        return newBalance;
    },
};
//# sourceMappingURL=wallet.service.js.map