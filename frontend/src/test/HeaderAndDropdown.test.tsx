import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RightHeader from "@/components/common/header/RightHeader";
import UserAvatarDropdown, { getInitials, shortenName } from "@/components/ui/dropdown/UserAvatarDropdown";
import { useAuthStore } from "@/stores/authStore";
import type { AuthUser } from "@/types/auth";

const mockUser: AuthUser = {
  id: "user-1",
  fullName: "Võ Tấn Đạt",
  email: "dat@example.com",
  phoneNumber: "0912345678",
  avatarUrl: null,
  role: "user",
};

describe("Header and UserAvatarDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  });

  describe("Helper functions", () => {
    it("extracts 2 initials correctly for Vietnamese full names", () => {
      expect(getInitials("Võ Tấn Đạt")).toBe("VĐ");
      expect(getInitials("Nguyễn Văn A")).toBe("NA");
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("Single")).toBe("S");
      expect(getInitials("")).toBe("");
    });

    it("shortens names properly for desktop UI", () => {
      expect(shortenName("Võ Tấn Đạt", 16)).toBe("Võ Tấn Đạt");
      expect(shortenName("Nguyễn Thị Thanh Hương", 10)).toBe("Nguyễn Thị…");
    });
  });

  describe("RightHeader state synchronization", () => {
    it("displays skeleton circle while isInitializing is true", () => {
      useAuthStore.setState({ isInitializing: true });

      render(
        <MemoryRouter>
          <RightHeader />
        </MemoryRouter>
      );

      expect(screen.getByTestId("header-auth-skeleton")).toBeInTheDocument();
      expect(screen.queryByTestId("guest-auth-buttons")).not.toBeInTheDocument();
    });

    it("displays Đăng nhập (ghost) and Đăng ký (prominent) buttons when unauthenticated", () => {
      useAuthStore.setState({ isAuthenticated: false, isInitializing: false });

      render(
        <MemoryRouter>
          <RightHeader />
        </MemoryRouter>
      );

      expect(screen.queryByTestId("header-auth-skeleton")).not.toBeInTheDocument();
      const loginBtn = screen.getByRole("button", { name: /đăng nhập/i });
      const signupBtn = screen.getByRole("button", { name: /đăng ký/i });

      expect(loginBtn).toBeInTheDocument();
      expect(signupBtn).toBeInTheDocument();
    });

    it("hides guest buttons and displays user avatar and name when authenticated", () => {
      useAuthStore.setState({
        isAuthenticated: true,
        user: mockUser,
        isInitializing: false,
      });

      render(
        <MemoryRouter>
          <RightHeader />
        </MemoryRouter>
      );

      // Guest buttons must be hidden
      expect(screen.queryByRole("button", { name: /đăng nhập/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /đăng ký/i })).not.toBeInTheDocument();

      // Avatar with initials 'VĐ'
      expect(screen.getByText("VĐ")).toBeInTheDocument();
      // Desktop shortened name
      expect(screen.getByTestId("user-display-name")).toHaveTextContent("Võ Tấn Đạt");
    });
  });

  describe("UserAvatarDropdown interactions", () => {
    it("opens menu when avatar button is clicked", () => {
      render(
        <MemoryRouter>
          <UserAvatarDropdown user={mockUser} />
        </MemoryRouter>
      );

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();

      const avatarButton = screen.getByRole("button", { name: /open user menu/i });
      fireEvent.click(avatarButton);

      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(screen.getByTestId("dropdown-user-name")).toHaveTextContent("Võ Tấn Đạt");
      expect(screen.getByTestId("dropdown-user-contact")).toHaveTextContent("dat@example.com");
      expect(screen.getByRole("menuitem", { name: /hồ sơ cá nhân/i })).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: /cài đặt tài khoản/i })).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: /đăng xuất/i })).toBeInTheDocument();
    });

    it("closes dropdown menu on Escape key press", () => {
      render(
        <MemoryRouter>
          <UserAvatarDropdown user={mockUser} />
        </MemoryRouter>
      );

      const avatarButton = screen.getByRole("button", { name: /open user menu/i });
      fireEvent.click(avatarButton);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes dropdown menu on outside click", () => {
      render(
        <MemoryRouter>
          <div>
            <span data-testid="outside">Outside area</span>
            <UserAvatarDropdown user={mockUser} />
          </div>
        </MemoryRouter>
      );

      const avatarButton = screen.getByRole("button", { name: /open user menu/i });
      fireEvent.click(avatarButton);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      fireEvent.pointerDown(screen.getByTestId("outside"));
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("calls onLogout callback when logout button is clicked", async () => {
      const handleLogout = vi.fn();
      render(
        <MemoryRouter>
          <UserAvatarDropdown user={mockUser} onLogout={handleLogout} />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole("button", { name: /open user menu/i }));
      const logoutButton = screen.getByRole("menuitem", { name: /đăng xuất/i });
      fireEvent.click(logoutButton);

      expect(handleLogout).toHaveBeenCalledTimes(1);
    });
  });
});
