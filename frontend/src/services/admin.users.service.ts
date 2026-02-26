import axiosInstance from "@/lib/axios";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  referrerName?: string;
  role: "ADMIN" | "SUBADMIN" | "USER";
  isBlocked: boolean;
  isPaperTradeDefault: boolean;
  isLearningMode: boolean;
  brokerRedirectUrl?: string;
  referralCode: string;
  createdAt: string;
}

export const adminUsersService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    const { data } = await axiosInstance.get("/users", { params });
    return data;
  },

  async getById(id: string): Promise<AdminUser> {
    const { data } = await axiosInstance.get(`/users/${id}`);
    return data;
  },

  async create(payload: {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
    role: "USER" | "SUBADMIN" | "ADMIN";
    isPaperTradeDefault?: boolean;
    isLearningMode?: boolean;
    brokerRedirectUrl?: string;
  }) {
    const { data } = await axiosInstance.post("/users", payload);
    return data;
  },
  async update(id: string, payload: Partial<AdminUser>) {
    const { data } = await axiosInstance.patch(`/users/${id}`, payload);
    return data;
  },

  async delete(id: string) {
    const { data } = await axiosInstance.delete(`/users/${id}`);
    return data;
  },

  async block(id: string) {
    return axiosInstance.post(`/users/${id}/block`);
  },

  async unblock(id: string) {
    return axiosInstance.post(`/users/${id}/unblock`);
  },
};