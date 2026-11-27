import { create } from "zustand";

export interface CartItem {
  key: string;
  productId: string;
  slug?: string;
  name: string;
  image: string;
  unitPrice: number;
  priceLabel: string;
  variant?: string;
  sku?: string;
  quantity: number;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  getTotalQuantity: () => number;
}

function buildCartItemKey(
  productId: string,
  sku?: string,
  variant?: string,
): string {
  return `${productId}::${sku ?? variant ?? "default"}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const key = buildCartItemKey(item.productId, item.sku, item.variant);
    set((state) => {
      const existing = state.items.find((entry) => entry.key === key);
      if (existing) {
        const nextQty = existing.quantity + item.quantity;
        const clampedQty =
          typeof item.maxStock === "number" && item.maxStock > 0
            ? Math.min(nextQty, item.maxStock)
            : nextQty;
        return {
          items: state.items.map((entry) =>
            entry.key === key
              ? { ...entry, quantity: clampedQty, maxStock: item.maxStock ?? entry.maxStock }
              : entry,
          ),
        };
      }

      const initialQty =
        typeof item.maxStock === "number" && item.maxStock > 0
          ? Math.min(Math.max(1, item.quantity), item.maxStock)
          : Math.max(1, item.quantity);

      return {
        items: [...state.items, { ...item, key, quantity: initialQty }],
      };
    });
  },

  removeItem: (key) =>
    set((state) => ({
      items: state.items.filter((entry) => entry.key !== key),
    })),

  updateQuantity: (key, quantity) =>
    set((state) => ({
      items: state.items
        .map((entry) => {
          if (entry.key !== key) return entry;
          const clamped =
            typeof entry.maxStock === "number" && entry.maxStock > 0
              ? Math.min(quantity, entry.maxStock)
              : quantity;
          return { ...entry, quantity: clamped };
        })
        .filter((entry) => entry.quantity > 0),
    })),

  clearCart: () => set({ items: [] }),

  getTotalQuantity: () =>
    get().items.reduce((sum, entry) => sum + entry.quantity, 0),
}));
