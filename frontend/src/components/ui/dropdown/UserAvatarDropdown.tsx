"use strict";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/avatar/Avatar";
import { useAuthStore } from "@/stores/authStore";
import type { AuthUser } from "@/types/auth";

export interface UserAvatarDropdownProps {
  user?: AuthUser | null;
  onLogout?: () => Promise<void> | void;
}

/**
 * Extracts up to 2 initials from a full name.
 * e.g. "Võ Tấn Đạt" -> "VĐ"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

/**
 * Truncate a name for desktop inline display.
 */
export function shortenName(name: string, max = 16): string {
  if (!name) return "";
  return name.length <= max ? name : `${name.slice(0, max)}…`;
}

export default function UserAvatarDropdown({
  user: propUser,
  onLogout: propOnLogout,
}: UserAvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const storeUser = useAuthStore((s) => s.user);
  const storeLogout = useAuthStore((s) => s.logout);

  const currentUser = propUser ?? storeUser;

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!currentUser) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    if (propOnLogout) {
      await propOnLogout();
    } else {
      await storeLogout();
      navigate("/", { replace: true });
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      {/* Shortened full name on Desktop */}
      <span
        data-testid="user-display-name"
        className="hidden max-w-[150px] truncate text-sm font-medium text-slate-800 md:block"
        title={currentUser.fullName}
      >
        {shortenName(currentUser.fullName)}
      </span>

      {/* Avatar Button */}
      <Avatar
        src={currentUser.avatarUrl}
        fullName={currentUser.fullName}
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-900 shadow-xl"
        >
          {/* Account summary */}
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white"
              >
                {getInitials(currentUser.fullName)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p
                data-testid="dropdown-user-name"
                className="truncate text-sm font-semibold text-slate-900"
              >
                {currentUser.fullName}
              </p>
              <p
                data-testid="dropdown-user-contact"
                className="truncate text-xs text-slate-500"
              >
                {currentUser.email || currentUser.phoneNumber || ""}
              </p>
            </div>
          </div>

          {/* Navigation Links & Actions */}
          <ul className="mt-2 border-t border-slate-100 pt-2 text-sm">
            <li>
              <Link
                role="menuitem"
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center rounded-md px-3 py-2 text-slate-700 transition hover:bg-slate-100"
              >
                Hồ sơ cá nhân
              </Link>
            </li>
            <li>
              <Link
                role="menuitem"
                to="/settings"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center rounded-md px-3 py-2 text-slate-700 transition hover:bg-slate-100"
              >
                Cài đặt tài khoản
              </Link>
            </li>
            <li className="mt-1 border-t border-slate-100 pt-1">
              <button
                role="menuitem"
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center rounded-md px-3 py-2 text-left font-medium text-red-600 transition hover:bg-red-50"
              >
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
