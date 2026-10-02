import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { listCategories } from "@/lib/categories";
import { requireAdminPage } from "@/lib/guards";

export const metadata: Metadata = { title: "Catégories" };

export default async function AdminCategoriesPage() {
  await requireAdminPage("/admin/categories");
  const categories = await listCategories();

  return <CategoryManager categories={categories} />;
}
