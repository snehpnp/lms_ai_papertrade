import { Request, Response, NextFunction } from 'express';
export declare const tradeController: {
    placeOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    closePosition(req: Request, res: Response, next: NextFunction): Promise<void>;
    openPositions(req: Request, res: Response, next: NextFunction): Promise<void>;
    orders(req: Request, res: Response, next: NextFunction): Promise<void>;
    tradeHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    pnl(req: Request, res: Response, next: NextFunction): Promise<void>;
    portfolio(req: Request, res: Response, next: NextFunction): Promise<void>;
    adminAllTrades(req: Request, res: Response, next: NextFunction): Promise<void>;
    adminAllPositions(req: Request, res: Response, next: NextFunction): Promise<void>;
    leaderboard(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=trade.controller.d.ts.map