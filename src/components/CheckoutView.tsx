"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";
import { selectTotalCents, useCartHydrated, useCartStore } from "@/store/cart";

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const totalCents = useCartStore(selectTotalCents);
  const clear = useCartStore((state) => state.clear);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setPending(true);
    setError(null);
    const result = await api<{ id: string }>("/api/orders", "POST", {
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });
    if (result.error) {
      setError(result.error.message);
      setPending(false);
      return;
    }
    // On quitte la page avant de vider le panier, sinon l'écran « panier vide » clignote.
    router.replace(`/orders/${result.data.id}`);
    clear();
  }

  if (!hydrated) {
    return <p className="mt-6 text-stone-500">Chargement…</p>;
  }

  if (items.length === 0 && !pending) {
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
    <div className="mt-6 max-w-xl">
      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between gap-4 p-4">
            <span>
              {item.name} <span className="text-stone-500">× {item.quantity}</span>
            </span>
            <span className="font-medium tabular-nums">{formatPrice(item.priceCents * item.quantity)}</span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-4 p-4 font-semibold">
          <span>Total</span>
          <span className="text-lg tabular-nums">{formatPrice(totalCents)}</span>
        </li>
      </ul>

      <p className="mt-3 text-sm text-stone-500">
        Le montant définitif est recalculé à la validation, à partir des prix en vigueur.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Validation…" : "Confirmer la commande"}
        </button>
        <Link href="/cart" className="text-sm text-stone-600 hover:text-stone-900">
          Modifier le panier
        </Link>
      </div>
    </div>
  );
}
