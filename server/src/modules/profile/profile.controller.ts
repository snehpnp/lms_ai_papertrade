import { Request, Response, NextFunction } from 'express';
import { profileService } from './profile.service';
import { userEventEmitter, USER_EVENTS } from '../user/user.events';

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

  async toggleMode(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await profileService.toggleMode(req.user!.id);
      res.json({ success: true, data, message: 'Mode toggled successfully' });
    } catch (e) {
      next(e);
    }
  },

  async stream(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });

      res.write('data: {"type":"connected"}\n\n');

      const handleUserUpdated = (eid: string, updatedUser: any) => {
        if (eid === userId) {
          res.write(`data: ${JSON.stringify({ type: 'user_updated', user: updatedUser })}\n\n`);
        }
      };

      const handleUserBlocked = (eid: string) => {
        if (eid === userId) {
          res.write(`data: ${JSON.stringify({ type: 'user_blocked' })}\n\n`);
        }
      };

      userEventEmitter.on(USER_EVENTS.USER_UPDATED, handleUserUpdated);
      userEventEmitter.on(USER_EVENTS.USER_BLOCKED, handleUserBlocked);

      req.on('close', () => {
        userEventEmitter.off(USER_EVENTS.USER_UPDATED, handleUserUpdated);
        userEventEmitter.off(USER_EVENTS.USER_BLOCKED, handleUserBlocked);
      });
    } catch (e) {
      next(e);
    }
  },
};
