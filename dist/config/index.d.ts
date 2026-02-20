export declare const config: {
    readonly env: string;
    readonly port: number;
    readonly apiPrefix: string;
    readonly database: {
        readonly url: string;
    };
    readonly jwt: {
        readonly accessSecret: string;
        readonly refreshSecret: string;
        readonly accessExpiry: string;
        readonly refreshExpiry: string;
    };
    readonly bcrypt: {
        readonly rounds: number;
    };
    readonly resetToken: {
        readonly expiryHours: number;
    };
    readonly razorpay: {
        readonly keyId: string;
        readonly keySecret: string;
    };
    readonly stripe: {
        readonly secretKey: string;
        readonly webhookSecret: string;
    };
    readonly openai: {
        readonly apiKey: string;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly max: number;
    };
};
//# sourceMappingURL=index.d.ts.map