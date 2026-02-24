import { Request, Response, NextFunction } from 'express';
import { profileService } from './profile.service';

export const profileController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await profileService.getProfile(req.user!.id);
      if (!data) return res.status(404).json({ success: false, message: 'Profile not found' });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await profileService.updateProfile(req.user!.id, req.body);
      res.json({ success: true, data, message: 'Profile updated' });
    } catch (e) {
      next(e);
    }
  },

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await profileService.updatePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (e) {
      next(e);
    }
  },
};
