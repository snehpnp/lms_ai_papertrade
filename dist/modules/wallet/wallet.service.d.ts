import { Decimal } from '@prisma/client/runtime/library';
export declare const walletService: {
    getOrCreateWallet(userId: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Decimal;
    }>;
    getBalance(userId: string): Promise<{
        balance: number;
    }>;
    credit(userId: string, amount: number, description?: string, reference?: string, creditedBy?: {
        userId: string;
        role: string;
    }): Promise<{
        balance: number;
        message: string;
    }>;
    debit(userId: string, amount: number, description?: string, reference?: string): Promise<{
        balance: number;
        message: string;
    }>;
    getTransactionHistory(userId: string, options?: {
        targetUserId?: string;
    }): Promise<{
        userId: string;
        balance: number;
        transactions: {
            type: import(".prisma/client").$Enums.WalletTransactionType;
            id: string;
            createdAt: Date;
            description: string | null;
            walletId: string;
            amount: Decimal;
            balanceAfter: Decimal | null;
            reference: string | null;
        }[];
    }>;
    /** Internal: add/subtract balance with trade reference (used by trading engine) */
    addTradePnl(walletId: string, amount: number, tradeId: string): Promise<number>;
};
//# sourceMappingURL=wallet.service.d.ts.map