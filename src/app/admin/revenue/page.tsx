import { prisma } from "@/lib/prisma";

const PLAN_PRICE: Record<string, number> = {
  MONTHLY: 30,
  SIX_MONTH: 150 / 6, // monthly-equivalent
  YEARLY: 250 / 12,   // monthly-equivalent
};

export default async function AdminRevenuePage() {
  const active = await prisma.subscription.findMany({ where: { status: "ACTIVE" } });
  const mrr = active.reduce((sum, s) => sum + (PLAN_PRICE[s.plan as keyof typeof PLAN_PRICE] || 0), 0);

  const byPlan = active.reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-2 text-xl font-semibold">Revenue overview</h2>
        <div className="text-slate-300">Estimated MRR</div>
        <div className="text-4xl font-bold">${mrr.toFixed(0)}/mo</div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="mb-2 text-lg font-semibold">Active subscriptions by plan</h3>
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
