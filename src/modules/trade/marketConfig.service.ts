import { prisma } from '../../utils/prisma';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export const marketConfigService = {
  async list() {
    return prisma.marketConfig.findMany({
      orderBy: { symbol: 'asc' },
    });
  },

  async create(data: { symbol: string; name?: string; lotSize?: number; tickSize?: number }) {
    const symbol = data.symbol.toUpperCase();
    const existing = await prisma.marketConfig.findUnique({ where: { symbol } });
    if (existing) throw new BadRequestError('Symbol already exists');
    return prisma.marketConfig.create({
      data: {
        symbol,
        name: data.name,
        lotSize: data.lotSize ?? 1,
        tickSize: data.tickSize ?? 0.01,
      },
    });
  },

  async update(id: string, data: { name?: string; lotSize?: number; tickSize?: number; isActive?: boolean }) {
    await prisma.marketConfig.findUniqueOrThrow({ where: { id } });
    return prisma.marketConfig.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    await prisma.marketConfig.delete({ where: { id } });
    return { message: 'Deleted' };
  },
};

export const brokerageConfigService = {
  async list() {
    return prisma.brokerageConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: { type: string; value: number; minCharge?: number; isDefault?: boolean }) {
    if (data.isDefault) {
      await prisma.brokerageConfig.updateMany({ data: { isDefault: false } });
    }
    return prisma.brokerageConfig.create({
      data: {
        type: data.type,
        value: data.value,
        minCharge: data.minCharge,
        isDefault: data.isDefault ?? false,
      },
    });
  },

  async update(id: string, data: { type?: string; value?: number; minCharge?: number; isDefault?: boolean }) {
    if (data.isDefault) {
      await prisma.brokerageConfig.updateMany({ data: { isDefault: false } });
    }
    return prisma.brokerageConfig.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    await prisma.brokerageConfig.delete({ where: { id } });
    return { message: 'Deleted' };
  },
};
