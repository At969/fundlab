"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/products", label: "Produits" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/orders", label: "Commandes" },
  { href: "/admin/users", label: "Utilisateurs" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-3 flex flex-wrap gap-1 border-b border-stone-200">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              active
                ? "border-accent-500 text-accent-800"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
