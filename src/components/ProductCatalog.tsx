"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

// Minuscules et sans accents : « cle » trouve « Clé USB ».
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// Catalogue avec recherche instantanée. Tous les produits sont déjà chargés : le filtre
// se fait dans le navigateur, sans requête, et la recherche est reflétée dans l'URL (?q=)
// pour qu'un lien ou un rechargement la conserve.
export function ProductCatalog({ products, initialQuery }: { products: Product[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);

  const index = useMemo(
    () =>
      products.map((product) => ({
        product,
        tokens: normalize(`${product.name} ${product.description}`).split(/[^a-z0-9]+/).filter(Boolean),
      })),
    [products],
  );

  // Chaque mot saisi doit être le début d'un mot du nom ou de la description :
  // « cle » trouve « clé » mais pas « article ».
  const words = normalize(query).split(/[^a-z0-9]+/).filter(Boolean);
  const results = index
    .filter((entry) => words.every((word) => entry.tokens.some((token) => token.startsWith(word))))
    .map((entry) => entry.product);

  function update(value: string) {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }

  const plural = results.length > 1 ? "s" : "";

  return (
    <>
      <div role="search" className="relative mt-4 max-w-md">
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-stone-400"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => update(event.target.value)}
          placeholder="Rechercher un produit"
          aria-label="Rechercher un produit"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="w-full rounded-full border border-stone-300 bg-white py-2.5 pr-10 pl-10 text-base outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-500/25 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Effacer la recherche"
            title="Effacer la recherche"
            onClick={() => update("")}
            className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        )}
      </div>

      <p aria-live="polite" className="mt-3 text-sm text-stone-500">
        {words.length === 0
          ? `${products.length} produit${products.length > 1 ? "s" : ""} disponible${products.length > 1 ? "s" : ""}`
          : `${results.length} résultat${plural} pour « ${query.trim()} »`}
      </p>

      {results.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-stone-300 px-6 py-12 text-center">
          <p className="font-medium">Aucun produit ne correspond à votre recherche.</p>
          <p className="mt-1 text-sm text-stone-600">Vérifiez l&apos;orthographe ou essayez un mot plus général.</p>
          <button
            type="button"
            onClick={() => update("")}
            className="mt-4 text-sm font-semibold text-accent-700 hover:underline"
          >
            Voir tous les produits
          </button>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </>
  );
}
