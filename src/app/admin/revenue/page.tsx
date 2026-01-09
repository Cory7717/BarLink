import { prisma } from "@/lib/prisma";
import { Subscription } from "@/generated/prisma/client";

const PLAN_PRICE: Record<string, number> = {
  MONTHLY: 30,
  SIX_MONTH: 150 / 6, // monthly-equivalent
  YEARLY: 250 / 12,   // monthly-equivalent
};

export default async function AdminRevenuePage() {
  const active = await prisma.subscription.findMany({ where: { status: "ACTIVE" } });
  const mrr = active.reduce((sum: number, s: Subscription) => sum + (PLAN_PRICE[s.plan as keyof typeof PLAN_PRICE] || 0), 0);

  const byPlan = (active as Subscription[]).reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-3xl p-4">
        <h2 className="mb-2 text-xl font-semibold text-gradient">Revenue overview</h2>
        <div className="text-slate-300">Estimated MRR</div>
        <div className="text-4xl font-semibold">${mrr.toFixed(0)}/mo</div>
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
