import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SearchInput from "@/components/ui/search/SearchInput";
import SearchPage from "@/pages/SearchPage";
import { mapApiProductToProduct } from "@/utils/productMapper";
import axiosClient from "@/api/axiosClient";

vi.mock("@/api/axiosClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(axiosClient.get);

describe("Search flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mapApiProductToProduct", () => {
    it("maps MongoDB product document to frontend Product shape", () => {
      const mapped = mapApiProductToProduct({
        _id: "665f1a2b3c4d5e6f7a8b9c0d",
        slug: "nike-pegasus-41",
        name: "Giày Nike Pegasus 41",
        brand: "NIKE",
        category: { _id: "cat-1", name: "Thể thao" },
        price: 2490000,
        oldPrice: 2990000,
        images: ["https://example.com/shoe.jpg"],
        rating: 4.8,
        reviewCount: 120,
        soldCount: 540,
        stock: 15,
      });

      expect(mapped.id).toBe("nike-pegasus-41");
      expect(mapped.category).toBe("Thể thao");
      expect(mapped.price).toBe("2.490.000₫");
      expect(mapped.oldPrice).toBe("2.990.000₫");
      expect(mapped.discountLabel).toBe("-17%");
      expect(mapped.soldLabel).toBe("540");
      expect(mapped.stockLabel).toBe("Còn 15 sản phẩm");
    });

    it("falls back safely when optional fields are missing", () => {
      const mapped = mapApiProductToProduct({
        _id: "abc123",
        name: "Basic Tee",
        price: 199000,
        oldPrice: 199000,
      });

      expect(mapped.id).toBe("abc123");
      expect(mapped.category).toBe("Sản phẩm");
      expect(mapped.oldPrice).toBeUndefined();
      expect(mapped.discountLabel).toBeUndefined();
      expect(mapped.images).toHaveLength(1);
      expect(mapped.rating).toBe(0);
    });
  });

  describe("SearchInput + SearchPage integration", () => {
    it("navigates to /search?q=... on submit and renders products returned by API", async () => {
      mockedGet.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Search successful",
          total: 1,
          data: {
            keyword: "Nike",
            products: [
              {
                _id: "p1",
                slug: "nike-air-max",
                name: "Nike Air Max 90",
                brand: "NIKE",
                category: { name: "Thời trang" },
                price: 2790000,
                oldPrice: 3190000,
                images: ["https://example.com/airmax.jpg"],
                rating: 4.7,
                reviewCount: 84,
                soldCount: 860,
              },
            ],
          },
        },
      });

      render(
        <MemoryRouter initialEntries={["/"]}>
          <SearchInput />
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </MemoryRouter>,
      );

      const input = screen.getByPlaceholderText("Search");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "Nike" } });
      fireEvent.submit(input.closest("form")!);

      await waitFor(() => {
        expect(mockedGet).toHaveBeenCalledTimes(1);
        expect(mockedGet).toHaveBeenCalledWith("/products/search", {
          params: { q: "Nike" },
        });
      });

      expect(await screen.findByText("Nike Air Max 90")).toBeInTheDocument();
      expect(screen.getByText("2.790.000₫")).toBeInTheDocument();
      expect(screen.getByText("Thời trang")).toBeInTheDocument();
    });

    it("shows empty state when API returns no products", async () => {
      mockedGet.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Search successful",
          total: 0,
          data: {
            keyword: "khongtontai",
            products: [],
          },
        },
      });

      render(
        <MemoryRouter initialEntries={["/search?q=khongtontai"]}>
          <Routes>
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(
        await screen.findByText(/Không tìm thấy sản phẩm nào khớp với/i),
      ).toBeInTheDocument();
    });

    it("shows error message when API request fails", async () => {
      mockedGet.mockRejectedValueOnce(new Error("Network error"));

      render(
        <MemoryRouter initialEntries={["/search?q=Nike"]}>
          <Routes>
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(
        await screen.findByText(/Không thể tải kết quả tìm kiếm/i),
      ).toBeInTheDocument();
    });
  });
});
