"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseService = void 0;
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
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
};
exports.courseService = {
    async create(data) {
        if (data.createdByRole === 'SUBADMIN' && !data.subadminId)
            data.subadminId = data.createdById;
        if (data.createdByRole === 'ADMIN' && data.subadminId) {
            // admin assigning to subadmin
        }
        const existing = await prisma_1.prisma.course.findUnique({ where: { slug: data.slug } });
        if (existing)
            throw new errors_1.BadRequestError('Slug already exists');
        return prisma_1.prisma.course.create({
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
    async update(id, data, options) {
        await this.getCourseForEdit(id, options);
        if (data.slug) {
            const ex = await prisma_1.prisma.course.findFirst({ where: { slug: data.slug, NOT: { id } } });
            if (ex)
                throw new errors_1.BadRequestError('Slug already exists');
        }
        return prisma_1.prisma.course.update({
            where: { id },
            data: data,
            select: courseSelect,
        });
    },
    async delete(id, options) {
        await this.getCourseForEdit(id, options);
        await prisma_1.prisma.course.delete({ where: { id } });
        return { message: 'Course deleted' };
    },
    async publish(id, options) {
        await this.getCourseForEdit(id, options);
        return prisma_1.prisma.course.update({
            where: { id },
            data: { isPublished: true },
            select: courseSelect,
        });
    },
    async unpublish(id, options) {
        await this.getCourseForEdit(id, options);
        return prisma_1.prisma.course.update({
            where: { id },
            data: { isPublished: false },
            select: courseSelect,
        });
    },
    async assignSubadmin(courseId, subadminId) {
        const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
        if (!course)
            throw new errors_1.NotFoundError('Course not found');
        const subadmin = await prisma_1.prisma.user.findFirst({
            where: { id: subadminId, role: 'SUBADMIN' },
        });
        if (!subadmin)
            throw new errors_1.NotFoundError('Subadmin not found');
        return prisma_1.prisma.course.update({
            where: { id: courseId },
            data: { subadminId },
            select: courseSelect,
        });
    },
    async getCourseForEdit(id, options) {
        const course = await prisma_1.prisma.course.findUnique({ where: { id } });
        if (!course)
            throw new errors_1.NotFoundError('Course not found');
        if (options?.subadminId && course.subadminId !== options.subadminId)
            throw new errors_1.ForbiddenError('Not allowed to edit this course');
        return course;
    },
    async listForAdmin(params) {
        const page = Math.max(1, params.page ?? 1);
        const limit = Math.min(100, Math.max(1, params.limit ?? 20));
        const skip = (page - 1) * limit;
        const where = {};
        if (params.search)
            where.OR = [
                { title: { contains: params.search, mode: 'insensitive' } },
                { slug: { contains: params.search, mode: 'insensitive' } },
            ];
        if (params.subadminId)
            where.subadminId = params.subadminId;
        const [items, total] = await Promise.all([
            prisma_1.prisma.course.findMany({
                where,
                select: { ...courseSelect, _count: { select: { modules: true, enrollments: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.prisma.course.count({ where }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    },
    async listForSubadmin(subadminId, params) {
        return this.listForAdmin({ ...params, subadminId });
    },
    async getAnalytics(courseId, options) {
        await this.getCourseForEdit(courseId, options);
        const [enrollments, completions, submissions] = await Promise.all([
            prisma_1.prisma.enrollment.count({ where: { courseId } }),
            prisma_1.prisma.enrollment.count({ where: { courseId, completedAt: { not: null } } }),
            prisma_1.prisma.exerciseSubmission.findMany({
                where: { enrollment: { courseId } },
                select: { score: true, isCorrect: true },
            }),
        ]);
        const avgScore = submissions.length > 0
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
    async getEnrolledUsers(courseId, options) {
        await this.getCourseForEdit(courseId, options);
        const enrollments = await prisma_1.prisma.enrollment.findMany({
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
    async createModule(courseId, data, options) {
        await this.getCourseForEdit(courseId, options);
        return prisma_1.prisma.module.create({
            data: { courseId, title: data.title, order: data.order ?? 0 },
        });
    },
    async createLesson(moduleId, data, options) {
        const module = await prisma_1.prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
        if (!module)
            throw new errors_1.NotFoundError('Module not found');
        if (options?.subadminId && module.course.subadminId !== options.subadminId)
            throw new errors_1.ForbiddenError('Not allowed');
        return prisma_1.prisma.lesson.create({
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
    async addExerciseToLesson(lessonId, data, options) {
        const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: { include: { course: true } } } });
        if (!lesson)
            throw new errors_1.NotFoundError('Lesson not found');
        if (options?.subadminId && lesson.module.course.subadminId !== options.subadminId)
            throw new errors_1.ForbiddenError('Not allowed');
        return prisma_1.prisma.exercise.create({
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
    async addExerciseToCourse(courseId, data, options) {
        await this.getCourseForEdit(courseId, options);
        return prisma_1.prisma.exercise.create({
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
    async updateExercise(id, data, options) {
        const ex = await prisma_1.prisma.exercise.findUnique({
            where: { id },
            include: { lesson: { include: { module: { include: { course: true } } } }, course: true },
        });
        if (!ex)
            throw new errors_1.NotFoundError('Exercise not found');
        const course = ex.lesson?.module?.course ?? ex.course;
        if (!course)
            throw new errors_1.NotFoundError('Course not found');
        if (options?.subadminId && course.subadminId !== options.subadminId)
            throw new errors_1.ForbiddenError('Not allowed');
        return prisma_1.prisma.exercise.update({ where: { id }, data });
    },
    async deleteExercise(id, options) {
        const ex = await prisma_1.prisma.exercise.findUnique({
            where: { id },
            include: { lesson: { include: { module: { include: { course: true } } } }, course: true },
        });
        if (!ex)
            throw new errors_1.NotFoundError('Exercise not found');
        const course = ex.lesson?.module?.course ?? ex.course;
        if (!course)
            throw new errors_1.NotFoundError('Course not found');
        if (options?.subadminId && course.subadminId !== options.subadminId)
            throw new errors_1.ForbiddenError('Not allowed');
        await prisma_1.prisma.exercise.delete({ where: { id } });
        return { message: 'Exercise deleted' };
    },
};
//# sourceMappingURL=course.service.js.map