import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { requireAdminPage } from "@/lib/guards";
import { listAllOrders } from "@/lib/orders";
import { listAllProducts } from "@/lib/products";
import { listUsers } from "@/lib/users";

const LOW_STOCK_THRESHOLD = 10;
const REVENUE_STATUSES = ["paid", "preparing", "delivered"];

export default async function AdminDashboardPage() {
  await requireAdminPage("/admin");
  const [orders, products, users] = await Promise.all([listAllOrders(), listAllProducts(), listUsers()]);

  const revenue = orders
    .filter((order) => REVENUE_STATUSES.includes(order.status))
    .reduce((sum, order) => sum + order.total_cents, 0);
  const toProcess = orders.filter((order) => order.status === "paid" || order.status === "preparing").length;
  const lowStock = products.filter((product) => product.is_active && product.stock < LOW_STOCK_THRESHOLD);

  const stats = [
    { label: "Chiffre d'affaires encaissé", value: formatPrice(revenue) },
    { label: "Commandes", value: String(orders.length) },
    { label: "Commandes à traiter", value: String(toProcess) },
    { label: "Clients inscrits", value: String(users.filter((user) => user.role === "customer").length) },
  ];

  return (
    <div className="flex flex-col gap-10">
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-stone-200 bg-white p-4">
            <dt className="text-sm text-stone-500">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Dernières commandes</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-emerald-700 hover:underline">
            Tout voir
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-3 text-stone-600">Aucune commande pour le moment.</p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 p-4">
                <div>
                  <p className="font-medium">
                    n° {shortId(order.id)} · {order.users?.name ?? "Client supprimé"}
                  </p>
                  <p className="text-sm text-stone-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="font-semibold tabular-nums">{formatPrice(order.total_cents)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold">Stock faible (moins de {LOW_STOCK_THRESHOLD} unités)</h2>
        {lowStock.length === 0 ? (
          <p className="mt-3 text-stone-600">Tous les produits en vente ont un stock suffisant.</p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
            {lowStock.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-4 p-4">
                <span>{product.name}</span>
                <span className={`font-medium tabular-nums ${product.stock === 0 ? "text-red-600" : "text-amber-700"}`}>
                  {product.stock === 0 ? "Rupture" : `${product.stock} restants`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
