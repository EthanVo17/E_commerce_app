import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

/**
 * ProtectedRoute – bọc các trang yêu cầu đăng nhập (/profile, /settings, /orders,...).
 * Người dùng chưa đăng nhập sẽ bị đẩy sang /signin kèm `from` lưu trong location.state
 * để sau khi đăng nhập thành công có thể quay lại đúng trang đích.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const location = useLocation();

  // Khi đang khởi tạo phiên, không render gì để tránh flickering
  if (isInitializing) return null;

  if (!isAuthenticated) {
    const fullPath = location.pathname + location.search;
    return <Navigate to="/signin" state={{ from: fullPath }} replace />;
  }

  return <Outlet />;
}
