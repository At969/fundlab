import "server-only";
import { db } from "@/lib/supabase";
import type { AdminUser, Role } from "@/lib/types";

const COLUMNS = "id, email, name, role, created_at";

export async function listUsers(): Promise<AdminUser[]> {
  const { data, error } = await db.from("users").select(COLUMNS).order("created_at", { ascending: false });

  if (error) throw new Error(`Lecture des utilisateurs impossible : ${error.message}`);
  return data;
}

export async function updateUserRole(id: string, role: Role): Promise<AdminUser | null> {
  const { data, error } = await db.from("users").update({ role }).eq("id", id).select(COLUMNS).maybeSingle();

  if (error) throw new Error(`Mise à jour de l'utilisateur impossible : ${error.message}`);
  return data;
}
