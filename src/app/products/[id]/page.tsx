import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BackLink } from "@/components/BackLink";
import { ProductGallery } from "@/components/ProductGallery";
import { formatPrice } from "@/lib/format";
import { redirectAdminToDashboard } from "@/lib/guards";
import { getActiveProduct } from "@/lib/products";
import { idSchema } from "@/lib/validation";

type Props = { params: Promise<{ id: string }> };

const LOW_STOCK_THRESHOLD = 5;

// Mise en cache le temps du rendu : generateMetadata et la page partagent la même lecture.
const loadProduct = cache(async (id: string) => (idSchema.safeParse(id).success ? getActiveProduct(id) : null));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await loadProduct((await params).id);
  if (!product) return { title: "Produit introuvable" };
  return { title: product.name, description: product.description || undefined };
}

export default async function ProductPage({ params }: Props) {
  await redirectAdminToDashboard();
  const product = await loadProduct((await params).id);
  if (!product) notFound();

  const stockLabel =
    product.stock === 0
      ? { text: "Rupture de stock", className: "bg-stone-200 text-stone-600" }
      : product.stock <= LOW_STOCK_THRESHOLD
        ? { text: `Plus que ${product.stock} en stock`, className: "bg-amber-100 text-amber-800" }
        : { text: `En stock (${product.stock} disponibles)`, className: "bg-emerald-100 text-emerald-800" };

  return (
    <div>
      <BackLink href="/products">Tous les produits</BackLink>

      <div className="animate-fade-up mt-2 grid gap-10 md:grid-cols-2 md:items-start">
        <ProductGallery images={product.image_urls} name={product.name} />

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">{product.name}</h1>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{formatPrice(product.price_cents)}</p>
          <p className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${stockLabel.className}`}>
            {stockLabel.text}
          </p>

          {product.description && (
            <>
              <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-stone-500">Description</h2>
              <p className="mt-2 whitespace-pre-line text-stone-700">{product.description}</p>
            </>
          )}

          <AddToCartButton
            product={product}
            className="mt-8 w-full rounded-md bg-brand-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 sm:w-auto"
          />
        </div>
      </div>
    </div>
  );
}
