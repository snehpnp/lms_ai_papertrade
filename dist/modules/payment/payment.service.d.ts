export declare const paymentService: {
    createOrder(userId: string, courseId: string, provider: "RAZORPAY" | "STRIPE", amount: number, currency: string): Promise<{
        paymentId: string;
        orderId: string;
        amount: string | number;
        currency: string;
        keyId: string;
        sessionId?: undefined;
        url?: undefined;
    } | {
        paymentId: string;
        sessionId: string;
        url: string | null;
        orderId?: undefined;
        amount?: undefined;
        currency?: undefined;
        keyId?: undefined;
    }>;
    verifyRazorpay(userId: string, paymentId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<{
        success: boolean;
        paymentId: string;
    }>;
    verifyStripe(sessionId: string): Promise<{
        success: boolean;
        paymentId: string;
    }>;
    assignCourseAndCommission(userId: string, paymentId: string, courseId: string, amount: number): Promise<void>;
    getPaymentHistory(userId: string, role: string): Promise<({
        user: {
            email: string;
            id: string;
            name: string;
        };
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
    })[]>;
};
//# sourceMappingURL=payment.service.d.ts.map