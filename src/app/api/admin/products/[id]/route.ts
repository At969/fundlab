import { NextResponse } from "next/server";
import { ApiError, handler, parseBody, parseId, requireAdmin } from "@/lib/api";
import { deleteProduct, updateProduct } from "@/lib/products";
import { productUpdateSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

const notFound = () => new ApiError(404, "PRODUCT_NOT_FOUND", "Produit introuvable.");

export const PATCH = handler(async (request: Request, { params }: Context) => {
  await requireAdmin();
  const id = await parseId(params);
  const input = await parseBody(request, productUpdateSchema);
  const product = await updateProduct(id, input);
  if (!product) throw notFound();
  return NextResponse.json({ product });
});

export const DELETE = handler(async (_request: Request, { params }: Context) => {
  await requireAdmin();
  const deleted = await deleteProduct(await parseId(params));
  if (!deleted) throw notFound();
  return NextResponse.json({ ok: true });
});
