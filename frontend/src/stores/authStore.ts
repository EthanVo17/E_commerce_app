import { create } from "zustand";
import type { AuthResponse, AuthUser } from "@/types/auth";

interface AuthState { user: AuthUser | null; accessToken: string | null; setSession: (session: AuthResponse) => void; clearSession: () => void }
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setSession: ({ user, accessToken }) => set({ user, accessToken }),
  clearSession: () => set({ user: null, accessToken: null }),
}));
