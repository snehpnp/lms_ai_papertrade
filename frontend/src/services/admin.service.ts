import axiosInstance from "@/lib/axios";

/* =========================================================
   COMMON TYPES
========================================================= */

export type UserRole = "ADMIN" | "SUBADMIN" | "USER";

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

/* =========================================================
   COURSES
========================================================= */

export interface CoursePayload {
  title: string;
  description: string;
  slug: string;
  price: number;
  thumbnail?: string;
}

export const adminCoursesService = {
  async getAll(params?: PaginationParams) {
    const { data } = await axiosInstance.get("/courses", { params });
    return data;
  },

  async getById(courseId: string) {
    const { data } = await axiosInstance.get(`/courses/${courseId}`);
    return data;
  },

  async create(payload: CoursePayload) {
    const { data } = await axiosInstance.post("/courses", payload);
    return data;
  },

  async update(courseId: string, payload: Partial<CoursePayload>) {
    const { data } = await axiosInstance.patch(`/courses/${courseId}`, payload);
    return data;
  },

  async delete(courseId: string) {
    return axiosInstance.delete(`/courses/${courseId}`);
  },

  async publish(courseId: string) {
    return axiosInstance.post(`/courses/${courseId}/publish`);
  },

  async unpublish(courseId: string) {
    return axiosInstance.post(`/courses/${courseId}/unpublish`);
  },

  async assignSubadmin(courseId: string, subadminId: string) {
    return axiosInstance.post(`/courses/${courseId}/assign-subadmin`, {
      subadminId,
    });
  },

  async analytics(courseId: string) {
    return axiosInstance.get(`/courses/${courseId}/analytics`);
  },

  async enrolledUsers(courseId: string) {
    return axiosInstance.get(`/courses/${courseId}/enrolled-users`);
  },
};

/* =========================================================
   MODULES & LESSONS
========================================================= */

export const adminCourseContentService = {
  async createModule(
    courseId: string,
    payload: { title: string; order: number },
  ) {
    return axiosInstance.post(`/courses/${courseId}/modules`, payload);
  },

  async createLesson(
    moduleId: string,
    payload: {
      title: string;
      order: number;
      content: string;
      videoUrl: string;
      duration: number;
      pdfUrl?: string | null;
      description?: string | null;
      thumbnail?: string | null;
    },
  ) {

    return axiosInstance.post(`/courses/modules/${moduleId}/lessons`, payload);
  },

  async updateLesson(
    lessonId: string,
    payload: Partial<{
      title: string;
      videoUrl?: string | null;
      content?: string | null;
      order: number;
      duration?: number | null;
      pdfUrl?: string | null;
      description?: string | null;
      thumbnail?: string | null;
      moduleId?: string;
    }>,
  ) {
    return axiosInstance.patch(`/courses/lessons/${lessonId}`, payload);
  },

  async deleteLesson(lessonId: string) {
    return axiosInstance.delete(`/courses/lessons/${lessonId}`);
  },

  async addExercise(
    lessonId: string,
    payload: {
      type: "MCQ" | "FILL_IN_BLANKS";
      question: string;
      options?: {
        id: string;
        text: string;
        isCorrect: boolean;
      }[];
    },
  ) {
    return axiosInstance.post(
      `/courses/lessons/${lessonId}/exercises`,
      payload,
    );
  },

  async updateExercise(
    exerciseId: string,
    payload: {
      type?: "MCQ" | "FILL_IN_BLANKS";
      question?: string;
      options?: {
        id: string;
        text: string;
        isCorrect: boolean;
      }[];
    },
  ) {
    return axiosInstance.patch(`/courses/exercises/${exerciseId}`, payload);
  },

  async deleteExercise(exerciseId: string) {
    return axiosInstance.delete(`/courses/exercises/${exerciseId}`);
  },

  async getLessons(params?: PaginationParams) {
    const { data } = await axiosInstance.get("/courses/list/lessons", {
      params,
    });
    return data;
  },

  async getLessonOptions() {
    const { data } = await axiosInstance.get("/courses/list/lesson-options");
    return data;
  },

  async getOneLesson(lessonId: string) {
    const { data } = await axiosInstance.get(`/courses/lessons/${lessonId}`);
    return data;
  },

  async getExercises(params?: PaginationParams) {
    const { data } = await axiosInstance.get("/courses/list/exercises", {
      params,
    });
    return data;
  },

  async getOneExercise(exerciseId: string) {
    const { data } = await axiosInstance.get(`/courses/exercises/${exerciseId}`);
    return data;
  },
  async coursewithmodule() {
    const { data } = await axiosInstance.get(`/courses/with/modules`);
    return data;
  }
};

/* =========================================================
   WALLET
========================================================= */

export const adminWalletService = {
  async credit(userId: string, amount: number, description: string) {
    return axiosInstance.post(`/wallet/${userId}/credit`, {
      amount,
      description,
    });
  },

  async debit(userId: string, amount: number, description: string) {
    return axiosInstance.post(`/wallet/${userId}/debit`, {
      amount,
      description,
    });
  },

  async transactions(userId: string) {
    return axiosInstance.get(`/wallet/admin/transactions?userId=${userId}`);
  },
};

/* =========================================================
   TRADING
========================================================= */

export const adminTradingService = {
  async allTrades(params?: PaginationParams) {
    return axiosInstance.get("/trades/admin/trades", { params });
  },

  async allPositions() {
    return axiosInstance.get("/trades/admin/positions");
  },

  async leaderboard(sortBy = "net_profit_pct", limit = 20) {
    return axiosInstance.get(
      `/trades/admin/leaderboard?sortBy=${sortBy}&limit=${limit}`,
    );
  },
};

/* =========================================================
   CONFIG (Market / Brokerage)
========================================================= */

export const adminConfigService = {
  async listMarket() {
    return axiosInstance.get("/config/market");
  },

  async createMarket(payload: {
    symbol: string;
    name: string;
    lotSize: number;
    tickSize: number;
  }) {
    return axiosInstance.post("/config/market", payload);
  },

  async listBrokerage() {
    return axiosInstance.get("/config/brokerage");
  },

  async createBrokerage(payload: {
    type: "PERCENTAGE" | "FLAT";
    value: number;
    minCharge: number;
    isDefault: boolean;
  }) {
    return axiosInstance.post("/config/brokerage", payload);
  },
};

/* =========================================================
   REPORTS
========================================================= */

export const adminReportsService = {
  async trade(userId: string) {
    return axiosInstance.get(`/reports/trade/${userId}`);
  },

  async wallet(userId: string) {
    return axiosInstance.get(`/reports/wallet/${userId}`);
  },

  async courseProgress(userId: string) {
    return axiosInstance.get(`/reports/course-progress/${userId}`);
  },

  async activity(userId: string) {
    return axiosInstance.get(`/reports/activity/${userId}`);
  },
  async fullReport(userId: string) {
    return axiosInstance.get(`/reports/full/${userId}`);
  },
};

/* =========================================================
   SYMBOLS (ADMIN)
========================================================= */

export const adminSymbolsService = {
  async search(params: {
    q?: string;
    exchange?: string;
    instrument?: string;
    page?: number;
    limit?: number;
  }) {
    return axiosInstance.get("/symbols", { params });
  },

  async ingest() {
    return axiosInstance.post("/symbols/ingest");
  },

  async truncate() {
    return axiosInstance.delete("/symbols/truncate");
  },
};
