import { OrderSide, OrderStatus, PositionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
export declare const tradeService: {
    getBrokerageCharge(amount: number): Promise<number>;
    validateSymbol(symbol: string): Promise<void>;
    placeOrder(userId: string, data: {
        symbol: string;
        side: OrderSide;
        quantity: number;
        price?: number;
        orderType: string;
    }): Promise<{
        trades: {
            symbol: string;
            userId: string;
            id: string;
            orderId: string;
            side: import(".prisma/client").$Enums.OrderSide;
            quantity: Decimal;
            price: Decimal;
            brokerage: Decimal;
            pnl: Decimal | null;
            positionId: string | null;
            executedAt: Date;
        }[];
    } & {
        symbol: string;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        side: import(".prisma/client").$Enums.OrderSide;
        quantity: Decimal;
        price: Decimal | null;
        orderType: string;
        filledQty: Decimal;
    }>;
    executeMarketOrder(orderId: string, userId: string, symbol: string, side: OrderSide, quantity: number, price: number, brokerage: number, walletId: string): Promise<void>;
    closePosition(userId: string, positionId: string, closePrice: number): Promise<{
        message: string;
        pnl: number;
    }>;
    getOpenPositions(userId: string): Promise<{
        symbol: string;
        userId: string;
        id: string;
        status: import(".prisma/client").$Enums.PositionStatus;
        side: import(".prisma/client").$Enums.OrderSide;
        quantity: Decimal;
        avgPrice: Decimal;
        currentPrice: Decimal | null;
        unrealizedPnl: Decimal | null;
        openedAt: Date;
        closedAt: Date | null;
    }[]>;
    getOrders(userId: string, params?: {
        status?: OrderStatus;
        limit?: number;
    }): Promise<({
        trades: {
            symbol: string;
            userId: string;
            id: string;
            orderId: string;
            side: import(".prisma/client").$Enums.OrderSide;
            quantity: Decimal;
            price: Decimal;
            brokerage: Decimal;
            pnl: Decimal | null;
            positionId: string | null;
            executedAt: Date;
        }[];
    } & {
        symbol: string;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        side: import(".prisma/client").$Enums.OrderSide;
        quantity: Decimal;
        price: Decimal | null;
        orderType: string;
        filledQty: Decimal;
    })[]>;
    getTradeHistory(userId: string, params?: {
        symbol?: string;
        limit?: number;
    }): Promise<{
        symbol: string;
        userId: string;
        id: string;
        orderId: string;
        side: import(".prisma/client").$Enums.OrderSide;
        quantity: Decimal;
        price: Decimal;
        brokerage: Decimal;
        pnl: Decimal | null;
        positionId: string | null;
        executedAt: Date;
    }[]>;
    getPnL(userId: string): Promise<{
        totalPnl: number;
        totalBrokerage: number;
        netPnl: number;
    }>;
    getPortfolioSummary(userId: string): Promise<{
        totalPnl: number;
        totalBrokerage: number;
        netPnl: number;
        walletBalance: number;
        openPositionsCount: number;
        totalOpenValue: number;
    }>;
    adminGetAllTrades(params: {
        userId?: string;
        symbol?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        items: {
            symbol: string;
            userId: string;
            id: string;
            orderId: string;
            side: import(".prisma/client").$Enums.OrderSide;
            quantity: Decimal;
            price: Decimal;
            brokerage: Decimal;
            pnl: Decimal | null;
            positionId: string | null;
            executedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    adminGetAllPositions(params: {
        userId?: string;
        status?: PositionStatus;
    }): Promise<{
        symbol: string;
        userId: string;
        id: string;
        status: import(".prisma/client").$Enums.PositionStatus;
        side: import(".prisma/client").$Enums.OrderSide;
        quantity: Decimal;
        avgPrice: Decimal;
        currentPrice: Decimal | null;
        unrealizedPnl: Decimal | null;
        openedAt: Date;
        closedAt: Date | null;
    }[]>;
    getLeaderboard(params: {
        sortBy: "net_profit_pct" | "win_rate" | "consistency";
        limit?: number;
    }): Promise<{
        userId: string;
        name: string | undefined;
        email: string | undefined;
        totalPnl: number;
        netProfitPct: number;
        winRate: number;
        tradeCount: number;
        consistency: number;
    }[]>;
};
//# sourceMappingURL=trade.service.d.ts.map