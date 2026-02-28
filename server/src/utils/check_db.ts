import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const columns: any[] = await prisma.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User'
        `);
        console.log('Columns in User table:', columns.map(c => c.column_name).sort());
    } catch (err) {
        console.error('Error fetching columns:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
