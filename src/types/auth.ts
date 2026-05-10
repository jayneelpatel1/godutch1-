/**
 * @file Auth type definitions.
 * @description Types for Firebase authentication — AuthUser mirrors the Firebase user
 *              object with only the fields we need. AuthState defines the Zustand store shape.
 */

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: string | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}
