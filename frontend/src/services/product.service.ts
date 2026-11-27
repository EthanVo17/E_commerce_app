import axiosClient from "@/api/axiosClient";
import type { ProductDetailData } from "@/types/product";
import type {
  ApiProduct,
  PaginationMeta,
  ProductDetailResponse,
  SearchProductsResponse,
  SearchProductsResult,
  SearchQueryParams,
} from "@/types/search";
import { mapApiProductToProduct } from "@/utils/productMapper";

export async function searchProducts(
  input: SearchQueryParams | string,
): Promise<SearchProductsResult> {
  const params: SearchQueryParams =
    typeof input === "string" ? { q: input } : input;

  const trimmed = params.q.trim();
  const queryParams: Record<string, string | number> = { q: trimmed };

  if (params.page && params.page > 1) {
    queryParams.page = params.page;
  } else if (params.page === 1) {
    queryParams.page = 1;
  }

  if (params.limit) {
    queryParams.limit = params.limit;
  }

  if (params.sort) {
    queryParams.sort = params.sort;
  }

  if (params.minPrice !== undefined) {
    queryParams.minPrice = params.minPrice;
  }

  if (params.maxPrice !== undefined) {
    queryParams.maxPrice = params.maxPrice;
  }

  const response = await axiosClient.get<SearchProductsResponse>(
    "/products/search",
    { params: queryParams },
  );

  const payload = response.data;
  const rawProducts: ApiProduct[] = Array.isArray(payload?.data)
    ? payload.data
    : (payload?.data?.products ?? []);

  const fallbackTotal = payload?.total ?? rawProducts.length;
  const limit = params.limit ?? 10;
  const page = params.page ?? 1;

  const pagination: PaginationMeta = payload?.pagination ?? {
    page,
    limit,
    totalItems: fallbackTotal,
    totalPages: fallbackTotal === 0 ? 0 : Math.ceil(fallbackTotal / limit),
  };

  return {
    keyword:
      !Array.isArray(payload?.data) && payload?.data?.keyword
        ? payload.data.keyword
        : trimmed,
    total: pagination.totalItems,
    products: rawProducts.map(mapApiProductToProduct),
    pagination,
  };
}

export async function getProductDetail(
  slugOrId: string,
): Promise<ProductDetailData> {
  const response = await axiosClient.get<ProductDetailResponse>(
    `/products/${encodeURIComponent(slugOrId.trim())}`,
  );
  return mapApiProductToProduct(response.data.data);
}
