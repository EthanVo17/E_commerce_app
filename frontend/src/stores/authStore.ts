import { create } from "zustand";
import type { AuthUser } from "@/types/auth";
import { refreshSession, logoutApi } from "@/api/authApi";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  setAuth: (user: AuthUser, accessToken: string) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

let initPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isInitializing: false }),

  logout: async () => {
    try {
      await logoutApi();
    } catch {}
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },

  initializeAuth: async () => {
    if (get().isAuthenticated) {
      set({ isInitializing: false });
      return;
    }

    if (initPromise) {
      return initPromise;
    }

    initPromise = (async () => {
      try {
        const { user, accessToken } = await refreshSession();
        if (accessToken && user) {
          set({ user, accessToken, isAuthenticated: true });
        } else {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      } catch {
        set({ user: null, accessToken: null, isAuthenticated: false });
      } finally {
        set({ isInitializing: false });
        initPromise = null;
      }
    })();

    return initPromise;
  },
}));
