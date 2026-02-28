import axiosInstance from "@/lib/axios";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

export interface UserCourse {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail: string | null;
  price: string;
  isEnrolled: boolean;
  enrollmentId: string | null;
  progressPct: number;
  totalLessons: number;
  averageRating: number;
  totalReviews: number;
  subadmin?: { name: string };
  _count: { modules: number; enrollments: number; lessons: number };
}

export interface Enrollment {
  id: string;
  courseId: string;
  course: { id: string; title: string; slug: string };
  progress: { id: string; lessonId: string; lesson: { id: string; title: string } }[];
}

export interface ExerciseOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ExerciseItem {
  id: string;
  type: 'MCQ' | 'FILL_IN_BLANKS';
  question: string;
  options: ExerciseOption[] | null;
  order: number;
}

export interface LessonItem {
  id: string;
  title: string;
  content: string | null;
  duration: number | null;
  order: number;
  videoUrl: string | null;
  pdfUrl: string | null;
  thumbnail: string | null;
  exercises?: ExerciseItem[];
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: LessonItem[];
}

export interface ExerciseHistoryItem {
  id: string;
  isCorrect: boolean;
  score: number;
  submittedAt: string;
  question: string;
  type: string;
  lessonTitle: string;
  courseTitle: string;
  response: any;
}

export interface CourseReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  }
}

export interface CourseReviewsResponse {
  reviews: CourseReview[];
  averageRating: number;
  totalReviews: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

/* ─────────────────────────────────────────────
   Service
───────────────────────────────────────────── */

const userCourseService = {
  /** List courses available to this user (filtered by their subadmin/referrer) */
  async getCourses(): Promise<UserCourse[]> {
    const { data } = await axiosInstance.get("/my/courses");
    return data;
  },

  /** Enroll in a free course (or after payment for paid course) */
  async enroll(courseId: string): Promise<Enrollment> {
    const { data } = await axiosInstance.post(`/my/enroll/${courseId}`);
    return data;
  },

  /** Get all modules + lessons for an enrolled course */
  async getLessons(courseId: string): Promise<{ courseId: string; modules: CourseModule[]; isEnrolled: boolean }> {
    const { data } = await axiosInstance.get(`/my/courses/${courseId}/lessons`);
    return data;
  },

  /** Get courses with modules */
  async getCoursesWithModules(): Promise<any[]> {
    const { data } = await axiosInstance.get("/courses/with/modules");
    return data;
  },

  /** Get all of my enrollments */
  async getEnrollments(): Promise<Enrollment[]> {
    const { data } = await axiosInstance.get("/my/enrollments");
    return data;
  },

  /** Record lesson progress */
  async recordProgress(lessonId: string, enrollmentId: string, timeSpent: number) {
    const { data } = await axiosInstance.post("/my/progress", { lessonId, enrollmentId, timeSpent });
    return data;
  },

  async submitExercise(exerciseId: string, enrollmentId: string, response: unknown) {
    const { data } = await axiosInstance.post(`/my/exercises/${exerciseId}/submit`, {
      enrollmentId,
      response,
    });
    return data as { submission: unknown; isCorrect: boolean; score: number };
  },

  /** Get exercise history */
  async getExerciseHistory(): Promise<ExerciseHistoryItem[]> {
    const { data } = await axiosInstance.get("/my/exercises/history");
    return data;
  },

  /** Get course reviews */
  async getCourseReviews(courseId: string): Promise<CourseReviewsResponse> {
    const { data } = await axiosInstance.get(`/my/courses/${courseId}/reviews`);
    return data;
  },

  /** Submit course review */
  async submitCourseReview(courseId: string, rating: number, comment?: string): Promise<CourseReview> {
    const { data } = await axiosInstance.post(`/my/courses/${courseId}/reviews`, { rating, comment });
    return data;
  },

  /** Get course chat history */
  async getCourseChat(courseId: string): Promise<ChatMessage[]> {
    const { data } = await axiosInstance.get(`/my/courses/${courseId}/chat`);
    return data.data;
  },

  /** Send message to course AI */
  async sendCourseMessage(courseId: string, message: string): Promise<ChatMessage> {
    const { data } = await axiosInstance.post(`/my/courses/${courseId}/chat`, { message });
    return data.data;
  },
};

export default userCourseService;
