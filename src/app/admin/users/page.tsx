import type { Metadata } from "next";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";
import { formatDate } from "@/lib/format";
import { requireAdminPage } from "@/lib/guards";
import { listUsers } from "@/lib/users";

export const metadata: Metadata = { title: "Utilisateurs" };

export default async function AdminUsersPage() {
  const admin = await requireAdminPage("/admin/users");
  const users = await listUsers();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-500">
            <tr>
              <th className="p-3 font-medium">Nom</th>
              <th className="p-3 font-medium">Adresse e-mail</th>
              <th className="p-3 font-medium">Inscription</th>
              <th className="p-3 font-medium">Rôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-3 font-medium">
                  {user.name}
                  {user.id === admin.id && <span className="ml-2 font-normal text-stone-500">(vous)</span>}
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 text-stone-500">{formatDate(user.created_at)}</td>
                <td className="p-3">
                  <UserRoleSelect userId={user.id} role={user.role} disabled={user.id === admin.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
