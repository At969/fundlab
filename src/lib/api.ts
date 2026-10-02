import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/dal";
import type { User } from "@/lib/types";

export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string[]> };
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "UNAUTHENTICATED", "Vous devez être connecté.");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") throw new ApiError(403, "FORBIDDEN", "Accès réservé à l'administrateur.");
  return user;
}

export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Le corps de la requête n'est pas un JSON valide.");
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const fields = z.flattenError(result.error).fieldErrors as Record<string, string[]>;
    throw new ApiError(422, "VALIDATION_ERROR", "Certains champs sont invalides.", fields);
  }
  return result.data;
}

// Enveloppe commune des route handlers : toute erreur devient une réponse JSON
// au même format, et les erreurs inattendues ne divulguent aucun détail interne.
export function handler<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json<ApiErrorBody>(
          { error: { code: err.code, message: err.message, fields: err.fields } },
          { status: err.status },
        );
      }
      console.error(err);
      return NextResponse.json<ApiErrorBody>(
        { error: { code: "INTERNAL_ERROR", message: "Une erreur inattendue est survenue." } },
        { status: 500 },
      );
    }
  };
}
