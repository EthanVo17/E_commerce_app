import { Link } from "react-router-dom";
import ProductCart from "@/components/ui/productCart/ProductCart";
import { products } from "@/data/products";

export default function HomePage() {
  return (
    <div>
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#fff1eb] to-[#fff8f4] px-6 py-10 sm:px-10 sm:py-14">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ee4d2d]">
            Mùa mới · Phong cách mới
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Tìm món đồ dành riêng cho bạn
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-gray-600 sm:text-base">
            Khám phá sản phẩm được yêu thích, giá tốt mỗi ngày và trải nghiệm
            mua sắm thật dễ dàng.
          </p>
          <Link
            to={`/product/${products[0].id}`}
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#ee4d2d] px-6 text-sm font-semibold text-white transition hover:bg-[#d94325]">
            Khám phá ngay
          </Link>
        </div>
      </section>

      <section className="mt-9 sm:mt-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ee4d2d]">
              Dành cho bạn
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
              Sản phẩm nổi bật
            </h2>
          </div>
          <Link
            to={`/product/see_all_product`}
            className="text-sm font-medium text-[#ee4d2d] hover:underline">
            Xem chi tiết →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCart key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
