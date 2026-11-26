import { useCallback, useEffect, useState } from "react";
import { searchProducts } from "@/api/productApi";
import type { SearchState } from "@/types/search";

export function useProductSearch(keyword: string) {
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<SearchState>({
    key: "",
    products: [],
    total: 0,
    error: null,
  });

  const requestKey = keyword ? `${keyword}::${retryCount}` : "";
  const isLoading = Boolean(requestKey) && state.key !== requestKey;
  const products = state.key === requestKey ? state.products : [];
  const total = state.key === requestKey ? state.total : 0;
  const error = state.key === requestKey ? state.error : null;

  useEffect(() => {
    if (!keyword) return;

    let cancelled = false;

    searchProducts(keyword)
      .then((result) => {
        if (cancelled) return;
        setState({
          key: requestKey,
          products: result.products,
          total: result.total,
          error: null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          key: requestKey,
          products: [],
          total: 0,
          error: "Không thể tải kết quả tìm kiếm. Vui lòng thử lại.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [keyword, requestKey]);

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  return { products, total, isLoading, error, retry };
}
