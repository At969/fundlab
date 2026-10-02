export type Role = "customer" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string | null;
  stock: number;
};

export type AdminProduct = Product & { is_active: boolean };

export const ORDER_STATUSES = ["pending", "paid", "preparing", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente de paiement",
  paid: "Payée",
  preparing: "En préparation",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export type OrderItem = {
  id: string;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  paid_at: string | null;
  order_items: OrderItem[];
};

export type AdminOrder = Order & { users: { name: string; email: string } | null };

export type AdminUser = User & { created_at: string };
