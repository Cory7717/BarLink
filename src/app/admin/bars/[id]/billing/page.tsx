import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logAdminAction } from "@/lib/adminAudit";

export default async function AdminBarBillingPage({ params }: { params: Promise<{ id: string }> }) {
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
      owner: {
        select: {
          email: true,
          name: true,
          subscription: { select: { id: true, status: true, plan: true, trialEndsAt: true, currentPeriodEnd: true } },
        },
      },
      barLicenses: { select: { id: true, status: true, priceCents: true, billingCycle: true, updatedAt: true } },
    },
  });

  if (!bar) redirect("/admin/bars");

  const sub = bar.owner.subscription;

  async function pauseBar() {
    "use server";
    await prisma.bar.update({ where: { id }, data: { isPublished: false } });
    await logAdminAction({ action: "admin.pauseBar", entityType: "bar", entityId: id, after: { isPublished: false } });
    redirect(`/admin/bars/${id}/billing`);
  }

  return (
    <div className="space-y-4">
      <Link href={`/admin/bars/${id}`} className="text-sm text-slate-300 hover:text-white">
        ← Back to bar
      </Link>
      <h1 className="text-3xl font-semibold text-gradient">Billing & Subscription</h1>
      <p className="text-sm text-slate-300">Owner: {bar.owner.email}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel rounded-2xl p-4 space-y-2">
          <h2 className="text-lg font-semibold text-white">Subscription</h2>
          <div className="text-sm text-slate-200 space-y-1">
            <div>ID: {sub?.id || "—"}</div>
            <div>Status: {sub?.status || "—"}</div>
            <div>Plan: {sub?.plan || "—"}</div>
            <div>Trial ends: {sub?.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString() : "—"}</div>
            <div>Current period end: {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—"}</div>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Manage status/plan in Admin → Subscriptions. All changes are logged in the Audit Log.
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 space-y-2">
          <h2 className="text-lg font-semibold text-white">Licenses</h2>
          {bar.barLicenses.length === 0 ? (
            <p className="text-sm text-slate-400">No bar licenses.</p>
          ) : (
            <ul className="text-sm text-slate-200 space-y-1">
              {bar.barLicenses.map((l) => (
                <li key={l.id}>
                  {l.status} • {l.billingCycle} • ${(l.priceCents / 100).toFixed(2)} • {new Date(l.updatedAt).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form action={pauseBar}>
        <button type="submit" className="btn-secondary px-4 py-2 text-sm">
          Pause bar (unpublish)
        </button>
      </form>
    </div>
  );
}
