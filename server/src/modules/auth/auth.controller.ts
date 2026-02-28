import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthTokens } from './auth.service';
import { BadRequestError } from '../../utils/errors';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, role } = req.body;
      const tokens: AuthTokens = await authService.login(email, password, role);
      res.json({
        success: true,
        data: tokens,
        message: 'Login successful',
      });
    } catch (e) {
      next(e);
    }
  },

  async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const tokens: AuthTokens = await authService.adminLogin(email, password);
      res.json({
        success: true,
        data: tokens,
        message: 'Admin login successful',
      });
    } catch (e) {
      next(e);
    }
  },

  async subadminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const tokens: AuthTokens = await authService.subadminLogin(email, password);
      res.json({
        success: true,
        data: tokens,
        message: 'Subadmin login successful',
      });
    } catch (e) {
      next(e);
    }
  },

  async userLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const tokens: AuthTokens = await authService.userLogin(email, password);
      res.json({
        success: true,
        data: tokens,
        message: 'Login successful',
      });
    } catch (e) {
      next(e);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens: AuthTokens = await authService.refreshTokens(refreshToken);
      res.json({
        success: true,
        data: tokens,
        message: 'Tokens refreshed',
      });
    } catch (e) {
      next(e);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken as string | undefined;
      await authService.logout(refreshToken);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (e) {
      next(e);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(userId, currentPassword, newPassword);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (e) {
      next(e);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const token = await authService.createResetToken(email);
      // In production, send token via email. For API we return generic message.
      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent.',
        // Only in dev for testing: token (remove in production)
        ...(process.env.NODE_ENV === 'development' && token ? { resetToken: token } : {}),
      });
    } catch (e) {
      next(e);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (e) {
      next(e);
    }
  },

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { credential } = req.body;
      const tokens: AuthTokens = await authService.googleLogin(credential);
      res.json({
        success: true,
        data: tokens,
        message: 'Google login successful',
      });
    } catch (e) {
      next(e);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;
      if (!token) throw new BadRequestError('Token is required');
      await authService.verifyEmail(token as string);
      res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
    } catch (e) {
      next(e);
    }
  },

  async getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const googleClientId = await authService.getGoogleClientId();
      res.json({
        success: true,
        data: { googleClientId },
      });
    } catch (e) {
      next(e);
    }
  },
};
