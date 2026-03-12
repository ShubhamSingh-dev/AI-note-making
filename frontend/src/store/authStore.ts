import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/schemas/auth.schema';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setAuth:   (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:            null,
      isAuthenticated: false,
      setAuth:   (user) => set({ user, isAuthenticated: true }),
      clearAuth: ()     => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);