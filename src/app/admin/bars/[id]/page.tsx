import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNotesClient from "../AdminNotesClient";
import { calculateSubtotalCents, calculateTaxCents, calculateTotalWithTaxCents } from "@/lib/pricing";

export default async function AdminBarDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      address: true,
      city: true,
      state: true,
      phone: true,
      website: true,
      basePlan: true,
      addonPro: true,
      addonPremium: true,
      addonInventory: true,
      planInterval: true,
      boostCreditsBalance: true,
      lastCalculatedTaxRate: true,
      subscriptionTier: true,
      inventoryAddOnEnabled: true,
      owner: { select: { email: true, name: true, subscription: { select: { status: true, plan: true, trialEndsAt: true, currentPeriodEnd: true } } } },
      events: { select: { id: true, title: true, startDate: true, isActive: true }, take: 5, orderBy: { startDate: "asc" } },
      offerings: { select: { id: true, category: true, isActive: true }, take: 5 },
      boosts: { select: { id: true, status: true, startAt: true, endAt: true }, take: 5, orderBy: { startAt: "desc" } },
    },
  });

  if (!bar) redirect("/admin/bars");

  const [visits30, scans30, eventsCount, offeringsCount] = await Promise.all([
    prisma.barVisit.count({ where: { barId: id, visitedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.inventoryScanSession.count({ where: { barId: id, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.event.count({ where: { barId: id, isActive: true } }),
    prisma.offering.count({ where: { barId: id, isActive: true } }),
  ]);

  const tier = bar.subscriptionTier || "FREE";
  const subStatus = bar.owner.subscription?.status || "UNKNOWN";
  const subPlan = bar.owner.subscription?.plan || "—";
  const trialEndsAt = bar.owner.subscription?.trialEndsAt;
  const currentPeriodEnd = bar.owner.subscription?.currentPeriodEnd;
  const trialEndingSoon = trialEndsAt ? trialEndsAt.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000 : false;
  const entitlements = {
    planInterval: (bar.planInterval || "MONTHLY").toUpperCase() as any,
    addonPro: bar.addonPro || bar.subscriptionTier === "PRO" || bar.subscriptionTier === "PREMIUM",
    addonPremium: bar.addonPremium || bar.subscriptionTier === "PREMIUM",
    addonInventory: bar.addonInventory || bar.inventoryAddOnEnabled,
  };
  const subtotalCents = calculateSubtotalCents(entitlements);
  const taxCents = calculateTaxCents(subtotalCents);
  const totalCents = calculateTotalWithTaxCents(entitlements);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/bars" className="text-sm text-slate-300 hover:text-white">
            ← Back to bars
          </Link>
          <h1 className="text-3xl font-semibold text-gradient">{bar.name}</h1>
          <p className="text-sm text-slate-300">
            {bar.city}, {bar.state} • Owner: {bar.owner?.email}
          </p>
        </div>
        <div className="text-right text-sm text-slate-300">
          <div>Base: BASIC</div>
          <div>Status: {subStatus}</div>
          <div>
            Add-ons: {entitlements.addonPremium ? "Premium" : entitlements.addonPro ? "Pro" : "None"}
            {entitlements.addonInventory ? " • Inventory" : ""}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-white">Overview</h2>
          <ul className="text-sm text-slate-200 space-y-1 mt-2">
            <li>Address: {bar.address}</li>
            <li>Phone: {bar.phone || "—"}</li>
            <li>Website: {bar.website || "—"}</li>
            <li>Subscription: {tier} ({subStatus})</li>
            <li>Plan: {subPlan}</li>
            <li>Trial ends: {trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : "—"}</li>
            <li>Current period end: {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : "—"}</li>
            <li>Trial ending in 7d: {trialEndingSoon ? "Yes" : "No"}</li>
            <li>Inventory add-on: {entitlements.addonInventory ? "Enabled" : "Disabled"}</li>
            <li>Plan interval: {entitlements.planInterval}</li>
            <li>Boost credits: {bar.boostCreditsBalance}</li>
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-white">Events & Offerings</h2>
          <div className="text-sm text-slate-200 mt-2">
            <div className="font-semibold text-white">Events</div>
            {bar.events.length === 0 ? (
              <p className="text-slate-400">No events</p>
            ) : (
              <ul className="list-disc pl-4">
                {bar.events.map((e) => (
                  <li key={e.id}>
                    {e.title} ({e.isActive ? "Active" : "Inactive"})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="text-sm text-slate-200 mt-3">
            <div className="font-semibold text-white">Offerings</div>
            {bar.offerings.length === 0 ? (
              <p className="text-slate-400">No offerings</p>
            ) : (
              <ul className="list-disc pl-4">
                {bar.offerings.map((o) => (
                  <li key={o.id}>
                    {o.category} ({o.isActive ? "Active" : "Inactive"})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-white">Billing & subscription</h2>
          <p className="text-sm text-slate-300 mb-3">Manage status/plan in Subscriptions. Audit log records admin changes.</p>
          <div className="space-y-1 text-sm text-slate-200">
            <div>Plan: {subPlan}</div>
            <div>Status: {subStatus}</div>
            <div>Interval: {entitlements.planInterval}</div>
            <div>Trial ends: {trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : "—"}</div>
            <div>Current period end: {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : "—"}</div>
            <div>Subtotal (pre-tax): ${(subtotalCents / 100).toFixed(2)}</div>
            <div>Tax (8.25%): ${(taxCents / 100).toFixed(2)}</div>
            <div>Total w/ tax: ${(totalCents / 100).toFixed(2)}</div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Link href="/admin/subscriptions" className="btn-secondary px-3 py-2 text-sm">
              Open subscriptions
            </Link>
            <Link href={`/admin/bars/${bar.id}/billing`} className="btn-secondary px-3 py-2 text-sm">
              Billing view
            </Link>
            <Link href="/admin/actions" className="btn-secondary px-3 py-2 text-sm">
              View audit
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-white">Engagement & scans (30d)</h2>
          <ul className="text-sm text-slate-200 space-y-1 mt-2">
            <li>Visits / check-ins: {visits30}</li>
            <li>Inventory photo scans: {scans30}</li>
            <li>Active events: {eventsCount}</li>
            <li>Active offerings: {offeringsCount}</li>
            <li>Recent boosts: {bar.boosts.length}</li>
          </ul>
          {bar.boosts.length > 0 && (
            <ul className="text-xs text-slate-300 mt-2 space-y-1">
              {bar.boosts.map((b) => (
                <li key={b.id}>
                  {b.status} • {b.startAt ? new Date(b.startAt).toLocaleDateString() : ""} –{" "}
                  {b.endAt ? new Date(b.endAt).toLocaleDateString() : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-white">Internal notes</h2>
          <p className="text-sm text-slate-300 mb-2">Only admins can see these.</p>
          <AdminNotesClient barId={bar.id} />
        </div>
      </div>
    </div>
  );
}
