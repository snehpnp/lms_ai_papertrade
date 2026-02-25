import axiosInstance from "@/lib/axios";

export const publicService = {
    async getCourses(params?: { page?: number; limit?: number }) {
        const { data } = await axiosInstance.get("/courses/public/list", { params });
        return data;
    },
};
