import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import type { User } from "@/lib/types";

// Gardes des pages (les routes API utilisent requireCustomer / requireAdmin de lib/api.ts).
// Appelées dans chaque page et non dans un layout, qui n'est pas re-rendu à chaque navigation.
// Les deux espaces sont étanches : l'administrateur n'a pas accès à la boutique, et inversement.

// Pages de la boutique ouvertes aux visiteurs (catalogue, panier).
export async function redirectAdminToDashboard(): Promise<void> {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");
}

export async function requireCustomerPage(next: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.role === "admin") redirect("/admin");
  return user;
}

export async function requireAdminPage(next: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.role !== "admin") redirect("/");
  return user;
}
