"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletController = void 0;
const wallet_service_1 = require("./wallet.service");
exports.walletController = {
    async getBalance(req, res, next) {
        try {
            const data = await wallet_service_1.walletService.getBalance(req.user.id);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async credit(req, res, next) {
        try {
            const data = await wallet_service_1.walletService.credit(req.params.userId, req.body.amount, req.body.description, undefined, { userId: req.user.id, role: req.user.role });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async debit(req, res, next) {
        try {
            const data = await wallet_service_1.walletService.debit(req.params.userId, req.body.amount, req.body.description);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async transactionHistory(req, res, next) {
        try {
            const data = await wallet_service_1.walletService.getTransactionHistory(req.user.id);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async adminTransactionHistory(req, res, next) {
        try {
            const userId = req.query.userId;
            const data = await wallet_service_1.walletService.getTransactionHistory(userId, { targetUserId: userId });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=wallet.controller.js.map