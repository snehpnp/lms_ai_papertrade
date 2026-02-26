import axiosInstance from "@/lib/axios";

export interface UpdateProfilePayload {
    name?: string;
    email?: string;
    avatar?: string;
    brokerRedirectUrl?: string;
}

export const profileService = {
    async getProfile() {
        const { data } = await axiosInstance.get("/my/profile");
        return data;
    },

    async updateProfile(payload: UpdateProfilePayload) {
        const { data } = await axiosInstance.patch("/my/profile", payload);
        return data;
    },

    async updatePassword(payload: any) {
        const { data } = await axiosInstance.patch("/my/profile/password", payload);
        return data;
    },

    async toggleMode() {
        const { data } = await axiosInstance.patch("/my/profile/toggle-mode");
        return data;
    }
};
