import { Router } from 'express';
import * as userCourseService from './userCourse.service';
import { authenticate } from '../../middlewares/authenticate';
import { userOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { z } from 'zod';

const router = Router();
router.use(authenticate, userOnly);

const courseIdParam = z.object({ params: z.object({ courseId: z.string().uuid() }) });
const enrollmentIdParam = z.object({ params: z.object({ enrollmentId: z.string().uuid() }) });
const lessonIdParam = z.object({ params: z.object({ lessonId: z.string().uuid() }) });
const exerciseIdParam = z.object({ params: z.object({ exerciseId: z.string().uuid() }) });

router.get('/courses', async (req, res, next) => {
  try {
    const data = await userCourseService.getAvailableCourses(req.user!.id);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/enroll/:courseId', validate(courseIdParam), async (req, res, next) => {
  try {
    const data = await userCourseService.enrollCourse(req.user!.id, req.params.courseId);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/enrollments', async (req, res, next) => {
  try {
    const data = await userCourseService.getMyEnrollments(req.user!.id);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/courses/:courseId/lessons', validate(courseIdParam), async (req, res, next) => {
  try {
    const data = await userCourseService.getLessons(req.user!.id, req.params.courseId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/progress', validate(z.object({
  body: z.object({
    lessonId: z.string().uuid(),
    enrollmentId: z.string().uuid(),
    timeSpent: z.number().int().min(0),
  }),
})), async (req, res, next) => {
  try {
    const { lessonId, enrollmentId, timeSpent } = req.body;
    const data = await userCourseService.recordProgress(req.user!.id, lessonId, enrollmentId, timeSpent);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/exercises/:exerciseId/submit', validate(z.object({
  params: z.object({ exerciseId: z.string().uuid() }),
  body: z.object({
    enrollmentId: z.string().uuid(),
    response: z.any(),
  }),
})), async (req, res, next) => {
  try {
    const data = await userCourseService.submitExercise(
      req.user!.id,
      req.params.exerciseId,
      req.body.enrollmentId,
      req.body.response
    );
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/certificate/:enrollmentId', validate(enrollmentIdParam), async (req, res, next) => {
  try {
    const data = await userCourseService.getCertificate(req.user!.id, req.params.enrollmentId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export const userCourseRoutes = router;
