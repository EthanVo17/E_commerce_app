import type { Types } from "mongoose";

/** A selectable product option, such as size, color, or storage capacity. */
export interface ProductOptionValueType {
  value: string;
  label?: string;
  image?: string;
}

export interface ProductOptionType {
  name: string;
  values: ProductOptionValueType[];
}

/** A purchasable SKU formed from one or more option values. */
export interface ProductVariantType {
  sku: string;
  options: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

/** Persisted product data. Prices are numeric amounts in the product currency. */
export interface ProductType {
  name: string;
  slug: string;
  brand: string;
  description: string;
  highlights: string[];
  images: string[];
  price: number;
  compareAtPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  options: ProductOptionType[];
  variants: ProductVariantType[];
  category: Types.ObjectId;
  isActive: boolean;
}
