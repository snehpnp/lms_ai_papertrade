import { Request, Response, NextFunction } from 'express';
export declare const courseController: {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOne(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    publish(req: Request, res: Response, next: NextFunction): Promise<void>;
    unpublish(req: Request, res: Response, next: NextFunction): Promise<void>;
    assignSubadmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    analytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    enrolledUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    createModule(req: Request, res: Response, next: NextFunction): Promise<void>;
    createLesson(req: Request, res: Response, next: NextFunction): Promise<void>;
    addExerciseToLesson(req: Request, res: Response, next: NextFunction): Promise<void>;
    addExerciseToCourse(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateExercise(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteExercise(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=course.controller.d.ts.map