import type { Order } from "@/lib/types";

// Coordonnées de livraison d'une commande. `compact` réduit le texte pour les tableaux.
export function DeliveryDetails({ order, compact = false }: { order: Order; compact?: boolean }) {
  if (!order.delivery_name) {
    return <p className={compact ? "text-stone-500" : "mt-2 text-stone-500"}>Non renseignée</p>;
  }

  return (
    <address className={`not-italic ${compact ? "" : "mt-2"}`}>
      <p className={compact ? undefined : "font-medium"}>{order.delivery_name}</p>
      <p className="text-stone-600">
        {order.delivery_address}, {order.delivery_city}
      </p>
      <p className="text-stone-600 tabular-nums">{order.delivery_phone}</p>
      {order.delivery_notes && <p className="mt-1 text-sm text-stone-500">« {order.delivery_notes} »</p>}
    </address>
  );
}
