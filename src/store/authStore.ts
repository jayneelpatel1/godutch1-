import { create } from 'zustand';

import type { AuthState, AuthUser } from '@/types/auth';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user: AuthUser | null) =>
    set({ user, isAuthenticated: !!user }),
  setSession: (session: string | null) =>
    set({ session }),
  clearAuth: () =>
    set({ user: null, session: null, isAuthenticated: false }),
  setLoading: (isLoading: boolean) =>
    set({ isLoading }),
}));
