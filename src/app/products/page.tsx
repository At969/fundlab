import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { redirectAdminToDashboard } from "@/lib/guards";
import { listActiveProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Tous les produits" };

export default async function ProductsPage() {
  await redirectAdminToDashboard();
  const products = await listActiveProducts();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Tous les produits</h1>

      {products.length === 0 ? (
        <p className="mt-6 text-stone-600">Aucun produit n&apos;est disponible pour le moment.</p>
      ) : (
        <>
          <p className="mt-1 text-stone-500">
            {products.length} produit{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}
          </p>
          <ul className="animate-fade-up mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
