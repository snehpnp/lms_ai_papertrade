import { z } from 'zod';
export declare const placeOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        symbol: z.ZodString;
        side: z.ZodNativeEnum<{
            BUY: "BUY";
            SELL: "SELL";
        }>;
        quantity: z.ZodNumber;
        price: z.ZodOptional<z.ZodNumber>;
        orderType: z.ZodEnum<["MARKET", "LIMIT"]>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        side: "BUY" | "SELL";
        quantity: number;
        orderType: "MARKET" | "LIMIT";
        price?: number | undefined;
    }, {
        symbol: string;
        side: "BUY" | "SELL";
        quantity: number;
        orderType: "MARKET" | "LIMIT";
        price?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        symbol: string;
        side: "BUY" | "SELL";
        quantity: number;
        orderType: "MARKET" | "LIMIT";
        price?: number | undefined;
    };
}, {
    body: {
        symbol: string;
        side: "BUY" | "SELL";
        quantity: number;
        orderType: "MARKET" | "LIMIT";
        price?: number | undefined;
    };
}>;
export declare const closePositionSchema: z.ZodObject<{
    params: z.ZodObject<{
        positionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        positionId: string;
    }, {
        positionId: string;
    }>;
    body: z.ZodObject<{
        closePrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        closePrice: number;
    }, {
        closePrice: number;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        positionId: string;
    };
    body: {
        closePrice: number;
    };
}, {
    params: {
        positionId: string;
    };
    body: {
        closePrice: number;
    };
}>;
export declare const ordersQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        status: z.ZodOptional<z.ZodNativeEnum<{
            PENDING: "PENDING";
            FILLED: "FILLED";
            CANCELLED: "CANCELLED";
            REJECTED: "REJECTED";
        }>>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status?: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED" | undefined;
        limit?: number | undefined;
    }, {
        status?: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED" | undefined;
        limit?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        status?: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED" | undefined;
        limit?: number | undefined;
    };
}, {
    query: {
        status?: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED" | undefined;
        limit?: number | undefined;
    };
}>;
export declare const historyQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        symbol: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        symbol?: string | undefined;
        limit?: number | undefined;
    }, {
        symbol?: string | undefined;
        limit?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        symbol?: string | undefined;
        limit?: number | undefined;
    };
}, {
    query: {
        symbol?: string | undefined;
        limit?: number | undefined;
    };
}>;
export declare const leaderboardQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        sortBy: z.ZodOptional<z.ZodEnum<["net_profit_pct", "win_rate", "consistency"]>>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit?: number | undefined;
        sortBy?: "net_profit_pct" | "win_rate" | "consistency" | undefined;
    }, {
        limit?: number | undefined;
        sortBy?: "net_profit_pct" | "win_rate" | "consistency" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit?: number | undefined;
        sortBy?: "net_profit_pct" | "win_rate" | "consistency" | undefined;
    };
}, {
    query: {
        limit?: number | undefined;
        sortBy?: "net_profit_pct" | "win_rate" | "consistency" | undefined;
    };
}>;
//# sourceMappingURL=trade.validation.d.ts.map