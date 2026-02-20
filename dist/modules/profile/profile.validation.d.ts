import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        name?: string | undefined;
    }, {
        email?: string | undefined;
        name?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email?: string | undefined;
        name?: string | undefined;
    };
}, {
    body: {
        email?: string | undefined;
        name?: string | undefined;
    };
}>;
//# sourceMappingURL=profile.validation.d.ts.map