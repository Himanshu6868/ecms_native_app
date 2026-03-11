import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthUserProfile, UserRole } from '../services/auth/authService';

type AuthState = {
  userId: string | null;
  authUserId: string | null;
  name: string | null;
  email: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  setAuthState: (profile: AuthUserProfile) => void;
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
      userId: null,
      authUserId: null,
      name: null,
      email: null,
      role: null,
      isAuthenticated: false,
      loading: false,
      setAuthState: (profile) =>
        set({
          userId: profile.userId,
          authUserId: profile.authUserId,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          isAuthenticated: true,
          loading: false,
        }),
      setLoading: (loading) => set({ loading }),
      logout: () =>
        set({
          userId: null,
          authUserId: null,
          name: null,
          email: null,
          role: null,
          isAuthenticated: false,
          loading: false,
        }),
    }),
    {
      name: 'auth-session-store',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        userId: state.userId,
        authUserId: state.authUserId,
        name: state.name,
        email: state.email,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
