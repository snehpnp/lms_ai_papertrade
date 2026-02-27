import { Router } from 'express';
import { tradeController } from './trade.controller';
import { authenticate } from '../../middlewares/authenticate';
import { adminOnly, userOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import {
  placeOrderSchema,
  closePositionSchema,
  ordersQuerySchema,
  historyQuerySchema,
  leaderboardQuerySchema,
} from './trade.validation';

const router = Router();

// User: paper trading
router.post('/orders', authenticate, userOnly, validate(placeOrderSchema), tradeController.placeOrder);
router.post('/positions/:positionId/close', authenticate, userOnly, validate(closePositionSchema), tradeController.closePosition);
router.patch('/positions/:positionId/risk', authenticate, userOnly, tradeController.updateRisk);
router.get('/positions', authenticate, userOnly, tradeController.openPositions);
router.get('/positions/today', authenticate, userOnly, tradeController.todayPositions);
router.get('/holdings', authenticate, userOnly, tradeController.holdings);
router.get('/orders', authenticate, userOnly, validate(ordersQuerySchema), tradeController.orders);
router.get('/history', authenticate, userOnly, validate(historyQuerySchema), tradeController.tradeHistory);
router.get('/pnl', authenticate, userOnly, tradeController.pnl);
router.get('/portfolio', authenticate, userOnly, tradeController.portfolio);

// Admin: all trades, positions, leaderboard
router.get('/admin/trades', authenticate, adminOnly, tradeController.adminAllTrades);
router.get('/admin/positions', authenticate, adminOnly, tradeController.adminAllPositions);
router.get('/admin/leaderboard', authenticate, adminOnly, validate(leaderboardQuerySchema), tradeController.leaderboard);

export const tradeRoutes = router;
