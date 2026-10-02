import { NextResponse } from "next/server";
import { handler, requireAdmin } from "@/lib/api";
import { listUsers } from "@/lib/users";

export const GET = handler(async () => {
  await requireAdmin();
  const users = await listUsers();
  return NextResponse.json({ users });
});
