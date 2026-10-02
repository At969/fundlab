import { NextResponse } from "next/server";
import { handler, parseBody, requireAdmin } from "@/lib/api";
import { createProduct, listAllProducts } from "@/lib/products";
import { assertOwnImage } from "@/lib/storage";
import { productSchema } from "@/lib/validation";

export const GET = handler(async () => {
  await requireAdmin();
  const products = await listAllProducts();
  return NextResponse.json({ products });
});

export const POST = handler(async (request: Request) => {
  await requireAdmin();
  const input = await parseBody(request, productSchema);
  assertOwnImage(input.image_url);
  const product = await createProduct(input);
  return NextResponse.json({ product }, { status: 201 });
});
