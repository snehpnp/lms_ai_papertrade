import { prisma } from '../../utils/prisma';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export const getWatchlists = async (userId: string) => {
    return prisma.watchlist.findMany({
        where: { userId },
        include: {
            items: {
                include: {
                    symbol: true,
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
};

export const createWatchlist = async (userId: string, name: string) => {
    // Ensure user exists before creating watchlist to avoid P2003
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found. Cannot create watchlist.');

    return prisma.watchlist.create({
        data: {
            userId,
            name,
        },
    });
};

export const updateWatchlist = async (id: string, userId: string, name: string) => {
    const watchlist = await prisma.watchlist.findUnique({ where: { id } });
    if (!watchlist) throw new NotFoundError('Watchlist not found');
    if (watchlist.userId !== userId) throw new ForbiddenError('Unauthorized');

    return prisma.watchlist.update({
        where: { id },
        data: { name },
    });
};

export const deleteWatchlist = async (id: string, userId: string) => {
    const watchlist = await prisma.watchlist.findUnique({ where: { id } });
    if (!watchlist) throw new NotFoundError('Watchlist not found');
    if (watchlist.userId !== userId) throw new ForbiddenError('Unauthorized');

    return prisma.watchlist.delete({
        where: { id },
    });
};

export const addSymbolToWatchlist = async (watchlistId: string, userId: string, symbolId: string) => {
    const watchlist = await prisma.watchlist.findUnique({
        where: { id: watchlistId },
    });

    if (!watchlist) throw new NotFoundError('Watchlist not found');
    if (watchlist.userId !== userId) throw new ForbiddenError('Unauthorized');

    return prisma.watchlistItem.create({
        data: {
            watchlistId,
            symbolId,
        },
        include: {
            symbol: true,
        },
    });
};

export const removeSymbolFromWatchlist = async (watchlistId: string, userId: string, symbolId: string) => {
    const watchlist = await prisma.watchlist.findUnique({
        where: { id: watchlistId },
    });

    if (!watchlist) throw new NotFoundError('Watchlist not found');
    if (watchlist.userId !== userId) throw new ForbiddenError('Unauthorized');

    return prisma.watchlistItem.delete({
        where: {
            watchlistId_symbolId: {
                watchlistId,
                symbolId,
            },
        },
    });
};
