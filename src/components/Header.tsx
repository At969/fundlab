import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { CartLink } from "@/components/CartLink";
import { LogoutButton } from "@/components/LogoutButton";

const linkClass = "text-stone-600 hover:text-stone-900";

export async function Header() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href={isAdmin ? "/admin" : "/"} className="font-semibold tracking-tight">
          FUNDLABSHOP
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {/* L'administrateur n'a ni panier ni commandes : sa navigation est dans l'espace admin. */}
          {!isAdmin && (
            <Link href="/products" className={linkClass}>
              Produits
            </Link>
          )}
          {!isAdmin && <CartLink />}
          {user && !isAdmin && (
            <Link href="/orders" className={linkClass}>
              Mes commandes
            </Link>
          )}
          {user ? (
            <>
              <span className="hidden text-stone-500 md:inline">
                {isAdmin ? `${user.name} · administrateur` : `Bonjour, ${user.name}`}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass}>
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-emerald-700 px-3 py-1.5 font-medium text-white hover:bg-emerald-800"
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
