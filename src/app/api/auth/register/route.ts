import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ApiError, handler, parseBody } from "@/lib/api";
import { createSession } from "@/lib/session";
import { db } from "@/lib/supabase";
import { registerSchema } from "@/lib/validation";

const UNIQUE_VIOLATION = "23505";

export const POST = handler(async (request: Request) => {
  const { name, email, password } = await parseBody(request, registerSchema);
  const password_hash = await bcrypt.hash(password, 12);

  // Le rôle n'est jamais lu depuis la requête : tout nouveau compte est « customer ».
  const { data: user, error } = await db
    .from("users")
    .insert({ name, email, password_hash })
    .select("id, email, name, role")
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      const message = "Un compte existe déjà avec cette adresse e-mail.";
      throw new ApiError(409, "EMAIL_TAKEN", message, { email: [message] });
    }
    throw new Error(`Création du compte impossible : ${error.message}`);
  }

  await createSession({ userId: user.id, role: user.role });
  return NextResponse.json({ user }, { status: 201 });
});
