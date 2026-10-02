"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, type ClientApiError } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/types";

const SIMULATED_DELAY_MS = 2000;
const inputClass =
  "rounded-md border border-stone-300 bg-white px-3 py-2 text-base font-normal outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-500/25";

type Props = { orderId: string; amount: number; defaultPhone: string };

// Paiement par mobile money, simulé : aucun opérateur n'est contacté.
export function PayForm({ orderId, amount, defaultPhone }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ClientApiError | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    setPending(true);
    setError(null);

    // Faux délai : le temps que le client « valide » la demande sur son téléphone.
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
    const result = await api(`/api/orders/${orderId}/pay`, "POST", body);

    if (result.error) setError(result.error);
    else router.refresh();
    setPending(false);
  }

  const fieldError = (name: string) => {
    const message = error?.fields?.[name]?.[0];
    return message ? <span className="text-sm font-normal text-red-600">{message}</span> : null;
  };

  return (
    <section className="mt-6 rounded-lg border border-stone-200 bg-white p-5">
      <h2 className="font-semibold">Payer par mobile money</h2>
      <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Paiement simulé : aucun compte n&apos;est débité et le numéro n&apos;est pas enregistré.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-4">
        <fieldset>
          <legend className="text-sm font-medium">Opérateur</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method, index) => (
              <label
                key={method}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-stone-300 px-3 py-2.5 text-sm font-medium has-checked:border-accent-500 has-checked:bg-accent-50"
              >
                <input
                  type="radio"
                  name="method"
                  value={method}
                  defaultChecked={index === 0}
                  className="h-4 w-4 accent-brand-900"
                />
                {PAYMENT_METHOD_LABELS[method]}
              </label>
            ))}
          </div>
          {fieldError("method")}
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Numéro mobile money
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={defaultPhone}
            placeholder="01 97 00 00 00"
            className={inputClass}
          />
          {fieldError("phone")}
        </label>

        {error && !error.fields && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.message}
          </p>
        )}

        {pending && (
          <p role="status" className="rounded-md bg-accent-50 px-3 py-2 text-sm text-accent-800">
            Demande envoyée : validez le paiement sur votre téléphone…
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "En attente de validation…" : `Payer ${formatPrice(amount)}`}
        </button>
      </form>
    </section>
  );
}
