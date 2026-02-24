import { create } from 'zustand';
import axiosInstance from '@/lib/axios';

interface ProfileState {
  userProfile: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfileState: (data: Partial<ProfileState['userProfile']>) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  userProfile: null,
  isLoading: false,

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const response = await axiosInstance.get('/my/profile');
   
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
  }
}));
