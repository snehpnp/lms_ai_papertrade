/** Available courses for a user: published + (no referral filter means all; if user has referredBy then only that subadmin's courses + global/unassigned). */
export declare function getAvailableCourses(userId: string): Promise<{
    id: string;
    description: string | null;
    price: import("@prisma/client/runtime/library").Decimal;
    title: string;
    slug: string;
    thumbnail: string | null;
}[]>;
export declare function enrollCourse(userId: string, courseId: string): Promise<{
    course: {
        id: string;
        title: string;
    };
} & {
    userId: string;
    id: string;
    courseId: string;
    enrolledAt: Date;
    completedAt: Date | null;
}>;
export declare function getLessons(userId: string, courseId: string): Promise<{
    courseId: string;
    modules: ({
        lessons: {
            order: number;
            type: import(".prisma/client").$Enums.LessonType;
            id: string;
            title: string;
            videoUrl: string | null;
            pdfUrl: string | null;
            duration: number | null;
        }[];
    } & {
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
    })[];
}>;
export declare function submitExercise(userId: string, exerciseId: string, enrollmentId: string, response: unknown): Promise<{
    submission: {
        userId: string;
        id: string;
        enrollmentId: string;
        exerciseId: string;
        response: import("@prisma/client/runtime/library").JsonValue;
        isCorrect: boolean;
        score: import("@prisma/client/runtime/library").Decimal;
        submittedAt: Date;
    };
    isCorrect: boolean;
    score: number;
}>;
export declare function recordProgress(userId: string, lessonId: string, enrollmentId: string, timeSpent: number): Promise<{
    id: string;
    completedAt: Date;
    enrollmentId: string;
    lessonId: string;
    timeSpent: number;
}>;
export declare function getMyEnrollments(userId: string): Promise<({
    course: {
        id: string;
        title: string;
        slug: string;
    };
    progress: ({
        lesson: {
            id: string;
            title: string;
        };
    } & {
        id: string;
        completedAt: Date;
        enrollmentId: string;
        lessonId: string;
        timeSpent: number;
    })[];
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
})[]>;
export declare function getCertificate(userId: string, enrollmentId: string): Promise<{
    userId: string;
    id: string;
    pdfUrl: string | null;
    enrollmentId: string;
    issuedAt: Date;
}>;
//# sourceMappingURL=userCourse.service.d.ts.map