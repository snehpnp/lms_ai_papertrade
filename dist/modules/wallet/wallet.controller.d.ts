import { Request, Response, NextFunction } from 'express';
export declare const walletController: {
    getBalance(req: Request, res: Response, next: NextFunction): Promise<void>;
    credit(req: Request, res: Response, next: NextFunction): Promise<void>;
    debit(req: Request, res: Response, next: NextFunction): Promise<void>;
    transactionHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    adminTransactionHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=wallet.controller.d.ts.map