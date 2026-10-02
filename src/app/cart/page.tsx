import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { CartView } from "@/components/CartView";
import { redirectAdminToDashboard } from "@/lib/guards";

export const metadata: Metadata = { title: "Panier" };

export default async function CartPage() {
  await redirectAdminToDashboard();

  return (
    <div>
      <BackLink href="/products">Continuer mes achats</BackLink>
      <h1 className="text-2xl font-semibold tracking-tight">Votre panier</h1>
      <CartView />
    </div>
  );
}
