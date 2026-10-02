import { NextResponse } from "next/server";
import { handler } from "@/lib/api";
import { deleteSession } from "@/lib/session";

export const POST = handler(async () => {
  await deleteSession();
  return NextResponse.json({ ok: true });
});
