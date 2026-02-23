import { z } from 'zod';

export const creditDebitSchema = z.object({
  params: z.object({ userId: z.string().uuid() }),
  body: z.object({
    amount: z.number().positive(),
    description: z.string().optional(),
  }),
});

export const historyQuerySchema = z.object({
  query: z.object({
    userId: z.string().uuid().optional(), // admin only
  }),
});
