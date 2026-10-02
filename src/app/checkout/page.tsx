import type { Metadata } from "next";
import { CheckoutView } from "@/components/CheckoutView";
import { requireUserPage } from "@/lib/guards";

export const metadata: Metadata = { title: "Validation de la commande" };

export default async function CheckoutPage() {
  await requireUserPage("/checkout");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Validation de la commande</h1>
      <CheckoutView />
    </div>
  );
}
