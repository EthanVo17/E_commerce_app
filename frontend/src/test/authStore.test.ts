import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import * as authApi from "@/api/authApi";
import type { AuthUser } from "@/types/auth";

vi.mock("@/api/authApi", () => ({
  refreshSession: vi.fn(),
  logoutApi: vi.fn(),
  signIn: vi.fn(),
}));

const mockUser: AuthUser = {
  id: "user-123",
  fullName: "Võ Tấn Đạt",
  email: "dat@example.com",
  phoneNumber: "0912345678",
  avatarUrl: null,
  role: "user",
};

describe("useAuthStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: true,
    });
  });

  it("should have correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(true);
  });

  it("should update state on setAuth", () => {
    useAuthStore.getState().setAuth(mockUser, "token-abc");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe("token-abc");
    expect(state.isAuthenticated).toBe(true);
  });

  it("should clear state and call logoutApi on logout", async () => {
    useAuthStore.getState().setAuth(mockUser, "token-abc");
    vi.mocked(authApi.logoutApi).mockResolvedValueOnce();

    await useAuthStore.getState().logout();

    expect(authApi.logoutApi).toHaveBeenCalledTimes(1);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should clear state even if logoutApi throws an error", async () => {
    useAuthStore.getState().setAuth(mockUser, "token-abc");
    vi.mocked(authApi.logoutApi).mockRejectedValueOnce(new Error("Network error"));

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should successfully restore session on initializeAuth", async () => {
    vi.mocked(authApi.refreshSession).mockResolvedValueOnce({
      message: "Session restored",
      user: mockUser,
      accessToken: "new-access-token",
    });

    await useAuthStore.getState().initializeAuth();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe("new-access-token");
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitializing).toBe(false);
  });

  it("should gracefully handle unauthenticated session on initializeAuth", async () => {
    vi.mocked(authApi.refreshSession).mockRejectedValueOnce(new Error("401 Unauthorized"));

    await useAuthStore.getState().initializeAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(false);
  });

  it("should skip refresh if already authenticated", async () => {
    useAuthStore.setState({
      user: mockUser,
      accessToken: "existing-token",
      isAuthenticated: true,
      isInitializing: true,
    });

    await useAuthStore.getState().initializeAuth();

    expect(authApi.refreshSession).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isInitializing).toBe(false);
  });
});
