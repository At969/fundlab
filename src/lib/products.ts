import "server-only";
import { db } from "@/lib/supabase";
import type { AdminProduct, Product } from "@/lib/types";

const PUBLIC_COLUMNS = "id, name, description, price_cents, image_urls, stock";
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, is_active`;

type ProductInput = Omit<AdminProduct, "id">;

export async function listActiveProducts(): Promise<Product[]> {
  const { data, error } = await db
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(`Lecture des produits impossible : ${error.message}`);
  return data;
}

export async function getActiveProduct(id: string): Promise<Product | null> {
  const { data, error } = await db
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Lecture du produit impossible : ${error.message}`);
  return data;
}

export async function listAllProducts(): Promise<AdminProduct[]> {
  const { data, error } = await db.from("products").select(ADMIN_COLUMNS).order("name");

  if (error) throw new Error(`Lecture des produits impossible : ${error.message}`);
  return data;
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  const { data, error } = await db.from("products").select(ADMIN_COLUMNS).eq("id", id).maybeSingle();

  if (error) throw new Error(`Lecture du produit impossible : ${error.message}`);
  return data;
}

export async function createProduct(input: ProductInput): Promise<AdminProduct> {
  const { data, error } = await db.from("products").insert(input).select(ADMIN_COLUMNS).single();

  if (error) throw new Error(`Création du produit impossible : ${error.message}`);
  return data;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<AdminProduct | null> {
  const { data, error } = await db
    .from("products")
    .update(input)
    .eq("id", id)
    .select(ADMIN_COLUMNS)
    .maybeSingle();

  if (error) throw new Error(`Mise à jour du produit impossible : ${error.message}`);
  return data;
}

// Les commandes passées gardent le nom et le prix du produit (copiés dans order_items),
// la suppression ne touche donc pas à l'historique. Renvoie le produit supprimé, ou null.
export async function deleteProduct(id: string): Promise<AdminProduct | null> {
  const { data, error } = await db.from("products").delete().eq("id", id).select(ADMIN_COLUMNS).maybeSingle();

  if (error) throw new Error(`Suppression du produit impossible : ${error.message}`);
  return data;
}
