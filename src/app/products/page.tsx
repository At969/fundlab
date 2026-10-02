import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { ProductCatalog } from "@/components/ProductCatalog";
import { redirectAdminToDashboard } from "@/lib/guards";
import { listActiveProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Tous les produits" };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function ProductsPage({ searchParams }: Props) {
  await redirectAdminToDashboard();
  const [products, { q }] = await Promise.all([listActiveProducts(), searchParams]);
  const initialQuery = (Array.isArray(q) ? q[0] : q) ?? "";

  return (
    <div>
      <BackLink href="/">Accueil</BackLink>
      <h1 className="text-2xl font-semibold tracking-tight">Tous les produits</h1>

      {products.length === 0 ? (
        <p className="mt-6 text-stone-600">Aucun produit n&apos;est disponible pour le moment.</p>
      ) : (
        <div className="animate-fade-up">
          <ProductCatalog products={products} initialQuery={initialQuery.slice(0, 100)} />
        </div>
      )}
    </div>
  );
}
