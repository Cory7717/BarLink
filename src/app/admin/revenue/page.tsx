import { prisma } from "@/lib/prisma";
import { Subscription } from "@/generated/prisma/client";

const PLAN_PRICE: Record<string, number> = {
  MONTHLY: 30,
  SIX_MONTH: 150 / 6, // monthly-equivalent
  YEARLY: 250 / 12,   // monthly-equivalent
};

export default async function AdminRevenuePage() {
  const [active, freeOwners] = await Promise.all([
    prisma.subscription.findMany({ where: { status: "ACTIVE" } }),
    prisma.owner.findMany({
      where: { allowFreeListings: true },
      select: { id: true, email: true, createdAt: true },
    }),
  ]);
  const mrr = active.reduce((sum: number, s: Subscription) => sum + (PLAN_PRICE[s.plan as keyof typeof PLAN_PRICE] || 0), 0);

  const byPlan = (active as Subscription[]).reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1;
    return acc;
  }, {});

  const now = new Date();
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(now.getDate() + 5);

  const freeExpiring = freeOwners.filter((owner) => {
    const created = owner.createdAt;
    return created >= now && created <= fiveDaysFromNow;
  }).length;

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-3xl p-4">
        <h2 className="mb-2 text-xl font-semibold text-gradient">Revenue overview</h2>
        <div className="text-slate-300">Estimated MRR</div>
        <div className="text-4xl font-semibold">${mrr.toFixed(0)}/mo</div>
      </div>
      <div className="glass-panel rounded-3xl p-4 grid gap-3 sm:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-gradient">Free listings (active)</h3>
          <p className="text-3xl font-semibold text-white">{freeOwners.length}</p>
          <p className="text-sm text-slate-300">Owners with free listing enabled.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gradient">Free expiring (next 5 days)</h3>
          <p className="text-3xl font-semibold text-white">{freeExpiring}</p>
          <p className="text-sm text-slate-300">Created within the last 5 days (suggest follow-up).</p>
        </div>
      </div>
      <div className="glass-panel rounded-3xl p-4">
        <h3 className="mb-2 text-lg font-semibold text-gradient">Active subscriptions by plan</h3>
        <ul className="text-sm text-slate-200">
          {Object.entries(byPlan).map(([plan, count]) => (
            <li key={plan}>{plan}: {count}</li>
          ))}
          {Object.keys(byPlan).length === 0 && <li>No active subscriptions</li>}
        </ul>
      </div>
    </section>
  );
}
