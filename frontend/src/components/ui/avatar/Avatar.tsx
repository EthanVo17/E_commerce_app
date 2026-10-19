"use strict";

interface AvatarProps {
  src?: string;
  alt?: string;
  isOpen?: boolean;
  onClick: () => void;
}

export default function Avatar({
  src,
  alt = "User avatar",
  isOpen = false,
  onClick,
}: AvatarProps) {
  return (
    <button
      type="button"
      aria-label="Open user menu"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200 transition hover:ring-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
      {src ? (
        <img className="h-full w-full object-cover" src={src} alt={alt} />
      ) : (
        <svg aria-hidden="true" className="h-7 w-7 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
