import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { CartLink } from "@/components/CartLink";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { MobileMenu } from "@/components/MobileMenu";

const linkClass = "text-stone-600 hover:text-stone-900";
const mobileLinkClass = "rounded-md px-2 py-2 text-stone-700 hover:bg-stone-100";
const registerClass = "rounded-md bg-brand-900 px-3 py-1.5 font-medium text-white hover:bg-brand-700";

export async function Header() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";

  // L'administrateur n'a ni panier ni commandes : sa navigation est dans l'espace admin.
  const links = isAdmin
    ? []
    : [{ href: "/products", label: "Produits" }, ...(user ? [{ href: "/orders", label: "Mes commandes" }] : [])];

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/85 backdrop-blur">
      <div className="relative mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <Link href={isAdmin ? "/admin" : "/"} aria-label="FUNDLABSHOP, accueil" className="shrink-0">
          <Logo className="h-8 w-auto" priority />
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {/* Grand écran : tout est affiché en ligne. */}
          <nav aria-label="Navigation principale" className="hidden items-center gap-4 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          {!isAdmin && <CartLink />}

          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <span className="text-stone-500">
                  {isAdmin ? `${user.name} · administrateur` : `Bonjour, ${user.name}`}
                </span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass}>
                  Connexion
                </Link>
                <Link href="/register" className={registerClass}>
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          {/* Petit écran : le panier reste visible, le reste passe dans un menu. */}
          {isAdmin ? (
            <div className="md:hidden">
              <LogoutButton />
            </div>
          ) : (
            <MobileMenu>
              {user && <p className="px-2 pb-1 text-sm text-stone-500">Bonjour, {user.name}</p>}
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={mobileLinkClass}>
                  {link.label}
                </Link>
              ))}
              {user ? (
                <div className="px-2 py-2">
                  <LogoutButton />
                </div>
              ) : (
                <>
                  <Link href="/login" className={mobileLinkClass}>
                    Connexion
                  </Link>
                  <Link href="/register" className={`${registerClass} mt-1 py-2 text-center`}>
                    Créer un compte
                  </Link>
                </>
              )}
            </MobileMenu>
          )}
        </div>
      </div>
    </header>
  );
}
