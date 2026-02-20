import { Exchange, InstrumentType, Prisma } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { NotFoundError } from '../../utils/errors';

export const symbolService = {
  async search(params: {
    q?: string;
    exchange?: Exchange;
    instrument?: InstrumentType;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SymbolWhereInput = {};
    if (params.exchange) where.exchange = params.exchange;
    if (params.instrument) where.instrument = params.instrument;
    if (params.q && params.q.trim()) {
      const q = params.q.trim();
      where.OR = [
        { symbol: { contains: q, mode: 'insensitive' } },
        { tradingSymbol: { contains: q, mode: 'insensitive' } },
        ...(/^\d+$/.test(q) ? [{ token: q }] : []),
      ];
    }

    const [items, total] = await Promise.all([
      prisma.symbol.findMany({
        where,
        orderBy: [{ exchange: 'asc' }, { tradingSymbol: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.symbol.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getById(id: number) {
    const symbol = await prisma.symbol.findUnique({ where: { id } });
    if (!symbol) throw new NotFoundError('Symbol not found');
    return symbol;
  },

  async getByExchangeAndToken(exchange: Exchange, token: string) {
    const symbol = await prisma.symbol.findUnique({
      where: { exchange_token: { exchange, token } },
    });
    if (!symbol) throw new NotFoundError('Symbol not found');
    return symbol;
  },

  /** Admin only: delete all rows from Symbol table (truncate). */
  async truncate() {
    const result = await prisma.symbol.deleteMany({});
    return { deleted: result.count, message: 'Symbol table truncated' };
  },
};
