import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

/**
 * GuestRoute – bọc các trang dành cho khách vãng lai (/signin, /signup, /login).
 * Nếu isAuthenticated === true, tự động chuyển hướng về trang trước đó (from / callbackUrl)
 * hoặc về Trang chủ (/).
 */
export default function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const location = useLocation();

  // Khi đang kiểm tra phiên (isInitializing), không render gì để tránh flickering
  if (isInitializing) return null;

  if (isAuthenticated) {
    const searchParams = new URLSearchParams(location.search);
    const callbackUrl =
      searchParams.get("callbackUrl") || searchParams.get("from");
    const stateFrom = (location.state as { from?: string } | null)?.from;
    const redirectTarget = stateFrom || callbackUrl;
    const destination =
      redirectTarget &&
      redirectTarget.startsWith("/") &&
      !redirectTarget.startsWith("//")
        ? redirectTarget
        : "/";
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
