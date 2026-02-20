import { Request, Response, NextFunction } from 'express';
export declare const profileController: {
    getProfile(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=profile.controller.d.ts.map