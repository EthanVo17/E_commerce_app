import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import ProductPage from "@/pages/ProductPage";
import axiosClient from "@/api/axiosClient";
import { useCartStore } from "@/stores/cartStore";

vi.mock("@/api/axiosClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(axiosClient.get);

const SAMPLE_DETAIL_PRODUCT = {
  _id: "665f1a2b3c4d5e6f7a8b9c0d",
  slug: "nike-pegasus-41",
  name: "Giày Nike Pegasus 41",
  brand: "NIKE",
  category: { _id: "cat-1", name: "Thể thao", slug: "the-thao" },
  price: 2490000,
  oldPrice: 2990000,
  originalPrice: 2990000,
  discountPercentage: 17,
  images: [
    "https://example.com/shoe-1.jpg",
    "https://example.com/shoe-2.jpg",
  ],
  rating: 4.8,
  reviewCount: 126,
  soldCount: 540,
  stock: 5,
  description: "Đôi giày chạy bộ êm ái cho mọi cự ly.",
  highlights: ["Thoáng khí", "Đệm đàn hồi"],
  specifications: [
    { key: "Thương hiệu", value: "NIKE" },
    { key: "Chất liệu", value: "Vải lưới Mesh" },
  ],
  options: [
    {
      name: "Kích cỡ",
      values: [
        { value: "41", label: "EU 41" },
        { value: "42", label: "EU 42" },
      ],
    },
  ],
  variants: [
    {
      sku: "PEG-41",
      options: { "Kích cỡ": "41" },
      price: 2490000,
      oldPrice: 2990000,
      stock: 2,
      isActive: true,
    },
    {
      sku: "PEG-42",
      options: { "Kích cỡ": "42" },
      price: 2690000,
      oldPrice: 2990000,
      stock: 4,
      isActive: true,
    },
  ],
};

describe("ProductPage & ProductDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.getState().clearCart();
  });

  it("renders product detail, switches variants, clamps quantity to stock, and adds to cart", async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: SAMPLE_DETAIL_PRODUCT,
      },
    });

    render(
      <MemoryRouter initialEntries={["/product/nike-pegasus-41"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("product-detail-loading")).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: "Giày Nike Pegasus 41" }),
    ).toBeInTheDocument();
    expect(mockedGet).toHaveBeenCalledWith("/products/nike-pegasus-41");

    // Specifications & Description
    expect(screen.getByText("Thông số kỹ thuật")).toBeInTheDocument();
    expect(screen.getByText("Vải lưới Mesh")).toBeInTheDocument();
    expect(
      screen.getByText("Đôi giày chạy bộ êm ái cho mọi cự ly."),
    ).toBeInTheDocument();

    // Default variant EU 41 -> stock 2, price 2.490.000₫
    expect(screen.getByText("2.490.000₫")).toBeInTheDocument();
    expect(screen.getByText("Còn 2 sản phẩm")).toBeInTheDocument();

    // Quantity clamped at stock = 2
    const increaseBtn = screen.getByRole("button", { name: "Tăng số lượng" });
    fireEvent.click(increaseBtn);
    expect(screen.getByTestId("product-quantity")).toHaveTextContent("2");
    expect(increaseBtn).toBeDisabled();

    // Switch to variant EU 42 -> updates price & stock
    fireEvent.click(screen.getByRole("button", { name: "EU 42" }));
    expect(screen.getByText("2.690.000₫")).toBeInTheDocument();
    expect(screen.getByText("Còn 4 sản phẩm")).toBeInTheDocument();
    expect(screen.getByTestId("product-quantity")).toHaveTextContent("1");

    // Add to Zustand cart store
    fireEvent.click(
      screen.getByRole("button", { name: /Thêm vào giỏ hàng/i }),
    );
    await waitFor(() => {
      const cartItems = useCartStore.getState().items;
      expect(cartItems).toHaveLength(1);
      expect(cartItems[0]?.sku).toBe("PEG-42");
      expect(cartItems[0]?.unitPrice).toBe(2690000);
      expect(cartItems[0]?.quantity).toBe(1);
    });
  });

  it("renders 404 NotFoundPage when API returns 404", async () => {
    const axios404Error = new axios.AxiosError(
      "Not Found",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {} as never,
        data: { success: false, message: "Product not found" },
      },
    );
    mockedGet.mockRejectedValueOnce(axios404Error);

    render(
      <MemoryRouter initialEntries={["/product/does-not-exist"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/404/i)).toBeInTheDocument();
  });
});
