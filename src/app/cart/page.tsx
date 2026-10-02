import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { redirectAdminToDashboard } from "@/lib/guards";

export const metadata: Metadata = { title: "Panier" };

export default async function CartPage() {
  await redirectAdminToDashboard();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Votre panier</h1>
      <CartView />
    </div>
  );
}
