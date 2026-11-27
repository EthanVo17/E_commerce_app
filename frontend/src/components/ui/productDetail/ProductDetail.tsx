import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import type { Product, ProductVariantItem } from "@/types/product";
import { formatVND } from "@/utils/productMapper";

export interface SelectedProductPurchase {
  product: Product;
  quantity: number;
  variantLabel: string;
  sku?: string;
  unitPrice: number;
  priceLabel: string;
  maxStock?: number;
}

interface ProductDetailProps {
  product: Product;
  onAddToCart?: (selection: SelectedProductPurchase) => void;
  onBuyNow?: (selection: SelectedProductPurchase) => void;
}

function buildInitialSelectedOptions(product: Product): Record<string, string> {
  const initial: Record<string, string> = {};
  if (!product.options || product.options.length === 0) {
    return initial;
  }

  const firstVariant = product.structuredVariants?.[0];
  if (firstVariant?.options) {
    return { ...firstVariant.options };
  }

  for (const option of product.options) {
    const firstValue = option.values[0]?.value;
    if (firstValue) {
      initial[option.name] = firstValue;
    }
  }
  return initial;
}

export default function ProductDetail({
  product,
  onAddToCart,
  onBuyNow,
}: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(product.images[0] ?? "");
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] ?? "",
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => buildInitialSelectedOptions(product),
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setActiveImage(product.images[0] ?? "");
    setSelectedVariant(product.variants?.[0] ?? "");
    setSelectedOptions(buildInitialSelectedOptions(product));
    setQuantity(1);
  }, [product]);

  const hasStructuredOptions =
    Array.isArray(product.options) && product.options.length > 0;

  const matchedVariant: ProductVariantItem | undefined = useMemo(() => {
    if (!hasStructuredOptions || !product.structuredVariants?.length) {
      return undefined;
    }
    return product.structuredVariants.find((variant) =>
      Object.entries(selectedOptions).every(
        ([optName, optValue]) => variant.options?.[optName] === optValue,
      ),
    );
  }, [hasStructuredOptions, product.structuredVariants, selectedOptions]);

  const availableStock = useMemo(() => {
    if (matchedVariant) return matchedVariant.stock;
    if (typeof product.stock === "number") return product.stock;
    return undefined;
  }, [matchedVariant, product.stock]);

  const isOutOfStock = availableStock !== undefined && availableStock <= 0;

  const displayPrice = matchedVariant
    ? formatVND(matchedVariant.price)
    : product.price;

  const displayUnitPrice = matchedVariant
    ? matchedVariant.price
    : (product.numericPrice ?? 0);

  const displayOldPrice = useMemo(() => {
    if (matchedVariant) {
      if (
        typeof matchedVariant.oldPrice === "number" &&
        matchedVariant.oldPrice > matchedVariant.price
      ) {
        return formatVND(matchedVariant.oldPrice);
      }
      return undefined;
    }
    return product.oldPrice;
  }, [matchedVariant, product.oldPrice]);

  const displayDiscountLabel = useMemo(() => {
    if (matchedVariant) {
      if (
        typeof matchedVariant.oldPrice === "number" &&
        matchedVariant.oldPrice > matchedVariant.price
      ) {
        const pct = Math.round(
          ((matchedVariant.oldPrice - matchedVariant.price) /
            matchedVariant.oldPrice) *
            100,
        );
        return pct > 0 ? `-${pct}%` : undefined;
      }
      return undefined;
    }
    return product.discountLabel;
  }, [matchedVariant, product.discountLabel]);

  const displayStockLabel = useMemo(() => {
    if (availableStock !== undefined) {
      return availableStock > 0
        ? `Còn ${availableStock} sản phẩm`
        : "Hết hàng";
    }
    return product.stockLabel;
  }, [availableStock, product.stockLabel]);

  const currentVariantSummary = useMemo(() => {
    if (hasStructuredOptions) {
      return Object.entries(selectedOptions)
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");
    }
    return selectedVariant;
  }, [hasStructuredOptions, selectedOptions, selectedVariant]);

  const handleSelectOption = (optionName: string, value: string, image?: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
    if (image) {
      setActiveImage(image);
    }
    setQuantity(1);
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => {
      if (availableStock !== undefined && availableStock > 0) {
        return Math.min(availableStock, prev + 1);
      }
      return prev + 1;
    });
  };

  const buildSelection = (): SelectedProductPurchase => ({
    product,
    quantity,
    variantLabel: currentVariantSummary,
    sku: matchedVariant?.sku,
    unitPrice: displayUnitPrice,
    priceLabel: displayPrice,
    maxStock: availableStock,
  });

  const specifications = product.specifications ?? [];

  return (
    <div>
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-500"
      >
        <Link to="/" className="hover:text-[#ee4d2d]">
          Trang chủ
        </Link>
        <span>&gt;</span>
        <span>{product.category}</span>
        <span>&gt;</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <section className="rounded-xl bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="min-w-0">
            <div className="aspect-square overflow-hidden rounded-lg bg-[#f7f7f7]">
              <img
                src={matchedVariant?.image || activeImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    aria-label={`Xem ảnh ${index + 1}`}
                    aria-pressed={activeImage === image}
                    onClick={() => setActiveImage(image)}
                    onMouseEnter={() => setActiveImage(image)}
                    className={`aspect-square overflow-hidden rounded-md border-2 bg-[#f7f7f7] transition ${
                      activeImage === image
                        ? "border-[#ee4d2d]"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-medium text-[#ee4d2d]">
              {product.brand ? `${product.brand} · ` : ""}
              {product.category}
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-snug text-gray-900 sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1 text-amber-500">
                <FontAwesomeIcon icon={faStar} />
                <span className="font-medium text-gray-700">
                  {product.rating.toFixed(1)}
                </span>
              </span>
              <span className="text-gray-500">
                <strong className="font-semibold text-gray-800">
                  {product.reviewCount}
                </strong>{" "}
                đánh giá
              </span>
              <span className="text-gray-500">
                Đã bán{" "}
                <strong className="font-semibold text-gray-800">
                  {product.soldLabel}
                </strong>
              </span>
            </div>

            <div className="mt-6 rounded-lg bg-[#fff8f6] p-4 sm:p-5">
              {displayOldPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {displayOldPrice}
                </span>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-bold text-[#ee4d2d]">
                  {displayPrice}
                </span>
                {displayDiscountLabel && (
                  <span className="rounded bg-[#ee4d2d]/10 px-2 py-1 text-xs font-semibold text-[#ee4d2d]">
                    {displayDiscountLabel}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Đã bao gồm thuế · Giá tốt trong hôm nay
              </p>
            </div>

            {hasStructuredOptions && (
              <div className="mt-6 space-y-4 border-b border-gray-100 pb-6">
                {product.options!.map((option) => (
                  <div key={option.name}>
                    <p className="mb-2.5 text-sm font-medium text-gray-800">
                      {option.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((val) => {
                        const isSelected =
                          selectedOptions[option.name] === val.value;
                        return (
                          <button
                            key={val.value}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() =>
                              handleSelectOption(
                                option.name,
                                val.value,
                                val.image,
                              )
                            }
                            className={`min-w-12 rounded-md border px-3 py-2 text-sm transition ${
                              isSelected
                                ? "border-[#ee4d2d] bg-[#fff8f6] text-[#ee4d2d]"
                                : "border-gray-200 text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {val.label ?? val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!hasStructuredOptions &&
              product.variants &&
              product.variants.length > 0 && (
                <div className="mt-6 border-b border-gray-100 pb-6">
                  <p className="mb-3 text-sm font-medium text-gray-800">
                    {product.variantLabel ?? "Phân loại hàng"}
                    {product.variantHint && (
                      <span className="font-normal text-gray-400">
                        {" "}
                        ({product.variantHint})
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant}
                        type="button"
                        aria-pressed={selectedVariant === variant}
                        onClick={() => setSelectedVariant(variant)}
                        className={`min-w-12 rounded-md border px-3 py-2 text-sm transition ${
                          selectedVariant === variant
                            ? "border-[#ee4d2d] bg-[#fff8f6] text-[#ee4d2d]"
                            : "border-gray-200 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            <div className="mt-5 flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Số lượng
              </span>
              <div className="flex h-10 items-center rounded-md border border-gray-200">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="h-full w-10 text-lg text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <span
                  data-testid="product-quantity"
                  className="min-w-10 text-center text-sm"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  disabled={
                    isOutOfStock ||
                    (availableStock !== undefined && quantity >= availableStock)
                  }
                  onClick={handleIncreaseQuantity}
                  className="h-full w-10 text-lg text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
              {displayStockLabel && (
                <span className="text-sm text-gray-400">
                  {displayStockLabel}
                </span>
              )}
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => onAddToCart?.(buildSelection())}
                className="h-12 rounded-lg border border-[#ee4d2d] bg-[#fff8f6] px-5 font-semibold text-[#ee4d2d] transition hover:bg-[#fff0eb] disabled:cursor-not-allowed disabled:opacity-50"
              >
                ＋ Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => onBuyNow?.(buildSelection())}
                className="h-12 rounded-lg bg-[#ee4d2d] px-5 font-semibold text-white transition hover:bg-[#d94325] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mua ngay
              </button>
            </div>

            <div className="mt-7 grid gap-3 border-t border-gray-100 pt-5 text-sm text-gray-600 sm:grid-cols-2">
              <p>
                <span className="mr-2 text-[#ee4d2d]">✓</span>Miễn phí vận
                chuyển cho đơn từ 500.000₫
              </p>
              <p>
                <span className="mr-2 text-[#ee4d2d]">↺</span>Đổi trả miễn phí
                trong 15 ngày
              </p>
              <p>
                <span className="mr-2 text-[#ee4d2d]">♧</span>Hàng chính hãng
                100%
              </p>
              <p>
                <span className="mr-2 text-[#ee4d2d]">▣</span>Thanh toán an toàn
              </p>
            </div>
          </div>
        </div>
      </section>

      {specifications.length > 0 && (
        <section className="mt-6 rounded-xl bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Thông số kỹ thuật
          </h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full text-left text-sm">
              <tbody>
                {specifications.map((spec, index) => (
                  <tr
                    key={`${spec.key}-${index}`}
                    className={index % 2 === 0 ? "bg-gray-50/70" : "bg-white"}
                  >
                    <th className="w-1/3 px-4 py-3 font-medium text-gray-600">
                      {spec.key}
                    </th>
                    <td className="px-4 py-3 text-gray-800">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Mô tả chi tiết sản phẩm
        </h2>
        <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-gray-600">
          {product.description || "Đang cập nhật mô tả sản phẩm."}
        </p>
        {product.highlights.length > 0 && (
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-600">
            {product.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
