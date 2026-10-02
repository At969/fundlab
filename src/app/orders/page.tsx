import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { requireUserPage } from "@/lib/guards";
import { listOrdersForUser } from "@/lib/orders";

export const metadata: Metadata = { title: "Mes commandes" };

export default async function OrdersPage() {
  const user = await requireUserPage("/orders");
  const orders = await listOrdersForUser(user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <p className="text-stone-600">Vous n&apos;avez pas encore passé de commande.</p>
          <Link href="/" className="mt-3 inline-block font-medium text-emerald-700 hover:underline">
            Voir les produits
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {orders.map((order) => {
            const count = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 p-4 hover:bg-stone-50"
                >
                  <div>
                    <p className="font-medium">Commande n° {shortId(order.id)}</p>
                    <p className="text-sm text-stone-500">
                      {formatDate(order.created_at)} · {count} article{count > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.status} />
                    <span className="font-semibold tabular-nums">{formatPrice(order.total_cents)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
