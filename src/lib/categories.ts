import "server-only";
import { ApiError } from "@/lib/api";
import { db } from "@/lib/supabase";
import type { AdminCategory } from "@/lib/types";

const UNIQUE_VIOLATION = "23505";

type Row = { id: string; name: string; products: { count: number }[] };

const toCategory = (row: Row): AdminCategory => ({
  id: row.id,
  name: row.name,
  product_count: row.products[0]?.count ?? 0,
});

function assertUniqueName(error: { code?: string } | null) {
  if (error?.code === UNIQUE_VIOLATION) {
    const message = "Une catégorie porte déjà ce nom.";
    throw new ApiError(409, "CATEGORY_EXISTS", message, { name: [message] });
  }
}

// Chaque catégorie est renvoyée avec son nombre de produits (visibles ou masqués).
export async function listCategories(): Promise<AdminCategory[]> {
  const { data, error } = await db.from("categories").select("id, name, products(count)").order("name");

  if (error) throw new Error(`Lecture des catégories impossible : ${error.message}`);
  return (data as Row[]).map(toCategory);
}

export async function createCategory(name: string): Promise<AdminCategory> {
  const { data, error } = await db.from("categories").insert({ name }).select("id, name").single();

  assertUniqueName(error);
  if (error) throw new Error(`Création de la catégorie impossible : ${error.message}`);
  return { ...data, product_count: 0 };
}

export async function renameCategory(id: string, name: string): Promise<AdminCategory | null> {
  const { data, error } = await db
    .from("categories")
    .update({ name })
    .eq("id", id)
    .select("id, name, products(count)")
    .maybeSingle();

  assertUniqueName(error);
  if (error) throw new Error(`Modification de la catégorie impossible : ${error.message}`);
  return data && toCategory(data as Row);
}

// Les produits de la catégorie ne sont pas supprimés : la clé étrangère (on delete set null)
// les fait passer « sans catégorie ».
export async function deleteCategory(id: string): Promise<boolean> {
  const { data, error } = await db.from("categories").delete().eq("id", id).select("id");

  if (error) throw new Error(`Suppression de la catégorie impossible : ${error.message}`);
  return data.length > 0;
}
