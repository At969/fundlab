import { NextResponse } from "next/server";
import { handler, parseBody, requireAdmin } from "@/lib/api";
import { createProduct, listAllProducts } from "@/lib/products";
import { productSchema } from "@/lib/validation";

export const GET = handler(async () => {
  await requireAdmin();
  const products = await listAllProducts();
  return NextResponse.json({ products });
});

export const POST = handler(async (request: Request) => {
  await requireAdmin();
  const input = await parseBody(request, productSchema);
  const product = await createProduct(input);
  return NextResponse.json({ product }, { status: 201 });
});
