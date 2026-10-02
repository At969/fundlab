"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { IconButton } from "@/components/Icons";
import { api } from "@/lib/client-api";
import type { AdminCategory } from "@/lib/types";

const inputClass =
  "min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-base outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-500/25";
const primaryButton =
  "rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60";

const productCount = (count: number) =>
  count === 0 ? "Aucun produit" : `${count} produit${count > 1 ? "s" : ""}`;

export function CategoryManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  // Le message du champ (« Une catégorie porte déjà ce nom ») est plus précis que le message général.
  const messageOf = (error: { message: string; fields?: Record<string, string[] | undefined> }) =>
    error.fields?.name?.[0] ?? error.message;

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy("create");
    setCreateError(null);

    const result = await api("/api/admin/categories", "POST", { name: new FormData(form).get("name") });
    if (result.error) setCreateError(messageOf(result.error));
    else {
      form.reset();
      router.refresh();
    }
    setBusy(null);
  }

  async function rename(event: FormEvent<HTMLFormElement>, category: AdminCategory) {
    event.preventDefault();
    setBusy(category.id);
    setRowError(null);

    const name = new FormData(event.currentTarget).get("name");
    const result = await api(`/api/admin/categories/${category.id}`, "PATCH", { name });
    if (result.error) setRowError({ id: category.id, message: messageOf(result.error) });
    else {
      setEditingId(null);
      router.refresh();
    }
    setBusy(null);
  }

  async function remove(category: AdminCategory) {
    const consequence =
      category.product_count > 0
        ? `\n\n${productCount(category.product_count)} ${category.product_count > 1 ? "passeront" : "passera"} « sans catégorie ». Aucun produit n'est supprimé.`
        : "";
    if (!window.confirm(`Supprimer la catégorie « ${category.name} » ?${consequence}`)) return;

    setBusy(category.id);
    setRowError(null);
    const result = await api(`/api/admin/categories/${category.id}`, "DELETE");
    if (result.error) setRowError({ id: category.id, message: result.error.message });
    else router.refresh();
    setBusy(null);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Catégories</h1>
      <p className="mt-1 text-stone-600">
        Elles servent à classer les produits et à filtrer le catalogue de la boutique. Une catégorie
        sans produit visible n&apos;apparaît pas dans la boutique.
      </p>

      <form onSubmit={create} noValidate className="mt-6 rounded-lg border border-stone-200 bg-white p-4">
        <label htmlFor="new-category" className="text-sm font-medium">
          Nouvelle catégorie
        </label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <input
            id="new-category"
            name="name"
            maxLength={40}
            autoComplete="off"
            placeholder="Ex. : Bureau"
            className={inputClass}
          />
          <button type="submit" disabled={busy === "create"} className={primaryButton}>
            {busy === "create" ? "Ajout…" : "Ajouter"}
          </button>
        </div>
        {createError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {createError}
          </p>
        )}
      </form>

      {categories.length === 0 ? (
        <p className="mt-6 text-stone-600">Aucune catégorie pour le moment. Créez la première ci-dessus.</p>
      ) : (
        <ul className="mt-6 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {categories.map((category) => (
            <li key={category.id} className={`p-4 ${busy === category.id ? "opacity-50" : ""}`}>
              {editingId === category.id ? (
                <form onSubmit={(event) => rename(event, category)} noValidate className="flex flex-wrap gap-2">
                  <input
                    name="name"
                    aria-label={`Nouveau nom de la catégorie ${category.name}`}
                    defaultValue={category.name}
                    maxLength={40}
                    autoComplete="off"
                    autoFocus
                    // Sur téléphone, le champ prend toute la largeur et les boutons passent dessous.
                    className={`${inputClass} max-sm:basis-full`}
                  />
                  <button type="submit" disabled={busy === category.id} className={primaryButton}>
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setRowError(null);
                    }}
                    className="px-2 text-sm text-stone-600 hover:text-stone-900"
                  >
                    Annuler
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium wrap-anywhere">{category.name}</p>
                    <p className="text-sm text-stone-500">{productCount(category.product_count)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <IconButton
                      icon="pencil"
                      tone="accent"
                      label={`Renommer ${category.name}`}
                      onClick={() => {
                        setEditingId(category.id);
                        setRowError(null);
                      }}
                    />
                    <IconButton
                      icon="trash"
                      tone="danger"
                      label={`Supprimer ${category.name}`}
                      disabled={busy === category.id}
                      onClick={() => remove(category)}
                    />
                  </div>
                </div>
              )}
              {rowError?.id === category.id && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {rowError.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
