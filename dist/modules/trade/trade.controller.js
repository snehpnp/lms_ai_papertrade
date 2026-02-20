"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradeController = void 0;
const trade_service_1 = require("./trade.service");
exports.tradeController = {
    async placeOrder(req, res, next) {
        try {
            const data = await trade_service_1.tradeService.placeOrder(req.user.id, req.body);
            res.status(201).json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async closePosition(req, res, next) {
        try {
            const data = await trade_service_1.tradeService.closePosition(req.user.id, req.params.positionId, req.body.closePrice);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async openPositions(req, res, next) {
        try {
            const data = await trade_service_1.tradeService.getOpenPositions(req.user.id);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async orders(req, res, next) {
        try {
            const data = await trade_service_1.tradeService.getOrders(req.user.id, req.query);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async tradeHistory(req, res, next) {
        try {
            const data = await trade_service_1.tradeService.getTradeHistory(req.user.id, req.query);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async pnl(req, res, next) {
        try {
            const data = await trade_service_1.tradeService.getPnL(req.user.id);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async portfolio(req, res, next) {
        try {
            const data = await trade_service_1.tradeService.getPortfolioSummary(req.user.id);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async adminAllTrades(req, res, next) {
        try {
            const data = await trade_service_1.tradeService.adminGetAllTrades(req.query);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async adminAllPositions(req, res, next) {
        try {
            const data = await trade_service_1.tradeService.adminGetAllPositions(req.query);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async leaderboard(req, res, next) {
        try {
            const data = await trade_service_1.tradeService.getLeaderboard(req.query);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=trade.controller.js.map