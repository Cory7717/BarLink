import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [ownersCount, activeSubs, barsCount] = await Promise.all([
    prisma.owner.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.bar.count(),
  ]);

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="text-slate-400 text-sm">Owners</div>
        <div className="text-3xl font-bold">{ownersCount}</div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="text-slate-400 text-sm">Active subscriptions</div>
        <div className="text-3xl font-bold">{activeSubs}</div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="text-slate-400 text-sm">Bars</div>
        <div className="text-3xl font-bold">{barsCount}</div>
      </div>
    </section>
  );
}
