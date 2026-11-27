import type {
  Product,
  ProductOption,
  ProductSortOption,
  ProductSpecification,
  ProductVariantItem,
} from "@/types/product";

export interface ApiCategory {
  _id?: string;
  name?: string;
  slug?: string;
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
  originalPrice?: number | string;
  discountPercentage?: number;
  discountLabel?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  soldLabel?: number | string;
  variantLabel?: string;
  variantHint?: string;
  stock?: number;
  location?: string;
  description?: string;
  highlights?: string[];
  specifications?: ProductSpecification[];
  options?: ProductOption[];
  variants?: ProductVariantItem[];
}

export interface SearchQueryParams {
  q: string;
  page?: number;
  limit?: number;
  sort?: ProductSortOption;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface SearchProductsResponse {
  success: boolean;
  message?: string;
  total?: number;
  data:
    | ApiProduct[]
    | {
        keyword?: string;
        products?: ApiProduct[];
      };
  pagination?: PaginationMeta;
}

export interface ProductDetailResponse {
  success: boolean;
  data: ApiProduct;
}

export interface SearchProductsResult {
  keyword: string;
  total: number;
  products: Product[];
  pagination: PaginationMeta;
}

export interface SearchState {
  key: string;
  products: Product[];
  pagination: PaginationMeta;
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
