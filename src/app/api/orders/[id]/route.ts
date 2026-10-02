import { NextResponse } from "next/server";
import { ApiError, handler, parseId, requireUser } from "@/lib/api";
import { getOrderForUser } from "@/lib/orders";

type Context = { params: Promise<{ id: string }> };

export const GET = handler(async (_request: Request, { params }: Context) => {
  const user = await requireUser();
  const order = await getOrderForUser(await parseId(params), user.id);
  if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Commande introuvable.");
  return NextResponse.json({ order });
});
