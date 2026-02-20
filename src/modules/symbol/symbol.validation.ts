import { z } from 'zod';
import { Exchange, InstrumentType } from '@prisma/client';

export const searchSymbolsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    exchange: z.nativeEnum(Exchange).optional(),
    instrument: z.nativeEnum(InstrumentType).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const symbolIdParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});
