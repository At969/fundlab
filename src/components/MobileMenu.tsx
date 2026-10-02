"use client";

import { useState, type ReactNode } from "react";

// Menu déroulant de l'en-tête sur petit écran. Un clic sur un lien du panneau le referme.
export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d={open ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} />
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          onClick={() => setOpen(false)}
          className="animate-fade-in absolute inset-x-0 top-full flex flex-col gap-1 border-b border-stone-200 bg-white px-4 py-3 text-base shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}
