import type { Metadata } from "next";
import { DeliveryDetails } from "@/components/DeliveryDetails";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { requireAdminPage } from "@/lib/guards";
import { listAllOrders } from "@/lib/orders";
import { PAYMENT_METHOD_LABELS } from "@/lib/types";

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
          <table className="table-cards w-full text-left text-sm md:min-w-[58rem]">
            <thead className="border-b border-stone-200 text-stone-500">
              <tr>
                <th className="p-3 font-medium">Commande</th>
                <th className="p-3 font-medium">Client</th>
                <th className="p-3 font-medium">Livraison</th>
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
                  <td data-label="Client" className="p-3">
                    <div>
                      <p>{order.users?.name ?? "Client supprimé"}</p>
                      <p className="wrap-anywhere text-stone-500">{order.users?.email}</p>
                    </div>
                  </td>
                  <td data-label="Livraison" className="p-3">
                    <DeliveryDetails order={order} compact />
                  </td>
                  <td data-label="Articles" className="p-3 text-stone-600">
                    <div>
                      {order.order_items.map((item) => (
                        <p key={item.id}>
                          {item.quantity} × {item.product_name}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td data-label="Total" className="p-3 text-right font-semibold tabular-nums">
                    {formatPrice(order.total_cents)}
                  </td>
                  <td data-label="Statut" className="p-3">
                    <div>
                      <OrderStatusSelect orderId={order.id} status={order.status} />
                      {order.payment_method && (
                        <p className="mt-1 text-xs text-stone-500">{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
                      )}
                    </div>
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
