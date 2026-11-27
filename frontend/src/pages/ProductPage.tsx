import { useCallback } from "react";
import { useParams } from "react-router-dom";
import ProductDetail, {
  type SelectedProductPurchase,
} from "@/components/ui/productDetail/ProductDetail";
import ProductDetailSkeleton from "@/components/ui/productDetail/ProductDetailSkeleton";
import SearchErrorState from "@/components/ui/search/SearchErrorState";
import { useProductDetail } from "@/hooks/useProductDetail";
import NotFoundPage from "@/pages/NotFoundPage";
import { useCartStore } from "@/stores/cartStore";
import { useToastStore } from "@/stores/toastStore";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, isLoading, isNotFound, error, retry } =
    useProductDetail(slug);

  const addItem = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);

  const handleAddToCart = useCallback(
    (selection: SelectedProductPurchase) => {
      addItem({
        productId: selection.product.id,
        slug: selection.product.slug,
        name: selection.product.name,
        image: selection.product.images[0] ?? "",
        unitPrice: selection.unitPrice,
        priceLabel: selection.priceLabel,
        variant: selection.variantLabel || undefined,
        sku: selection.sku,
        quantity: selection.quantity,
        maxStock: selection.maxStock,
      });
      addToast(
        `Đã thêm ${selection.quantity} "${selection.product.name}" vào giỏ hàng`,
        "success",
      );
    },
    [addItem, addToast],
  );

  const handleBuyNow = useCallback(
    (selection: SelectedProductPurchase) => {
      addItem({
        productId: selection.product.id,
        slug: selection.product.slug,
        name: selection.product.name,
        image: selection.product.images[0] ?? "",
        unitPrice: selection.unitPrice,
        priceLabel: selection.priceLabel,
        variant: selection.variantLabel || undefined,
        sku: selection.sku,
        quantity: selection.quantity,
        maxStock: selection.maxStock,
      });
      addToast(
        `Đã chọn mua ngay "${selection.product.name}" (x${selection.quantity})`,
        "info",
      );
    },
    [addItem, addToast],
  );

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isNotFound) {
    return <NotFoundPage />;
  }

  if (error) {
    return <SearchErrorState message={error} onRetry={retry} />;
  }

  if (!product) {
    return <NotFoundPage />;
  }

  return (
    <ProductDetail
      product={product}
      onAddToCart={handleAddToCart}
      onBuyNow={handleBuyNow}
    />
  );
}
