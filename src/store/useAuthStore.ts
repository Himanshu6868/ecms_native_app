import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthUserProfile, UserRole } from '../services/auth/authService';

type AuthState = {
  user: string | null;
  name: string | null;
  email: string | null;
  role: UserRole | null;
  area: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (profile: AuthUserProfile) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      name: null,
      email: null,
      role: null,
      area: null,
      isAuthenticated: false,
      loading: false,
      setUser: (profile) =>
        set({
          user: profile.user,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          area: profile.area,
          isAuthenticated: true,
          loading: false,
        }),
      setLoading: (loading) => set({ loading }),
      logout: () =>
        set({
          user: null,
          name: null,
          email: null,
          role: null,
          area: null,
          isAuthenticated: false,
          loading: false,
        }),
    }),
    {
      name: 'auth-session-store',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        name: state.name,
        email: state.email,
        role: state.role,
        area: state.area,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
