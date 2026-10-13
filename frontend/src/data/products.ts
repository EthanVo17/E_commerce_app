import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "pegasus-41",
    name: "Giày thể thao Pegasus 41",
    brand: "NIKE",
    category: "Thể thao",
    price: "2.490.000₫",
    oldPrice: "2.990.000₫",
    discountLabel: "-17%",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1100&q=85",
      "https://images.unsplash.com/photo-1600266328721-52fd3d6f8a08?auto=format&fit=crop&w=1100&q=85",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1100&q=85",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1100&q=85&sat=-25",
    ],
    rating: 4.8,
    reviewCount: 126,
    soldLabel: "1,2k",
    variants: ["38", "39", "40", "41", "42", "43"],
    variantLabel: "Chọn kích cỡ",
    variantHint: "EU",
    stockLabel: "Còn 24 sản phẩm",
    description:
      "Pegasus 41 mang đến cảm giác êm ái và linh hoạt cho những buổi chạy bộ hằng ngày. Thiết kế nhẹ, thoáng khí cùng đệm đàn hồi giúp bạn thoải mái từ đường chạy đến những hoạt động thường ngày.",
    highlights: [
      "Thân giày lưới nhẹ và thoáng khí",
      "Đệm êm, hỗ trợ chuyển động tự nhiên",
      "Phù hợp chạy bộ và sử dụng hằng ngày",
    ],
  },
  {
    id: "air-max-90",
    name: "Giày Air Max 90 Essential",
    brand: "NIKE",
    category: "Thời trang",
    price: "2.790.000₫",
    oldPrice: "3.190.000₫",
    discountLabel: "-13%",
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1100&q=85",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1100&q=85",
    ],
    rating: 4.7,
    reviewCount: 84,
    soldLabel: "860",
    variants: ["39", "40", "41", "42", "43"],
    variantLabel: "Chọn kích cỡ",
    variantHint: "EU",
    stockLabel: "Còn 12 sản phẩm",
    description:
      "Thiết kế kinh điển kết hợp đệm êm và chất liệu bền bỉ, phù hợp để đi hằng ngày và phối cùng nhiều phong cách khác nhau.",
    highlights: [
      "Phong cách cổ điển dễ phối đồ",
      "Đệm êm cho cảm giác thoải mái cả ngày",
      "Đế cao su bám đường tốt",
    ],
  },
];
