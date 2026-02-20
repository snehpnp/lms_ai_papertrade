import { Request, Response, NextFunction } from 'express';
export declare const userController: {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOne(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    block(req: Request, res: Response, next: NextFunction): Promise<void>;
    unblock(req: Request, res: Response, next: NextFunction): Promise<void>;
    activityReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    tradingReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    courseProgress(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=user.controller.d.ts.map