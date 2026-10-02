import { ProductCard } from "@/components/ProductCard";
import { listActiveProducts } from "@/lib/products";

export default async function HomePage() {
  const products = await listActiveProducts();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Nos produits</h1>

      {products.length === 0 ? (
        <p className="mt-6 text-stone-600">Aucun produit n&apos;est disponible pour le moment.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
}
