"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersSchema = exports.userIdParamSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const roleEnum = zod_1.z.nativeEnum(client_1.Role);
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        name: zod_1.z.string().min(1),
        role: roleEnum,
        referralCode: zod_1.z.string().optional(),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        email: zod_1.z.string().email().optional(),
        password: zod_1.z.string().min(8).optional(),
        role: roleEnum.optional(),
    }),
});
exports.userIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
});
exports.listUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        role: roleEnum.optional(),
        search: zod_1.z.string().optional(),
        page: zod_1.z.coerce.number().int().min(1).optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    }),
});
//# sourceMappingURL=user.validation.js.map