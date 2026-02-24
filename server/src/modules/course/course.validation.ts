import { z } from 'zod';
import { LessonType, ExerciseType } from '@prisma/client';

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    thumbnail: z.string().url().optional(),
    price: z.number().min(0).optional(),
    subadminId: z.string().uuid().optional(),
    modules: z.array(
      z.object({
        title: z.string().min(1),
        order: z.number().int().min(0).optional(),
      })
    ).optional(),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
    thumbnail: z.string().url().optional(),
    price: z.number().min(0).optional(),
    subadminId: z.string().uuid().optional(),
    modules: z.array(
      z.object({
        id: z.string().uuid().optional(),
        title: z.string().min(1
        ),
        order: z.number().int().min(0).optional(),
      })
    ).optional(),
  }),
});

export const courseIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const assignSubadminSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ subadminId: z.string().uuid() }),
});

export const listCoursesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    subadminId: z.string().uuid().optional(),
  }),
});

export const createModuleSchema = z.object({
  params: z.object({ courseId: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1),
    order: z.number().int().min(0).optional(),
  }),
});

export const createLessonSchema = z.object({
  params: z.object({ moduleId: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1),
    type: z.nativeEnum(LessonType),
    content: z.string().optional(),
    videoUrl: z.string().url().optional(),
    pdfUrl: z.string().url().optional(),
    order: z.number().int().min(0).optional(),
    duration: z.number().int().min(0).optional(),
  }),
});

export const updateLessonSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1).optional(),
    type: z.nativeEnum(LessonType).optional(),
    content: z.string().optional(),
    videoUrl: z.string().url().optional(),
    pdfUrl: z.string().url().optional(),
    order: z.number().int().min(0).optional(),
    duration: z.number().int().min(0).optional(),
    moduleId: z.string().uuid().optional(),
  }),
});

export const addExerciseSchema = z.object({
  body: z.object({
    type: z.nativeEnum(ExerciseType),
    question: z.string().min(1),
    options: z.any().optional(),
    answer: z.string().optional(),
    order: z.number().int().min(0).optional(),
  }),
});

export const addExerciseToLessonSchema = z.object({
  params: z.object({ lessonId: z.string().uuid() }),
  body: addExerciseSchema.shape.body,
});

export const addExerciseToCourseSchema = z.object({
  params: z.object({ courseId: z.string().uuid() }),
  body: addExerciseSchema.shape.body,
});

export const exerciseIdParamSchema = z.object({
  params: z.object({ exerciseId: z.string().uuid() }),
});

export const lessonIdParamSchema = z.object({
  params: z.object({ lessonId: z.string().uuid() }),
});

export const courseIdInPathSchema = z.object({
  params: z.object({ courseId: z.string().uuid() }),
});

export const listLessonsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    subadminId: z.string().uuid().optional(),
  }),
});

export const lessonIdInPathSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
