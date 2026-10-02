import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: { default: "Administration", template: "%s · Administration" } };

// Simple habillage : le contrôle d'accès est fait dans chaque page (requireAdminPage)
// et dans chaque route /api/admin, pas ici.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Administration</p>
      <AdminNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
