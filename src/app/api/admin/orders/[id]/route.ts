import { NextResponse } from "next/server";
import { handler, parseBody, parseId, requireAdmin } from "@/lib/api";
import { updateOrderStatus } from "@/lib/orders";
import { orderStatusSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export const PATCH = handler(async (request: Request, { params }: Context) => {
  await requireAdmin();
  const id = await parseId(params);
  const { status } = await parseBody(request, orderStatusSchema);
  const order = await updateOrderStatus(id, status);
  return NextResponse.json({ order });
});
