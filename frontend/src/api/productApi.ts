import axiosClient from "@/api/axiosClient";
import type {
  SearchProductsResponse,
  SearchProductsResult,
} from "@/types/search";
import { mapApiProductToProduct } from "@/utils/productMapper";

export async function searchProducts(
  keyword: string,
): Promise<SearchProductsResult> {
  const trimmed = keyword.trim();
  const response = await axiosClient.get<SearchProductsResponse>(
    "/products/search",
    {
      params: { q: trimmed },
    },
  );

  const payload = response.data;
  const rawProducts = payload?.data?.products ?? [];

  return {
    keyword: payload?.data?.keyword ?? trimmed,
    total: payload?.total ?? rawProducts.length,
    products: rawProducts.map(mapApiProductToProduct),
  };
}
