"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistService = void 0;
const prisma_1 = require("../../utils/prisma");
exports.wishlistService = {
    async add(userId, symbol) {
        const s = symbol.toUpperCase();
        const item = await prisma_1.prisma.wishlistItem.upsert({
            where: { userId_symbol: { userId, symbol: s } },
            create: { userId, symbol: s },
            update: {},
        });
        return item;
    },
    async remove(userId, symbol) {
        const s = symbol.toUpperCase();
        await prisma_1.prisma.wishlistItem.deleteMany({
            where: { userId, symbol: s },
        });
        return { message: 'Removed from wishlist' };
    },
    async list(userId) {
        const items = await prisma_1.prisma.wishlistItem.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return items;
    },
};
//# sourceMappingURL=wishlist.service.js.map