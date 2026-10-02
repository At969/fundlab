import "server-only";
import { db } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export async function listActiveProducts(): Promise<Product[]> {
  const { data, error } = await db
    .from("products")
    .select("id, name, description, price_cents, image_url, stock")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(`Lecture des produits impossible : ${error.message}`);
  return data;
}
