import { NextResponse } from "next/server";
import { ApiError, handler, requireAdmin } from "@/lib/api";
import { uploadProductImage } from "@/lib/storage";

export const POST = handler(async (request: Request) => {
  await requireAdmin();

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    throw new ApiError(400, "FILE_REQUIRED", "Aucun fichier reçu.");
  }

  const url = await uploadProductImage(file);
  return NextResponse.json({ url }, { status: 201 });
});
