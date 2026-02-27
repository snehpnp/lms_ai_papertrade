import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    avatar: z.string().url().optional(),
    email: z.string().email().optional(),
    brokerRedirectUrl: z
      .string()
      .url("Invalid URL")
      .optional()
      .transform((val) => val ?? "")
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }),
});
