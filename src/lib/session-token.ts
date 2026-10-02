import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/types";

// Signature et vérification du JWT de session, sans dépendance à next/headers :
// ce module est aussi utilisé par proxy.ts.

export const SESSION_COOKIE = "session";
export const SESSION_DURATION_S = 60 * 60 * 24 * 7;

export type SessionPayload = { userId: string; role: Role };

function getKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET doit être définie (32 caractères minimum).");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_S}s`)
    .sign(getKey());
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const key = getKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string") return null;
    if (payload.role !== "customer" && payload.role !== "admin") return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    // Jeton expiré, altéré ou mal formé : on le traite comme une absence de session.
    return null;
  }
}
