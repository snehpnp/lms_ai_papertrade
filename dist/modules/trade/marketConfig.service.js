"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brokerageConfigService = exports.marketConfigService = void 0;
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
exports.marketConfigService = {
    async list() {
        return prisma_1.prisma.marketConfig.findMany({
            orderBy: { symbol: 'asc' },
        });
    },
    async create(data) {
        const symbol = data.symbol.toUpperCase();
        const existing = await prisma_1.prisma.marketConfig.findUnique({ where: { symbol } });
        if (existing)
            throw new errors_1.BadRequestError('Symbol already exists');
        return prisma_1.prisma.marketConfig.create({
            data: {
                symbol,
                name: data.name,
                lotSize: data.lotSize ?? 1,
                tickSize: data.tickSize ?? 0.01,
            },
        });
    },
    async update(id, data) {
        await prisma_1.prisma.marketConfig.findUniqueOrThrow({ where: { id } });
        return prisma_1.prisma.marketConfig.update({
            where: { id },
            data,
        });
    },
    async delete(id) {
        await prisma_1.prisma.marketConfig.delete({ where: { id } });
        return { message: 'Deleted' };
    },
};
exports.brokerageConfigService = {
    async list() {
        return prisma_1.prisma.brokerageConfig.findMany({
            orderBy: { createdAt: 'desc' },
        });
    },
    async create(data) {
        if (data.isDefault) {
            await prisma_1.prisma.brokerageConfig.updateMany({ data: { isDefault: false } });
        }
        return prisma_1.prisma.brokerageConfig.create({
            data: {
                type: data.type,
                value: data.value,
                minCharge: data.minCharge,
                isDefault: data.isDefault ?? false,
            },
        });
    },
    async update(id, data) {
        if (data.isDefault) {
            await prisma_1.prisma.brokerageConfig.updateMany({ data: { isDefault: false } });
        }
        return prisma_1.prisma.brokerageConfig.update({
            where: { id },
            data,
        });
    },
    async delete(id) {
        await prisma_1.prisma.brokerageConfig.delete({ where: { id } });
        return { message: 'Deleted' };
    },
};
//# sourceMappingURL=marketConfig.service.js.map