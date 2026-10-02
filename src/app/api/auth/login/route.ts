import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ApiError, handler, parseBody } from "@/lib/api";
import { createSession } from "@/lib/session";
import { db } from "@/lib/supabase";
import { loginSchema } from "@/lib/validation";

// Hash comparé quand l'e-mail est inconnu, pour que la réponse prenne le même temps
// qu'avec un compte existant (ne pas révéler quels e-mails sont inscrits).
const DUMMY_HASH = "$2b$12$b4M/gHQc3koUmAZaI3IFRuRiw4AcbMCPdYAeJ7odd5PYB/gtU6ySa";

export const POST = handler(async (request: Request) => {
  const { email, password } = await parseBody(request, loginSchema);

  const { data: row, error } = await db
    .from("users")
    .select("id, email, name, role, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(`Lecture de l'utilisateur impossible : ${error.message}`);

  const valid = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !valid) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "E-mail ou mot de passe incorrect.");
  }

  await createSession({ userId: row.id, role: row.role });
  const user = { id: row.id, email: row.email, name: row.name, role: row.role };
  return NextResponse.json({ user });
});
