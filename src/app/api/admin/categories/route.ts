import { NextResponse } from "next/server";
import { handler, parseBody, requireAdmin } from "@/lib/api";
import { createCategory, listCategories } from "@/lib/categories";
import { categorySchema } from "@/lib/validation";

export const GET = handler(async () => {
  await requireAdmin();
  const categories = await listCategories();
  return NextResponse.json({ categories });
});

export const POST = handler(async (request: Request) => {
  await requireAdmin();
  const { name } = await parseBody(request, categorySchema);
  const category = await createCategory(name);
  return NextResponse.json({ category }, { status: 201 });
});
