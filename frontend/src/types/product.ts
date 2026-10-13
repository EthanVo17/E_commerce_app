export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  oldPrice?: string;
  discountLabel?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  soldLabel: string;
  variants?: string[];
  variantLabel?: string;
  variantHint?: string;
  stockLabel?: string;
  description: string;
  highlights: string[];
}
