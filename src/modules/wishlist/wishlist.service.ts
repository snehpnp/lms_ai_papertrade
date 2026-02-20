import { prisma } from "../../utils/prisma";
import { NotFoundError } from "../../utils/errors";

export const wishlistService = {
 async add(userId: string, symbolId: number) {

  const symbol = await prisma.symbol.findUnique({
    where: { id: symbolId }  // number only
  });

  if (!symbol) throw new Error("Symbol not found");

  return prisma.wishlistItem.upsert({
    where: {
      user_symbol_unique: {
        userId,      // STRING UUID
        symbolId,    // NUMBER
      },
    },
    create: {
      userId,
      symbolId,
      symbol: symbol.tradingSymbol,
    },
    update: {},
  });
},

  async remove(userId: string, symbol: string) {
    const s = symbol.toUpperCase();
    await prisma.wishlistItem.deleteMany({
      where: { userId, symbol: s },
    });
    return { message: "Removed from wishlist" };
  },

  async list(userId: string) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return items;
  },
};
