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
      {/* Photo affichée en entier (object-contain), jamais recadrée. Lien décoratif : le nom du
          produit, juste en dessous, porte déjà le même lien. */}
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-square overflow-hidden border-b border-stone-100 bg-white">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 320px, 50vw"
            className="object-contain p-2 transition duration-500 group-hover:scale-105 sm:p-4"
          />
        ) : (
          <span className="flex h-full items-center justify-center bg-accent-50 text-5xl font-semibold text-accent-700/40">
            {product.name.charAt(0)}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        {product.category && (
          <p className="truncate text-xs font-medium uppercase tracking-wide text-accent-700">{product.category}</p>
        )}
        <h2 className="line-clamp-2 text-sm font-medium sm:text-base">
          <Link href={href} className="hover:text-accent-700 hover:underline">
            {product.name}
          </Link>
        </h2>
        {/* Sur téléphone (deux cartes par ligne), la description est réservée à la fiche produit. */}
        <p className="line-clamp-2 flex-1 text-sm text-stone-600 max-sm:hidden">{product.description}</p>

        <div className="mt-auto flex flex-col gap-2 pt-2 sm:mt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-0">
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
            className="rounded-md bg-brand-900 px-3 py-2 text-sm max-sm:w-full font-medium text-white transition hover:bg-brand-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {inCart > 0 ? `Ajouter (${inCart})` : "Ajouter"}
          </button>
        </div>
      </div>
    </li>
  );
}
