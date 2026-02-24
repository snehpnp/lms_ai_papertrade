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
  subadmin?: { name: string };
  _count: { modules: number; enrollments: number };
}

export interface Enrollment {
  id: string;
  courseId: string;
  course: { id: string; title: string; slug: string };
  progress: { id: string; lessonId: string; lesson: { id: string; title: string } }[];
}

export interface LessonItem {
  id: string;
  title: string;
  duration: number | null;
  order: number;
  videoUrl: string | null;
  pdfUrl: string | null;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: LessonItem[];
}

/* ─────────────────────────────────────────────
   Service
───────────────────────────────────────────── */

const userCourseService = {
  /** List courses available to this user (filtered by their subadmin/referrer) */
  async getCourses(): Promise<UserCourse[]> {
    const { data } = await axiosInstance.get("/my/courses");
    console.log("data",data)
    return data;
  },

  /** Enroll in a free course (or after payment for paid course) */
  async enroll(courseId: string): Promise<Enrollment> {
    const { data } = await axiosInstance.post(`/my/enroll/${courseId}`);
    return data.data;
  },

  /** Get all modules + lessons for an enrolled course */
  async getLessons(courseId: string): Promise<{ courseId: string; modules: CourseModule[] }> {
    const { data } = await axiosInstance.get(`/my/courses/${courseId}/lessons`);
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
    return data.data;
  },
};

export default userCourseService;
