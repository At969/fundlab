import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { CheckoutView } from "@/components/CheckoutView";
import { requireCustomerPage } from "@/lib/guards";

export const metadata: Metadata = { title: "Validation de la commande" };

export default async function CheckoutPage() {
  const user = await requireCustomerPage("/checkout");

  return (
    <div>
      <BackLink href="/cart">Retour au panier</BackLink>
      <h1 className="text-2xl font-semibold tracking-tight">Validation de la commande</h1>
      <CheckoutView defaultName={user.name} />
    </div>
  );
}
