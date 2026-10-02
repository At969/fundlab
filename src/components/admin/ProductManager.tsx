"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ProductThumb } from "@/components/ProductThumb";
import { api, type ClientApiError } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";
import type { AdminProduct } from "@/lib/types";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

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
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-3">
                      <ProductThumb src={product.image_url} name={product.name} size={40} />
                      {product.name}
                    </div>
                  </td>
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
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);

  // Aperçu local du fichier choisi ; l'URL temporaire est libérée dès qu'elle n'est plus affichée.
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    if (preview) return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (selected && selected.size > MAX_IMAGE_BYTES) {
      setError({ message: "", fields: { image_url: ["L'image ne doit pas dépasser 2 Mo."] } });
      event.target.value = "";
      return;
    }
    setError(null);
    setFile(selected);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    // L'image part d'abord : le produit n'enregistre que l'URL renvoyée par le serveur.
    let image_url = imageUrl;
    if (file) {
      const upload = new FormData();
      upload.set("file", file);
      const uploaded = await api<{ url: string }>("/api/admin/uploads", "POST", upload);
      if (uploaded.error) {
        setError({ message: "", fields: { image_url: [uploaded.error.message] } });
        setPending(false);
        return;
      }
      image_url = uploaded.data.url;
      setImageUrl(image_url);
      setFile(null);
    }

    const body = {
      name: form.get("name"),
      description: form.get("description"),
      price_cents: Number(form.get("price_cents")),
      stock: Number(form.get("stock")),
      is_active: form.get("is_active") === "on",
      image_url,
    };

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
        <div className="flex items-center gap-4 sm:col-span-2">
          <ProductThumb src={preview ?? imageUrl} name={product?.name ?? "?"} size={80} />
          <div className="flex flex-col gap-1.5 text-sm">
            <label className="font-medium" htmlFor="product-image">
              Image du produit
            </label>
            <input
              // Changer la clé recrée le champ, donc le vide, après un retrait d'image.
              key={inputKey}
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-stone-200"
            />
            <span className="text-stone-500">JPEG, PNG ou WebP, 2 Mo maximum.</span>
            {(file || imageUrl) && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setImageUrl(null);
                  setInputKey((key) => key + 1);
                }}
                className="self-start text-stone-500 hover:text-red-600"
              >
                Retirer l&apos;image
              </button>
            )}
            {fieldError("image_url")}
          </div>
        </div>
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
