import { Link, useParams } from "react-router-dom";
import ProductDetail from "@/components/ui/productDetail/ProductDetail";
import { products } from "@/data/products";
import NotFoundPage from "@/pages/NotFoundPage";

export default function ProductPage() {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);

  return product ? (
    <ProductDetail product={product} />
  ) : (
    <Link to="/404_not_found">
      <NotFoundPage />
    </Link>
  );
}
