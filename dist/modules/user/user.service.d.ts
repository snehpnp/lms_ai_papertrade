import { Role } from '@prisma/client';
import { Prisma } from '@prisma/client';
export declare const userService: {
    create(data: {
        email: string;
        password: string;
        name: string;
        role: Role;
        referralCode?: string;
    }): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        referralCode: string;
        name: string;
        isBlocked: boolean;
        referredById: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(params: {
        role?: Role;
        search?: string;
        page?: number;
        limit?: number;
        subadminId?: string;
    }): Promise<{
        items: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            referralCode: string;
            name: string;
            isBlocked: boolean;
            referredById: string | null;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string, options?: {
        forSubadmin?: string;
    }): Promise<{
        wallet: {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            balance: Prisma.Decimal;
        } | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        referralCode: string;
        name: string;
        isBlocked: boolean;
        referredById: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            enrollments: number;
            trades: number;
            positions: number;
        };
    }>;
    update(id: string, data: {
        name?: string;
        email?: string;
        password?: string;
        role?: Role;
    }, options?: {
        forSubadmin?: string;
    }): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        referralCode: string;
        name: string;
        isBlocked: boolean;
        referredById: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string, options?: {
        forSubadmin?: string;
    }): Promise<{
        message: string;
    }>;
    block(id: string, options?: {
        forSubadmin?: string;
    }): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        referralCode: string;
        name: string;
        isBlocked: boolean;
        referredById: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    unblock(id: string, options?: {
        forSubadmin?: string;
    }): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        referralCode: string;
        name: string;
        isBlocked: boolean;
        referredById: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getActivityReport(userId: string, options?: {
        forSubadmin?: string;
    }): Promise<{
        userId: string;
        logs: {
            userId: string;
            id: string;
            createdAt: Date;
            ip: string | null;
            action: string;
            resource: string | null;
            details: Prisma.JsonValue | null;
            userAgent: string | null;
        }[];
    }>;
    getTradingReport(userId: string, options?: {
        forSubadmin?: string;
    }): Promise<{
        userId: string;
        totalTrades: number;
        winningTrades: number;
        winRate: number;
        totalPnl: number;
        walletBalance: number;
        trades: {
            symbol: string;
            userId: string;
            id: string;
            orderId: string;
            side: import(".prisma/client").$Enums.OrderSide;
            quantity: Prisma.Decimal;
            price: Prisma.Decimal;
            brokerage: Prisma.Decimal;
            pnl: Prisma.Decimal | null;
            positionId: string | null;
            executedAt: Date;
        }[];
        positions: {
            symbol: string;
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.PositionStatus;
            side: import(".prisma/client").$Enums.OrderSide;
            quantity: Prisma.Decimal;
            avgPrice: Prisma.Decimal;
            currentPrice: Prisma.Decimal | null;
            unrealizedPnl: Prisma.Decimal | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    }>;
    getCourseProgress(userId: string, options?: {
        forSubadmin?: string;
    }): Promise<{
        enrollments: {
            courseId: string;
            courseTitle: string;
            enrolledAt: Date;
            completedLessons: number;
            completedAt: Date | null;
            certificate: {
                userId: string;
                id: string;
                pdfUrl: string | null;
                enrollmentId: string;
                issuedAt: Date;
            } | null;
        }[];
        userId: string;
    }>;
};
//# sourceMappingURL=user.service.d.ts.map