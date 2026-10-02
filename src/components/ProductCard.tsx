"use client";

import Image from "next/image";
import Link from "next/link";
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
  const href = `/products/${product.id}`;
  const image = product.image_urls[0];

  return (
    <li className="group flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Lien décoratif : le nom du produit, juste en dessous, porte déjà le même lien. */}
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-[4/3] overflow-hidden bg-stone-100">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center bg-emerald-50 text-5xl font-semibold text-emerald-700/40">
            {product.name.charAt(0)}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h2 className="font-medium">
          <Link href={href} className="hover:text-emerald-700 hover:underline">
            {product.name}
          </Link>
        </h2>
        <p className="line-clamp-2 flex-1 text-sm text-stone-600">{product.description}</p>

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
            className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {inCart > 0 ? `Ajouter (${inCart})` : "Ajouter"}
          </button>
        </div>
      </div>
    </li>
  );
}
