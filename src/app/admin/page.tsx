import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [ownersCount, activeSubs, barsCount] = await Promise.all([
    prisma.owner.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.bar.count(),
  ]);

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="glass-panel rounded-2xl p-5">
        <div className="text-slate-300 text-sm">Owners</div>
        <div className="text-3xl font-semibold">{ownersCount}</div>
      </div>
      <div className="glass-panel rounded-2xl p-5">
        <div className="text-slate-300 text-sm">Active subscriptions</div>
        <div className="text-3xl font-semibold">{activeSubs}</div>
      </div>
      <div className="glass-panel rounded-2xl p-5">
        <div className="text-slate-300 text-sm">Bars</div>
        <div className="text-3xl font-semibold">{barsCount}</div>
      </div>
    </section>
  );
}
