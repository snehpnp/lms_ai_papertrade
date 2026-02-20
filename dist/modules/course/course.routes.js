"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseRoutes = void 0;
const express_1 = require("express");
const course_controller_1 = require("./course.controller");
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const course_validation_1 = require("./course.validation");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, rbac_1.adminOrSubadmin);
router.get('/', (0, validate_1.validate)(course_validation_1.listCoursesSchema), course_controller_1.courseController.list);
router.post('/', (0, validate_1.validate)(course_validation_1.createCourseSchema), course_controller_1.courseController.create);
router.get('/:id', (0, validate_1.validate)(course_validation_1.courseIdParamSchema), course_controller_1.courseController.getOne);
router.patch('/:id', (0, validate_1.validate)(course_validation_1.updateCourseSchema), course_controller_1.courseController.update);
router.delete('/:id', (0, validate_1.validate)(course_validation_1.courseIdParamSchema), course_controller_1.courseController.delete);
router.post('/:id/publish', (0, validate_1.validate)(course_validation_1.courseIdParamSchema), course_controller_1.courseController.publish);
router.post('/:id/unpublish', (0, validate_1.validate)(course_validation_1.courseIdParamSchema), course_controller_1.courseController.unpublish);
router.post('/:id/assign-subadmin', (0, validate_1.validate)(course_validation_1.assignSubadminSchema), rbac_1.adminOnly, course_controller_1.courseController.assignSubadmin);
router.get('/:id/analytics', (0, validate_1.validate)(course_validation_1.courseIdParamSchema), course_controller_1.courseController.analytics);
router.get('/:id/enrolled-users', (0, validate_1.validate)(course_validation_1.courseIdParamSchema), course_controller_1.courseController.enrolledUsers);
// Modules
router.post('/:courseId/modules', (0, validate_1.validate)(course_validation_1.createModuleSchema), course_controller_1.courseController.createModule);
// Lessons (nested under module)
router.post('/modules/:moduleId/lessons', (0, validate_1.validate)(course_validation_1.createLessonSchema), course_controller_1.courseController.createLesson);
// Exercises
router.post('/lessons/:lessonId/exercises', (0, validate_1.validate)(course_validation_1.addExerciseToLessonSchema), course_controller_1.courseController.addExerciseToLesson);
router.post('/:courseId/exercises', (0, validate_1.validate)(course_validation_1.addExerciseToCourseSchema), course_controller_1.courseController.addExerciseToCourse);
router.patch('/exercises/:exerciseId', (0, validate_1.validate)(course_validation_1.exerciseIdParamSchema), course_controller_1.courseController.updateExercise);
router.delete('/exercises/:exerciseId', (0, validate_1.validate)(course_validation_1.exerciseIdParamSchema), course_controller_1.courseController.deleteExercise);
exports.courseRoutes = router;
//# sourceMappingURL=course.routes.js.map