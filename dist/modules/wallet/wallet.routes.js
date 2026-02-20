"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRoutes = void 0;
const express_1 = require("express");
const wallet_controller_1 = require("./wallet.controller");
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const wallet_validation_1 = require("./wallet.validation");
const router = (0, express_1.Router)();
// User: own balance and history
router.get('/me/balance', authenticate_1.authenticate, rbac_1.userOnly, wallet_controller_1.walletController.getBalance);
router.get('/me/transactions', authenticate_1.authenticate, rbac_1.userOnly, (0, validate_1.validate)(wallet_validation_1.historyQuerySchema), wallet_controller_1.walletController.transactionHistory);
// Admin: credit/debit any user. Subadmin: credit only their referred users (debit remains Admin only)
router.post('/:userId/credit', authenticate_1.authenticate, rbac_1.adminOrSubadmin, (0, validate_1.validate)(wallet_validation_1.creditDebitSchema), wallet_controller_1.walletController.credit);
router.post('/:userId/debit', authenticate_1.authenticate, rbac_1.adminOnly, (0, validate_1.validate)(wallet_validation_1.creditDebitSchema), wallet_controller_1.walletController.debit);
// Admin: view any user's transaction history (query userId)
router.get('/admin/transactions', authenticate_1.authenticate, rbac_1.adminOnly, (0, validate_1.validate)(wallet_validation_1.historyQuerySchema), wallet_controller_1.walletController.adminTransactionHistory);
exports.walletRoutes = router;
//# sourceMappingURL=wallet.routes.js.map