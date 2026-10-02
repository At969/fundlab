import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

const AUTH_PAGES = ["/login", "/register"];
const PRIVATE_PREFIXES = ["/checkout", "/orders", "/admin"];

// Contrôle « optimiste » basé sur le seul cookie : il écarte tôt les visiteurs non connectés.
// Le rôle n'est volontairement pas utilisé ici. Celui du cookie peut être périmé (compte promu
// ou rétrogradé depuis la connexion) ; l'aiguillage client / administrateur est fait par les
// pages (lib/guards.ts), qui relisent le rôle en base.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isPrivate && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/admin/:path*", "/login", "/register"],
};
