import { NextResponse } from "next/server";
import { handler, parseBody, parseId, requireCustomer } from "@/lib/api";
import { payOrder } from "@/lib/orders";
import { paymentSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

// Paiement mobile money simulé : aucun opérateur n'est appelé. Le numéro est seulement
// validé ; seul l'opérateur choisi est enregistré sur la commande.
export const POST = handler(async (request: Request, { params }: Context) => {
  const user = await requireCustomer();
  const id = await parseId(params);
  const { method } = await parseBody(request, paymentSchema);
  const order = await payOrder(id, user.id, method);
  return NextResponse.json({ order });
});
