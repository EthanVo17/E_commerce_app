import type { Product } from "@/types/product";

export interface ApiCategory {
  _id?: string;
  name?: string;
}

export interface ApiProduct {
  _id?: string;
  id?: string;
  slug?: string;
  name: string;
  brand?: string;
  category?: ApiCategory | string | null;
  price?: number | string;
  oldPrice?: number | string;
  discountLabel?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  soldLabel?: number | string;
  variantLabel?: string;
  variantHint?: string;
  stock?: number;
  description?: string;
  highlights?: string[];
}

export interface SearchProductsResponse {
  success: boolean;
  message: string;
  total: number;
  data: {
    keyword: string;
    products: ApiProduct[];
  };
}

export interface SearchProductsResult {
  keyword: string;
  total: number;
  products: Product[];
}

export interface SearchState {
  key: string;
  products: Product[];
  total: number;
  error: string | null;
}

export interface SearchDropDownProps {
  value: string;
  listSearch: string[];
  onSelect?: (keyword: string) => void;
}

export interface SearchEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
}

export interface SearchErrorStateProps {
  message: string;
  onRetry: () => void;
}

export interface SearchResultsGridProps {
  products: Product[];
}
