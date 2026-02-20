import { Prisma, LessonType, ExerciseType } from '@prisma/client';
export declare const courseService: {
    create(data: {
        title: string;
        description?: string;
        slug: string;
        thumbnail?: string;
        price?: number;
        subadminId?: string;
        createdByRole: string;
        createdById: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: Prisma.Decimal;
        title: string;
        slug: string;
        thumbnail: string | null;
        isPublished: boolean;
        subadminId: string | null;
    }>;
    update(id: string, data: {
        title?: string;
        description?: string;
        slug?: string;
        thumbnail?: string;
        price?: number;
    }, options?: {
        subadminId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: Prisma.Decimal;
        title: string;
        slug: string;
        thumbnail: string | null;
        isPublished: boolean;
        subadminId: string | null;
    }>;
    delete(id: string, options?: {
        subadminId?: string;
    }): Promise<{
        message: string;
    }>;
    publish(id: string, options?: {
        subadminId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: Prisma.Decimal;
        title: string;
        slug: string;
        thumbnail: string | null;
        isPublished: boolean;
        subadminId: string | null;
    }>;
    unpublish(id: string, options?: {
        subadminId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: Prisma.Decimal;
        title: string;
        slug: string;
        thumbnail: string | null;
        isPublished: boolean;
        subadminId: string | null;
    }>;
    assignSubadmin(courseId: string, subadminId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: Prisma.Decimal;
        title: string;
        slug: string;
        thumbnail: string | null;
        isPublished: boolean;
        subadminId: string | null;
    }>;
    getCourseForEdit(id: string, options?: {
        subadminId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: Prisma.Decimal;
        title: string;
        slug: string;
        thumbnail: string | null;
        isPublished: boolean;
        subadminId: string | null;
    }>;
    listForAdmin(params: {
        search?: string;
        page?: number;
        limit?: number;
        subadminId?: string;
    }): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            _count: {
                enrollments: number;
                modules: number;
            };
            description: string | null;
            price: Prisma.Decimal;
            title: string;
            slug: string;
            thumbnail: string | null;
            isPublished: boolean;
            subadminId: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    listForSubadmin(subadminId: string, params: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            _count: {
                enrollments: number;
                modules: number;
            };
            description: string | null;
            price: Prisma.Decimal;
            title: string;
            slug: string;
            thumbnail: string | null;
            isPublished: boolean;
            subadminId: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAnalytics(courseId: string, options?: {
        subadminId?: string;
    }): Promise<{
        courseId: string;
        totalEnrollments: number;
        completed: number;
        completionRate: number;
        averageQuizScore: number;
    }>;
    getEnrolledUsers(courseId: string, options?: {
        subadminId?: string;
    }): Promise<{
        courseId: string;
        enrollments: ({
            user: {
                email: string;
                id: string;
                name: string;
            };
            progress: {
                id: string;
                completedAt: Date;
                enrollmentId: string;
                lessonId: string;
                timeSpent: number;
            }[];
            certificate: {
                userId: string;
                id: string;
                pdfUrl: string | null;
                enrollmentId: string;
                issuedAt: Date;
            } | null;
        } & {
            userId: string;
            id: string;
            courseId: string;
            enrolledAt: Date;
            completedAt: Date | null;
        })[];
    }>;
    createModule(courseId: string, data: {
        title: string;
        order?: number;
    }, options?: {
        subadminId?: string;
    }): Promise<{
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
    }>;
    createLesson(moduleId: string, data: {
        title: string;
        type: LessonType;
        content?: string;
        videoUrl?: string;
        pdfUrl?: string;
        order?: number;
        duration?: number;
    }, options?: {
        subadminId?: string;
    }): Promise<{
        order: number;
        type: import(".prisma/client").$Enums.LessonType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        moduleId: string;
        content: string | null;
        videoUrl: string | null;
        pdfUrl: string | null;
        duration: number | null;
    }>;
    addExerciseToLesson(lessonId: string, data: {
        type: ExerciseType;
        question: string;
        options?: unknown;
        answer?: string;
        order?: number;
    }, options?: {
        subadminId?: string;
    }): Promise<{
        order: number;
        type: import(".prisma/client").$Enums.ExerciseType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        options: Prisma.JsonValue | null;
        courseId: string | null;
        lessonId: string | null;
        question: string;
        answer: string | null;
    }>;
    addExerciseToCourse(courseId: string, data: {
        type: ExerciseType;
        question: string;
        options?: unknown;
        answer?: string;
        order?: number;
    }, options?: {
        subadminId?: string;
    }): Promise<{
        order: number;
        type: import(".prisma/client").$Enums.ExerciseType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        options: Prisma.JsonValue | null;
        courseId: string | null;
        lessonId: string | null;
        question: string;
        answer: string | null;
    }>;
    updateExercise(id: string, data: Prisma.ExerciseUpdateInput, options?: {
        subadminId?: string;
    }): Promise<{
        order: number;
        type: import(".prisma/client").$Enums.ExerciseType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        options: Prisma.JsonValue | null;
        courseId: string | null;
        lessonId: string | null;
        question: string;
        answer: string | null;
    }>;
    deleteExercise(id: string, options?: {
        subadminId?: string;
    }): Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=course.service.d.ts.map