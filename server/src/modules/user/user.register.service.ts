import { Prisma } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { authService } from '../auth/auth.service';
import { generateReferralCode } from '../../utils/referral';
import { walletService } from '../wallet/wallet.service';
import { ConflictError } from '../../utils/errors';

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  referralCode?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictError('Email already registered');

  const referralCode = generateReferralCode();
  let referredById: string | null = null;
  let referrerCode: string | null = null;

  if (data.referralCode) {
    const referrer = await prisma.user.findFirst({
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
  } else {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, referralCode: true },
    });
    if (adminUser) {
      referredById = adminUser.id;
      referrerCode = adminUser.referralCode;
    }
  }

  const passwordHash = await authService.hashPassword(data.password);
  const user = await prisma.user.create({
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
    await prisma.referral.create({
      data: {
        referrerId: referredById,
        referredId: user.id,
        code: referrerCode,
      },
    });
  }

  await prisma.wallet.create({ data: { userId: user.id, balance: 0 } });

  // Auto-credit referral signup bonus if referrer has set an amount (raw query so it works even if Prisma client was not regenerated)
  if (referredById) {
    const rows = await prisma.$queryRaw<[{ referral_signup_bonus_amount: unknown }]>(
      Prisma.sql`SELECT referral_signup_bonus_amount FROM "User" WHERE id = ${referredById}`
    );
    const bonusAmount = rows[0]?.referral_signup_bonus_amount != null ? Number(rows[0].referral_signup_bonus_amount) : 0;
    if (bonusAmount > 0) {
      await walletService.credit(
        user.id,
        bonusAmount,
        'Referral signup bonus',
        undefined,
        undefined
      );
    }
  }

  return user;
}
