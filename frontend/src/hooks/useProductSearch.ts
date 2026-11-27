import { useCallback, useEffect, useState } from "react";
import { searchProducts } from "@/services/product.service";
import type {
  PaginationMeta,
  SearchQueryParams,
  SearchState,
} from "@/types/search";

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
};

export function useProductSearch(params: SearchQueryParams) {
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<SearchState>({
    key: "",
    products: [],
    pagination: DEFAULT_PAGINATION,
    error: null,
  });

  const q = params.q.trim();
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const sort = params.sort ?? "relevance";
  const minPrice = params.minPrice;
  const maxPrice = params.maxPrice;

  const requestKey = q
    ? `${q}::${page}::${limit}::${sort}::${minPrice ?? ""}::${maxPrice ?? ""}::${retryCount}`
    : "";

  const isLoading = Boolean(requestKey) && state.key !== requestKey;
  const products = state.key === requestKey ? state.products : [];
  const pagination =
    state.key === requestKey ? state.pagination : DEFAULT_PAGINATION;
  const total = pagination.totalItems;
  const error = state.key === requestKey ? state.error : null;

  useEffect(() => {
    if (!q) return;

    let cancelled = false;

    searchProducts({
      q,
      page,
      limit,
      sort,
      minPrice,
      maxPrice,
    })
      .then((result) => {
        if (cancelled) return;
        setState({
          key: requestKey,
          products: result.products,
          pagination: result.pagination,
          error: null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          key: requestKey,
          products: [],
          pagination: DEFAULT_PAGINATION,
          error: "Không thể tải kết quả tìm kiếm. Vui lòng thử lại.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [q, page, limit, sort, minPrice, maxPrice, requestKey]);

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  return { products, pagination, total, isLoading, error, retry };
}
