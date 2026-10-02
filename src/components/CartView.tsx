"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { selectTotalCents, useCartHydrated, useCartStore, type CartItem } from "@/store/cart";

export function CartView() {
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const totalCents = useCartStore(selectTotalCents);
  const clear = useCartStore((state) => state.clear);

  if (!hydrated) {
    return <p className="mt-6 text-stone-500">Chargement du panier…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-6">
        <p className="text-stone-600">Votre panier est vide.</p>
        <Link href="/" className="mt-3 inline-block font-medium text-emerald-700 hover:underline">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-[1fr_18rem] md:items-start">
      <div>
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {items.map((item) => (
            <CartRow key={item.productId} item={item} />
          ))}
        </ul>
        <button type="button" onClick={clear} className="mt-3 text-sm text-stone-500 hover:text-red-600">
          Vider le panier
        </button>
      </div>

      <aside className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-stone-600">Total</span>
          <span className="text-xl font-semibold tabular-nums">{formatPrice(totalCents)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 block rounded-md bg-emerald-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-800"
        >
          Passer la commande
        </Link>
      </aside>
    </div>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const stepClass =
    "h-8 w-8 rounded-md border border-stone-300 text-lg leading-none hover:bg-stone-100 disabled:opacity-40";

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
      <div className="min-w-40 flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-stone-500 tabular-nums">{formatPrice(item.priceCents)} l&apos;unité</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Retirer un exemplaire de ${item.name}`}
          onClick={() => setQuantity(item.productId, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className={stepClass}
        >
          −
        </button>
        <span aria-live="polite" className="w-6 text-center tabular-nums">
          {item.quantity}
        </span>
        <button
          type="button"
          aria-label={`Ajouter un exemplaire de ${item.name}`}
          onClick={() => setQuantity(item.productId, item.quantity + 1)}
          disabled={item.quantity >= item.stock}
          className={stepClass}
        >
          +
        </button>
      </div>

      <p className="w-20 text-right font-medium tabular-nums">
        {formatPrice(item.priceCents * item.quantity)}
      </p>

      <button
        type="button"
        onClick={() => remove(item.productId)}
        className="text-sm text-stone-500 hover:text-red-600"
      >
        Supprimer
      </button>
    </li>
  );
}
