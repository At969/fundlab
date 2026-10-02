import Link from "next/link";

// Lien de retour placé au-dessus du titre d'une page.
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group mb-3 inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
    >
      <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
        ←
      </span>
      {children}
    </Link>
  );
}
