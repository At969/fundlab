import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Panier" };

export default function CartPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Votre panier</h1>
      <CartView />
    </div>
  );
}
