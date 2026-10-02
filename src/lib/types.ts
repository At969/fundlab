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
  /** Liste ordonnée ; la première image est la principale. */
  image_urls: string[];
  stock: number;
};

export const MAX_PRODUCT_IMAGES = 6;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

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

// Opérateurs de mobile money proposés au paiement (simulé).
export const PAYMENT_METHODS = ["mtn", "moov", "orange", "wave"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mtn: "MTN Mobile Money",
  moov: "Moov Money",
  orange: "Orange Money",
  wave: "Wave",
};

export type Delivery = {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
};

export type Order = {
  id: string;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  paid_at: string | null;
  payment_method: PaymentMethod | null;
  // Vides sur les commandes passées avant l'ajout de la livraison.
  delivery_name: string | null;
  delivery_phone: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_notes: string | null;
  order_items: OrderItem[];
};

export type AdminOrder = Order & { users: { name: string; email: string } | null };

export type AdminUser = User & { created_at: string };
