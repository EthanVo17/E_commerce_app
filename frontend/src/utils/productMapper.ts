import type { Product } from "@/types/product";
import type { ApiProduct } from "@/types/search";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="18">No image</text></svg>`,
  );

export function formatVND(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")}₫`;
}

export function mapApiProductToProduct(item: ApiProduct): Product {
  const numericPrice = typeof item.price === "number" ? item.price : undefined;
  const numericOldPrice =
    typeof item.oldPrice === "number" ? item.oldPrice : undefined;

  const hasDiscount =
    numericPrice !== undefined &&
    numericOldPrice !== undefined &&
    numericOldPrice > numericPrice &&
    numericOldPrice > 0;

  const computedDiscountLabel =
    item.discountLabel ??
    (hasDiscount
      ? `-${Math.round(((numericOldPrice - numericPrice) / numericOldPrice) * 100)}%`
      : undefined);

  const categoryName =
    typeof item.category === "object" && item.category !== null
      ? item.category.name ?? "Sản phẩm"
      : typeof item.category === "string" && item.category.trim()
        ? item.category
        : "Sản phẩm";

  const images =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : [FALLBACK_IMAGE];

  return {
    id: String(item.slug ?? item._id ?? item.id ?? ""),
    name: item.name ?? "",
    brand: item.brand ?? "",
    category: categoryName,
    price:
      numericPrice !== undefined
        ? formatVND(numericPrice)
        : String(item.price ?? "0₫"),
    oldPrice: hasDiscount
      ? formatVND(numericOldPrice)
      : typeof item.oldPrice === "string"
        ? item.oldPrice
        : undefined,
    discountLabel: computedDiscountLabel,
    images,
    rating: Number(item.rating ?? 0),
    reviewCount: Number(item.reviewCount ?? 0),
    soldLabel: String(item.soldLabel ?? item.soldCount ?? 0),
    variantLabel: item.variantLabel,
    variantHint: item.variantHint,
    stockLabel:
      typeof item.stock === "number" ? `Còn ${item.stock} sản phẩm` : undefined,
    description: item.description ?? "",
    highlights: Array.isArray(item.highlights) ? item.highlights : [],
  };
}
