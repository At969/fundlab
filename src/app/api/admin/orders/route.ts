import { NextResponse } from "next/server";
import { handler, requireAdmin } from "@/lib/api";
import { listAllOrders } from "@/lib/orders";

export const GET = handler(async () => {
  await requireAdmin();
  const orders = await listAllOrders();
  return NextResponse.json({ orders });
});
