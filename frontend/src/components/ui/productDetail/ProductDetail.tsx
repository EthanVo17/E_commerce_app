import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/types/product";

interface ProductDetailProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number, variant: string) => void;
  onBuyNow?: (product: Product, quantity: number, variant: string) => void;
}

export default function ProductDetail({ product, onAddToCart, onBuyNow }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(product.images[0] ?? "");
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setActiveImage(product.images[0] ?? "");
    setSelectedVariant(product.variants?.[0] ?? "");
    setQuantity(1);
  }, [product]);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#ee4d2d]">Trang chủ</Link>
        <span>/</span><span>{product.category}</span><span>/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <section className="rounded-xl bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="min-w-0">
            <div className="aspect-square overflow-hidden rounded-lg bg-[#f7f7f7]">
              <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={`Xem ảnh ${index + 1}`}
                  aria-pressed={activeImage === image}
                  onClick={() => setActiveImage(image)}
                  className={`aspect-square overflow-hidden rounded-md border-2 bg-[#f7f7f7] ${activeImage === image ? "border-[#ee4d2d]" : "border-transparent hover:border-gray-300"}`}>
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-medium text-[#ee4d2d]">{product.brand} · {product.category}</p>
            <h1 className="mt-2 text-2xl font-semibold leading-snug text-gray-900 sm:text-3xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="text-amber-500">★★★★★ <span className="text-gray-600">{product.rating.toFixed(1)}</span></span>
              <span className="text-gray-500"><strong className="font-semibold text-gray-800">{product.reviewCount}</strong> đánh giá</span>
              <span className="text-gray-500">Đã bán <strong className="font-semibold text-gray-800">{product.soldLabel}</strong></span>
            </div>

            <div className="mt-6 rounded-lg bg-[#fff8f6] p-4 sm:p-5">
              {product.oldPrice && <span className="text-sm text-gray-400 line-through">{product.oldPrice}</span>}
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-bold text-[#ee4d2d]">{product.price}</span>
                {product.discountLabel && <span className="rounded bg-[#ee4d2d]/10 px-2 py-1 text-xs font-semibold text-[#ee4d2d]">{product.discountLabel}</span>}
              </div>
              <p className="mt-1 text-xs text-gray-500">Đã bao gồm thuế · Giá tốt trong hôm nay</p>
            </div>

            {product.variants && product.variants.length > 0 && <div className="mt-6 border-b border-gray-100 pb-6">
              <p className="mb-3 text-sm font-medium text-gray-800">
                {product.variantLabel ?? "Phân loại hàng"}
                {product.variantHint && <span className="font-normal text-gray-400"> ({product.variantHint})</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button key={variant} type="button" aria-pressed={selectedVariant === variant} onClick={() => setSelectedVariant(variant)}
                    className={`min-w-12 rounded-md border px-3 py-2 text-sm transition ${selectedVariant === variant ? "border-[#ee4d2d] bg-[#fff8f6] text-[#ee4d2d]" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}>
                    {variant}
                  </button>
                ))}
              </div>
            </div>}

            <div className="mt-5 flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Số lượng</span>
              <div className="flex h-10 items-center rounded-md border border-gray-200">
                <button type="button" aria-label="Giảm số lượng" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-full w-10 text-lg text-gray-600 hover:bg-gray-50">−</button>
                <span className="min-w-10 text-center text-sm">{quantity}</span>
                <button type="button" aria-label="Tăng số lượng" onClick={() => setQuantity((value) => value + 1)} className="h-full w-10 text-lg text-gray-600 hover:bg-gray-50">+</button>
              </div>
              {product.stockLabel && <span className="text-sm text-gray-400">{product.stockLabel}</span>}
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => onAddToCart?.(product, quantity, selectedVariant)} className="h-12 rounded-lg border border-[#ee4d2d] bg-[#fff8f6] px-5 font-semibold text-[#ee4d2d] transition hover:bg-[#fff0eb]">＋ Thêm vào giỏ</button>
              <button type="button" onClick={() => onBuyNow?.(product, quantity, selectedVariant)} className="h-12 rounded-lg bg-[#ee4d2d] px-5 font-semibold text-white transition hover:bg-[#d94325]">Mua ngay</button>
            </div>

            <div className="mt-7 grid gap-3 border-t border-gray-100 pt-5 text-sm text-gray-600 sm:grid-cols-2">
              <p><span className="mr-2 text-[#ee4d2d]">✓</span>Miễn phí vận chuyển cho đơn từ 500.000₫</p>
              <p><span className="mr-2 text-[#ee4d2d]">↺</span>Đổi trả miễn phí trong 15 ngày</p>
              <p><span className="mr-2 text-[#ee4d2d]">♧</span>Hàng chính hãng 100%</p>
              <p><span className="mr-2 text-[#ee4d2d]">▣</span>Thanh toán an toàn</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900">Mô tả sản phẩm</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">{product.description}</p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-600">
          {product.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
      </section>
    </div>
  );
}
