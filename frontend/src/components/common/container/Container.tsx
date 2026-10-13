import type { ReactNode } from "react";

export default function Container({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-[60vh] bg-[#f5f5f5] text-[#222]">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </main>
  );
}
