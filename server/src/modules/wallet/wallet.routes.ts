import { Router } from 'express';
import { walletController } from './wallet.controller';
import { authenticate } from '../../middlewares/authenticate';
import { adminOnly, adminOrSubadmin, userOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { creditDebitSchema, historyQuerySchema } from './wallet.validation';

const router = Router();

// User: own balance and history
router.get('/me/balance', authenticate, userOnly, walletController.getBalance);
router.get('/me/transactions', authenticate, userOnly, validate(historyQuerySchema), walletController.transactionHistory);

// Admin: credit/debit any user. Subadmin: credit only their referred users (debit remains Admin only)
router.post('/:userId/credit', authenticate, adminOrSubadmin, validate(creditDebitSchema), walletController.credit);
router.post('/:userId/debit', authenticate, adminOnly, validate(creditDebitSchema), walletController.debit);

// Admin: view any user's transaction history (query userId)
router.get('/admin/transactions', authenticate, adminOnly, validate(historyQuerySchema), walletController.adminTransactionHistory);

export const walletRoutes = router;
