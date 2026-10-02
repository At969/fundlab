import { NextResponse } from "next/server";
import { handler, parseBody, requireUser } from "@/lib/api";
import { createOrder, listOrdersForUser } from "@/lib/orders";
import { createOrderSchema } from "@/lib/validation";

export const GET = handler(async () => {
  const user = await requireUser();
  const orders = await listOrdersForUser(user.id);
  return NextResponse.json({ orders });
});

// Le client n'envoie que des identifiants et des quantités : prix et total viennent de la base.
export const POST = handler(async (request: Request) => {
  const user = await requireUser();
  const { items } = await parseBody(request, createOrderSchema);
  const id = await createOrder(user.id, items);
  return NextResponse.json({ id }, { status: 201 });
});
