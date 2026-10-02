"use client";

import Link from "next/link";
import { CartIcon } from "@/components/CartIcon";
import { selectCount, useCartHydrated, useCartStore } from "@/store/cart";

// Lien « panier » de l'en-tête : une icône, avec le nombre d'articles en pastille.
export function CartLink() {
  useCartHydrated();
  const count = useCartStore(selectCount);

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier"}
      className="relative flex h-9 w-9 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100 hover:text-stone-900"
    >
      <CartIcon className="h-5.5 w-5.5" />
      {count > 0 && (
        <span
          // La clé relance la petite animation à chaque changement de quantité.
          key={count}
          className="animate-pop absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent-600 px-1 text-[0.6875rem] leading-none font-semibold text-white tabular-nums"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
