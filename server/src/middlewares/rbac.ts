import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError } from '../utils/errors';

export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
}

export const adminOnly = requireRoles('ADMIN');
export const subadminOnly = requireRoles('SUBADMIN');
export const userOnly = requireRoles('USER');
export const adminOrSubadmin = requireRoles('ADMIN', 'SUBADMIN');
