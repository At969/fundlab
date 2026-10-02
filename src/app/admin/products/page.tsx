import type { Metadata } from "next";
import { ProductManager } from "@/components/admin/ProductManager";
import { requireAdminPage } from "@/lib/guards";
import { listAllProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Produits" };

export default async function AdminProductsPage() {
  await requireAdminPage("/admin/products");
  const products = await listAllProducts();

  return <ProductManager products={products} />;
}
