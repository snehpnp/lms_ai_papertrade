import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
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
import { settingsService } from '../settings/settings.service';
import { walletService } from '../wallet/wallet.service';
import { mailer } from '../../utils/mailer';
import { v4 as uuidv4 } from 'uuid';
import { emailTemplates } from '../../utils/emailTemplates';

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

const googleClient = new OAuth2Client();

export const authService = {
  async getGoogleClientId(): Promise<string> {
    return (await settingsService.getByKey('GOOGLE_CLIENT_ID')) || '';
  },

  async getBrandingConfig() {
    return {
      appName: (await settingsService.getByKey('APP_NAME')) || 'TradeAlgo',
      appLogo: (await settingsService.getByKey('APP_LOGO')) || '/logo.png',
      appFavicon: (await settingsService.getByKey('APP_FAVICON')) || '/favicon.png',
    };
  },

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

    // Check email verification for USER role
    if (user.role === 'USER' && !user.emailVerified) {
      throw new ForbiddenError('Please verify your email address to log in');
    }

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

  async googleLogin(credential: string): Promise<AuthTokens> {
    const dbClientId = await settingsService.getByKey('GOOGLE_CLIENT_ID');
    const clientId = dbClientId || process.env.GOOGLE_CLIENT_ID;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new UnauthorizedError('Invalid Google token');

    const { email, name, picture, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Find a default admin to associate with
      const admin = await prisma.user.findFirst({
        where: { role: Role.ADMIN },
        orderBy: { createdAt: 'asc' },
      });

      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0]!,
          role: Role.USER,
          avatar: picture,
          passwordHash: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), SALT_ROUNDS),
          isLearningMode: false,
          isPaperTradeDefault: true,
          referralCode: generateReferralCode(),
          referredById: admin?.id,
        },
      });

      // Initialize wallet for new Google user
      await prisma.wallet.create({ data: { userId: user.id, balance: 0 } });

      // Add initial balance set by admin
      if (admin?.referralSignupBonusAmount) {
        const bonusAmount = Number(admin.referralSignupBonusAmount);
        if (bonusAmount > 0) {
          await walletService.credit(
            user.id,
            bonusAmount,
            `Initial balance for Google Signup (Default via Admin: ${admin.name})`
          );
        }
      }

      // Send welcome email - Google emails are pre-verified
      await this.sendWelcomeEmail(user.email, user.name);
    }

    if (user.isBlocked) throw new ForbiddenError('Account is blocked');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        avatar: picture || user.avatar
      },
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

  async sendVerificationEmail(email: string, name: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const { appName } = await this.getBrandingConfig();
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = await emailTemplates.verificationEmail(name, verificationUrl);

    await mailer.sendMail({
      to: email,
      subject: `Verify Your Email - ${appName}`,
      html,
    });
  },

  async sendWelcomeEmail(email: string, name: string) {
    const { appName } = await this.getBrandingConfig();
    const html = await emailTemplates.welcomeEmail(name);

    await mailer.sendMail({
      to: email,
      subject: `Welcome to ${appName}!`,
      html,
    });
  },

  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExp: { gt: new Date() },
      } as any,
    });

    if (!user) throw new BadRequestError('Invalid or expired verification token');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExp: null,
      } as any,
    });

    // Send welcome email
    await this.sendWelcomeEmail(user.email, user.name);
  },

  async createResetToken(email: string): Promise<string | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExp: expires,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const { appName } = await this.getBrandingConfig();

    const html = await emailTemplates.forgotPasswordEmail(user.name, resetUrl);

    await mailer.sendMail({
      to: email,
      subject: `Password Reset Request - ${appName}`,
      html,
    });

    return token;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestError('Invalid or expired reset token');

    const passwordHash = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExp: null,
      },
    });
  },
};
