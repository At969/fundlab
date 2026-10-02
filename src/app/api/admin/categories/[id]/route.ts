import { NextResponse } from "next/server";
import { ApiError, handler, parseBody, parseId, requireAdmin } from "@/lib/api";
import { deleteCategory, renameCategory } from "@/lib/categories";
import { categorySchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

const notFound = () => new ApiError(404, "CATEGORY_NOT_FOUND", "Catégorie introuvable.");

export const PATCH = handler(async (request: Request, { params }: Context) => {
  await requireAdmin();
  const id = await parseId(params);
  const { name } = await parseBody(request, categorySchema);
  const category = await renameCategory(id, name);
  if (!category) throw notFound();
  return NextResponse.json({ category });
});

export const DELETE = handler(async (_request: Request, { params }: Context) => {
  await requireAdmin();
  const deleted = await deleteCategory(await parseId(params));
  if (!deleted) throw notFound();
  return NextResponse.json({ ok: true });
});
