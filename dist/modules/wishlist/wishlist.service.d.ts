export declare const wishlistService: {
    add(userId: string, symbol: string): Promise<{
        symbol: string;
        userId: string;
        id: string;
        createdAt: Date;
        symbolId: number | null;
    }>;
    remove(userId: string, symbol: string): Promise<{
        message: string;
    }>;
    list(userId: string): Promise<{
        symbol: string;
        userId: string;
        id: string;
        createdAt: Date;
        symbolId: number | null;
    }[]>;
};
//# sourceMappingURL=wishlist.service.d.ts.map