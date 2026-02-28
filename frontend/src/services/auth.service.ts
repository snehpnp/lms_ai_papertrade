// src/services/auth.service.ts

import axiosInstance from "@/lib/axios";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number; // Optional, in seconds
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

const authService = {
  async getConfig(): Promise<{ googleClientId: string }> {
    const { data } = await axiosInstance.get("/auth/config");
    return data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const Response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      { email, password }
    );
    const data = Response?.data;

    this.saveTokens(data);
    return data;
  },

  async googleLogin(credential: string): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/google",
      { credential }
    );
    const data = response?.data;
    this.saveTokens(data);
    return data;
  },

  saveTokens(data: LoginResponse) {
    if (!data.accessToken || !data.refreshToken) {
      throw new Error("Invalid login response: missing tokens");
    }
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("expiresIn", String(data?.expiresIn || 3600));
  },

  async register(payload: {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
    referralCode?: string;
  }) {
    const { data } = await axiosInstance.post("/auth/register", payload);
    return data;
  },

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

export default authService;