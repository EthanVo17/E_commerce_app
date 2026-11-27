import ProductCart from "@/components/ui/productCart/ProductCart";
import type { SearchResultsGridProps } from "@/types/search";

export default function SearchResultsGrid({
  products,
}: SearchResultsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
      {products.map((product) => (
        <ProductCart key={product.id} product={product} />
      ))}
    </div>
  );
}
