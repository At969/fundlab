import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { ProductCard } from "@/components/ProductCard";
import { redirectAdminToDashboard } from "@/lib/guards";
import { listActiveProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Tous les produits" };

export default async function ProductsPage() {
  await redirectAdminToDashboard();
  const products = await listActiveProducts();

  return (
    <div>
      <BackLink href="/">Accueil</BackLink>
      <h1 className="text-2xl font-semibold tracking-tight">Tous les produits</h1>

      {products.length === 0 ? (
        <p className="mt-6 text-stone-600">Aucun produit n&apos;est disponible pour le moment.</p>
      ) : (
        <>
          <p className="mt-1 text-stone-500">
            {products.length} produit{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}
          </p>
          <ul className="animate-fade-up mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
