import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
        role: z.ZodNativeEnum<{
            ADMIN: "ADMIN";
            SUBADMIN: "SUBADMIN";
            USER: "USER";
        }>;
        referralCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        role: "ADMIN" | "SUBADMIN" | "USER";
        name: string;
        password: string;
        referralCode?: string | undefined;
    }, {
        email: string;
        role: "ADMIN" | "SUBADMIN" | "USER";
        name: string;
        password: string;
        referralCode?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        role: "ADMIN" | "SUBADMIN" | "USER";
        name: string;
        password: string;
        referralCode?: string | undefined;
    };
}, {
    body: {
        email: string;
        role: "ADMIN" | "SUBADMIN" | "USER";
        name: string;
        password: string;
        referralCode?: string | undefined;
    };
}>;
export declare const updateUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodNativeEnum<{
            ADMIN: "ADMIN";
            SUBADMIN: "SUBADMIN";
            USER: "USER";
        }>>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        role?: "ADMIN" | "SUBADMIN" | "USER" | undefined;
        name?: string | undefined;
        password?: string | undefined;
    }, {
        email?: string | undefined;
        role?: "ADMIN" | "SUBADMIN" | "USER" | undefined;
        name?: string | undefined;
        password?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        email?: string | undefined;
        role?: "ADMIN" | "SUBADMIN" | "USER" | undefined;
        name?: string | undefined;
        password?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        email?: string | undefined;
        role?: "ADMIN" | "SUBADMIN" | "USER" | undefined;
        name?: string | undefined;
        password?: string | undefined;
    };
}>;
export declare const userIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const listUsersSchema: z.ZodObject<{
    query: z.ZodObject<{
        role: z.ZodOptional<z.ZodNativeEnum<{
            ADMIN: "ADMIN";
            SUBADMIN: "SUBADMIN";
            USER: "USER";
        }>>;
        search: z.ZodOptional<z.ZodString>;
        page: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        search?: string | undefined;
        role?: "ADMIN" | "SUBADMIN" | "USER" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }, {
        search?: string | undefined;
        role?: "ADMIN" | "SUBADMIN" | "USER" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        search?: string | undefined;
        role?: "ADMIN" | "SUBADMIN" | "USER" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    };
}, {
    query: {
        search?: string | undefined;
        role?: "ADMIN" | "SUBADMIN" | "USER" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    };
}>;
//# sourceMappingURL=user.validation.d.ts.map