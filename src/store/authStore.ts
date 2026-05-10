/**
 * @store authStore
 * @description Global authentication state managed by Zustand.
 *              Firebase Auth is the source of truth — this store mirrors it.
 *
 * @state
 *   - user: AuthUser | null        — Null means logged out
 *   - session: string | null       — Firebase session token
 *   - isAuthenticated: boolean     — Derived from user
 *   - isLoading: boolean           — True until Firebase finishes initializing
 *                                    (prevents flashing login screen on app start)
 *
 * @actions
 *   - setUser(user)     — Called by Firebase onAuthStateChanged listener
 *   - setSession(s)     — Stores session token
 *   - clearAuth()       — Called on logout
 *   - setLoading(bool)  — Controls loading state
 */

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
