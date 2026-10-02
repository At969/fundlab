import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { DeliveryDetails } from "@/components/DeliveryDetails";
import { PayForm } from "@/components/PayForm";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { requireCustomerPage } from "@/lib/guards";
import { getOrderForUser } from "@/lib/orders";
import { PAYMENT_METHOD_LABELS } from "@/lib/types";
import { idSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Détail de la commande" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCustomerPage(`/orders/${id}`);
  if (!idSchema.safeParse(id).success) notFound();

  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <BackLink href="/orders">Mes commandes</BackLink>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Commande n° {shortId(order.id)}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-stone-500">Passée le {formatDate(order.created_at)}</p>

      <ul className="mt-6 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {order.order_items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 p-4">
            <span>
              {item.product_name}{" "}
              <span className="text-stone-500">
                × {item.quantity} · {formatPrice(item.unit_price_cents)} l&apos;unité
              </span>
            </span>
            <span className="font-medium tabular-nums">{formatPrice(item.unit_price_cents * item.quantity)}</span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-4 p-4 font-semibold">
          <span>Total</span>
          <span className="text-lg tabular-nums">{formatPrice(order.total_cents)}</span>
        </li>
      </ul>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Livraison</h2>
          <DeliveryDetails order={order} />
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Paiement</h2>
          <p className="mt-2">
            {order.payment_method
              ? PAYMENT_METHOD_LABELS[order.payment_method]
              : order.status === "pending"
                ? "En attente de paiement"
                : "Non renseigné"}
          </p>
          {order.paid_at && <p className="text-sm text-stone-500">Payée le {formatDate(order.paid_at)}</p>}
        </section>
      </div>

      {order.status === "pending" && (
        <PayForm orderId={order.id} amount={order.total_cents} defaultPhone={order.delivery_phone ?? ""} />
      )}
    </div>
  );
}
