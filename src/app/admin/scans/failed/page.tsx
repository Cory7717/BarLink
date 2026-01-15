import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getFailedScans() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/admin/scans/failed`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.scans || [];
}

export default async function AdminFailedScansPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const scans = await getFailedScans();

  return (
    <div className="space-y-4">
      <Link href="/admin" className="text-sm text-slate-300 hover:text-white">
        ← Back to overview
      </Link>
      <h1 className="text-3xl font-semibold text-gradient">Failed inventory scans (last 30d)</h1>
      <div className="glass-panel rounded-3xl p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="px-2 py-1">Scan ID</th>
              <th className="px-2 py-1">Bar</th>
              <th className="px-2 py-1">Created</th>
              <th className="px-2 py-1">Image</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s: any) => (
              <tr key={s.id} className="border-t border-white/5 text-slate-200">
                <td className="px-2 py-2">{s.id}</td>
                <td className="px-2 py-2">
                  {s.bar?.name || s.barId} {s.bar?.city ? `(${s.bar.city})` : ""}
                </td>
                <td className="px-2 py-2 text-xs text-slate-400">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="px-2 py-2">
                  {s.imageUrl ? (
                    <a href={s.imageUrl} target="_blank" rel="noreferrer" className="text-cyan-200 hover:text-cyan-100">
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {(!scans || scans.length === 0) && (
              <tr>
                <td className="px-2 py-2 text-slate-400" colSpan={4}>
                  No failed scans in last 30 days.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
