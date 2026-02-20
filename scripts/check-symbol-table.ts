/**
 * Quick check: does Symbol table exist and is it accessible?
 * Run: npx ts-node scripts/check-symbol-table.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.symbol.count();
    console.log('Symbol table exists. Current row count:', count);
  } catch (e: any) {
    if (e?.code === 'P2021' || e?.message?.includes('does not exist')) {
      console.log('Symbol table NOT found in database.');
      process.exit(1);
    }
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main();
