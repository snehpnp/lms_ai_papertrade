import axiosInstance from "@/lib/axios";

export interface SystemSetting {
  id: string;
  key: string;
  value: string | null;
  description?: string;
}

export const adminSettingsService = {
  async getAll() {
    const { data } = await axiosInstance.get("/settings");
    return data.data as SystemSetting[];
  },

  async updateBulk(settings: { key: string; value: string | null; description?: string }[]) {
    return axiosInstance.post("/settings/bulk", settings);
  },
};
