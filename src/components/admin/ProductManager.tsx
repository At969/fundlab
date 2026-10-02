"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { IconButton } from "@/components/Icons";
import { ProductThumb } from "@/components/ProductThumb";
import { api, type ClientApiError } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";
import { MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES, type AdminProduct } from "@/lib/types";

type Editing = { mode: "create" } | { mode: "edit"; product: AdminProduct } | null;

// Image du formulaire : déjà enregistrée (url) ou choisie mais pas encore envoyée (file).
type FormImage = { key: string; url: string; file?: File };

const inputClass =
  "rounded-md border border-stone-300 bg-white px-3 py-2 text-base font-normal outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-500/25";

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

  const categories = [...new Set(products.flatMap((product) => (product.category ? [product.category] : [])))].sort(
    (a, b) => a.localeCompare(b, "fr"),
  );

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
          className="rounded-md bg-brand-900 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Nouveau produit
        </button>
      </div>

      {editing && (
        <ProductForm
          // La clé recrée le formulaire quand on change de produit, pour repartir de ses valeurs.
          key={editing.mode === "edit" ? editing.product.id : "create"}
          product={editing.mode === "edit" ? editing.product : null}
          categories={categories}
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
          <table className="table-cards w-full text-left text-sm md:min-w-[40rem]">
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
                      <ProductThumb src={product.image_urls[0] ?? null} name={product.name} size={40} />
                      <div>
                        {product.name}
                        <p className="font-normal text-stone-500">
                          {product.category && `${product.category} · `}
                          {product.image_urls.length === 0
                            ? "Aucune image"
                            : `${product.image_urls.length} image${product.image_urls.length > 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td data-label="Prix" className="p-3 text-right tabular-nums">
                    {formatPrice(product.price_cents)}
                  </td>
                  <td
                    data-label="Stock"
                    className={`p-3 text-right tabular-nums ${product.stock === 0 ? "text-red-600" : ""}`}
                  >
                    {product.stock}
                  </td>
                  <td data-label="En vente" className="p-3">
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
                  <td data-label="Actions" className="p-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <IconButton
                        icon="pencil"
                        tone="accent"
                        label={`Modifier ${product.name}`}
                        onClick={() => setEditing({ mode: "edit", product })}
                      />
                      <IconButton
                        icon="trash"
                        tone="danger"
                        label={`Supprimer ${product.name}`}
                        disabled={busyId === product.id}
                        onClick={() => remove(product)}
                      />
                    </div>
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
  categories,
  onClose,
  onSaved,
}: {
  product: AdminProduct | null;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ClientApiError | null>(null);
  const [images, setImages] = useState<FormImage[]>(
    () => product?.image_urls.map((url) => ({ key: url, url })) ?? [],
  );

  // Les aperçus locaux (blob:) sont libérés à la fermeture du formulaire.
  const previewUrls = useRef<string[]>([]);
  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const imageError = (message: string) => setError({ message: "", fields: { image_urls: [message] } });

  function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError(null);

    if (files.some((file) => file.size > MAX_IMAGE_BYTES)) {
      imageError("Chaque image doit faire 2 Mo au maximum.");
      return;
    }
    if (images.length + files.length > MAX_PRODUCT_IMAGES) {
      imageError(`${MAX_PRODUCT_IMAGES} images maximum par produit.`);
      return;
    }
    setImages((current) => [
      ...current,
      ...files.map((file) => {
        const url = URL.createObjectURL(file);
        previewUrls.current.push(url);
        return { key: url, url, file };
      }),
    ]);
  }

  // Toute action sur les images efface un éventuel message d'erreur devenu sans objet
  // (« 6 images maximum » n'a plus lieu d'être après un retrait).
  function removeImage(key: string) {
    setError(null);
    setImages((current) => current.filter((image) => image.key !== key));
  }

  function makeMain(key: string) {
    setError(null);
    setImages((current) => {
      const chosen = current.find((image) => image.key === key);
      return chosen ? [chosen, ...current.filter((image) => image.key !== key)] : current;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    // Les nouvelles images partent d'abord : le produit n'enregistre que les URL renvoyées par le serveur.
    const uploaded: FormImage[] = [];
    for (const image of images) {
      if (!image.file) {
        uploaded.push(image);
        continue;
      }
      const body = new FormData();
      body.set("file", image.file);
      const result = await api<{ url: string }>("/api/admin/uploads", "POST", body);
      if (result.error) {
        // Les images déjà envoyées sont conservées dans le formulaire pour ne pas les renvoyer.
        setImages([...uploaded, ...images.slice(uploaded.length)]);
        imageError(`${image.file.name} : ${result.error.message}`);
        setPending(false);
        return;
      }
      uploaded.push({ key: result.data.url, url: result.data.url });
    }
    setImages(uploaded);

    const body = {
      name: form.get("name"),
      description: form.get("description"),
      category: form.get("category"),
      price_cents: Number(form.get("price_cents")),
      stock: Number(form.get("stock")),
      is_active: form.get("is_active") === "on",
      image_urls: uploaded.map((image) => image.url),
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

      {/* min-w-0 : sans lui, un fieldset ou un champ fichier impose sa largeur minimale à la grille. */}
      <div className="mt-4 grid gap-4 *:min-w-0 sm:grid-cols-2">
        <fieldset className="flex min-w-0 flex-col gap-2 text-sm sm:col-span-2">
          <legend className="font-medium">
            Images ({images.length}/{MAX_PRODUCT_IMAGES})
          </legend>

          {images.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-3">
              {images.map((image, index) => (
                <li key={image.key} className="flex w-24 flex-col items-center gap-1">
                  <div className={`rounded-lg p-0.5 ${index === 0 ? "ring-2 ring-accent-500" : ""}`}>
                    <ProductThumb src={image.url} name={product?.name ?? "?"} size={88} />
                  </div>
                  <div className="flex h-9 items-center gap-1">
                    {index === 0 ? (
                      <span className="px-1 text-xs font-medium text-accent-700">Principale</span>
                    ) : (
                      <IconButton
                        icon="star"
                        tone="accent"
                        label="Définir comme image principale"
                        onClick={() => makeMain(image.key)}
                      />
                    )}
                    <IconButton
                      icon="close"
                      tone="danger"
                      label="Retirer cette image"
                      onClick={() => removeImage(image.key)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {images.length < MAX_PRODUCT_IMAGES && (
            <input
              type="file"
              multiple
              aria-label="Ajouter des images"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFilesChange}
              className="mt-1 w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-stone-200"
            />
          )}
          <span className="text-stone-500">
            JPEG, PNG ou WebP, 2 Mo maximum par image. La première image est celle affichée dans le catalogue.
          </span>
          {fieldError("image_urls")}
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
          Nom
          <input name="name" defaultValue={product?.name} className={inputClass} />
          {fieldError("name")}
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
          Description
          <textarea name="description" rows={3} defaultValue={product?.description} className={inputClass} />
          {fieldError("description")}
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
          <span>
            Catégorie <span className="font-normal text-stone-500">(facultatif)</span>
          </span>
          {/* Les catégories déjà utilisées sont proposées, pour éviter les doublons mal orthographiés. */}
          <input
            name="category"
            list="product-categories"
            maxLength={40}
            autoComplete="off"
            defaultValue={product?.category ?? ""}
            placeholder="Choisir ou saisir une catégorie"
            className={inputClass}
          />
          <datalist id="product-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          {fieldError("category")}
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
            className="h-4 w-4 accent-brand-900"
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
          className="rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
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
