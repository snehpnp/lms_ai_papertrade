export declare const profileService: {
    getProfile(userId: string): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        referralCode: string;
        name: string;
        referredById: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateProfile(userId: string, data: {
        name?: string;
        email?: string;
    }): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        referralCode: string;
        name: string;
        referredById: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
//# sourceMappingURL=profile.service.d.ts.map