import { NextResponse } from "next/server";
import { handler } from "@/lib/api";
import { listActiveProducts } from "@/lib/products";

export const GET = handler(async () => {
  const products = await listActiveProducts();
  return NextResponse.json({ products });
});
