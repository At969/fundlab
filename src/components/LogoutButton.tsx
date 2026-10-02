"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icons";

// Icône seule par défaut ; `showLabel` ajoute le mot « Déconnexion » (menu mobile).
export function LogoutButton({ showLabel = false }: { showLabel?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      aria-label="Déconnexion"
      title="Déconnexion"
      className={`inline-flex items-center gap-2 rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-60 ${
        showLabel ? "px-2 py-2" : "h-9 w-9 justify-center"
      }`}
    >
      <Icon name="logout" className="h-5 w-5" />
      {showLabel && "Déconnexion"}
    </button>
  );
}
