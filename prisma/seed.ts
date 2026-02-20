import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tradelearn.pro';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        name: 'Admin',
        role: 'ADMIN',
        referralCode: generateReferralCode(),
      },
    });
  }

  const defaultBrokerage = await prisma.brokerageConfig.findFirst({ where: { isDefault: true } });
  if (!defaultBrokerage) {
    await prisma.brokerageConfig.create({
      data: {
        type: 'PERCENTAGE',
        value: 0.1,
        minCharge: 10,
        isDefault: true,
      },
    });
  }

  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'];
  for (const symbol of symbols) {
    await prisma.marketConfig.upsert({
      where: { symbol },
      create: { symbol, name: symbol, lotSize: 1, tickSize: 0.05 },
      update: {},
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
