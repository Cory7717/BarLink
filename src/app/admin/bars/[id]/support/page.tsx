import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNotesClient from "../AdminNotesClient";
import SupportTicketForm from "../SupportTicketForm";

export default async function AdminBarSupportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const bar = await prisma.bar.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      owner: { select: { email: true } },
      categoryRequests: { select: { id: true, category: true, status: true, createdAt: true }, take: 10, orderBy: { createdAt: "desc" } },
    },
  });

  if (!bar) redirect("/admin/bars");

  return (
    <div className="space-y-4">
      <Link href={`/admin/bars/${id}`} className="text-sm text-slate-300 hover:text-white">
        ← Back to bar
      </Link>
      <h1 className="text-3xl font-semibold text-gradient">Support & Notes</h1>
      <p className="text-sm text-slate-300">Owner: {bar.owner.email}</p>

      <div className="glass-panel rounded-2xl p-4">
        <h2 className="text-lg font-semibold text-white">Create support ticket</h2>
        <SupportTicketForm barId={bar.id} />
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <h2 className="text-lg font-semibold text-white">Category requests</h2>
        {bar.categoryRequests.length === 0 ? (
          <p className="text-sm text-slate-400">No requests.</p>
        ) : (
          <ul className="text-sm text-slate-200 space-y-1 mt-2">
            {bar.categoryRequests.map((r) => (
              <li key={r.id}>
                {r.category} • {r.status} • {new Date(r.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <h2 className="text-lg font-semibold text-white">Internal notes</h2>
        <AdminNotesClient barId={bar.id} />
      </div>
    </div>
  );
}
