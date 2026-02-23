import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { config } from '../../config';
import { generateReferralCode } from '../../utils/referral';
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../utils/errors';

const SALT_ROUNDS = config.bcrypt.rounds;

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

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'access' },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry } as jwt.SignOptions
    );
  },

  generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry } as jwt.SignOptions
    );
  },

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
    if (decoded.type !== 'access') throw new UnauthorizedError('Invalid token type');
    return decoded;
  },

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
    if (decoded.type !== 'refresh') throw new UnauthorizedError('Invalid token type');
    return decoded;
  },

  getRefreshExpirySeconds(): number {
    const match = config.jwt.refreshExpiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60;
    const [, n, unit] = match;
    const num = parseInt(n!, 10);
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return num * (multipliers[unit] || 86400);
  },

  async adminLogin(email: string, password: string): Promise<AuthTokens> {
    return this.login(email, password, 'ADMIN');
  },

  async userLogin(email: string, password: string): Promise<AuthTokens> {
    return this.login(email, password, 'USER');
  },

  async subadminLogin(email: string, password: string): Promise<AuthTokens> {
    return this.login(email, password, 'SUBADMIN');
  },

  /** Common login for all roles. If role is provided, validates user has that role. */
  async login(email: string, password: string, expectedRole?: Role): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');
    if (user.isBlocked) throw new ForbiddenError('Account is blocked');
    if (expectedRole && user.role !== expectedRole) {
      throw new ForbiddenError(`${expectedRole} access only`);
    }

    const valid = await this.comparePassword(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.getRefreshExpirySeconds() * 1000);

    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken, expiresIn: this.getRefreshExpirySeconds() };
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const decoded = this.verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const stored = await prisma.refreshToken.findFirst({
      where: { userId: decoded.userId, tokenHash },
    });
    if (!stored) throw new UnauthorizedError('Invalid or expired refresh token');
    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedError('Refresh token expired');
    }

    // Rotation: delete used refresh token
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.isBlocked) throw new UnauthorizedError('User not found or blocked');

    const newAccessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = this.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + this.getRefreshExpirySeconds() * 1000);

    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: newTokenHash, expiresAt },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.getRefreshExpirySeconds(),
    };
  },

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  },

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const valid = await this.comparePassword(currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestError('Current password is incorrect');

    const hash = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });
    await this.logoutAll(userId);
  },

  async createResetToken(email: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return ''; // Don't leak existence

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const exp = new Date();
    exp.setHours(exp.getHours() + config.resetToken.expiryHours);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash: tokenHash, resetTokenExp: exp },
    });
    return token;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExp: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestError('Invalid or expired reset token');

    const hash = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
        resetTokenHash: null,
        resetTokenExp: null,
      },
    });
    await this.logoutAll(user.id);
  },
};
