import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { CartLink } from "@/components/CartLink";
import { LogoutButton } from "@/components/LogoutButton";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          FUNDLABSHOP
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <CartLink />
          {user ? (
            <>
              <Link href="/orders" className="text-stone-600 hover:text-stone-900">
                Mes commandes
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="font-medium text-emerald-700 hover:text-emerald-900">
                  Administration
                </Link>
              )}
              <span className="hidden text-stone-500 md:inline">Bonjour, {user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-stone-600 hover:text-stone-900">
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
