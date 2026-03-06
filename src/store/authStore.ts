import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type User } from 'firebase/auth';

import { logout as authLogout } from '../services/authService';

type AuthState = {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  hydrateAuth: (params: { user: User; role: string | null }) => void;
  resetAuth: () => void;
};

const secureStoreStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
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
      role: null,
      isAuthenticated: false,
      loading: false,
      setUser: (user) => {
        set({ user, isAuthenticated: Boolean(user) });
      },
      setRole: (role) => {
        set({ role });
      },
      setLoading: (loading) => {
        set({ loading });
      },
      hydrateAuth: ({ user, role }) => {
        set({ user, role, isAuthenticated: true, loading: false });
      },
      resetAuth: () => {
        set({ user: null, role: null, isAuthenticated: false, loading: false });
      },
      logout: async () => {
        await authLogout();
        set({ user: null, role: null, isAuthenticated: false, loading: false });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => secureStoreStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    },
  ),
);
