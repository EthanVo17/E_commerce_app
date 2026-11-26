import { useSearchParams } from "react-router-dom";
import SearchEmptyState from "@/components/ui/search/SearchEmptyState";
import SearchErrorState from "@/components/ui/search/SearchErrorState";
import SearchResultsGrid from "@/components/ui/search/SearchResultsGrid";
import SearchSkeleton from "@/components/ui/search/SearchSkeleton";
import { useProductSearch } from "@/hooks/useProductSearch";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const keyword = (searchParams.get("q") ?? "").trim();

  const { products, total, isLoading, error, retry } =
    useProductSearch(keyword);

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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ee4d2d]">
            Kết quả tìm kiếm
          </p>
          <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
            Từ khóa: &ldquo;{keyword}&rdquo;
          </h1>
        </div>
        {!isLoading && !error && (
          <p className="text-sm text-gray-500">
            Tìm thấy <strong className="text-gray-800">{total}</strong> sản phẩm
          </p>
        )}
      </div>

      {isLoading ? (
        <SearchSkeleton />
      ) : error ? (
        <SearchErrorState message={error} onRetry={retry} />
      ) : products.length === 0 ? (
        <SearchEmptyState
          title={`Không tìm thấy sản phẩm nào khớp với "${keyword}"`}
          description="Hãy thử lại với từ khóa khác hoặc ngắn gọn hơn."
        />
      ) : (
        <SearchResultsGrid products={products} />
      )}
    </section>
  );
}
