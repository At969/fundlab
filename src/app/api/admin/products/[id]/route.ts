import { NextResponse } from "next/server";
import { ApiError, handler, parseBody, parseId, requireAdmin } from "@/lib/api";
import { deleteProduct, getProduct, updateProduct } from "@/lib/products";
import { assertOwnImages, deleteProductImages } from "@/lib/storage";
import { productUpdateSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

const notFound = () => new ApiError(404, "PRODUCT_NOT_FOUND", "Produit introuvable.");

export const PATCH = handler(async (request: Request, { params }: Context) => {
  await requireAdmin();
  const id = await parseId(params);
  const input = await parseBody(request, productUpdateSchema);
  assertOwnImages(input.image_urls);

  const previous = await getProduct(id);
  if (!previous) throw notFound();

  const product = await updateProduct(id, input);
  if (!product) throw notFound();

  // Les images retirées du produit ne sont plus référencées : on les supprime du stockage.
  await deleteProductImages(previous.image_urls.filter((url) => !product.image_urls.includes(url)));
  return NextResponse.json({ product });
});

export const DELETE = handler(async (_request: Request, { params }: Context) => {
  await requireAdmin();
  const deleted = await deleteProduct(await parseId(params));
  if (!deleted) throw notFound();
  await deleteProductImages(deleted.image_urls);
  return NextResponse.json({ ok: true });
});
