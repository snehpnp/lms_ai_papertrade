import { WalletTransactionType } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { Decimal } from '@prisma/client/runtime/library';

export const walletService = {
  async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      // Ensure user exists before creating wallet to avoid P2003
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError('User not found. Cannot create wallet.');

      wallet = await prisma.wallet.create({ data: { userId, balance: 0 } });
    }
    return wallet;
  },

  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: Number(wallet.balance) };
  },

  async credit(
    userId: string,
    amount: number,
    description?: string,
    reference?: string,
    creditedBy?: { userId: string; role: string }
  ) {
    if (amount <= 0) throw new BadRequestError('Amount must be positive');
    if (creditedBy?.role === 'SUBADMIN') {
      const target = await prisma.user.findUnique({
        where: { id: userId },
        select: { referredById: true },
      });
      if (!target || target.referredById !== creditedBy.userId)
        throw new ForbiddenError('You can only add balance to users who registered with your referral code');
    }
    const wallet = await this.getOrCreateWallet(userId);
    const newBalance = Number(wallet.balance) + amount;
    const desc =
      description ??
      (creditedBy?.role === 'SUBADMIN' ? 'Subadmin credit' : 'Admin credit');
    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.CREDIT,
          amount,
          balanceAfter: newBalance,
          reference,
          description: desc,
        },
      }),
    ]);
    return { balance: newBalance, message: 'Credited successfully' };
  },

  async debit(
    userId: string,
    amount: number,
    description?: string,
    reference?: string
  ) {
    if (amount <= 0) throw new BadRequestError('Amount must be positive');
    const wallet = await this.getOrCreateWallet(userId);
    const current = Number(wallet.balance);
    if (current < amount) throw new BadRequestError('Insufficient balance');
    const newBalance = current - amount;
    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.DEBIT,
          amount: -amount,
          balanceAfter: newBalance,
          reference,
          description: description ?? 'Admin debit',
        },
      }),
    ]);
    return { balance: newBalance, message: 'Deducted successfully' };
  },

  async getTransactionHistory(
    userId: string,
    options?: { targetUserId?: string }
  ) {
    const id = options?.targetUserId ?? userId;
    const wallet = await this.getOrCreateWallet(id);
    const transactions = await prisma.walletTransaction.findMany({
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
  async addTradePnl(
    walletId: string,
    amount: number,
    tradeId: string
  ) {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new NotFoundError('Wallet not found');
    const newBalance = Number(wallet.balance) + amount;
    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId,
          type: WalletTransactionType.TRADE_PNL,
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
