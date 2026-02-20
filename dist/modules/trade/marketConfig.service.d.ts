export declare const marketConfigService: {
    list(): Promise<{
        symbol: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        lotSize: import("@prisma/client/runtime/library").Decimal;
        tickSize: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }[]>;
    create(data: {
        symbol: string;
        name?: string;
        lotSize?: number;
        tickSize?: number;
    }): Promise<{
        symbol: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        lotSize: import("@prisma/client/runtime/library").Decimal;
        tickSize: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }>;
    update(id: string, data: {
        name?: string;
        lotSize?: number;
        tickSize?: number;
        isActive?: boolean;
    }): Promise<{
        symbol: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        lotSize: import("@prisma/client/runtime/library").Decimal;
        tickSize: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
};
export declare const brokerageConfigService: {
    list(): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: import("@prisma/client/runtime/library").Decimal;
        minCharge: import("@prisma/client/runtime/library").Decimal | null;
        isDefault: boolean;
    }[]>;
    create(data: {
        type: string;
        value: number;
        minCharge?: number;
        isDefault?: boolean;
    }): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: import("@prisma/client/runtime/library").Decimal;
        minCharge: import("@prisma/client/runtime/library").Decimal | null;
        isDefault: boolean;
    }>;
    update(id: string, data: {
        type?: string;
        value?: number;
        minCharge?: number;
        isDefault?: boolean;
    }): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: import("@prisma/client/runtime/library").Decimal;
        minCharge: import("@prisma/client/runtime/library").Decimal | null;
        isDefault: boolean;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=marketConfig.service.d.ts.map