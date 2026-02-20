"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyQuerySchema = exports.creditDebitSchema = void 0;
const zod_1 = require("zod");
exports.creditDebitSchema = zod_1.z.object({
    params: zod_1.z.object({ userId: zod_1.z.string().uuid() }),
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
        description: zod_1.z.string().optional(),
    }),
});
exports.historyQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        userId: zod_1.z.string().uuid().optional(), // admin only
    }),
});
//# sourceMappingURL=wallet.validation.js.map