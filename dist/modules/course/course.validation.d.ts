import { z } from 'zod';
export declare const createCourseSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        slug: z.ZodString;
        thumbnail: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodNumber>;
        subadminId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        slug: string;
        description?: string | undefined;
        price?: number | undefined;
        thumbnail?: string | undefined;
        subadminId?: string | undefined;
    }, {
        title: string;
        slug: string;
        description?: string | undefined;
        price?: number | undefined;
        thumbnail?: string | undefined;
        subadminId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        slug: string;
        description?: string | undefined;
        price?: number | undefined;
        thumbnail?: string | undefined;
        subadminId?: string | undefined;
    };
}, {
    body: {
        title: string;
        slug: string;
        description?: string | undefined;
        price?: number | undefined;
        thumbnail?: string | undefined;
        subadminId?: string | undefined;
    };
}>;
export declare const updateCourseSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        thumbnail: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description?: string | undefined;
        price?: number | undefined;
        title?: string | undefined;
        slug?: string | undefined;
        thumbnail?: string | undefined;
    }, {
        description?: string | undefined;
        price?: number | undefined;
        title?: string | undefined;
        slug?: string | undefined;
        thumbnail?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        description?: string | undefined;
        price?: number | undefined;
        title?: string | undefined;
        slug?: string | undefined;
        thumbnail?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        description?: string | undefined;
        price?: number | undefined;
        title?: string | undefined;
        slug?: string | undefined;
        thumbnail?: string | undefined;
    };
}>;
export declare const courseIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const assignSubadminSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        subadminId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        subadminId: string;
    }, {
        subadminId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        subadminId: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        subadminId: string;
    };
}>;
export declare const listCoursesSchema: z.ZodObject<{
    query: z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
        page: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
        subadminId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        search?: string | undefined;
        subadminId?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }, {
        search?: string | undefined;
        subadminId?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        search?: string | undefined;
        subadminId?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    };
}, {
    query: {
        search?: string | undefined;
        subadminId?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    };
}>;
export declare const createModuleSchema: z.ZodObject<{
    params: z.ZodObject<{
        courseId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        courseId: string;
    }, {
        courseId: string;
    }>;
    body: z.ZodObject<{
        title: z.ZodString;
        order: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        order?: number | undefined;
    }, {
        title: string;
        order?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        courseId: string;
    };
    body: {
        title: string;
        order?: number | undefined;
    };
}, {
    params: {
        courseId: string;
    };
    body: {
        title: string;
        order?: number | undefined;
    };
}>;
export declare const createLessonSchema: z.ZodObject<{
    params: z.ZodObject<{
        moduleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        moduleId: string;
    }, {
        moduleId: string;
    }>;
    body: z.ZodObject<{
        title: z.ZodString;
        type: z.ZodNativeEnum<{
            VIDEO: "VIDEO";
            PDF: "PDF";
            TEXT: "TEXT";
            QUIZ: "QUIZ";
        }>;
        content: z.ZodOptional<z.ZodString>;
        videoUrl: z.ZodOptional<z.ZodString>;
        pdfUrl: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "VIDEO" | "PDF" | "TEXT" | "QUIZ";
        title: string;
        order?: number | undefined;
        content?: string | undefined;
        videoUrl?: string | undefined;
        pdfUrl?: string | undefined;
        duration?: number | undefined;
    }, {
        type: "VIDEO" | "PDF" | "TEXT" | "QUIZ";
        title: string;
        order?: number | undefined;
        content?: string | undefined;
        videoUrl?: string | undefined;
        pdfUrl?: string | undefined;
        duration?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        moduleId: string;
    };
    body: {
        type: "VIDEO" | "PDF" | "TEXT" | "QUIZ";
        title: string;
        order?: number | undefined;
        content?: string | undefined;
        videoUrl?: string | undefined;
        pdfUrl?: string | undefined;
        duration?: number | undefined;
    };
}, {
    params: {
        moduleId: string;
    };
    body: {
        type: "VIDEO" | "PDF" | "TEXT" | "QUIZ";
        title: string;
        order?: number | undefined;
        content?: string | undefined;
        videoUrl?: string | undefined;
        pdfUrl?: string | undefined;
        duration?: number | undefined;
    };
}>;
export declare const addExerciseSchema: z.ZodObject<{
    body: z.ZodObject<{
        type: z.ZodNativeEnum<{
            MCQ: "MCQ";
            FILL_IN_BLANKS: "FILL_IN_BLANKS";
        }>;
        question: z.ZodString;
        options: z.ZodOptional<z.ZodAny>;
        answer: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    }, {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    };
}, {
    body: {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    };
}>;
export declare const addExerciseToLessonSchema: z.ZodObject<{
    params: z.ZodObject<{
        lessonId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        lessonId: string;
    }, {
        lessonId: string;
    }>;
    body: z.ZodObject<{
        type: z.ZodNativeEnum<{
            MCQ: "MCQ";
            FILL_IN_BLANKS: "FILL_IN_BLANKS";
        }>;
        question: z.ZodString;
        options: z.ZodOptional<z.ZodAny>;
        answer: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    }, {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        lessonId: string;
    };
    body: {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    };
}, {
    params: {
        lessonId: string;
    };
    body: {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    };
}>;
export declare const addExerciseToCourseSchema: z.ZodObject<{
    params: z.ZodObject<{
        courseId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        courseId: string;
    }, {
        courseId: string;
    }>;
    body: z.ZodObject<{
        type: z.ZodNativeEnum<{
            MCQ: "MCQ";
            FILL_IN_BLANKS: "FILL_IN_BLANKS";
        }>;
        question: z.ZodString;
        options: z.ZodOptional<z.ZodAny>;
        answer: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    }, {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        courseId: string;
    };
    body: {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    };
}, {
    params: {
        courseId: string;
    };
    body: {
        type: "MCQ" | "FILL_IN_BLANKS";
        question: string;
        order?: number | undefined;
        options?: any;
        answer?: string | undefined;
    };
}>;
export declare const exerciseIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        exerciseId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        exerciseId: string;
    }, {
        exerciseId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        exerciseId: string;
    };
}, {
    params: {
        exerciseId: string;
    };
}>;
export declare const lessonIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        lessonId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        lessonId: string;
    }, {
        lessonId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        lessonId: string;
    };
}, {
    params: {
        lessonId: string;
    };
}>;
export declare const courseIdInPathSchema: z.ZodObject<{
    params: z.ZodObject<{
        courseId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        courseId: string;
    }, {
        courseId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        courseId: string;
    };
}, {
    params: {
        courseId: string;
    };
}>;
//# sourceMappingURL=course.validation.d.ts.map