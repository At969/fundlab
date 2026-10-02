import "server-only";
import { cache } from "react";
import { db } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import type { User } from "@/lib/types";

// Le rôle est relu en base à chaque requête : le cookie sert à identifier l'utilisateur,
// pas à décider de ses droits (un compte supprimé ou rétrogradé perd l'accès tout de suite).
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await db
    .from("users")
    .select("id, email, name, role")
    .eq("id", session.userId)
    .maybeSingle();

  if (error) throw new Error(`Lecture de l'utilisateur impossible : ${error.message}`);
  return data;
});
