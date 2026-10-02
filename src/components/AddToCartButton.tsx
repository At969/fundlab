"use client";

import { useCartStore } from "@/store/cart";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product, className }: { product: Product; className: string }) {
  const add = useCartStore((state) => state.add);
  const inCart = useCartStore(
    (state) => state.items.find((item) => item.productId === product.id)?.quantity ?? 0,
  );
  const soldOut = product.stock <= 0;

  return (
    <button
      type="button"
      onClick={() => add(product)}
      disabled={soldOut || inCart >= product.stock}
      className={className}
    >
      {soldOut ? "Rupture de stock" : inCart > 0 ? `Ajouter au panier (${inCart})` : "Ajouter au panier"}
    </button>
  );
}
