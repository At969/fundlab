"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon } from "@/components/CartIcon";
import { formatPrice } from "@/lib/format";
import { selectCount, selectTotalCents, useCartHydrated, useCartStore } from "@/store/cart";

// Pages où le bouton serait redondant (panier, validation), gênant (paiement d'une commande)
// ou hors sujet (connexion, administration).
const HIDDEN_PREFIXES = ["/cart", "/checkout", "/orders", "/admin", "/login", "/register"];

// Panier flottant, fixé en bas à droite de la boutique : il suit le visiteur pendant qu'il
// parcourt les produits et affiche le montant dès qu'il y a un article.
export function FloatingCart() {
  const pathname = usePathname();
  const hydrated = useCartHydrated();
  const count = useCartStore(selectCount);
  const totalCents = useCartStore(selectTotalCents);

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (hidden || !hydrated) return null;

  return (
    <Link
      href="/cart"
      aria-label={
        count > 0
          ? `Voir le panier : ${count} article${count > 1 ? "s" : ""}, ${formatPrice(totalCents)}`
          : "Voir le panier (vide)"
      }
      className="animate-fade-up fixed right-4 bottom-4 z-30 flex h-14 items-center gap-3 rounded-full bg-brand-900 pr-5 pl-4 text-white shadow-xl shadow-brand-950/30 transition hover:-translate-y-0.5 hover:bg-brand-700 sm:right-6 sm:bottom-6"
    >
      <span className="relative">
        <CartIcon className="h-6 w-6" />
        {count > 0 && (
          <span
            // La clé relance la petite animation à chaque changement de quantité.
            key={count}
            className="animate-pop absolute -top-2 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-400 px-1 text-xs leading-none font-bold text-brand-950 tabular-nums"
          >
            {count}
          </span>
        )}
      </span>
      <span className="text-sm font-semibold tabular-nums">{count > 0 ? formatPrice(totalCents) : "Panier"}</span>
    </Link>
  );
}
