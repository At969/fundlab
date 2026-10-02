import { NextResponse } from "next/server";
import { ApiError, handler, parseBody, parseId, requireAdmin } from "@/lib/api";
import { deleteProduct, getProduct, updateProduct } from "@/lib/products";
import { assertOwnImage, deleteProductImage } from "@/lib/storage";
import { productUpdateSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

const notFound = () => new ApiError(404, "PRODUCT_NOT_FOUND", "Produit introuvable.");

export const PATCH = handler(async (request: Request, { params }: Context) => {
  await requireAdmin();
  const id = await parseId(params);
  const input = await parseBody(request, productUpdateSchema);
  assertOwnImage(input.image_url);

  const previous = await getProduct(id);
  if (!previous) throw notFound();

  const product = await updateProduct(id, input);
  if (!product) throw notFound();

  // L'ancienne image n'est plus référencée : on la retire du stockage.
  if (previous.image_url !== product.image_url) await deleteProductImage(previous.image_url);
  return NextResponse.json({ product });
});

export const DELETE = handler(async (_request: Request, { params }: Context) => {
  await requireAdmin();
  const deleted = await deleteProduct(await parseId(params));
  if (!deleted) throw notFound();
  await deleteProductImage(deleted.image_url);
  return NextResponse.json({ ok: true });
});
