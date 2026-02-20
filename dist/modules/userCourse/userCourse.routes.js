"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCourseRoutes = void 0;
const express_1 = require("express");
const userCourseService = __importStar(require("./userCourse.service"));
const authenticate_1 = require("../../middlewares/authenticate");
const rbac_1 = require("../../middlewares/rbac");
const validate_1 = require("../../middlewares/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, rbac_1.userOnly);
const courseIdParam = zod_1.z.object({ params: zod_1.z.object({ courseId: zod_1.z.string().uuid() }) });
const enrollmentIdParam = zod_1.z.object({ params: zod_1.z.object({ enrollmentId: zod_1.z.string().uuid() }) });
const lessonIdParam = zod_1.z.object({ params: zod_1.z.object({ lessonId: zod_1.z.string().uuid() }) });
const exerciseIdParam = zod_1.z.object({ params: zod_1.z.object({ exerciseId: zod_1.z.string().uuid() }) });
router.get('/courses', async (req, res, next) => {
    try {
        const data = await userCourseService.getAvailableCourses(req.user.id);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.post('/enroll/:courseId', (0, validate_1.validate)(courseIdParam), async (req, res, next) => {
    try {
        const data = await userCourseService.enrollCourse(req.user.id, req.params.courseId);
        res.status(201).json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.get('/enrollments', async (req, res, next) => {
    try {
        const data = await userCourseService.getMyEnrollments(req.user.id);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.get('/courses/:courseId/lessons', (0, validate_1.validate)(courseIdParam), async (req, res, next) => {
    try {
        const data = await userCourseService.getLessons(req.user.id, req.params.courseId);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.post('/progress', (0, validate_1.validate)(zod_1.z.object({
    body: zod_1.z.object({
        lessonId: zod_1.z.string().uuid(),
        enrollmentId: zod_1.z.string().uuid(),
        timeSpent: zod_1.z.number().int().min(0),
    }),
})), async (req, res, next) => {
    try {
        const { lessonId, enrollmentId, timeSpent } = req.body;
        const data = await userCourseService.recordProgress(req.user.id, lessonId, enrollmentId, timeSpent);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.post('/exercises/:exerciseId/submit', (0, validate_1.validate)(zod_1.z.object({
    params: zod_1.z.object({ exerciseId: zod_1.z.string().uuid() }),
    body: zod_1.z.object({
        enrollmentId: zod_1.z.string().uuid(),
        response: zod_1.z.any(),
    }),
})), async (req, res, next) => {
    try {
        const data = await userCourseService.submitExercise(req.user.id, req.params.exerciseId, req.body.enrollmentId, req.body.response);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
router.get('/certificate/:enrollmentId', (0, validate_1.validate)(enrollmentIdParam), async (req, res, next) => {
    try {
        const data = await userCourseService.getCertificate(req.user.id, req.params.enrollmentId);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
});
exports.userCourseRoutes = router;
//# sourceMappingURL=userCourse.routes.js.map