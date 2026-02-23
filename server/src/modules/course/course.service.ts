import { Prisma, LessonType, ExerciseType } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors';

const courseSelect = {
  id: true,
  title: true,
  description: true,
  slug: true,
  thumbnail: true,
  price: true,
  isPublished: true,
  subadminId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const courseService = {
  async create(data: {
    title: string;
    description?: string;
    slug: string;
    thumbnail?: string;
    price?: number;
    subadminId?: string;
    createdByRole: string;
    createdById: string;
  }) {
    if (data.createdByRole === 'SUBADMIN' && !data.subadminId)
      data.subadminId = data.createdById;
    if (data.createdByRole === 'ADMIN' && data.subadminId) {
      // admin assigning to subadmin
    }
    const existing = await prisma.course.findUnique({ where: { slug: data.slug } });
    if (existing) throw new BadRequestError('Slug already exists');

    return prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        slug: data.slug,
        thumbnail: data.thumbnail,
        price: data.price ?? 0,
        subadminId: data.subadminId,
      },
      select: courseSelect,
    });
  },

  async update(
    id: string,
    data: { title?: string; description?: string; slug?: string; thumbnail?: string; price?: number },
    options?: { subadminId?: string }
  ) {
    await this.getCourseForEdit(id, options);
    if (data.slug) {
      const ex = await prisma.course.findFirst({ where: { slug: data.slug, NOT: { id } } });
      if (ex) throw new BadRequestError('Slug already exists');
    }
    return prisma.course.update({
      where: { id },
      data: data as Prisma.CourseUpdateInput,
      select: courseSelect,
    });
  },

  async delete(id: string, options?: { subadminId?: string }) {
    await this.getCourseForEdit(id, options);
    await prisma.course.delete({ where: { id } });
    return { message: 'Course deleted' };
  },

  async publish(id: string, options?: { subadminId?: string }) {
    await this.getCourseForEdit(id, options);
    return prisma.course.update({
      where: { id },
      data: { isPublished: true },
      select: courseSelect,
    });
  },

  async unpublish(id: string, options?: { subadminId?: string }) {
    await this.getCourseForEdit(id, options);
    return prisma.course.update({
      where: { id },
      data: { isPublished: false },
      select: courseSelect,
    });
  },

  async assignSubadmin(courseId: string, subadminId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError('Course not found');
    const subadmin = await prisma.user.findFirst({
      where: { id: subadminId, role: 'SUBADMIN' },
    });
    if (!subadmin) throw new NotFoundError('Subadmin not found');
    return prisma.course.update({
      where: { id: courseId },
      data: { subadminId },
      select: courseSelect,
    });
  },

  async getCourseForEdit(id: string, options?: { subadminId?: string }) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError('Course not found');
    if (options?.subadminId && course.subadminId !== options.subadminId)
      throw new ForbiddenError('Not allowed to edit this course');
    return course;
  },

  async listForAdmin(params: { search?: string; page?: number; limit?: number; subadminId?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;
    const where: Prisma.CourseWhereInput = {};
    if (params.search)
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
      ];
    if (params.subadminId) where.subadminId = params.subadminId;

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: { ...courseSelect, _count: { select: { modules: true, enrollments: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async listForSubadmin(subadminId: string, params: { search?: string; page?: number; limit?: number }) {
    return this.listForAdmin({ ...params, subadminId });
  },

  async getAnalytics(courseId: string, options?: { subadminId?: string }) {
    await this.getCourseForEdit(courseId, options);
    const [enrollments, completions, submissions] = await Promise.all([
      prisma.enrollment.count({ where: { courseId } }),
      prisma.enrollment.count({ where: { courseId, completedAt: { not: null } } }),
      prisma.exerciseSubmission.findMany({
        where: { enrollment: { courseId } },
        select: { score: true, isCorrect: true },
      }),
    ]);
    const avgScore =
      submissions.length > 0
        ? submissions.reduce((s, x) => s + Number(x.score), 0) / submissions.length
        : 0;
    return {
      courseId,
      totalEnrollments: enrollments,
      completed: completions,
      completionRate: enrollments ? (completions / enrollments) * 100 : 0,
      averageQuizScore: avgScore,
    };
  },

  async getEnrolledUsers(courseId: string, options?: { subadminId?: string }) {
    await this.getCourseForEdit(courseId, options);
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        progress: true,
        certificate: true,
      },
    });
    return { courseId, enrollments };
  },

  // Modules
  async createModule(courseId: string, data: { title: string; order?: number }, options?: { subadminId?: string }) {
    await this.getCourseForEdit(courseId, options);
    return prisma.module.create({
      data: { courseId, title: data.title, order: data.order ?? 0 },
    });
  },

  async createLesson(
    moduleId: string,
    data: {
      title: string;
      type: LessonType;
      content?: string;
      videoUrl?: string;
      pdfUrl?: string;
      order?: number;
      duration?: number;
    },
    options?: { subadminId?: string }
  ) {
    const module = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!module) throw new NotFoundError('Module not found');
    if (options?.subadminId && module.course.subadminId !== options.subadminId)
      throw new ForbiddenError('Not allowed');
    return prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        type: data.type,
        content: data.content,
        videoUrl: data.videoUrl,
        pdfUrl: data.pdfUrl,
        order: data.order ?? 0,
        duration: data.duration,
      },
    });
  },

  async addExerciseToLesson(
    lessonId: string,
    data: { type: ExerciseType; question: string; options?: unknown; answer?: string; order?: number },
    options?: { subadminId?: string }
  ) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: { include: { course: true } } } });
    if (!lesson) throw new NotFoundError('Lesson not found');
    if (options?.subadminId && lesson.module.course.subadminId !== options.subadminId)
      throw new ForbiddenError('Not allowed');
    return prisma.exercise.create({
      data: {
        lessonId,
        type: data.type,
        question: data.question,
        options: data.options ?? undefined,
        answer: data.answer ?? undefined,
        order: data.order ?? 0,
      },
    });
  },

  async addExerciseToCourse(
    courseId: string,
    data: { type: ExerciseType; question: string; options?: unknown; answer?: string; order?: number },
    options?: { subadminId?: string }
  ) {
    await this.getCourseForEdit(courseId, options);
    return prisma.exercise.create({
      data: {
        courseId,
        type: data.type,
        question: data.question,
        options: data.options ?? undefined,
        answer: data.answer ?? undefined,
        order: data.order ?? 0,
      },
    });
  },

  async updateExercise(id: string, data: Prisma.ExerciseUpdateInput, options?: { subadminId?: string }) {
    const ex = await prisma.exercise.findUnique({
      where: { id },
      include: { lesson: { include: { module: { include: { course: true } } } }, course: true },
    });
    if (!ex) throw new NotFoundError('Exercise not found');
    const course = ex.lesson?.module?.course ?? ex.course;
    if (!course) throw new NotFoundError('Course not found');
    if (options?.subadminId && course.subadminId !== options.subadminId)
      throw new ForbiddenError('Not allowed');
    return prisma.exercise.update({ where: { id }, data });
  },

  async deleteExercise(id: string, options?: { subadminId?: string }) {
    const ex = await prisma.exercise.findUnique({
      where: { id },
      include: { lesson: { include: { module: { include: { course: true } } } }, course: true },
    });
    if (!ex) throw new NotFoundError('Exercise not found');
    const course = ex.lesson?.module?.course ?? ex.course;
    if (!course) throw new NotFoundError('Course not found');
    if (options?.subadminId && course.subadminId !== options.subadminId)
      throw new ForbiddenError('Not allowed');
    await prisma.exercise.delete({ where: { id } });
    return { message: 'Exercise deleted' };
  },
};
