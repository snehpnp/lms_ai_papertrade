import { Prisma, ExerciseType } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../utils/errors";

const courseSelect = {
  id: true,
  title: true,
  description: true,
  slug: true,
  thumbnail: true,
  modules: { select: { id: true, title: true, order: true } },

  price: true,
  isPublished: true,
  subadminId: true,
  subadmin: { select: { name: true } },
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
    modules?: { title: string; order?: number }[];

    createdByRole: string;
    createdById: string;
  }) {
    if (!data.subadminId) {
      data.subadminId = data.createdById;
    }

    // Slug check
    const existing = await prisma.course.findUnique({
      where: { slug: data.slug },
    });

    if (existing) throw new BadRequestError("Slug already exists");

    // 🔥 Transaction start
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create Course
      const course = await tx.course.create({
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

      // 2️⃣ Create Modules (if provided)
      if (data.modules && data.modules.length > 0) {
        await tx.module.createMany({
          data: data.modules.map((module, index) => ({
            courseId: course.id,
            title: module.title,
            order: module.order ?? index + 1,
          })),
        });
      }

      return course;
    });

    return result;
  },

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      slug?: string;
      thumbnail?: string;
      price?: number;
      modules?: {
        id?: string;
        title: string;
        order?: number;
      }[];
    },
    options?: { subadminId?: string },
  ) {

    await this.getCourseForEdit(id, options);


    // Slug validation
    if (data.slug) {
      const ex = await prisma.course.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (ex) throw new BadRequestError("Slug already exists");
    }

    return prisma.$transaction(async (tx) => {
      // 1️⃣ Update Course
      const updatedCourse = await tx.course.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          slug: data.slug,
          thumbnail: data.thumbnail,
          price: data.price,
        },
        select: courseSelect,
      });

      // 2️⃣ Handle Modules If Provided
      if (data.modules) {
        const existingModules = await tx.module.findMany({
          where: { courseId: id },
        });

        const existingModuleIds = existingModules.map((m) => m.id);
        const incomingModuleIds = data.modules
          .filter((m) => m.id)
          .map((m) => m.id as string);

        // 🔥 Delete removed modules
        const modulesToDelete = existingModuleIds.filter(
          (moduleId) => !incomingModuleIds.includes(moduleId),
        );

        if (modulesToDelete.length > 0) {
          await tx.module.deleteMany({
            where: {
              id: { in: modulesToDelete },
            },
          });
        }

        // 🔥 Create or Update modules
        for (const module of data.modules) {
          if (module.id) {
            // Update existing
            await tx.module.update({
              where: { id: module.id },
              data: {
                title: module.title,
                order: module.order ?? 0,
              },
            });
          } else {
            // Create new
            await tx.module.create({
              data: {
                courseId: id,
                title: module.title,
                order: module.order ?? 0,
              },
            });
          }
        }
      }

      return updatedCourse;
    });
  },

  async delete(id: string, options?: { subadminId?: string }) {
    await this.getCourseForEdit(id, options);
    await prisma.course.delete({ where: { id } });
    return { message: "Course deleted" };
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
    if (!course) throw new NotFoundError("Course not found");
    const subadmin = await prisma.user.findFirst({
      where: { id: subadminId, role: "SUBADMIN" },
    });
    if (!subadmin) throw new NotFoundError("Subadmin not found");
    return prisma.course.update({
      where: { id: courseId },
      data: { subadminId },
      select: courseSelect,
    });
  },

  async getCourseForEdit(id: string, options?: { subadminId?: string }) {

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");
    if (options?.subadminId && course.subadminId !== options.subadminId)
      throw new ForbiddenError("Not allowed to edit this course");
    return course;
  },

  async listForAdmin(params: {
    search?: string;
    page?: number;
    limit?: number;
    subadminId?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;
    const where: Prisma.CourseWhereInput = {};
    if (params.search)
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } },
      ];
    if (params.subadminId) where.subadminId = params.subadminId;

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: {
          ...courseSelect,
          _count: { select: { modules: true, enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async listForSubadmin(
    subadminId: string,
    params: { search?: string; page?: number; limit?: number },
  ) {
    return this.listForAdmin({ ...params, subadminId });
  },

  async getAnalytics(courseId: string, options?: { subadminId?: string }) {
    await this.getCourseForEdit(courseId, options);
    const [enrollments, completions, submissions] = await Promise.all([
      prisma.enrollment.count({ where: { courseId } }),
      prisma.enrollment.count({
        where: { courseId, completedAt: { not: null } },
      }),
      prisma.exerciseSubmission.findMany({
        where: { enrollment: { courseId } },
        select: { score: true, isCorrect: true },
      }),
    ]);
    const avgScore =
      submissions.length > 0
        ? submissions.reduce((s, x) => s + Number(x.score), 0) /
        submissions.length
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
  async createModule(
    courseId: string,
    data: { title: string; order?: number },
    options?: { subadminId?: string },
  ) {
    await this.getCourseForEdit(courseId, options);
    return prisma.module.create({
      data: { courseId, title: data.title, order: data.order ?? 0 },
    });
  },

  async createLesson(
    moduleId: string,
    data: {
      title: string;
      description?: string;
      thumbnail?: string;
      content: string;
      videoUrl: string;
      pdfUrl?: string;
      order: number;
      duration: number;
    },
    options?: { subadminId?: string },
  ) {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module) throw new NotFoundError("Module not found");
    if (options?.subadminId && module.course.subadminId !== options.subadminId)
      throw new ForbiddenError("Not allowed");
    return prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        content: data.content,
        videoUrl: data.videoUrl,
        pdfUrl: data.pdfUrl,
        order: data.order,
        duration: data.duration,
      },
    });
  },

  async updateLesson(
    id: string,
    data: {
      title?: string;
      description?: string;
      thumbnail?: string;
      content?: string;
      videoUrl?: string;
      pdfUrl?: string;
      order?: number;
      duration?: number;
      moduleId?: string;
      exercises?: {
        id?: string;
        type: ExerciseType;
        question: string;
        options?: any;
        answer?: string;
        order?: number;
      }[];
    },
    options?: { subadminId?: string },
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) throw new NotFoundError("Lesson not found");

    if (
      options?.subadminId &&
      lesson.module.course.subadminId !== options.subadminId
    )
      throw new ForbiddenError("Not allowed");

    if (data.moduleId && data.moduleId !== lesson.moduleId) {
      const newModule = await prisma.module.findUnique({
        where: { id: data.moduleId },
        include: { course: true },
      });
      if (!newModule) throw new NotFoundError("New module not found");
      if (
        options?.subadminId &&
        newModule.course.subadminId !== options.subadminId
      )
        throw new ForbiddenError("Not allowed to move to this module");
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update lesson fields
      const updatedLesson = await tx.lesson.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnail,
          content: data.content,
          videoUrl: data.videoUrl,
          pdfUrl: data.pdfUrl,
          order: data.order,
          duration: data.duration,
          moduleId: data.moduleId,
        },
      });

      // 2. Handle nested exercises if provided
      if (data.exercises) {
        const existingExercises = await tx.exercise.findMany({
          where: { lessonId: id },
        });

        const existingExIds = existingExercises.map(e => e.id);
        const incomingExIds = data.exercises.filter(e => e.id).map(e => e.id as string);

        // Delete exercises not in incoming data
        const toDelete = existingExIds.filter(id => !incomingExIds.includes(id));
        if (toDelete.length > 0) {
          await tx.exercise.deleteMany({ where: { id: { in: toDelete } } });
        }

        // Create or Update
        for (const ex of data.exercises) {
          if (ex.id && existingExIds.includes(ex.id)) {
            await tx.exercise.update({
              where: { id: ex.id },
              data: {
                type: ex.type,
                question: ex.question,
                options: ex.options ?? undefined,
                answer: ex.answer,
                order: ex.order ?? 0,
              },
            });
          } else {
            await tx.exercise.create({
              data: {
                lessonId: id,
                type: ex.type,
                question: ex.question,
                options: ex.options ?? undefined,
                answer: ex.answer,
                order: ex.order ?? 0,
              },
            });
          }
        }
      }

      return updatedLesson;
    });
  },

  async deleteLesson(id: string, options?: { subadminId?: string }) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) throw new NotFoundError("Lesson not found");
    if (
      options?.subadminId &&
      lesson.module.course.subadminId !== options.subadminId
    )
      throw new ForbiddenError("Not allowed");

    await prisma.lesson.delete({ where: { id } });
    return { message: "Lesson deleted" };
  },

  async addExerciseToLesson(
    lessonId: string,
    data: {
      type: ExerciseType;
      question: string;
      options?: unknown;
      answer?: string;
      order?: number;
    },
    options?: { subadminId?: string },
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) throw new NotFoundError("Lesson not found");
    if (
      options?.subadminId &&
      lesson.module.course.subadminId !== options.subadminId
    )
      throw new ForbiddenError("Not allowed");
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
    data: {
      type: ExerciseType;
      question: string;
      options?: unknown;
      answer?: string;
      order?: number;
    },
    options?: { subadminId?: string },
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

  async updateExercise(
    id: string,
    data: Prisma.ExerciseUpdateInput,
    options?: { subadminId?: string },
  ) {
    const ex = await prisma.exercise.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
        course: true,
      },
    });
    if (!ex) throw new NotFoundError("Exercise not found");
    const course = ex.lesson?.module?.course ?? ex.course;
    if (!course) throw new NotFoundError("Course not found");
    if (options?.subadminId && course.subadminId !== options.subadminId)
      throw new ForbiddenError("Not allowed");
    return prisma.exercise.update({ where: { id }, data });
  },

  async deleteExercise(id: string, options?: { subadminId?: string }) {
    const ex = await prisma.exercise.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
        course: true,
      },
    });
    if (!ex) throw new NotFoundError("Exercise not found");
    const course = ex.lesson?.module?.course ?? ex.course;
    if (!course) throw new NotFoundError("Course not found");
    if (options?.subadminId && course.subadminId !== options.subadminId)
      throw new ForbiddenError("Not allowed");
    await prisma.exercise.delete({ where: { id } });
    return { message: "Exercise deleted" };
  },

  async listLessons(options?: {
    subadminId?: string;
    search?: string;
    courseId?: string;
    moduleId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(options?.page) || 1;
    const limit = Number(options?.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.LessonWhereInput = {};

    // Filter by subadmin
    if (options?.subadminId || options?.courseId) {
      where.module = {};
      if (options.subadminId) {
        where.module.course = { subadminId: options.subadminId };
      }
      if (options.courseId) {
        where.module.courseId = options.courseId;
      }
    }

    if (options?.moduleId) {
      where.moduleId = options.moduleId;
    }

    // Search filter
    if (options?.search) {
      where.OR = [
        {
          title: {
            contains: options.search,
            mode: "insensitive",
          },
        },
        {
          module: {
            title: {
              contains: options.search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.lesson.count({ where });

    // Get paginated data
    const lessons = await prisma.lesson.findMany({
      where,
      skip,
      take: limit,
      include: {
        exercises: true,
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                subadminId: true,
                subadmin: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // 🔥 latest lesson first
      },
    });

    return {
      data: lessons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getOneLesson(id: string, options?: { subadminId?: string }) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        exercises: true,
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                subadminId: true,
                subadmin: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!lesson) throw new NotFoundError("Lesson not found");

    // ✅ Proper Permission Check
    if (
      options?.subadminId &&
      lesson.module.course.subadminId !== options.subadminId
    ) {
      throw new ForbiddenError("Not allowed");
    }

    // ✅ Flatten response (cleaner frontend)
    return {
      id: lesson.id,
      title: lesson.title,
      order: lesson.order,
      videoUrl: lesson.videoUrl,
      pdfUrl: lesson.pdfUrl,
      content: lesson.content,
      duration: lesson.duration,
      exercises: lesson.exercises,
      thumbnail: lesson.thumbnail,
      description: lesson.description,

      module_id: lesson.module.id,
      module_name: lesson.module.title,

      course_id: lesson.module.course.id,
      course_name: lesson.module.course.title,
    };
  },

  async getLessonOptions(options?: { subadminId?: string }) {
    const where: Prisma.LessonWhereInput = {};
    if (options?.subadminId) {
      where.module = {
        course: {
          subadminId: options.subadminId,
        },
      };
    }

    const lessons = await prisma.lesson.findMany({
      where,
      select: {
        id: true,
        title: true,
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
                subadminId: true,
                subadmin: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return lessons.map(l => ({
      id: l.id,
      title: l.title,
      module_id: l.module.id,
      module_name: l.module.title,
      course_id: l.module.course.id,
      course_name: l.module.course.title,
    }));
  },

  async getCoursesWithModules(options?: { subadminId?: string }) {
    const where: Prisma.CourseWhereInput = {};
    if (options?.subadminId) where.subadminId = options.subadminId;

    const course = await prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,

        modules: {
          select: {
            id: true,
            title: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    return course;
  },
  async listExercises(options?: {
    subadminId?: string;
    search?: string;
    courseId?: string;
    moduleId?: string;
    lessonId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(options?.page) || 1;
    const limit = Number(options?.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ExerciseWhereInput = {};

    if (options?.subadminId) {
      where.OR = [
        { lesson: { module: { course: { subadminId: options.subadminId } } } },
        { course: { subadminId: options.subadminId } }
      ];
    }

    if (options?.courseId) {
      if (where.OR) {
        // Narrow down existing OR if subadmin is present
        where.AND = [
          { OR: where.OR },
          {
            OR: [
              { lesson: { module: { courseId: options.courseId } } },
              { courseId: options.courseId }
            ]
          }
        ];
        delete where.OR;
      } else {
        where.OR = [
          { lesson: { module: { courseId: options.courseId } } },
          { courseId: options.courseId }
        ];
      }
    }

    if (options?.moduleId) {
      where.lesson = { moduleId: options.moduleId };
    }

    if (options?.lessonId) {
      where.lessonId = options.lessonId;
    }

    if (options?.search) {
      where.question = { contains: options.search, mode: "insensitive" };
    }

    const total = await prisma.exercise.count({ where });

    const exercises = await prisma.exercise.findMany({
      where,
      skip,
      take: limit,
      include: {
        lesson: { include: { module: { include: { course: { select: { id: true, title: true, subadminId: true, subadmin: { select: { name: true } } } } } } } },
        course: { select: { id: true, title: true, subadminId: true, subadmin: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedData = exercises.map(ex => ({
      ...ex,
      course_id: ex.lesson?.module.course.id || ex.course?.id,
      course_name: ex.lesson?.module.course.title || ex.course?.title,
      subadminId: ex.lesson?.module.course.subadminId || ex.course?.subadminId,
      subadmin: ex.lesson?.module.course.subadmin || ex.course?.subadmin,
      lesson_id: ex.lesson?.id,
      lesson_title: ex.lesson?.title,
    }));

    return {
      data: formattedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getOneExercise(id: string, options?: { subadminId?: string }) {

    const ex = await prisma.exercise.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: { select: { id: true, title: true, subadminId: true } } } } } },
        course: { select: { id: true, title: true, subadminId: true } },
      },
    });

    if (!ex) throw new NotFoundError("Exercise not found");

    const course = ex.lesson?.module?.course ?? ex.course;
    if (options?.subadminId && course && course.subadminId !== options.subadminId)
      throw new ForbiddenError("Not allowed");

    return {
      ...ex,
      course_id: course?.id,
      course_name: course?.title,
      subadminId: course?.subadminId,
      subadmin: course?.subadminId ? { name: course?.subadminId } : undefined,
      lesson_id: ex.lesson?.id,
      lesson_title: ex.lesson?.title,
    };
  },

  async getFilterOptions(options?: { subadminId?: string }) {
    const where: Prisma.CourseWhereInput = {};
    if (options?.subadminId) where.subadminId = options.subadminId;

    return prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        modules: {
          select: {
            id: true,
            title: true,
            lessons: {
              select: {
                id: true,
                title: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { title: "asc" },
    });
  }
};
