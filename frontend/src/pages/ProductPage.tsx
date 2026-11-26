import { Link, useParams } from "react-router-dom";
import React from "react";
import ProductDetail from "@/components/ui/productDetail/ProductDetail";
// import { products } from "@/data/products";
import NotFoundPage from "@/pages/NotFoundPage";
import axiosClient from "@/api/axiosClient";

export default function ProductPage() {
  const [products, setProducts] = React.useState({});
  // const { productId } = useParams();
  // const product = products.find((item) => item.id === productId);

  const handleGetProduct = async () => {
    try {
      const response = await axiosClient.get("/products");
      setProducts(response.data);
    } catch (err) {
      return err;
    }
  };

  return product ? (
    <ProductDetail product={product} />
  ) : (
    <Link to="/404_not_found">
      <NotFoundPage />
    </Link>
  );
}
