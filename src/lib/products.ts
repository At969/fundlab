import "server-only";
import { ApiError } from "@/lib/api";
import { db } from "@/lib/supabase";
import type { AdminProduct, Product } from "@/lib/types";

// Une seule chaîne littérale par requête : le client Supabase en déduit le type des lignes.
const PUBLIC_COLUMNS = "id, name, description, price_cents, image_urls, stock, categories(name)";
const ADMIN_COLUMNS = "id, name, description, price_cents, image_urls, stock, categories(name), category_id, is_active";

const FOREIGN_KEY_VIOLATION = "23503";

type ProductInput = Omit<AdminProduct, "id" | "category">;

// La catégorie arrive de la base comme une ligne liée ({ name }) ; l'application
// ne manipule que son nom.
type Joined = { categories: { name: string } | { name: string }[] | null };

function withCategory<Row extends Joined>(row: Row): Omit<Row, "categories"> & { category: string | null } {
  const { categories, ...rest } = row;
  const linked = Array.isArray(categories) ? categories[0] : categories;
  return { ...rest, category: linked?.name ?? null };
}

// Une catégorie supprimée entre l'affichage du formulaire et son envoi : erreur de saisie, pas une panne.
function assertKnownCategory(error: { code?: string } | null) {
  if (error?.code === FOREIGN_KEY_VIOLATION) {
    const message = "Cette catégorie n'existe plus.";
    throw new ApiError(422, "VALIDATION_ERROR", message, { category_id: [message] });
  }
}

export async function listActiveProducts(): Promise<Product[]> {
  const { data, error } = await db
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(`Lecture des produits impossible : ${error.message}`);
  return data.map(withCategory);
}

export async function getActiveProduct(id: string): Promise<Product | null> {
  const { data, error } = await db
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Lecture du produit impossible : ${error.message}`);
  return data && withCategory(data);
}

export async function listAllProducts(): Promise<AdminProduct[]> {
  const { data, error } = await db.from("products").select(ADMIN_COLUMNS).order("name");

  if (error) throw new Error(`Lecture des produits impossible : ${error.message}`);
  return data.map(withCategory);
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  const { data, error } = await db.from("products").select(ADMIN_COLUMNS).eq("id", id).maybeSingle();

  if (error) throw new Error(`Lecture du produit impossible : ${error.message}`);
  return data && withCategory(data);
}

export async function createProduct(input: ProductInput): Promise<AdminProduct> {
  const { data, error } = await db.from("products").insert(input).select(ADMIN_COLUMNS).single();

  assertKnownCategory(error);
  if (error) throw new Error(`Création du produit impossible : ${error.message}`);
  return withCategory(data);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<AdminProduct | null> {
  const { data, error } = await db
    .from("products")
    .update(input)
    .eq("id", id)
    .select(ADMIN_COLUMNS)
    .maybeSingle();

  assertKnownCategory(error);
  if (error) throw new Error(`Mise à jour du produit impossible : ${error.message}`);
  return data && withCategory(data);
}

// Les commandes passées gardent le nom et le prix du produit (copiés dans order_items),
// la suppression ne touche donc pas à l'historique. Renvoie le produit supprimé, ou null.
export async function deleteProduct(id: string): Promise<AdminProduct | null> {
  const { data, error } = await db.from("products").delete().eq("id", id).select(ADMIN_COLUMNS).maybeSingle();

  if (error) throw new Error(`Suppression du produit impossible : ${error.message}`);
  return data && withCategory(data);
}
