import ProductCart from "@/components/ui/productCart/ProductCart";
import type { SearchResultsGridProps } from "@/types/search";

export default function SearchResultsGrid({
  products,
}: SearchResultsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCart key={product.id} product={product} />
      ))}
    </div>
  );
}
