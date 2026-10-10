"use strict";
import LeftHeader from "./LeftHeader";
import RightHeader from "./RightHeader";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-[80px] border-b border-white/[0.07] bg-white backdrop-blur-xl shadow-sm">
      <div className="flex w-full items-center mt-[20px] pr-[20px]">
        <LeftHeader />

        <RightHeader />
      </div>
    </header>
  );
}
