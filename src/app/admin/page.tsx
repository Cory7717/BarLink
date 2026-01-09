import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [ownersCount, activeSubs, barsCount] = await Promise.all([
    prisma.owner.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.bar.count(),
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

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="glass-panel rounded-2xl p-5">
        <div className="text-slate-300 text-sm">Pending approvals</div>
        <div className="text-3xl font-semibold">{pendingApprovals}</div>
        <a className="text-xs text-cyan-200 hover:text-cyan-100 mt-2 inline-block" href="/admin/approvals">
          Review requests
        </a>
      </div>
    </section>
  );
}
