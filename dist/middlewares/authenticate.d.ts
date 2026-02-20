import { Request, Response, NextFunction } from 'express';
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
/** Optionally attach user if token present; never fail. */
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=authenticate.d.ts.map