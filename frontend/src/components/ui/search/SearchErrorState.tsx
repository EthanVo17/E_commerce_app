import type { SearchErrorStateProps } from "@/types/search";

export default function SearchErrorState({
  message,
  onRetry,
}: SearchErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-10 cursor-pointer items-center rounded-lg bg-[#ee4d2d] px-5 text-sm font-medium text-white transition hover:bg-[#d94325]"
      >
        Thử lại
      </button>
    </div>
  );
}
