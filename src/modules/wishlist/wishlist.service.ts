import { prisma } from '../../utils/prisma';
import { NotFoundError } from '../../utils/errors';

export const wishlistService = {
  async add(userId: string, symbol: string) {
    const s = symbol.toUpperCase();
    const item = await prisma.wishlistItem.upsert({
      where: { userId_symbol: { userId, symbol: s } },
      create: { userId, symbol: s },
      update: {},
    });
    return item;
  },

  async remove(userId: string, symbol: string) {
    const s = symbol.toUpperCase();
    await prisma.wishlistItem.deleteMany({
      where: { userId, symbol: s },
    });
    return { message: 'Removed from wishlist' };
  },

  async list(userId: string) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return items;
  },
};
