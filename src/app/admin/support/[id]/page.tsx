import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import TicketStatusControls from "../ticket-controls";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
  });
  if (!ticket) redirect("/admin/support");

  return (
    <div className="space-y-3">
      <Link href="/admin/support" className="text-sm text-slate-300 hover:text-white">
        ← Back to support
      </Link>
      <h1 className="text-2xl font-semibold text-gradient">Ticket: {ticket.subject}</h1>
      <div className="glass-panel rounded-3xl p-4 space-y-3">
        <div className="text-sm text-slate-200">
          <div><span className="text-slate-400">User:</span> {ticket.userEmail}</div>
          <div><span className="text-slate-400">Bar:</span> {ticket.barId || "—"}</div>
          <div><span className="text-slate-400">Created:</span> {new Date(ticket.createdAt).toLocaleString()}</div>
        </div>
        <div className="text-sm text-slate-200">
          <div className="text-slate-400">Message:</div>
          <div className="mt-1 whitespace-pre-wrap">{ticket.message}</div>
        </div>
        {ticket.resolution && (
          <div className="text-sm text-emerald-200">
            <div className="text-slate-400">Resolution:</div>
            <div className="mt-1 whitespace-pre-wrap">{ticket.resolution}</div>
          </div>
        )}
        <TicketStatusControls
          ticketId={ticket.id}
          currentStatus={ticket.status}
          currentPriority={ticket.priority}
          currentResolution={ticket.resolution}
        />
      </div>
    </div>
  );
}
