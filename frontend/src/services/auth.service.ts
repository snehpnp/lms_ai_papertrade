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
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
    const Response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      { email, password }
    );
    const data = Response?.data;
   

    if (!data.accessToken || !data.refreshToken) {
      throw new Error("Invalid login response: missing tokens");
    }

    // Save tokens
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("expiresIn", String(data?.expiresIn || 3600)); // Default to 1 hour if not provided


    return data;
  } catch (error: any) {
     throw error?.response?.data?.message || "Invalid credentials";
  }
  },

  async register(payload: {
    phoneNumber: string;
    email: string;
    password: string;
    name: string;
    referralCode?: string;
  }) {
    const { data } = await axiosInstance.post("/auth/register", payload);
    return data;
  },


  // async verifyOtp(url: string, payload: { phoneNumber: string; otp: string }) {
  //   const { data } = await axiosInstance.post(url, payload);
  //   return data;
  // },

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

export default authService;