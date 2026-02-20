export declare function registerUser(data: {
    email: string;
    password: string;
    name: string;
    referralCode?: string;
}): Promise<{
    email: string;
    role: import(".prisma/client").$Enums.Role;
    id: string;
    referralCode: string;
    name: string;
    referredById: string | null;
}>;
//# sourceMappingURL=user.register.service.d.ts.map