import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TicketStatusControls from "./ticket-controls";

async function getTickets(status?: string) {
  const params = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`/api/admin/support${params}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.tickets || [];
}

export default async function AdminSupportPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const status = searchParams.status;
  const tickets = await getTickets(status);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gradient">Support tickets</h1>
        <div className="flex gap-2 text-sm">
          <Link href="/admin/support" className="btn-secondary px-3 py-1.5">
            All
          </Link>
          <Link href="/admin/support?status=OPEN" className="btn-secondary px-3 py-1.5">
            Open
          </Link>
          <Link href="/admin/support?status=CLOSED" className="btn-secondary px-3 py-1.5">
            Closed
          </Link>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="px-2 py-1">Created</th>
              <th className="px-2 py-1">User</th>
              <th className="px-2 py-1">Subject</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Priority</th>
              <th className="px-2 py-1">Bar</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t: any) => (
              <tr key={t.id} className="border-t border-white/5 text-slate-200">
                <td className="px-2 py-2 text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="px-2 py-2">{t.userEmail}</td>
                <td className="px-2 py-2">
                  <Link href={`/admin/support/${t.id}`} className="text-cyan-200 hover:text-cyan-100">
                    {t.subject}
                  </Link>
                </td>
                <td className="px-2 py-2">{t.status}</td>
                <td className="px-2 py-2">{t.priority}</td>
                <td className="px-2 py-2">{t.barId || "—"}</td>
                <td className="px-2 py-2">
                  <TicketStatusControls ticketId={t.id} currentStatus={t.status} currentPriority={t.priority} />
                </td>
              </tr>
            ))}
            {(!tickets || tickets.length === 0) && (
              <tr>
                <td className="px-2 py-2 text-slate-400" colSpan={7}>
                  No tickets.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
