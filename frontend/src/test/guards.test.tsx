import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import GuestRoute from "@/components/common/guards/GuestRoute";
import ProtectedRoute from "@/components/common/guards/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import type { AuthUser } from "@/types/auth";

const mockUser: AuthUser = {
  id: "1",
  fullName: "Võ Tấn Đạt",
  email: "dat@example.com",
  phoneNumber: "0901234567",
  avatarUrl: null,
  role: "user",
};

describe("Route Guards", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  });

  describe("GuestRoute", () => {
    it("renders nothing while isInitializing is true (anti-flicker)", () => {
      useAuthStore.setState({ isInitializing: true });

      const { container } = render(
        <MemoryRouter initialEntries={["/signin"]}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/signin" element={<div>Sign In Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("renders guest page when user is not authenticated", () => {
      render(
        <MemoryRouter initialEntries={["/signin"]}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/signin" element={<div>Sign In Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Sign In Content")).toBeInTheDocument();
    });

    it("redirects authenticated user to '/' by default", () => {
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });

      render(
        <MemoryRouter initialEntries={["/signin"]}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/signin" element={<div>Sign In Content</div>} />
            </Route>
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText("Sign In Content")).not.toBeInTheDocument();
      expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("redirects authenticated user to 'from' state destination", () => {
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });

      render(
        <MemoryRouter initialEntries={[{ pathname: "/signin", state: { from: "/orders" } }]}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/signin" element={<div>Sign In Content</div>} />
            </Route>
            <Route path="/orders" element={<div>Orders Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Orders Page")).toBeInTheDocument();
    });

    it("redirects authenticated user to callbackUrl query parameter", () => {
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });

      render(
        <MemoryRouter initialEntries={["/signin?callbackUrl=/profile"]}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/signin" element={<div>Sign In Content</div>} />
            </Route>
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Profile Page")).toBeInTheDocument();
    });
  });

  describe("ProtectedRoute", () => {
    it("renders nothing while isInitializing is true", () => {
      useAuthStore.setState({ isInitializing: true });

      const { container } = render(
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<div>Profile Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("redirects unauthenticated user to /signin with original location in state", () => {
      render(
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<div>Profile Content</div>} />
            </Route>
            <Route path="/signin" element={<div>Sign In Page Redirected</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText("Profile Content")).not.toBeInTheDocument();
      expect(screen.getByText("Sign In Page Redirected")).toBeInTheDocument();
    });

    it("renders protected content when user is authenticated", () => {
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });

      render(
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<div>Profile Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Profile Content")).toBeInTheDocument();
    });
  });
});
