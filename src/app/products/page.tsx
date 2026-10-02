import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { ProductCatalog } from "@/components/ProductCatalog";
import { redirectAdminToDashboard } from "@/lib/guards";
import { listActiveProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Tous les produits" };

type Search = { q?: string | string[]; categorie?: string | string[] };
type Props = { searchParams: Promise<Search> };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export default async function ProductsPage({ searchParams }: Props) {
  await redirectAdminToDashboard();
  const [products, search] = await Promise.all([listActiveProducts(), searchParams]);

  return (
    <div>
      <BackLink href="/">Accueil</BackLink>
      <h1 className="text-2xl font-semibold tracking-tight">Tous les produits</h1>

      {products.length === 0 ? (
        <p className="mt-6 text-stone-600">Aucun produit n&apos;est disponible pour le moment.</p>
      ) : (
        <div className="animate-fade-up">
          <ProductCatalog
            products={products}
            initialQuery={first(search.q).slice(0, 100)}
            initialCategory={first(search.categorie)}
          />
        </div>
      )}
    </div>
  );
}
