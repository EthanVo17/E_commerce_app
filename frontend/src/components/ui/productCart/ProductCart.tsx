import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import type { Product } from "@/types/product";

interface ProductCartProps {
  product: Product;
}

export default function ProductCart({ product }: ProductCartProps) {
  const image = product.images[0];
  const productUrl = `/product/${product.slug || product.id}`;

  return (
    <Link
      to={productUrl}
      aria-label={`Xem ${product.name}`}
      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-[#f7f7f7]">
          <img
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            src={image}
            alt={product.name}
          />
          {product.discountLabel && (
            <span className="absolute right-2 top-2 rounded bg-[#ee4d2d] px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
              {product.discountLabel}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3.5">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
            {product.category}
          </p>
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-gray-800 group-hover:text-[#ee4d2d]">
            {product.name}
          </h3>
          <div className="mt-2.5 flex flex-wrap items-baseline gap-1.5">
            <span className="text-base font-bold text-[#ee4d2d]">
              {product.price}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                {product.oldPrice}
              </span>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 text-amber-500">
              <FontAwesomeIcon icon={faStar} className="text-[11px]" />
              <span>{product.rating.toFixed(1)}</span>
              {product.reviewCount > 0 && (
                <span className="text-gray-400">({product.reviewCount})</span>
              )}
            </span>
            <span>Đã bán {product.soldLabel}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
