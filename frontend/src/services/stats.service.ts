import axiosInstance from "@/lib/axios";

export const statsService = {
    async getDashboardStats() {
        const { data } = await axiosInstance.get("/stats/dashboard");
        return data;
    },

    async getRevenueChart(days = 7) {
        const { data } = await axiosInstance.get(`/stats/charts/revenue?days=${days}`);
        return data;
    },

    async getEnrollmentChart(days = 7) {
        const { data } = await axiosInstance.get(`/stats/charts/enrollments?days=${days}`);
        return data;
    },

    async getRecentActivities(limit = 5) {
        const { data } = await axiosInstance.get(`/stats/recent-activities?limit=${limit}`);
        return data;
    }
};

export default statsService;
