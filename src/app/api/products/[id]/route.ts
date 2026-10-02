import { NextResponse } from "next/server";
import { ApiError, handler, parseId } from "@/lib/api";
import { getActiveProduct } from "@/lib/products";

type Context = { params: Promise<{ id: string }> };

export const GET = handler(async (_request: Request, { params }: Context) => {
  const product = await getActiveProduct(await parseId(params));
  if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Produit introuvable.");
  return NextResponse.json({ product });
});
