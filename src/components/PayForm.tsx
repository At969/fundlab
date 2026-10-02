"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, type ClientApiError } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";

const SIMULATED_DELAY_MS = 1500;
const inputClass =
  "rounded-md border border-stone-300 bg-white px-3 py-2 text-base font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";

export function PayForm({ orderId, amount }: { orderId: string; amount: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ClientApiError | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    setPending(true);
    setError(null);

    // Faux délai de traitement bancaire, pour rendre la simulation crédible.
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
    const result = await api(`/api/orders/${orderId}/pay`, "POST", body);

    if (result.error) setError(result.error);
    else router.refresh();
    setPending(false);
  }

  const fieldError = (name: string) => {
    const message = error?.fields?.[name]?.[0];
    return message ? <span className="font-normal text-red-600">{message}</span> : null;
  };

  return (
    <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5">
      <h2 className="font-semibold">Paiement</h2>
      <p className="mt-1 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Paiement simulé : aucune carte n&apos;est débitée et rien n&apos;est enregistré. Saisissez
        n&apos;importe quel numéro à 16 chiffres.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Numéro de carte
          <input
            name="cardNumber"
            inputMode="numeric"
            autoComplete="off"
            placeholder="4242 4242 4242 4242"
            className={inputClass}
          />
          {fieldError("cardNumber")}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Expiration
            <input name="expiry" autoComplete="off" placeholder="MM/AA" className={inputClass} />
            {fieldError("expiry")}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Code de sécurité
            <input name="cvc" inputMode="numeric" autoComplete="off" placeholder="123" className={inputClass} />
            {fieldError("cvc")}
          </label>
        </div>

        {error && !error.fields && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Paiement en cours…" : `Payer ${formatPrice(amount)}`}
        </button>
      </form>
    </section>
  );
}
