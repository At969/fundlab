import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import type { User } from "@/lib/types";

// Gardes des pages (les routes API utilisent requireUser / requireAdmin de lib/api.ts).
// Appelées dans chaque page et non dans un layout, qui n'est pas re-rendu à chaque navigation.

export async function requireUserPage(next: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdminPage(next: string): Promise<User> {
  const user = await requireUserPage(next);
  if (user.role !== "admin") redirect("/");
  return user;
}
