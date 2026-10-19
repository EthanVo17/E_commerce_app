"use strict";

import type { AvatarDropDownProps } from "@/types/AvatarDropDown.type";

export default function AvatarDropDown({
  user,
  isOpen,
  onClose,
  items = [],
}: AvatarDropDownProps) {
  if (!isOpen) return null;

  return (
    <div
      role="menu"
      aria-label="User menu"
      className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 text-gray-900 shadow-lg">
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          {user.email && (
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <ul className="mt-2 border-t border-gray-100 pt-2">
          {items.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <a
                  role="menuitem"
                  href={item.href}
                  onClick={onClose}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 ${item.destructive ? "text-red-600" : "text-gray-700"}`}>
                  {item.label}
                </a>
              ) : (
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    item.onClick?.();
                    onClose?.();
                  }}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 ${item.destructive ? "text-red-600" : "text-gray-700"}`}>
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
