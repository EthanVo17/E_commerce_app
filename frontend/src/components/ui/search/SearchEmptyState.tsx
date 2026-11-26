import { Link } from "react-router-dom";
import type { SearchEmptyStateProps } from "@/types/search";

export default function SearchEmptyState({
  title,
  description,
  actionLabel = "Về trang chủ",
}: SearchEmptyStateProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
      <p className="text-base font-semibold text-gray-800">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      <Link
        to="/"
        className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#ee4d2d] px-5 text-sm font-medium text-white transition hover:bg-[#d94325]"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
