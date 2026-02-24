import { Request, Response, NextFunction } from "express";
import { courseService } from "./course.service";
import { prisma } from "../../utils/prisma";
import console from "console";

export const courseController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await courseService.create({
        ...req.body,
        createdByRole: req.user!.role,
        createdById: req.user!.id,
      });
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId =
        req.user?.role === "SUBADMIN"
          ? req.user.id
          : (req.query.subadminId as string);
      const data =
        req.user?.role === "SUBADMIN"
          ? await courseService.listForSubadmin(req.user.id, req.query as any)
          : await courseService.listForAdmin({
              search: req.query.search as string,
              page: req.query.page as any,
              limit: req.query.limit as any,
              subadminId,
            });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId =
        req.user?.role === "SUBADMIN" ? req.user.id : undefined;
      const course = await courseService.getCourseForEdit(req.params.id, {
        subadminId,
      });
      const modules = await prisma.module.findMany({
        where: { courseId: course.id },
        include: { lessons: { include: { exercises: true } } },
        orderBy: { order: "asc" },
      });
      res.json({ success: true, data: { ...course, modules } });
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      const data = await courseService.update(req.params.id, req.body, {
        subadminId,
      });
      console.log(data);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      await courseService.delete(req.params.id, { subadminId });
      res.json({ success: true, message: "Course deleted" });
    } catch (e) {
      next(e);
    }
  },

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      const data = await courseService.publish(req.params.id, { subadminId });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async unpublish(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      const data = await courseService.unpublish(req.params.id, { subadminId });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async assignSubadmin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await courseService.assignSubadmin(
        req.params.id,
        req.body.subadminId,
      );
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async analytics(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId =
        req.user?.role === "SUBADMIN" ? req.user.id : undefined;
      const data = await courseService.getAnalytics(req.params.id, {
        subadminId,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async enrolledUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId =
        req.user?.role === "SUBADMIN" ? req.user.id : undefined;
      const data = await courseService.getEnrolledUsers(req.params.id, {
        subadminId,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async createModule(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      const data = await courseService.createModule(
        req.params.courseId,
        req.body,
        { subadminId },
      );
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async createLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      const data = await courseService.createLesson(
        req.params.moduleId,
        req.body,
        { subadminId },
      );
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async updateLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      const data = await courseService.updateLesson(
        req.params.id,
        req.body,
        { subadminId },
      );
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async deleteLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      await courseService.deleteLesson(req.params.id, { subadminId });
      res.json({ success: true, message: "Lesson deleted" });
    } catch (e) {
      next(e);
    }
  },

  async addExerciseToLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      const data = await courseService.addExerciseToLesson(
        req.params.lessonId,
        req.body,
        { subadminId },
      );
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async addExerciseToCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      const data = await courseService.addExerciseToCourse(
        req.params.courseId,
        req.body,
        { subadminId },
      );
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async updateExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      const data = await courseService.updateExercise(
        req.params.exerciseId,
        req.body,
        { subadminId },
      );
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async deleteExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.id;
      await courseService.deleteExercise(req.params.exerciseId, { subadminId });
      res.json({ success: true, message: "Exercise deleted" });
    } catch (e) {
      next(e);
    }
  },

  async listLessons(req: Request, res: Response, next: NextFunction) {
    try {
      // SUBADMIN can only see lessons belonging to their own courses
      const subadminId =
        req.user?.role === "SUBADMIN"
          ? req.user.id
          : (req.query.subadminId as string | undefined);
      const data = await courseService.listLessons({
        subadminId,
        search: req.query.search as string,
        page: req.query.page as any,
        limit: req.query.limit as any,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getOneLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId =
        req.user?.role === "SUBADMIN" ? req.user.id : undefined;
      const data = await courseService.getOneLesson(req.params.id, {
        subadminId,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getLessonOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.role === "SUBADMIN" ? req.user.id : undefined;
      const data = await courseService.getLessonOptions({ subadminId });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getCoursesWithModules(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.role === "SUBADMIN" ? req.user.id : undefined;
      const data = await courseService.getCoursesWithModules({ subadminId });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async listExercises(req: Request, res: Response, next: NextFunction) {
    try {
      // SUBADMIN can only see exercises belonging to their own courses
      const subadminId =
        req.user?.role === "SUBADMIN"
          ? req.user.id
          : (req.query.subadminId as string | undefined);
      const data = await courseService.listExercises({
        subadminId,
        search: req.query.search as string,
        page: req.query.page as any,
        limit: req.query.limit as any,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getOneExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const subadminId = req.user?.role === "SUBADMIN" ? req.user.id : undefined;
      const data = await courseService.getOneExercise(req.params.id, { subadminId });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
};
