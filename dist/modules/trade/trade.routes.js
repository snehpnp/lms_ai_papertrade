"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradeRoutes = void 0;
const express_1 = require("express");
const trade_controller_1 = require("./trade.controller");
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const trade_validation_1 = require("./trade.validation");
const router = (0, express_1.Router)();
// User: paper trading
router.post('/orders', authenticate_1.authenticate, rbac_1.userOnly, (0, validate_1.validate)(trade_validation_1.placeOrderSchema), trade_controller_1.tradeController.placeOrder);
router.post('/positions/:positionId/close', authenticate_1.authenticate, rbac_1.userOnly, (0, validate_1.validate)(trade_validation_1.closePositionSchema), trade_controller_1.tradeController.closePosition);
router.get('/positions', authenticate_1.authenticate, rbac_1.userOnly, trade_controller_1.tradeController.openPositions);
router.get('/orders', authenticate_1.authenticate, rbac_1.userOnly, (0, validate_1.validate)(trade_validation_1.ordersQuerySchema), trade_controller_1.tradeController.orders);
router.get('/history', authenticate_1.authenticate, rbac_1.userOnly, (0, validate_1.validate)(trade_validation_1.historyQuerySchema), trade_controller_1.tradeController.tradeHistory);
router.get('/pnl', authenticate_1.authenticate, rbac_1.userOnly, trade_controller_1.tradeController.pnl);
router.get('/portfolio', authenticate_1.authenticate, rbac_1.userOnly, trade_controller_1.tradeController.portfolio);
// Admin: all trades, positions, leaderboard
router.get('/admin/trades', authenticate_1.authenticate, rbac_1.adminOnly, trade_controller_1.tradeController.adminAllTrades);
router.get('/admin/positions', authenticate_1.authenticate, rbac_1.adminOnly, trade_controller_1.tradeController.adminAllPositions);
router.get('/admin/leaderboard', authenticate_1.authenticate, rbac_1.adminOnly, (0, validate_1.validate)(trade_validation_1.leaderboardQuerySchema), trade_controller_1.tradeController.leaderboard);
exports.tradeRoutes = router;
//# sourceMappingURL=trade.routes.js.map