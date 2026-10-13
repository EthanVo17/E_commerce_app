import { Link } from "react-router-dom";
import type { Product } from "@/types/product";

interface ProductCartProps {
  product: Product;
}

export default function ProductCart({ product }: ProductCartProps) {
  const image = product.images[0];

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="block" aria-label={`Xem ${product.name}`}>
        <div className="relative aspect-square overflow-hidden bg-[#f7f7f7]">
          <img
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            src={image}
            alt={product.name}
          />
          {product.discountLabel && (
            <span className="absolute left-3 top-3 rounded bg-[#ee4d2d] px-2 py-1 text-xs font-semibold text-white">
              {product.discountLabel}
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          {product.category}
        </p>
        <Link to={`/product/${product.id}`} className="line-clamp-2 min-h-12 font-medium text-gray-800 hover:text-[#ee4d2d]">
          {product.name}
        </Link>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#ee4d2d]">{product.price}</span>
          {product.oldPrice && <span className="text-xs text-gray-400 line-through">{product.oldPrice}</span>}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span className="text-amber-500">★ {product.rating.toFixed(1)} <span className="text-gray-400">({product.reviewCount})</span></span>
          <span>Đã bán {product.soldLabel}</span>
        </div>
      </div>
    </article>
  );
}
