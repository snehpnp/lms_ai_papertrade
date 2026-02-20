import { z } from 'zod';
export declare const creditDebitSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        userId: string;
    }, {
        userId: string;
    }>;
    body: z.ZodObject<{
        amount: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        description?: string | undefined;
    }, {
        amount: number;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        userId: string;
    };
    body: {
        amount: number;
        description?: string | undefined;
    };
}, {
    params: {
        userId: string;
    };
    body: {
        amount: number;
        description?: string | undefined;
    };
}>;
export declare const historyQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId?: string | undefined;
    }, {
        userId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        userId?: string | undefined;
    };
}, {
    query: {
        userId?: string | undefined;
    };
}>;
//# sourceMappingURL=wallet.validation.d.ts.map