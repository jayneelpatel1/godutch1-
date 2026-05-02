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
