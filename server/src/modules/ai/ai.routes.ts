import { Router } from 'express';
import { aiService } from './ai.service';
import { authenticate } from '../../middlewares/authenticate';
import { userOnly, requireRoles, adminOrSubadmin } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const askSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(2000),
    context: z.object({ type: z.string(), data: z.any() }).optional(),
  }),
});

const conceptSchema = z.object({
  body: z.object({ topic: z.string().min(1) }),
});

router.post('/ask', userOnly, validate(askSchema), async (req, res, next) => {
  try {
    const data = await aiService.ask(req.user!.id, req.body.message, req.body.context);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/explain', userOnly, validate(conceptSchema), async (req, res, next) => {
  try {
    const data = await aiService.getConceptExplanation(req.body.topic);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/analyze-performance', userOnly, async (req, res, next) => {
  try {
    const { tradeService } = require('../trade/trade.service');
    const pnl = await tradeService.getPnL(req.user!.id);
    const data = await aiService.analyzePerformance(req.user!.id, {
      winRate: 0,
      totalPnl: pnl.netPnl,
      tradeCount: 0,
    });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

const courseDescSchema = z.object({
  body: z.object({ title: z.string().min(1) }),
});

router.post(
  '/generate-course-description',
  adminOrSubadmin,
  validate(courseDescSchema),
  async (req, res, next) => {
    try {
      const data = await aiService.generateCourseDescription(req.body.title);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
);

const lessonContentSchema = z.object({
  body: z.object({ title: z.string().min(1), description: z.string().min(1) }),
});

router.post(
  '/generate-lesson-description',
  adminOrSubadmin,
  validate(courseDescSchema), // Reusing same validation since it only needs title
  async (req, res, next) => {
    try {
      const data = await aiService.generateLessonDescription(req.body.title);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/generate-lesson-content',
  adminOrSubadmin,
  validate(lessonContentSchema),
  async (req, res, next) => {
    try {
      const data = await aiService.generateLessonContent(req.body.title, req.body.description);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
);

const quizSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().optional(),
    count: z.number().min(1).max(20),
  }),
});

router.post(
  '/generate-quiz-questions',
  adminOrSubadmin,
  validate(quizSchema),
  async (req, res, next) => {
    try {
      const data = await aiService.generateQuizQuestions(
        req.body.title,
        req.body.content,
        req.body.count
      );
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/generate-course-banner',
  adminOrSubadmin,
  validate(lessonContentSchema),
  async (req, res, next) => {
    try {
      const data = await aiService.generateCourseBanner(req.body.title, req.body.description);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
);

export const aiRoutes = router;
