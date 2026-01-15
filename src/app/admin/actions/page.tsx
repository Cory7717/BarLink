import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getLogs() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/admin/actions/log`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.logs || [];
}

export default async function AdminActionsPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const logs = await getLogs();

  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-semibold text-gradient">Admin actions</h1>
      <p className="text-sm text-slate-300">Latest audit log entries.</p>
      <div className="glass-panel rounded-3xl p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="px-2 py-1">When</th>
              <th className="px-2 py-1">Admin</th>
              <th className="px-2 py-1">Action</th>
              <th className="px-2 py-1">Entity</th>
              <th className="px-2 py-1">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id} className="border-t border-white/5 text-slate-200">
                <td className="px-2 py-2 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-2 py-2">{log.adminEmail}</td>
                <td className="px-2 py-2">{log.action}</td>
                <td className="px-2 py-2">
                  {log.entityType || "-"} {log.entityId || ""}
                </td>
                <td className="px-2 py-2 text-xs text-slate-300">
                  {log.after ? JSON.stringify(log.after) : log.before ? JSON.stringify(log.before) : "-"}
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td className="px-2 py-2 text-slate-400" colSpan={5}>
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
