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
    .replace(/\p{Diacritic}/gu, "");

type Props = { products: Product[]; initialQuery: string; initialCategory: string };

// Catalogue avec recherche instantanée et filtre par catégorie. Tous les produits sont déjà
// chargés : le filtre se fait dans le navigateur, sans requête. La recherche et la catégorie
// sont reflétées dans l'URL (?q=…&categorie=…) pour qu'un lien ou un rechargement les conserve.
export function ProductCatalog({ products, initialQuery, initialCategory }: Props) {
  const [query, setQuery] = useState(initialQuery);

  // Catégories présentes dans le catalogue, avec leur nombre de produits.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      if (product.category) counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return [...counts].sort(([a], [b]) => a.localeCompare(b, "fr"));
  }, [products]);

  // Une catégorie inconnue dans l'URL (lien périmé) revient à « Tous ».
  const [category, setCategory] = useState(() =>
    categories.some(([name]) => name === initialCategory) ? initialCategory : "",
  );

  const index = useMemo(
    () =>
      products.map((product) => ({
        product,
        tokens: normalize(`${product.name} ${product.description} ${product.category ?? ""}`)
          .split(/[^a-z0-9]+/)
          .filter(Boolean),
      })),
    [products],
  );

  // Chaque mot saisi doit être le début d'un mot du nom, de la description ou de la catégorie :
  // « cle » trouve « clé » mais pas « article ».
  const words = normalize(query).split(/[^a-z0-9]+/).filter(Boolean);
  const results = index
    .filter((entry) => !category || entry.product.category === category)
    .filter((entry) => words.every((word) => entry.tokens.some((token) => token.startsWith(word))))
    .map((entry) => entry.product);

  function update(nextQuery: string, nextCategory: string) {
    setQuery(nextQuery);
    setCategory(nextCategory);
    const url = new URL(window.location.href);
    const params = { q: nextQuery.trim(), categorie: nextCategory };
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(null, "", url);
  }

  const filtered = words.length > 0 || category !== "";
  const plural = (count: number) => (count > 1 ? "s" : "");
  const summary = filtered
    ? `${results.length} résultat${plural(results.length)}` +
      (words.length > 0 ? ` pour « ${query.trim()} »` : "") +
      (category ? ` dans « ${category} »` : "")
    : `${products.length} produit${plural(products.length)} disponible${plural(products.length)}`;

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
          onChange={(event) => update(event.target.value, category)}
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
            onClick={() => update("", category)}
            className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        )}
      </div>

      {categories.length > 0 && (
        // Sur téléphone, la rangée défile horizontalement (au doigt, barre de défilement masquée)
        // plutôt que de s'empiler sur plusieurs lignes.
        <div
          role="group"
          aria-label="Filtrer par catégorie"
          className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <CategoryChip label="Tous" count={products.length} active={category === ""} onClick={() => update(query, "")} />
          {categories.map(([name, count]) => (
            <CategoryChip
              key={name}
              label={name}
              count={count}
              active={category === name}
              onClick={() => update(query, name)}
            />
          ))}
        </div>
      )}

      <p aria-live="polite" className="mt-3 text-sm text-stone-500">
        {summary}
      </p>

      {results.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-stone-300 px-6 py-12 text-center">
          <p className="font-medium">Aucun produit ne correspond à votre recherche.</p>
          <p className="mt-1 text-sm text-stone-600">
            Vérifiez l&apos;orthographe, essayez un mot plus général ou une autre catégorie.
          </p>
          <button
            type="button"
            onClick={() => update("", "")}
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

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition ${
        active
          ? "border-brand-900 bg-brand-900 text-white"
          : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
      }`}
    >
      {label} <span className={active ? "text-white/70" : "text-stone-400"}>{count}</span>
    </button>
  );
}
