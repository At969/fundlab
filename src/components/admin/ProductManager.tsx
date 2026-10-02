"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, type ClientApiError } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";
import type { AdminProduct } from "@/lib/types";

type Editing = { mode: "create" } | { mode: "edit"; product: AdminProduct } | null;

const inputClass =
  "rounded-md border border-stone-300 bg-white px-3 py-2 text-base font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";

export function ProductManager({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(id: string, url: string, method: string, body?: unknown) {
    setBusyId(id);
    setError(null);
    const result = await api(url, method, body);
    if (result.error) setError(result.error.message);
    else router.refresh();
    setBusyId(null);
  }

  function remove(product: AdminProduct) {
    if (!window.confirm(`Supprimer définitivement « ${product.name} » ?`)) return;
    run(product.id, `/api/admin/products/${product.id}`, "DELETE");
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
        <button
          type="button"
          onClick={() => setEditing({ mode: "create" })}
          className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Nouveau produit
        </button>
      </div>

      {editing && (
        <ProductForm
          // La clé recrée le formulaire quand on change de produit, pour repartir de ses valeurs.
          key={editing.mode === "edit" ? editing.product.id : "create"}
          product={editing.mode === "edit" ? editing.product : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {products.length === 0 ? (
        <p className="mt-6 text-stone-600">Aucun produit. Créez le premier avec « Nouveau produit ».</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-stone-200 text-stone-500">
              <tr>
                <th className="p-3 font-medium">Produit</th>
                <th className="p-3 text-right font-medium">Prix</th>
                <th className="p-3 text-right font-medium">Stock</th>
                <th className="p-3 font-medium">En vente</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {products.map((product) => (
                <tr key={product.id} className={busyId === product.id ? "opacity-50" : undefined}>
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(product.price_cents)}</td>
                  <td className={`p-3 text-right tabular-nums ${product.stock === 0 ? "text-red-600" : ""}`}>
                    {product.stock}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() =>
                        run(product.id, `/api/admin/products/${product.id}`, "PATCH", {
                          is_active: !product.is_active,
                        })
                      }
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.is_active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {product.is_active ? "Oui" : "Masqué"}
                    </button>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setEditing({ mode: "edit", product })}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => remove(product)}
                      className="ml-4 text-stone-500 hover:text-red-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: AdminProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ClientApiError | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      name: form.get("name"),
      description: form.get("description"),
      price_cents: Number(form.get("price_cents")),
      stock: Number(form.get("stock")),
      is_active: form.get("is_active") === "on",
    };
    setPending(true);
    setError(null);

    const result = product
      ? await api(`/api/admin/products/${product.id}`, "PATCH", body)
      : await api("/api/admin/products", "POST", body);

    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    onSaved();
  }

  const fieldError = (name: string) => {
    const message = error?.fields?.[name]?.[0];
    return message ? <span className="font-normal text-red-600">{message}</span> : null;
  };

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 rounded-lg border border-stone-200 bg-white p-5">
      <h2 className="font-semibold">{product ? `Modifier « ${product.name} »` : "Nouveau produit"}</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
          Nom
          <input name="name" defaultValue={product?.name} className={inputClass} />
          {fieldError("name")}
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
          Description
          <textarea name="description" rows={2} defaultValue={product?.description} className={inputClass} />
          {fieldError("description")}
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Prix (F CFA)
          <input
            name="price_cents"
            type="number"
            min={0}
            step={1}
            defaultValue={product?.price_cents ?? ""}
            className={inputClass}
          />
          {fieldError("price_cents")}
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Stock
          <input name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? ""} className={inputClass} />
          {fieldError("stock")}
        </label>
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={product?.is_active ?? true}
            className="h-4 w-4 accent-emerald-700"
          />
          Visible dans la boutique
        </label>
      </div>

      {error && !error.fields && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </p>
      )}

      <div className="mt-5 flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-stone-600 hover:text-stone-900">
          Annuler
        </button>
      </div>
    </form>
  );
}
