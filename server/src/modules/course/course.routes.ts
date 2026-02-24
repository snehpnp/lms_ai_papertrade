import { Router } from 'express';
import { courseController } from './course.controller';
import { authenticate } from '../../middlewares/authenticate';
import { adminOnly, adminOrSubadmin } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import {
  createCourseSchema,
  updateCourseSchema,
  courseIdParamSchema,
  assignSubadminSchema,
  listCoursesSchema,
  createModuleSchema,
  createLessonSchema,
  updateLessonSchema,
  addExerciseSchema,
  addExerciseToLessonSchema,
  addExerciseToCourseSchema,
  exerciseIdParamSchema,
  listLessonsSchema,
  lessonIdInPathSchema
} from './course.validation';

const router = Router();

router.use(authenticate, adminOrSubadmin);

router.get('/', validate(listCoursesSchema), courseController.list);
router.post('/', validate(createCourseSchema), courseController.create);
router.get('/:id', validate(courseIdParamSchema), courseController.getOne);
router.patch('/:id', validate(updateCourseSchema), courseController.update);
router.delete('/:id', validate(courseIdParamSchema), courseController.delete);
router.post('/:id/publish', validate(courseIdParamSchema), courseController.publish);
router.post('/:id/unpublish', validate(courseIdParamSchema), courseController.unpublish);
router.post('/:id/assign-subadmin', validate(assignSubadminSchema), adminOnly, courseController.assignSubadmin);
router.get('/:id/analytics', validate(courseIdParamSchema), courseController.analytics);
router.get('/:id/enrolled-users', validate(courseIdParamSchema), courseController.enrolledUsers);

// Modules
router.post('/:courseId/modules', validate(createModuleSchema), courseController.createModule);

// Lessons (nested under module)
router.post('/modules/:moduleId/lessons', validate(createLessonSchema), courseController.createLesson);
router.patch('/lessons/:id', validate(updateLessonSchema), courseController.updateLesson);
router.delete('/lessons/:id', validate(lessonIdInPathSchema), courseController.deleteLesson);
router.get('/list/lessons',validate(listLessonsSchema), courseController.listLessons); //List Of Lessons All LEssons 
router.get('/lessons/:id', validate(lessonIdInPathSchema), courseController.getOneLesson);
router.get('/with/modules', courseController.getCoursesWithModules); // New endpoint to get courses with their lessons




// Exercises
router.post('/lessons/:lessonId/exercises', validate(addExerciseToLessonSchema), courseController.addExerciseToLesson);
router.post('/:courseId/exercises', validate(addExerciseToCourseSchema), courseController.addExerciseToCourse);
router.patch('/exercises/:exerciseId', validate(exerciseIdParamSchema), courseController.updateExercise);
router.delete('/exercises/:exerciseId', validate(exerciseIdParamSchema), courseController.deleteExercise);



export const courseRoutes = router;
