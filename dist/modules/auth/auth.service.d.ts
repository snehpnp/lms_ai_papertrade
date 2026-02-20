import { Role } from '@prisma/client';
export interface TokenPayload {
    userId: string;
    email: string;
    role: Role;
    type: 'access' | 'refresh';
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare const authService: {
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hash: string): Promise<boolean>;
    generateAccessToken(payload: Omit<TokenPayload, "type">): string;
    generateRefreshToken(payload: Omit<TokenPayload, "type">): string;
    verifyAccessToken(token: string): TokenPayload;
    verifyRefreshToken(token: string): TokenPayload;
    getRefreshExpirySeconds(): number;
    adminLogin(email: string, password: string): Promise<AuthTokens>;
    userLogin(email: string, password: string): Promise<AuthTokens>;
    subadminLogin(email: string, password: string): Promise<AuthTokens>;
    refreshTokens(refreshToken: string): Promise<AuthTokens>;
    logout(refreshToken: string | undefined): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    createResetToken(email: string): Promise<string>;
    resetPassword(token: string, newPassword: string): Promise<void>;
};
//# sourceMappingURL=auth.service.d.ts.map