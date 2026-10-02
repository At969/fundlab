"use client";

import Link from "next/link";
import { selectCount, useCartHydrated, useCartStore } from "@/store/cart";

export function CartLink() {
  useCartHydrated();
  const count = useCartStore(selectCount);

  return (
    <Link href="/cart" className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900">
      Panier
      {count > 0 && (
        <span
          // La clé relance la petite animation à chaque changement de quantité.
          key={count}
          className="animate-pop rounded-full bg-brand-900 px-2 py-0.5 text-xs font-medium text-white tabular-nums"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
