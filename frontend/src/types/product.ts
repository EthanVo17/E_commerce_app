export type ProductSortOption =
  | "relevance"
  | "newest"
  | "bestselling"
  | "price_asc"
  | "price_desc";

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductOptionValue {
  value: string;
  label?: string;
  image?: string;
}

export interface ProductOption {
  name: string;
  values: ProductOptionValue[];
}

export interface ProductVariantItem {
  sku: string;
  options: Record<string, string>;
  price: number;
  oldPrice?: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

export interface ProductCardItem {
  id: string;
  slug?: string;
  name: string;
  brand: string;
  category: string;
  categorySlug?: string;
  price: string;
  numericPrice?: number;
  oldPrice?: string;
  numericOldPrice?: number;
  discountPercentage?: number;
  discountLabel?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  soldCount?: number;
  soldLabel: string;
  location?: string;
  stock?: number;
}

export interface ProductDetailData extends ProductCardItem {
  description: string;
  highlights: string[];
  specifications?: ProductSpecification[];
  options?: ProductOption[];
  structuredVariants?: ProductVariantItem[];
  variants?: string[];
  variantLabel?: string;
  variantHint?: string;
  stockLabel?: string;
}

export type Product = ProductDetailData;
