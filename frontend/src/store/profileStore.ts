import { create } from 'zustand';
import axiosInstance from '@/lib/axios';

interface ProfileState {
  userProfile: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
    isLearningMode?: boolean;
    isPaperTradeDefault?: boolean;
    brokerRedirectUrl?: string;
    referralCode?: string;
    referredBy?: {
      brokerRedirectUrl?: string;
    } | null;
  } | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfileState: (data: Partial<ProfileState['userProfile']>) => void;
  toggleMode: () => Promise<void>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  userProfile: null,
  isLoading: false,

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const response: any = await axiosInstance.get('/my/profile');

      if (response.data) {
        set({ userProfile: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfileState: (data) => {
    set((state) => ({
      userProfile: state.userProfile ? { ...state.userProfile, ...data } : data
    }));
  },

  toggleMode: async () => {
    try {
      set({ isLoading: true });
      const response: any = await axiosInstance.patch('/my/profile/toggle-mode');

      if (response?.success) {
        set({ userProfile: response.data });

      }
    } catch (error) {
      console.error("Failed to toggle mode", error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
