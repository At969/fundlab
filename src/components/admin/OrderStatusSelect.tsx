"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client-api";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: OrderStatus) {
    setPending(true);
    setError(null);
    const result = await api(`/api/admin/orders/${orderId}`, "PATCH", { status: next });
    if (result.error) setError(result.error.message);
    else router.refresh();
    setPending(false);
  }

  return (
    <div>
      <select
        aria-label="Statut de la commande"
        value={status}
        disabled={pending}
        onChange={(event) => change(event.target.value as OrderStatus)}
        className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm disabled:opacity-60"
      >
        {ORDER_STATUSES.map((value) => (
          <option key={value} value={value}>
            {ORDER_STATUS_LABELS[value]}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
