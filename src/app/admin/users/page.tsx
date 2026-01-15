import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserActions from "./user-actions";

async function getUsers(q?: string) {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/admin/users`);
  if (q) url.searchParams.set("q", q);
  url.searchParams.set("bars", "true");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.users || [];
}

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const q = searchParams.q;
  const users = await getUsers(q);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gradient">Users</h1>
          <p className="text-sm text-slate-300">Search by email or name. Shows recent bars visited.</p>
        </div>
        <form className="flex gap-2" action="/admin/users" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="email or name"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          />
          <button type="submit" className="btn-secondary px-3 py-2 text-sm">
            Search
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-3xl p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="px-2 py-1">Email</th>
              <th className="px-2 py-1">Name</th>
              <th className="px-2 py-1">Role</th>
              <th className="px-2 py-1">Created</th>
              <th className="px-2 py-1">Recent bars</th>
              <th className="px-2 py-1">Disabled</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-t border-white/5 text-slate-200">
                <td className="px-2 py-2">{u.email}</td>
                <td className="px-2 py-2">{u.name || "—"}</td>
                <td className="px-2 py-2">{u.role || "PATRON"}</td>
                <td className="px-2 py-2 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-2 py-2 text-xs text-slate-300">
                  {u.visits?.length
                    ? u.visits.map((v: any) => v.barId).join(", ")
                    : "—"}
                </td>
                <td className="px-2 py-2 text-xs text-slate-300">
                  {u.disabled ? "Yes" : "No"}
                </td>
                <td className="px-2 py-2">
                  <UserActions userId={u.id} />
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td className="px-2 py-2 text-slate-400" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link href="/admin/actions" className="text-sm text-cyan-200 hover:text-cyan-100">
        View audit log
      </Link>
    </div>
  );
}
