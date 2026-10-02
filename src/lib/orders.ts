import "server-only";
import { ApiError } from "@/lib/api";
import { db } from "@/lib/supabase";
import type { AdminOrder, Delivery, Order, OrderStatus, PaymentMethod } from "@/lib/types";

// Une seule chaîne littérale : le client Supabase en déduit le type des lignes renvoyées.
const ORDER_COLUMNS =
  "id, status, total_cents, created_at, paid_at, payment_method, delivery_name, delivery_phone, delivery_address, delivery_city, delivery_notes, order_items(id, product_name, unit_price_cents, quantity)";

type CartLine = { productId: string; quantity: number };

// La fonction SQL create_order fait tout dans une transaction (prix lus en base,
// contrôle et décrément du stock). Ses exceptions sont traduites en erreurs d'API.
export async function createOrder(userId: string, items: CartLine[], delivery: Delivery): Promise<string> {
  const { data, error } = await db.rpc("create_order", {
    p_user_id: userId,
    p_items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
    p_delivery: delivery,
  });

  if (error) {
    const [code, detail] = error.message.split(":");
    if (code === "OUT_OF_STOCK") {
      throw new ApiError(409, code, `Stock insuffisant pour « ${detail} ».`);
    }
    if (code === "PRODUCT_NOT_FOUND") {
      throw new ApiError(409, code, "Un produit de votre panier n'est plus disponible.");
    }
    if (code === "EMPTY_CART" || code === "INVALID_QUANTITY") {
      throw new ApiError(422, code, "Le panier est vide ou invalide.");
    }
    throw new Error(`Création de la commande impossible : ${error.message}`);
  }
  return data;
}

export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const { data, error } = await db
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Lecture des commandes impossible : ${error.message}`);
  return data;
}

// Le filtre sur user_id fait office de contrôle d'accès : la commande d'un autre
// client est introuvable, exactement comme une commande inexistante.
export async function getOrderForUser(orderId: string, userId: string): Promise<Order | null> {
  const { data, error } = await db
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Lecture de la commande impossible : ${error.message}`);
  return data;
}

// Mise à jour conditionnelle (status = 'pending') : deux paiements simultanés
// ne peuvent pas passer tous les deux.
export async function payOrder(orderId: string, userId: string, method: PaymentMethod): Promise<Order> {
  const { data, error } = await db
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString(), payment_method: method })
    .eq("id", orderId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .select(ORDER_COLUMNS)
    .maybeSingle();

  if (error) throw new Error(`Paiement impossible : ${error.message}`);
  if (data) return data;

  const order = await getOrderForUser(orderId, userId);
  if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Commande introuvable.");
  throw new ApiError(409, "ORDER_NOT_PAYABLE", "Cette commande ne peut plus être payée.");
}

export async function listAllOrders(): Promise<AdminOrder[]> {
  const { data, error } = await db
    .from("orders")
    .select(`${ORDER_COLUMNS}, users(name, email)`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Lecture des commandes impossible : ${error.message}`);
  return data as unknown as AdminOrder[];
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const { data: current, error: readError } = await db
    .from("orders")
    .select("paid_at")
    .eq("id", orderId)
    .maybeSingle();

  if (readError) throw new Error(`Lecture de la commande impossible : ${readError.message}`);
  if (!current) throw new ApiError(404, "ORDER_NOT_FOUND", "Commande introuvable.");

  const paid_at = status === "paid" && !current.paid_at ? new Date().toISOString() : current.paid_at;
  const { data, error } = await db
    .from("orders")
    .update({ status, paid_at })
    .eq("id", orderId)
    .select(ORDER_COLUMNS)
    .single();

  if (error) throw new Error(`Mise à jour de la commande impossible : ${error.message}`);
  return data;
}
