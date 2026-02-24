import { prisma } from '../../utils/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors';

/** Available courses for a user: published + (no referral filter means all; if user has referredBy then only that subadmin's courses + global/unassigned). */
export async function getAvailableCourses(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referredById: true },
  });
  if (!user) throw new NotFoundError('User not found');

  const where: any = { isPublished: true };
  if (user.referredById) {
    where.OR = [{ subadminId: user.referredById }, { subadminId: null }];
  }

  const courses = await prisma.course.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      thumbnail: true,
      price: true,
      subadmin: { select: { name: true } },
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
      enrollments: {
        where: { userId },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return courses.map(c => ({
    ...c,
    isEnrolled: c.enrollments.length > 0,
    enrollmentId: c.enrollments[0]?.id ?? null,
  }));
}


export async function enrollCourse(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new NotFoundError('Course not found');
  if (!course.isPublished) throw new BadRequestError('Course is not available for enrollment');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  if (user.referredById && course.subadminId && course.subadminId !== user.referredById)
    throw new ForbiddenError('You can only enroll in courses from your referrer or global courses');

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
    include: { course: { select: { id: true, title: true } } },
  });
  return enrollment;
}

export async function getLessons(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) throw new ForbiddenError('Not enrolled in this course');

  const modules = await prisma.module.findMany({
    where: { courseId },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
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

export async function submitExercise(
  userId: string,
  exerciseId: string,
  enrollmentId: string,
  response: unknown
) {
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) throw new NotFoundError('Exercise not found');

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true },
  });
  if (!enrollment || enrollment.userId !== userId)
    throw new ForbiddenError('Enrollment not found');

  const correctAnswer = exercise.answer;
  const options = exercise.options as Array<{ id: string; isCorrect?: boolean }> | null;
  let isCorrect = false;
  let score = 0;
  if (exercise.type === 'MCQ' && options) {
    const selected = (response as { optionId?: string }).optionId;
    const correctOption = options.find((o) => o.isCorrect);
    isCorrect = correctOption ? selected === correctOption.id : false;
    score = isCorrect ? 100 : 0;
  } else if (exercise.type === 'FILL_IN_BLANKS' && correctAnswer) {
    const answers = JSON.parse(correctAnswer) as string[];
    const userAnswers = (response as { answers?: string[] }).answers ?? [];
    isCorrect = answers.length === userAnswers.length && answers.every((a, i) => a === userAnswers[i]);
    score = isCorrect ? 100 : 0;
  }

  const submission = await prisma.exerciseSubmission.create({
    data: {
      userId,
      exerciseId,
      enrollmentId,
      response: response as object,
      isCorrect,
      score,
    },
  });
  return { submission, isCorrect, score };
}

export async function recordProgress(userId: string, lessonId: string, enrollmentId: string, timeSpent: number) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });
  if (!enrollment || enrollment.userId !== userId) throw new ForbiddenError('Enrollment not found');

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  });
  if (!lesson || lesson.module.courseId !== enrollment.courseId)
    throw new BadRequestError('Lesson not in this course');

  const progress = await prisma.progress.upsert({
    where: {
      enrollmentId_lessonId: { enrollmentId, lessonId },
    },
    create: { enrollmentId, lessonId, timeSpent },
    update: { timeSpent },
  });
  return progress;
}

export async function getMyEnrollments(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      progress: { include: { lesson: { select: { id: true, title: true } } } },
      certificate: true,
    },
  });
  return enrollments;
}

export async function getCertificate(userId: string, enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true, progress: true },
  });
  if (!enrollment || enrollment.userId !== userId) throw new NotFoundError('Enrollment not found');

  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId: enrollment.courseId } },
  });
  const completed = enrollment.progress.length;
  if (totalLessons > 0 && completed < totalLessons)
    throw new BadRequestError('Complete all lessons to get the certificate');

  let cert = await prisma.certificate.findUnique({
    where: { enrollmentId },
  });
  if (!cert) {
    cert = await prisma.certificate.create({
      data: { userId, enrollmentId },
    });
  }
  return cert;
}
