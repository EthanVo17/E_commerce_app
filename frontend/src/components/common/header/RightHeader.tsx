"use strict";

import { Link } from "react-router-dom";
import LanguageSelector from "@/components/ui/dropdown/LanguageSelector";
import UserAvatarDropdown from "@/components/ui/dropdown/UserAvatarDropdown";
import { useAuthStore } from "@/stores/authStore";

export default function RightHeader() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  return (
    <div
      id="right-header"
      className="ml-auto flex items-center justify-end gap-3 sm:gap-4"
    >
      {/* 1. Khi đang kiểm tra phiên: Hiển thị Skeleton Circle */}
      {isInitializing ? (
        <div
          data-testid="header-auth-skeleton"
          className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200"
          aria-label="Đang kiểm tra phiên đăng nhập..."
        />
      ) : isAuthenticated && user ? (
        /* 2. Khi đã đăng nhập: Hiển thị Avatar + Dropdown */
        <UserAvatarDropdown user={user} />
      ) : (
        /* 3. Khi chưa đăng nhập: Hiển thị 2 nút Đăng nhập (ghost) và Đăng ký (nổi bật) */
        <div data-testid="guest-auth-buttons" className="flex items-center gap-2 sm:gap-3">
          <Link to="/signin">
            <button
              type="button"
              className="h-[36px] min-w-[96px] cursor-pointer rounded-full border border-slate-300 bg-transparent px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              Đăng nhập
            </button>
          </Link>
          <Link to="/signup">
            <button
              type="button"
              className="h-[36px] min-w-[96px] cursor-pointer rounded-full border border-transparent bg-orange-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              Đăng ký
            </button>
          </Link>
        </div>
      )}

      <LanguageSelector />
    </div>
  );
}
