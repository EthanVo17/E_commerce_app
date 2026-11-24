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
  image?: string;

  price: number;
  oldPrice?: number;

  stock: number;
  isActive: boolean;
}

/** Persisted product data. Prices are numeric amounts in the product currency. */
export interface ProductType {
  _id?: Types.ObjectId;
  id: string;
  slug: string;
  name: string;
  brand: string;
  images: string[];
  stockLabel: number;
  highlights: string[];

  price: number;
  oldPrice: number;
  soldLabel: number;
  soldCount: number;
  currency: string;
  stock: number;

  rating: number;
  reviewCount: number;

  variantLabel: string;
  variantHint: string;
  description: string;

  category: Types.ObjectId;
  isActive: boolean;

  variants: ProductVariantType[];
  options: ProductOptionType[];
}
