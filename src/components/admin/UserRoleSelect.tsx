"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client-api";
import type { Role } from "@/lib/types";

const ROLE_LABELS: Record<Role, string> = { customer: "Client", admin: "Administrateur" };

export function UserRoleSelect({ userId, role, disabled }: { userId: string; role: Role; disabled: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: Role) {
    setPending(true);
    setError(null);
    const result = await api(`/api/admin/users/${userId}`, "PATCH", { role: next });
    if (result.error) setError(result.error.message);
    else router.refresh();
    setPending(false);
  }

  return (
    <div>
      <select
        aria-label="Rôle de l'utilisateur"
        value={role}
        disabled={disabled || pending}
        onChange={(event) => change(event.target.value as Role)}
        className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm disabled:opacity-60"
      >
        {(Object.keys(ROLE_LABELS) as Role[]).map((value) => (
          <option key={value} value={value}>
            {ROLE_LABELS[value]}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
