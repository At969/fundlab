import { NextResponse } from "next/server";
import { handler } from "@/lib/api";
import { getCurrentUser } from "@/lib/dal";

export const GET = handler(async () => {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
});
