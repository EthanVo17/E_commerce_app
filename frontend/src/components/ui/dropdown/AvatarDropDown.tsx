"use strict";

import { useEffect } from "react";
import { Link } from "react-router-dom";
import type { AvatarDropDownProps } from "@/types/AvatarDropDown.type";

/**
 * Extracts up to 2 initials from a full name.
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

export default function AvatarDropDown({
  user,
  isOpen,
  onClose,
  items = [],
}: AvatarDropDownProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="menu"
      aria-label="User menu"
      className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 text-gray-900 shadow-lg"
    >
      {/* User summary */}
      <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white"
          >
            {getInitials(user.fullName)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.fullName}</p>
          {user.email ? (
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          ) : user.phoneNumber ? (
            <p className="truncate text-xs text-gray-500">
              {user.phoneNumber}
            </p>
          ) : null}
        </div>
      </div>

      {/* Menu items */}
      {items.length > 0 && (
        <ul className="mt-2 border-t border-gray-100 pt-2">
          {items.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link
                  role="menuitem"
                  to={item.href}
                  onClick={onClose}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 ${item.destructive ? "text-red-600" : "text-gray-700"}`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    item.onClick?.();
                    onClose?.();
                  }}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 ${item.destructive ? "text-red-600" : "text-gray-700"}`}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
