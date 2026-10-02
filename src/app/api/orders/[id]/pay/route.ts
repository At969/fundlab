import { NextResponse } from "next/server";
import { handler, parseBody, parseId, requireUser } from "@/lib/api";
import { payOrder } from "@/lib/orders";
import { paymentSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

// Paiement simulé : aucun prestataire n'est appelé et les données de carte
// sont seulement validées, jamais enregistrées.
export const POST = handler(async (request: Request, { params }: Context) => {
  const user = await requireUser();
  const id = await parseId(params);
  await parseBody(request, paymentSchema);
  const order = await payOrder(id, user.id);
  return NextResponse.json({ order });
});
