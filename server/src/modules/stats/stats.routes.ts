import { Router } from 'express';
import { statsService } from './stats.service';
import { authenticate } from '../../middlewares/authenticate';
import { adminOrSubadmin } from '../../middlewares/rbac';

const router = Router();

router.get('/dashboard', authenticate, adminOrSubadmin, async (req, res, next) => {
    try {
        const stats = await statsService.getAdminStats();
        res.json({ success: true, data: stats });
    } catch (e) {
        next(e);
    }
});

router.get('/charts/revenue', authenticate, adminOrSubadmin, async (req, res, next) => {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 7;
        const data = await statsService.getRevenueChartData(days);
        res.json({ success: true, data });
    } catch (e) {
        next(e);
    }
});

router.get('/charts/enrollments', authenticate, adminOrSubadmin, async (req, res, next) => {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 7;
        const data = await statsService.getEnrollmentChartData(days);
        res.json({ success: true, data });
    } catch (e) {
        next(e);
    }
});

router.get('/recent-activities', authenticate, adminOrSubadmin, async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        const data = await statsService.getRecentActivities(limit);
        res.json({ success: true, data });
    } catch (e) {
        next(e);
    }
});

export const statsRoutes = router;
