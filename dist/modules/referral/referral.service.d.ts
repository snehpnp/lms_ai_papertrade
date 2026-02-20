export declare const referralService: {
    /** Admin/Subadmin: set the virtual balance amount new users get when they register with their referral code */
    setSignupBonus(userId: string, role: string, amount: number): Promise<{
        id: string;
        referralCode: string;
        referralSignupBonusAmount: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    /** Admin/Subadmin: get their current referral signup bonus amount */
    getSignupBonus(userId: string, role: string): Promise<{
        referralCode: string;
        signupBonusAmount: number;
    } | null>;
    getReferredUsers(subadminId: string, params?: {
        page?: number;
        limit?: number;
    }): Promise<{
        items: {
            email: string;
            id: string;
            referralCode: string;
            name: string;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCommissionReport(userId: string, role: string): Promise<{
        total: number;
        commissions: {
            userId: string;
            id: string;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentId: string;
            percentage: import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
    getCourseRevenue(subadminId: string): Promise<{
        total: number;
        payments: ({
            course: {
                id: string;
                title: string;
            } | null;
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            courseId: string | null;
            currency: string;
            provider: import(".prisma/client").$Enums.PaymentProvider;
            providerOrderId: string | null;
            providerPaymentId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    }>;
};
//# sourceMappingURL=referral.service.d.ts.map