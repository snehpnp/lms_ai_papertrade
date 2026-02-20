"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseController = void 0;
const course_service_1 = require("./course.service");
const prisma_1 = require("../../utils/prisma");
exports.courseController = {
    async create(req, res, next) {
        try {
            const data = await course_service_1.courseService.create({
                ...req.body,
                createdByRole: req.user.role,
                createdById: req.user.id,
            });
            res.status(201).json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async list(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : req.query.subadminId;
            const data = req.user?.role === 'SUBADMIN'
                ? await course_service_1.courseService.listForSubadmin(req.user.id, req.query)
                : await course_service_1.courseService.listForAdmin({
                    search: req.query.search,
                    page: req.query.page,
                    limit: req.query.limit,
                    subadminId,
                });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async getOne(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const course = await course_service_1.courseService.getCourseForEdit(req.params.id, { subadminId });
            const modules = await prisma_1.prisma.module.findMany({
                where: { courseId: course.id },
                include: { lessons: { include: { exercises: true } } },
                orderBy: { order: 'asc' },
            });
            res.json({ success: true, data: { ...course, modules } });
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await course_service_1.courseService.update(req.params.id, req.body, { subadminId });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async delete(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            await course_service_1.courseService.delete(req.params.id, { subadminId });
            res.json({ success: true, message: 'Course deleted' });
        }
        catch (e) {
            next(e);
        }
    },
    async publish(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await course_service_1.courseService.publish(req.params.id, { subadminId });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async unpublish(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await course_service_1.courseService.unpublish(req.params.id, { subadminId });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async assignSubadmin(req, res, next) {
        try {
            const data = await course_service_1.courseService.assignSubadmin(req.params.id, req.body.subadminId);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async analytics(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await course_service_1.courseService.getAnalytics(req.params.id, { subadminId });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async enrolledUsers(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await course_service_1.courseService.getEnrolledUsers(req.params.id, { subadminId });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async createModule(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await course_service_1.courseService.createModule(req.params.courseId, req.body, { subadminId });
            res.status(201).json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async createLesson(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await course_service_1.courseService.createLesson(req.params.moduleId, req.body, { subadminId });
            res.status(201).json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async addExerciseToLesson(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await course_service_1.courseService.addExerciseToLesson(req.params.lessonId, req.body, { subadminId });
            res.status(201).json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async addExerciseToCourse(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await course_service_1.courseService.addExerciseToCourse(req.params.courseId, req.body, { subadminId });
            res.status(201).json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async updateExercise(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await course_service_1.courseService.updateExercise(req.params.exerciseId, req.body, { subadminId });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async deleteExercise(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            await course_service_1.courseService.deleteExercise(req.params.exerciseId, { subadminId });
            res.json({ success: true, message: 'Exercise deleted' });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=course.controller.js.map