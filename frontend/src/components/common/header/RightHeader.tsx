"use strict";

import React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button/Button";
import Avatar from "@/components/ui/avatar/Avatar";
import AvatarDropDown from "@/components/ui/avatar/AvatarDropDown";
import LanguageSelector from "@/components/ui/dropdown/LanguageSelector";

export default function RightHeader() {
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = React.useState(false);
  const avatarMenuRef = React.useRef<HTMLDivElement>(null);

  // Replace this placeholder with the authenticated user from application state.
  const user = { name: "Joseph McFall", email: "name@flowbite.com" };

  React.useEffect(() => {
    if (!isAvatarMenuOpen) return;
    const handleOutsideClick = (event: PointerEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isAvatarMenuOpen]);

  return (
    <div
      id="right-header"
      className="ml-auto flex items-center justify-end gap-4">
      {user ? (
        <div ref={avatarMenuRef} className="relative">
          <Avatar
            isOpen={isAvatarMenuOpen}
            onClick={() => setIsAvatarMenuOpen((open) => !open)}
          />
          <AvatarDropDown
            user={user}
            isOpen={isAvatarMenuOpen}
            onClose={() => setIsAvatarMenuOpen(false)}
          />
        </div>
      ) : (
        <>
          <Link to="/signin">
            <Button
              type="button"
              className="h-[36px] w-[120px] cursor-pointer rounded-4xl border-2 border-solid border-black bg-white text-lg font-medium text-black shadow-xs">
              Sign in
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              type="button"
              className="h-[36px] w-[120px] cursor-pointer rounded-4xl border-2 border-solid border-black bg-white text-lg font-medium text-black shadow-xs">
              Sign up
            </Button>
          </Link>
        </>
      )}
      <LanguageSelector />
    </div>
  );
}
