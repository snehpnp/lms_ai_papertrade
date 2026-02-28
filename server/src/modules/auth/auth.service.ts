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
    const dbClientId = await settingsService.getByKey('GOOGLE_CLIENT_ID');
    return dbClientId || process.env.GOOGLE_CLIENT_ID || '';
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
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
        <h1 style="color: #333;">Welcome to TradeAlgo!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #666;">If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #2563eb;">${verificationUrl}</p>
        <p style="margin-top: 30px;">Best regards,<br>The TradeAlgo Team</p>
      </div>
    `;

    await mailer.sendMail({
      to: email,
      subject: 'Verify Your Email - TradeAlgo',
      html,
    });
  },

  async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
        <h1 style="color: #333;">Registration Successful!</h1>
        <p>Hello ${name},</p>
        <p>Your account is now active and ready to use. Explore our Courses, Exercises, and Trade Simulator to start your learning journey.</p>
        <div style="margin: 30px 0; border-top: 1px solid #eee; padding-top: 20px;">
          <h3 style="color: #333;">What's next?</h3>
          <ul style="color: #555;">
            <li>Go to Dashboard and explore Paper Trading</li>
            <li>Enrol in a Masterclass</li>
            <li>Complete daily exercises</li>
          </ul>
        </div>
        <p>Happy Trading!</p>
        <p>Best regards,<br>The TradeAlgo Team</p>
      </div>
    `;
    console.log("Test Email")
    await mailer.sendMail({
      to: email,
      subject: 'Welcome to TradeAlgo!',
      html,
    });
  },

  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExp: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestError('Invalid or expired verification token');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExp: null,
      },
    });

    // Send welcome email
    await this.sendWelcomeEmail(user.email, user.name);
  },
};
