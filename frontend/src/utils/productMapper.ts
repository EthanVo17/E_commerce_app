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
  const rawOldPrice = item.originalPrice ?? item.oldPrice;
  const numericOldPrice =
    typeof rawOldPrice === "number" ? rawOldPrice : undefined;

  const hasDiscount =
    numericPrice !== undefined &&
    numericOldPrice !== undefined &&
    numericOldPrice > numericPrice &&
    numericOldPrice > 0;

  const computedDiscountPercentage =
    typeof item.discountPercentage === "number" && item.discountPercentage > 0
      ? item.discountPercentage
      : hasDiscount
        ? Math.round(((numericOldPrice - numericPrice) / numericOldPrice) * 100)
        : undefined;

  const computedDiscountLabel =
    item.discountLabel ??
    (computedDiscountPercentage && computedDiscountPercentage > 0
      ? `-${computedDiscountPercentage}%`
      : undefined);

  const categoryName =
    typeof item.category === "object" && item.category !== null
      ? item.category.name ?? "Sản phẩm"
      : typeof item.category === "string" && item.category.trim()
        ? item.category
        : "Sản phẩm";

  const categorySlug =
    typeof item.category === "object" && item.category !== null
      ? item.category.slug
      : undefined;

  const images =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : [FALLBACK_IMAGE];

  const soldCount = Number(item.soldCount ?? 0);
  const stock = typeof item.stock === "number" ? item.stock : undefined;
  const structuredVariants = Array.isArray(item.variants)
    ? item.variants.filter((variant) => variant && variant.isActive !== false)
    : undefined;
  const options = Array.isArray(item.options) ? item.options : undefined;

  const normalizedSlug =
    typeof item.slug === "string" && item.slug.trim()
      ? item.slug.trim()
      : undefined;

  return {
    id: String(normalizedSlug ?? item._id ?? item.id ?? ""),
    slug: normalizedSlug,
    name: item.name ?? "",
    brand: item.brand ?? "",
    category: categoryName,
    categorySlug,
    price:
      numericPrice !== undefined
        ? formatVND(numericPrice)
        : String(item.price ?? "0₫"),
    numericPrice,
    oldPrice: hasDiscount
      ? formatVND(numericOldPrice)
      : typeof rawOldPrice === "string"
        ? rawOldPrice
        : undefined,
    numericOldPrice: hasDiscount ? numericOldPrice : undefined,
    discountPercentage: computedDiscountPercentage,
    discountLabel: computedDiscountLabel,
    images,
    rating: Number(item.rating ?? 0),
    reviewCount: Number(item.reviewCount ?? 0),
    soldCount,
    soldLabel: String(item.soldLabel ?? soldCount),
    location: item.location,
    stock,
    variantLabel: item.variantLabel,
    variantHint: item.variantHint,
    stockLabel:
      stock !== undefined
        ? stock > 0
          ? `Còn ${stock} sản phẩm`
          : "Hết hàng"
        : undefined,
    description: item.description ?? "",
    highlights: Array.isArray(item.highlights) ? item.highlights : [],
    specifications: Array.isArray(item.specifications)
      ? item.specifications
      : [],
    options,
    structuredVariants,
  };
}
