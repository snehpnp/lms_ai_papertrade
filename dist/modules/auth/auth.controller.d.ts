import { Request, Response, NextFunction } from 'express';
export declare const authController: {
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    adminLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    subadminLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    userLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=auth.controller.d.ts.map