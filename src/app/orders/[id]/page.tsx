import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PayForm } from "@/components/PayForm";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { requireCustomerPage } from "@/lib/guards";
import { getOrderForUser } from "@/lib/orders";
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
      <Link href="/orders" className="text-sm text-stone-600 hover:text-stone-900">
        ← Mes commandes
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Commande n° {shortId(order.id)}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-stone-500">
        Passée le {formatDate(order.created_at)}
        {order.paid_at && ` · payée le ${formatDate(order.paid_at)}`}
      </p>

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

      {order.status === "pending" && <PayForm orderId={order.id} amount={order.total_cents} />}
    </div>
  );
}
