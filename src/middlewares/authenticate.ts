import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { prisma } from '../utils/prisma';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    next(new UnauthorizedError('Access token required'));
    return;
  }

  try {
    const payload = authService.verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

/** Optionally attach user if token present; never fail. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    next();
    return;
  }
  try {
    const payload = authService.verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // ignore
  }
  next();
}
