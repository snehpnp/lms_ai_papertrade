import { z } from 'zod';

export const createWatchlistSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(50),
    }),
});

export const updateWatchlistSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().min(1).max(50),
    }),
});

export const watchlistIdSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const addSymbolSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        symbolId: z.string().uuid(),
    }),
});

export const removeSymbolSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
        symbolId: z.string().uuid(),
    }),
});
