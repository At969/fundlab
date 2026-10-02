"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, type ClientApiError } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";
import { selectTotalCents, useCartHydrated, useCartStore } from "@/store/cart";

const inputClass =
  "rounded-md border border-stone-300 bg-white px-3 py-2 text-base font-normal outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-500/25";

export function CheckoutView({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const totalCents = useCartStore(selectTotalCents);
  const clear = useCartStore((state) => state.clear);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ClientApiError | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const result = await api<{ id: string }>("/api/orders", "POST", {
      delivery: Object.fromEntries(form),
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });
    if (result.error) {
      setError(result.error);
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
        <Link href="/products" className="mt-3 inline-block font-medium text-accent-700 hover:underline">
          Voir les produits
        </Link>
      </div>
    );
  }

  // Seules les erreurs de livraison se rattachent à un champ ; les autres (panier, stock)
  // s'affichent en message général.
  const deliveryErrors = Object.keys(error?.fields ?? {}).some((key) => key.startsWith("delivery."));
  const fieldError = (name: string) => {
    const message = error?.fields?.[`delivery.${name}`]?.[0];
    return message ? <span className="font-normal text-red-600">{message}</span> : null;
  };

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-8 md:grid-cols-[1fr_20rem] md:items-start">
      <fieldset className="rounded-lg border border-stone-200 bg-white p-5">
        <legend className="px-1 font-semibold">Informations de livraison</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Nom du destinataire
            <input name="name" autoComplete="name" defaultValue={defaultName} className={inputClass} />
            {fieldError("name")}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Téléphone
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01 97 00 00 00" className={inputClass} />
            {fieldError("phone")}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
            Adresse
            <input name="address" autoComplete="street-address" placeholder="Quartier, rue, repère" className={inputClass} />
            {fieldError("address")}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
            Ville
            <input name="city" autoComplete="address-level2" className={inputClass} />
            {fieldError("city")}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
            Instructions pour le livreur <span className="font-normal text-stone-500">(facultatif)</span>
            <textarea name="notes" rows={2} className={inputClass} />
            {fieldError("notes")}
          </label>
        </div>
      </fieldset>

      <aside className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="font-semibold">Votre commande</h2>
        <ul className="mt-3 divide-y divide-stone-200 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex items-start justify-between gap-4 py-2">
              <span>
                {item.name} <span className="text-stone-500">× {item.quantity}</span>
              </span>
              <span className="font-medium whitespace-nowrap tabular-nums">
                {formatPrice(item.priceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-stone-200 pt-3 font-semibold">
          <span>Total</span>
          <span className="text-lg whitespace-nowrap tabular-nums">{formatPrice(totalCents)}</span>
        </div>
        <p className="mt-2 text-xs text-stone-500">
          Le montant définitif est recalculé à la validation, à partir des prix en vigueur.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {deliveryErrors ? "Vérifiez les informations de livraison." : error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-md bg-brand-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Validation…" : "Confirmer la commande"}
        </button>
        <p className="mt-2 text-center text-xs text-stone-500">Le paiement se fait à l&apos;étape suivante.</p>
      </aside>
    </form>
  );
}
