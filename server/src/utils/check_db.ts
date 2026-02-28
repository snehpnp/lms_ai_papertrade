import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const columns: any[] = await prisma.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User'
        `);
    } catch (err) {
        console.error('Error fetching columns:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
