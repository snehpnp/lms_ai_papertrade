import { z } from 'zod';
import { OrderSide, OrderStatus } from '@prisma/client';

export const placeOrderSchema = z.object({
  body: z.object({
    symbolId: z.string().optional(),
    symbol: z.string().optional(),
    side: z.nativeEnum(OrderSide),
    quantity: z.number().positive(),
    price: z.number().positive().optional(),
    orderType: z.enum(['MARKET', 'LIMIT']),
  }),
});

export const closePositionSchema = z.object({
  params: z.object({ positionId: z.string().uuid() }),
  body: z.object({ closePrice: z.number().positive() }),
});

export const ordersQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const historyQuerySchema = z.object({
  query: z.object({
    symbol: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(500).optional(),
  }),
});

export const leaderboardQuerySchema = z.object({
  query: z.object({
    sortBy: z.enum(['net_profit_pct', 'win_rate', 'consistency']).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
