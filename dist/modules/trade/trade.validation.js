"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardQuerySchema = exports.historyQuerySchema = exports.ordersQuerySchema = exports.closePositionSchema = exports.placeOrderSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.placeOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        symbol: zod_1.z.string().min(1),
        side: zod_1.z.nativeEnum(client_1.OrderSide),
        quantity: zod_1.z.number().positive(),
        price: zod_1.z.number().positive().optional(),
        orderType: zod_1.z.enum(['MARKET', 'LIMIT']),
    }),
});
exports.closePositionSchema = zod_1.z.object({
    params: zod_1.z.object({ positionId: zod_1.z.string().uuid() }),
    body: zod_1.z.object({ closePrice: zod_1.z.number().positive() }),
});
exports.ordersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.OrderStatus).optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    }),
});
exports.historyQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        symbol: zod_1.z.string().optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(500).optional(),
    }),
});
exports.leaderboardQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        sortBy: zod_1.z.enum(['net_profit_pct', 'win_rate', 'consistency']).optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    }),
});
//# sourceMappingURL=trade.validation.js.map