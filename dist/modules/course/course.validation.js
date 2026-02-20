"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseIdInPathSchema = exports.lessonIdParamSchema = exports.exerciseIdParamSchema = exports.addExerciseToCourseSchema = exports.addExerciseToLessonSchema = exports.addExerciseSchema = exports.createLessonSchema = exports.createModuleSchema = exports.listCoursesSchema = exports.assignSubadminSchema = exports.courseIdParamSchema = exports.updateCourseSchema = exports.createCourseSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        slug: zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/),
        thumbnail: zod_1.z.string().url().optional(),
        price: zod_1.z.number().min(0).optional(),
        subadminId: zod_1.z.string().uuid().optional(),
    }),
});
exports.updateCourseSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().optional(),
        slug: zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
        thumbnail: zod_1.z.string().url().optional(),
        price: zod_1.z.number().min(0).optional(),
    }),
});
exports.courseIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
});
exports.assignSubadminSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z.object({ subadminId: zod_1.z.string().uuid() }),
});
exports.listCoursesSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        page: zod_1.z.coerce.number().int().min(1).optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
        subadminId: zod_1.z.string().uuid().optional(),
    }),
});
exports.createModuleSchema = zod_1.z.object({
    params: zod_1.z.object({ courseId: zod_1.z.string().uuid() }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1),
        order: zod_1.z.number().int().min(0).optional(),
    }),
});
exports.createLessonSchema = zod_1.z.object({
    params: zod_1.z.object({ moduleId: zod_1.z.string().uuid() }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1),
        type: zod_1.z.nativeEnum(client_1.LessonType),
        content: zod_1.z.string().optional(),
        videoUrl: zod_1.z.string().url().optional(),
        pdfUrl: zod_1.z.string().url().optional(),
        order: zod_1.z.number().int().min(0).optional(),
        duration: zod_1.z.number().int().min(0).optional(),
    }),
});
exports.addExerciseSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.nativeEnum(client_1.ExerciseType),
        question: zod_1.z.string().min(1),
        options: zod_1.z.any().optional(),
        answer: zod_1.z.string().optional(),
        order: zod_1.z.number().int().min(0).optional(),
    }),
});
exports.addExerciseToLessonSchema = zod_1.z.object({
    params: zod_1.z.object({ lessonId: zod_1.z.string().uuid() }),
    body: exports.addExerciseSchema.shape.body,
});
exports.addExerciseToCourseSchema = zod_1.z.object({
    params: zod_1.z.object({ courseId: zod_1.z.string().uuid() }),
    body: exports.addExerciseSchema.shape.body,
});
exports.exerciseIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({ exerciseId: zod_1.z.string().uuid() }),
});
exports.lessonIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({ lessonId: zod_1.z.string().uuid() }),
});
exports.courseIdInPathSchema = zod_1.z.object({
    params: zod_1.z.object({ courseId: zod_1.z.string().uuid() }),
});
//# sourceMappingURL=course.validation.js.map