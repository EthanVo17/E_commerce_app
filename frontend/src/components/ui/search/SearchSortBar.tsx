import type { ProductSortOption } from "@/types/product";

interface SearchSortBarProps {
  activeSort: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
}

const QUICK_SORT_OPTIONS: Array<{
  value: Exclude<ProductSortOption, "price_asc" | "price_desc">;
  label: string;
}> = [
  { value: "relevance", label: "Liên quan" },
  { value: "newest", label: "Mới nhất" },
  { value: "bestselling", label: "Bán chạy" },
];

export default function SearchSortBar({
  activeSort,
  onSortChange,
}: SearchSortBarProps) {
  const priceSortValue =
    activeSort === "price_asc" || activeSort === "price_desc" ? activeSort : "";

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-gray-600">
          Sắp xếp theo
        </span>
        {QUICK_SORT_OPTIONS.map((option) => {
          const isActive = activeSort === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSortChange(option.value)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-[#ee4d2d] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
              }`}
            >
              {option.label}
            </button>
          );
        })}

        <select
          aria-label="Sắp xếp theo giá"
          value={priceSortValue}
          onChange={(e) => {
            const val = e.target.value as ProductSortOption | "";
            if (val === "price_asc" || val === "price_desc") {
              onSortChange(val);
            }
          }}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none ${
            priceSortValue
              ? "border-[#ee4d2d] bg-[#fff8f6] text-[#ee4d2d]"
              : "border-gray-200 bg-white text-gray-700 hover:border-[#ee4d2d]"
          }`}
        >
          <option value="" disabled>
            Giá
          </option>
          <option value="price_asc">Giá: Thấp đến Cao</option>
          <option value="price_desc">Giá: Cao đến Thấp</option>
        </select>
      </div>
    </div>
  );
}
