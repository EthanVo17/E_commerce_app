import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getProductDetail } from "@/services/product.service";
import type { ProductDetailData } from "@/types/product";

interface ProductDetailState {
  key: string;
  product: ProductDetailData | null;
  isNotFound: boolean;
  error: string | null;
}

export function useProductDetail(slug?: string) {
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<ProductDetailState>({
    key: "",
    product: null,
    isNotFound: false,
    error: null,
  });

  const trimmedSlug = (slug ?? "").trim();
  const requestKey = trimmedSlug ? `${trimmedSlug}::${retryCount}` : "";

  const isLoading = Boolean(requestKey) && state.key !== requestKey;
  const product = state.key === requestKey ? state.product : null;
  const isNotFound =
    !trimmedSlug || (state.key === requestKey && state.isNotFound);
  const error = state.key === requestKey ? state.error : null;

  useEffect(() => {
    if (!trimmedSlug) return;

    let cancelled = false;

    getProductDetail(trimmedSlug)
      .then((detail) => {
        if (cancelled) return;
        setState({
          key: requestKey,
          product: detail,
          isNotFound: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = axios.isAxiosError(err)
          ? err.response?.status
          : undefined;
        if (status === 404 || status === 400) {
          setState({
            key: requestKey,
            product: null,
            isNotFound: true,
            error: null,
          });
          return;
        }
        setState({
          key: requestKey,
          product: null,
          isNotFound: false,
          error: "Không thể tải thông tin sản phẩm. Vui lòng thử lại.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [trimmedSlug, requestKey]);

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  return { product, isLoading, isNotFound, error, retry };
}
