import { z } from 'zod';
import { Role } from '@prisma/client';

const roleEnum = z.nativeEnum(Role);

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    phoneNumber: z.string().min(1),
    role: roleEnum,
    referralCode: z.string().optional(),

    initialBalance: z.number().nonnegative().optional(),
    brokerRedirectUrl: z.string().url().optional().or(z.literal(''))
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().min(1).optional(),
    password: z.string().min(8).optional(),
    role: roleEnum.optional(),
    isPaperTradeDefault: z.boolean().optional(),
    isLearningMode: z.boolean().optional(),
    brokerRedirectUrl: z.string().url().optional().or(z.literal('')).nullable()
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const listUsersSchema = z.object({
  query: z.object({
    role: roleEnum.optional(),
    search: z.string().optional(),
    status: z.enum(['ALL', 'ACTIVE', 'BLOCKED']).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
