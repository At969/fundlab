import { NextResponse } from "next/server";
import { ApiError, handler, parseBody, parseId, requireAdmin } from "@/lib/api";
import { updateUserRole } from "@/lib/users";
import { userRoleSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export const PATCH = handler(async (request: Request, { params }: Context) => {
  const admin = await requireAdmin();
  const id = await parseId(params);
  const { role } = await parseBody(request, userRoleSchema);

  // Garde-fou : un admin ne peut pas se retirer lui-même ses droits
  // (la plateforme pourrait se retrouver sans administrateur).
  if (id === admin.id && role !== "admin") {
    throw new ApiError(409, "CANNOT_DEMOTE_SELF", "Vous ne pouvez pas retirer vos propres droits d'administrateur.");
  }

  const user = await updateUserRole(id, role);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "Utilisateur introuvable.");
  return NextResponse.json({ user });
});
