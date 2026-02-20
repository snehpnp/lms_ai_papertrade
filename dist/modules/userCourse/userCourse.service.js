"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableCourses = getAvailableCourses;
exports.enrollCourse = enrollCourse;
exports.getLessons = getLessons;
exports.submitExercise = submitExercise;
exports.recordProgress = recordProgress;
exports.getMyEnrollments = getMyEnrollments;
exports.getCertificate = getCertificate;
const prisma_1 = require("../../utils/prisma");
const errors_1 = require("../../utils/errors");
/** Available courses for a user: published + (no referral filter means all; if user has referredBy then only that subadmin's courses + global/unassigned). */
async function getAvailableCourses(userId) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { referredById: true },
    });
    if (!user)
        throw new errors_1.NotFoundError('User not found');
    const where = { isPublished: true };
    if (user.referredById) {
        where.OR = [{ subadminId: user.referredById }, { subadminId: null }];
    }
    const courses = await prisma_1.prisma.course.findMany({
        where,
        select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            thumbnail: true,
            price: true,
        },
        orderBy: { createdAt: 'desc' },
    });
    return courses;
}
async function enrollCourse(userId, courseId) {
    const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
    if (!course)
        throw new errors_1.NotFoundError('Course not found');
    if (!course.isPublished)
        throw new errors_1.BadRequestError('Course is not available for enrollment');
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new errors_1.NotFoundError('User not found');
    if (user.referredById && course.subadminId && course.subadminId !== user.referredById)
        throw new errors_1.ForbiddenError('You can only enroll in courses from your referrer or global courses');
    const enrollment = await prisma_1.prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId },
        update: {},
        include: { course: { select: { id: true, title: true } } },
    });
    return enrollment;
}
async function getLessons(userId, courseId) {
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment)
        throw new errors_1.ForbiddenError('Not enrolled in this course');
    const modules = await prisma_1.prisma.module.findMany({
        where: { courseId },
        include: {
            lessons: {
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    duration: true,
                    order: true,
                    videoUrl: true,
                    pdfUrl: true,
                },
            },
        },
        orderBy: { order: 'asc' },
    });
    return { courseId, modules };
}
async function submitExercise(userId, exerciseId, enrollmentId, response) {
    const exercise = await prisma_1.prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise)
        throw new errors_1.NotFoundError('Exercise not found');
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { course: true },
    });
    if (!enrollment || enrollment.userId !== userId)
        throw new errors_1.ForbiddenError('Enrollment not found');
    const correctAnswer = exercise.answer;
    const options = exercise.options;
    let isCorrect = false;
    let score = 0;
    if (exercise.type === 'MCQ' && options) {
        const selected = response.optionId;
        const correctOption = options.find((o) => o.isCorrect);
        isCorrect = correctOption ? selected === correctOption.id : false;
        score = isCorrect ? 100 : 0;
    }
    else if (exercise.type === 'FILL_IN_BLANKS' && correctAnswer) {
        const answers = JSON.parse(correctAnswer);
        const userAnswers = response.answers ?? [];
        isCorrect = answers.length === userAnswers.length && answers.every((a, i) => a === userAnswers[i]);
        score = isCorrect ? 100 : 0;
    }
    const submission = await prisma_1.prisma.exerciseSubmission.create({
        data: {
            userId,
            exerciseId,
            enrollmentId,
            response: response,
            isCorrect,
            score,
        },
    });
    return { submission, isCorrect, score };
}
async function recordProgress(userId, lessonId, enrollmentId, timeSpent) {
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
    });
    if (!enrollment || enrollment.userId !== userId)
        throw new errors_1.ForbiddenError('Enrollment not found');
    const lesson = await prisma_1.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: { select: { courseId: true } } },
    });
    if (!lesson || lesson.module.courseId !== enrollment.courseId)
        throw new errors_1.BadRequestError('Lesson not in this course');
    const progress = await prisma_1.prisma.progress.upsert({
        where: {
            enrollmentId_lessonId: { enrollmentId, lessonId },
        },
        create: { enrollmentId, lessonId, timeSpent },
        update: { timeSpent },
    });
    return progress;
}
async function getMyEnrollments(userId) {
    const enrollments = await prisma_1.prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: { select: { id: true, title: true, slug: true } },
            progress: { include: { lesson: { select: { id: true, title: true } } } },
            certificate: true,
        },
    });
    return enrollments;
}
async function getCertificate(userId, enrollmentId) {
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { course: true, progress: true },
    });
    if (!enrollment || enrollment.userId !== userId)
        throw new errors_1.NotFoundError('Enrollment not found');
    const totalLessons = await prisma_1.prisma.lesson.count({
        where: { module: { courseId: enrollment.courseId } },
    });
    const completed = enrollment.progress.length;
    if (totalLessons > 0 && completed < totalLessons)
        throw new errors_1.BadRequestError('Complete all lessons to get the certificate');
    let cert = await prisma_1.prisma.certificate.findUnique({
        where: { enrollmentId },
    });
    if (!cert) {
        cert = await prisma_1.prisma.certificate.create({
            data: { userId, enrollmentId },
        });
    }
    return cert;
}
//# sourceMappingURL=userCourse.service.js.map