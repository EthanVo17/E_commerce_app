import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import SearchEmptyState from "@/components/ui/search/SearchEmptyState";
import SearchErrorState from "@/components/ui/search/SearchErrorState";
import SearchPagination from "@/components/ui/search/SearchPagination";
import SearchResultsGrid from "@/components/ui/search/SearchResultsGrid";
import SearchSkeleton from "@/components/ui/search/SearchSkeleton";
import SearchSortBar from "@/components/ui/search/SearchSortBar";
import { useProductSearch } from "@/hooks/useProductSearch";
import type { ProductSortOption } from "@/types/product";

const VALID_SORT_OPTIONS: readonly ProductSortOption[] = [
  "relevance",
  "newest",
  "bestselling",
  "price_asc",
  "price_desc",
];

function parseSort(value: string | null): ProductSortOption {
  if (value && VALID_SORT_OPTIONS.includes(value as ProductSortOption)) {
    return value as ProductSortOption;
  }
  return "relevance";
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseOptionalPrice(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = (searchParams.get("q") ?? "").trim();
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const sort = parseSort(searchParams.get("sort"));
  const minPrice = parseOptionalPrice(searchParams.get("minPrice"));
  const maxPrice = parseOptionalPrice(searchParams.get("maxPrice"));

  const { products, pagination, total, isLoading, error, retry } =
    useProductSearch({
      q: keyword,
      page,
      limit: 10,
      sort,
      minPrice,
      maxPrice,
    });

  const handleSortChange = useCallback(
    (nextSort: ProductSortOption) => {
      const next = new URLSearchParams(searchParams);
      next.set("sort", nextSort);
      next.set("page", "1");
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const next = new URLSearchParams(searchParams);
      next.set("page", String(nextPage));
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  if (!keyword) {
    return (
      <SearchEmptyState
        title="Nhập từ khóa để tìm kiếm sản phẩm"
        description="Hãy gõ tên sản phẩm vào ô tìm kiếm phía trên và nhấn Enter."
        actionLabel="Quay lại trang chủ"
      />
    );
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ee4d2d]">
            Tìm kiếm sản phẩm
          </p>
          <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
            Kết quả tìm kiếm cho từ khóa &ldquo;{keyword}&rdquo;
          </h1>
        </div>
        {!isLoading && !error && (
          <p className="text-sm text-gray-500">
            Tìm thấy <strong className="text-gray-800">{total}</strong> sản phẩm
          </p>
        )}
      </div>

      <SearchSortBar activeSort={sort} onSortChange={handleSortChange} />

      {isLoading ? (
        <SearchSkeleton />
      ) : error ? (
        <SearchErrorState message={error} onRetry={retry} />
      ) : products.length === 0 ? (
        <SearchEmptyState
          title={`Không tìm thấy sản phẩm nào khớp với "${keyword}"`}
          description="Hãy thử kiểm tra lại chính tả hoặc sử dụng từ khóa chung chung hơn."
        />
      ) : (
        <>
          <SearchResultsGrid products={products} />
          <SearchPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}
