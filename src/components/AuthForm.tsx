"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

type Mode = "login" | "register";
type FieldErrors = Record<string, string[] | undefined>;

const COPY = {
  login: {
    title: "Connexion",
    submit: "Se connecter",
    pending: "Connexion…",
    altText: "Pas encore de compte ?",
    altLink: "Créer un compte",
    altHref: "/register",
  },
  register: {
    title: "Créer un compte",
    submit: "S'inscrire",
    pending: "Création du compte…",
    altText: "Déjà inscrit ?",
    altLink: "Se connecter",
    altHref: "/login",
  },
} as const;

// N'accepte qu'un chemin interne, pour éviter une redirection vers un site tiers.
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const copy = COPY[mode];
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setMessage(null);
    setFields({});

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      if (response.ok) {
        const { user } = await response.json();
        router.replace(user.role === "admin" ? "/admin" : next);
        router.refresh();
        return;
      }
      const body = await response.json().catch(() => null);
      setFields(body?.error?.fields ?? {});
      setMessage(body?.error?.fields ? null : (body?.error?.message ?? "Une erreur est survenue."));
    } catch {
      setMessage("Impossible de joindre le serveur. Vérifiez votre connexion.");
    }
    setPending(false);
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
        {mode === "register" && (
          <Field label="Nom" name="name" autoComplete="name" errors={fields.name} />
        )}
        <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" errors={fields.email} />
        <Field
          label="Mot de passe"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          hint={mode === "register" ? "8 caractères minimum." : undefined}
          errors={fields.password}
        />
        {mode === "register" && (
          <Field
            label="Confirmer le mot de passe"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            errors={fields.passwordConfirm}
          />
        )}

        {message && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? copy.pending : copy.submit}
        </button>
      </form>

      <p className="mt-6 text-sm text-stone-600">
        {copy.altText}{" "}
        <Link
          href={next === "/" ? copy.altHref : `${copy.altHref}?next=${encodeURIComponent(next)}`}
          className="font-medium text-emerald-700 hover:underline"
        >
          {copy.altLink}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  hint,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  errors?: string[];
}) {
  const error = errors?.[0];
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={Boolean(error)}
        className="rounded-md border border-stone-300 bg-white px-3 py-2 text-base font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 aria-invalid:border-red-500"
      />
      {error ? (
        <span className="font-normal text-red-600">{error}</span>
      ) : (
        hint && <span className="font-normal text-stone-500">{hint}</span>
      )}
    </label>
  );
}
