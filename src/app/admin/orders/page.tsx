import type { Metadata } from "next";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { requireAdminPage } from "@/lib/guards";
import { listAllOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "Commandes" };

export default async function AdminOrdersPage() {
  await requireAdminPage("/admin/orders");
  const orders = await listAllOrders();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Commandes</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-stone-600">Aucune commande pour le moment.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-stone-200 text-stone-500">
              <tr>
                <th className="p-3 font-medium">Commande</th>
                <th className="p-3 font-medium">Client</th>
                <th className="p-3 font-medium">Articles</th>
                <th className="p-3 text-right font-medium">Total</th>
                <th className="p-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {orders.map((order) => (
                <tr key={order.id} className="align-top">
                  <td className="p-3">
                    <p className="font-medium">n° {shortId(order.id)}</p>
                    <p className="text-stone-500">{formatDate(order.created_at)}</p>
                  </td>
                  <td className="p-3">
                    <p>{order.users?.name ?? "Client supprimé"}</p>
                    <p className="text-stone-500">{order.users?.email}</p>
                  </td>
                  <td className="p-3 text-stone-600">
                    {order.order_items.map((item) => (
                      <p key={item.id}>
                        {item.quantity} × {item.product_name}
                      </p>
                    ))}
                  </td>
                  <td className="p-3 text-right font-semibold tabular-nums">{formatPrice(order.total_cents)}</td>
                  <td className="p-3">
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
