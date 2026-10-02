"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((state) => state.add);
  const inCart = useCartStore(
    (state) => state.items.find((item) => item.productId === product.id)?.quantity ?? 0,
  );
  const soldOut = product.stock <= 0;
  const maxReached = inCart >= product.stock;

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white">
      {product.image_url ? (
        <div className="relative aspect-[4/3] bg-stone-100">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          aria-hidden
          className="flex aspect-[4/3] items-center justify-center bg-emerald-50 text-5xl font-semibold text-emerald-700/40"
        >
          {product.name.charAt(0)}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h2 className="font-medium">{product.name}</h2>
        <p className="flex-1 text-sm text-stone-600">{product.description}</p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold tabular-nums">{formatPrice(product.price_cents)}</p>
            <p className="text-xs text-stone-500">
              {soldOut ? "Rupture de stock" : `${product.stock} en stock`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => add(product)}
            disabled={soldOut || maxReached}
            className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {inCart > 0 ? `Ajouter (${inCart})` : "Ajouter"}
          </button>
        </div>
      </div>
    </li>
  );
}
