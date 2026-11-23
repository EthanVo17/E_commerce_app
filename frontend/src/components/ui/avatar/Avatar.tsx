"use strict";

interface AvatarProps {
  src?: string | null;
  fullName?: string;
  alt?: string;
  isOpen?: boolean;
  onClick: () => void;
}

/**
 * Extracts up to 2 initials from a full name.
 * "Võ Tấn Đạt" → "VĐ", "John" → "J"
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

/**
 * Deterministic background colour based on name string.
 */
const AVATAR_COLORS = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-indigo-500",
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Avatar({
  src,
  fullName,
  alt = "User avatar",
  isOpen = false,
  onClick,
}: AvatarProps) {
  const hasImage = !!src;
  const initials = fullName ? getInitials(fullName) : "";
  const bgColor = fullName ? colorForName(fullName) : "bg-gray-200";

  return (
    <button
      type="button"
      aria-label="Open user menu"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-gray-200 transition hover:ring-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      {hasImage ? (
        <img className="h-full w-full object-cover" src={src} alt={alt} />
      ) : initials ? (
        <span
          aria-hidden="true"
          className={`flex h-full w-full items-center justify-center text-sm font-bold text-white ${bgColor}`}
        >
          {initials}
        </span>
      ) : (
        <svg
          aria-hidden="true"
          className="h-7 w-7 text-gray-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
