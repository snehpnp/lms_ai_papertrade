import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export declare function requireRoles(...allowedRoles: Role[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare const adminOnly: (req: Request, _res: Response, next: NextFunction) => void;
export declare const subadminOnly: (req: Request, _res: Response, next: NextFunction) => void;
export declare const userOnly: (req: Request, _res: Response, next: NextFunction) => void;
export declare const adminOrSubadmin: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=rbac.d.ts.map