import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [
    ownersCount,
    activeSubs,
    barsCount,
    newBars7d,
    newBars30d,
    addOnCount,
    pastDueCount,
    trialsSoon,
    idleBars,
    failedPayments,
    zeroActivityBars,
  ] = await Promise.all([
    prisma.owner.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.bar.count(),
    prisma.bar.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.bar.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.bar.count({ where: { inventoryAddOnEnabled: true } }),
    prisma.subscription.count({ where: { status: "PAST_DUE" } }),
    prisma.subscription.count({
      where: {
        status: "ACTIVE",
        trialEndsAt: { gte: new Date(), lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.bar.count({
      where: {
        events: { none: {} },
        offerings: { none: {} },
      },
    }),
    prisma.subscription.count({ where: { status: "INCOMPLETE" } }),
    prisma.bar.count({
      where: {
        events: { none: {} },
        offerings: { none: {} },
        createdAt: { lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);
  let pendingApprovals = 0;
  try {
    const exists = await prisma.$queryRaw<{ name: string | null }[]>`
      SELECT to_regclass('public."CategoryRequest"')::text as name
    `;
    if (exists?.[0]?.name) {
      pendingApprovals = await prisma.categoryRequest.count({ where: { status: "PENDING" } });
    }
  } catch (error) {
    console.warn("CategoryRequest check failed:", error);
  }

  const addOnAdoptionPct = barsCount ? Math.round((addOnCount / barsCount) * 100) : 0;
  const alerts: { label: string; value: string | number; href?: string }[] = [];
  if (pendingApprovals > 0) alerts.push({ label: "Pending approvals", value: pendingApprovals, href: "/admin/approvals" });
  if (addOnAdoptionPct < 20) alerts.push({ label: "Inventory add-on adoption low", value: `${addOnAdoptionPct}%`, href: "/admin/bars?addOn=true" });
  if (pastDueCount > 0) alerts.push({ label: "Past due subscriptions", value: pastDueCount, href: "/admin/bars?status=PAST_DUE" });
  if (trialsSoon > 0) alerts.push({ label: "Trials ending (7d)", value: trialsSoon, href: "/admin/bars?status=TRIALING" });
  if (idleBars > 0) alerts.push({ label: "Bars with no events/offerings", value: idleBars, href: "/admin/bars?status=ACTIVE" });
  if (failedPayments > 0) alerts.push({ label: "Failed payments (incomplete)", value: failedPayments, href: "/admin/subscriptions" });
  if (zeroActivityBars > 0) alerts.push({ label: "Bars idle 14d (no content)", value: zeroActivityBars, href: "/admin/bars" });
  const recentScanFailures = await prisma.inventoryScanSession.count({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, detections: { none: {} } },
  });
  if (recentScanFailures > 0) alerts.push({ label: "Inventory scan failures (7d)", value: recentScanFailures, href: "/admin/scans/failed" });

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/bars" className="glass-panel rounded-2xl p-5 hover:border-cyan-300/60 transition-all border border-white/10">
          <div className="text-slate-300 text-sm">Owners</div>
          <div className="text-3xl font-semibold">{ownersCount}</div>
          <div className="text-xs text-cyan-200 mt-2">View all owners</div>
        </Link>
        <Link
          href="/admin/bars?activeOnly=true"
          className="glass-panel rounded-2xl p-5 hover:border-cyan-300/60 transition-all border border-white/10"
        >
          <div className="text-slate-300 text-sm">Active subscriptions</div>
          <div className="text-3xl font-semibold">{activeSubs}</div>
          <div className="text-xs text-cyan-200 mt-2">Filter bars with active subs</div>
        </Link>
        <Link href="/admin/bars" className="glass-panel rounded-2xl p-5 hover-border-cyan-300/60 transition-all border border-white/10">
          <div className="text-slate-300 text-sm">Bars</div>
          <div className="text-3xl font-semibold">{barsCount}</div>
          <div className="text-xs text-cyan-200 mt-2">Search by city or owner</div>
        </Link>
        <div className="glass-panel rounded-2xl p-5">
          <div className="text-slate-300 text-sm">Pending approvals</div>
          <div className="text-3xl font-semibold">{pendingApprovals}</div>
          <a className="text-xs text-cyan-200 hover:text-cyan-100 mt-2 inline-block" href="/admin/approvals">
            Review requests
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5">
          <div className="text-slate-300 text-sm">New bars (7d)</div>
          <div className="text-3xl font-semibold">{newBars7d}</div>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <div className="text-slate-300 text-sm">New bars (30d)</div>
          <div className="text-3xl font-semibold">{newBars30d}</div>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <div className="text-slate-300 text-sm">Inventory add-on adoption</div>
          <div className="text-3xl font-semibold">{addOnAdoptionPct}%</div>
          <div className="text-xs text-cyan-200 mt-2">Enabled bars: {addOnCount}</div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Alerts</h2>
          <Link href="/admin/reports" className="text-xs text-cyan-200 hover:text-cyan-100">
            Reports
          </Link>
        </div>
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-300">No critical alerts.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.label} className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2">
                <div className="text-sm text-amber-100">{alert.label}</div>
                <div className="text-sm font-semibold text-amber-50">{alert.value}</div>
                {alert.href && (
                  <Link href={alert.href} className="text-xs text-amber-100 underline">
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
