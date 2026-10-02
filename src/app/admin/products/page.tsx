import type { Metadata } from "next";
import { ProductManager } from "@/components/admin/ProductManager";
import { listCategories } from "@/lib/categories";
import { requireAdminPage } from "@/lib/guards";
import { listAllProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Produits" };

export default async function AdminProductsPage() {
  await requireAdminPage("/admin/products");
  const [products, categories] = await Promise.all([listAllProducts(), listCategories()]);

  return <ProductManager products={products} categories={categories} />;
}
