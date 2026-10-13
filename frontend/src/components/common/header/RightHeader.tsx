"use strict";

import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import Button from "@/components/ui/button/Button";
import DropDown from "@/components/ui/dropdown/DropDown";

export default function RightHeader() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState("English");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const Languages = ["English", "Vietnamese", "Chinese"];

  React.useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isOpen]);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };
  return (
    <>
      {/**Right header */}
      <div
        id="right-header"
        className="ml-auto flex gap-4 items-center justify-center">
        <div id="login-btn">
          <Link to={{ pathname: "/signin" }}>
            <Button
              type="button"
              className="w-[120px] h-[36px] text-black text-lg font-medium shadow-xs border-black rounded-4xl border-[2px] border-solid bg-[#fff] cursor-pointer">
              Sign in
            </Button>
          </Link>
        </div>

        <div id="sign-up-btn">
          <Link to={{ pathname: "/signup" }}>
            <Button
              type="button"
              className="w-[120px] h-[36px] text-black text-lg font-medium shadow-xs border-black rounded-4xl border-[2px] border-solid bg-[#fff] cursor-pointer">
              Sign up
            </Button>
          </Link>
        </div>

        <div ref={dropdownRef} className="relative">
          <button
            id="dropdownLargeButton"
            type="button"
            aria-expanded={isOpen}
            aria-controls="dropdownNavbar"
            aria-label="Select language"
            className="cursor-pointer text-black"
            onClick={() => setIsOpen((open) => !open)}>
            <FontAwesomeIcon icon={faGlobe} className="text-xl" />
          </button>

          {isOpen && <DropDown items={Languages} onClick={handleOptionClick} />}
        </div>
      </div>
    </>
  );
}
