"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

export type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  stock: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const clamp = (quantity: number, stock: number) => Math.max(1, Math.min(quantity, stock));

// Les prix gardés ici ne servent qu'à l'affichage : à la commande,
// le serveur recalcule le total à partir des prix en base.
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product) =>
        set((state) => {
          if (product.stock <= 0) return state;
          const existing = state.items.find((item) => item.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, stock: product.stock, quantity: clamp(item.quantity + 1, product.stock) }
                  : item,
              ),
            };
          }
          const item: CartItem = {
            productId: product.id,
            name: product.name,
            priceCents: product.price_cents,
            stock: product.stock,
            quantity: 1,
          };
          return { items: [...state.items, item] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: clamp(quantity, item.stock) } : item,
          ),
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    // Réhydratation déclenchée à la main (voir useCartHydrated) : le premier rendu client
    // reste identique au rendu serveur, qui ne connaît pas le localStorage.
    { name: "fundlabshop-cart", skipHydration: true },
  ),
);

let rehydration: Promise<void> | void;

export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    rehydration ??= useCartStore.persist.rehydrate();
    Promise.resolve(rehydration).then(() => setHydrated(true));
  }, []);
  return hydrated;
}

export const selectCount = (state: CartState) =>
  state.items.reduce((count, item) => count + item.quantity, 0);

export const selectTotalCents = (state: CartState) =>
  state.items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
