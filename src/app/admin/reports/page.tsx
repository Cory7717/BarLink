import { format } from "date-fns";
import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PLAN_PRICE: Record<string, number> = {
  MONTHLY: 30,
  SIX_MONTH: 150,
  YEARLY: 250,
};

function parseDate(value: string | undefined, fallbackDaysAgo: number) {
  if (!value) {
    const d = new Date();
    d.setDate(d.getDate() - fallbackDaysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const d = new Date();
    d.setDate(d.getDate() - fallbackDaysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return parsed;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!isAdminEmail(email)) {
    return null;
  }

  const start = parseDate(params.start as string | undefined, 30);
  const end = parseDate(params.end as string | undefined, 0);
  end.setHours(23, 59, 59, 999);

  const [activeOwners, activeSubs, canceledSubs, createdSubs, visitsByBar] = await Promise.all([
    prisma.owner.count(),
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { owner: true },
    }),
    prisma.subscription.findMany({
      where: {
        status: "CANCELED",
        canceledAt: {
          gte: start,
          lte: end,
        },
      },
      include: { owner: true },
      orderBy: { canceledAt: "desc" },
    }),
    prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: { owner: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.barVisit.groupBy({
      by: ["barId"],
      _count: { _all: true },
      where: {
        visitedAt: {
          gte: start,
          lte: end,
        },
      },
    }),
  ]);

  const barIds = visitsByBar.map((v) => v.barId);
  const barsForVisits = barIds.length
    ? await prisma.bar.findMany({
        where: { id: { in: barIds } },
        select: { id: true, city: true, cityNormalized: true },
      })
    : [];

  const cityActivity = visitsByBar.reduce<Record<string, number>>((acc, visit) => {
    const bar = barsForVisits.find((b) => b.id === visit.barId);
    const city = bar?.city || "Unknown";
    acc[city] = (acc[city] || 0) + visit._count._all;
    return acc;
  }, {});

  const cityRows = Object.entries(cityActivity).sort((a, b) => b[1] - a[1]);

  const revenue = createdSubs.reduce((sum, sub) => {
    const price = PLAN_PRICE[sub.plan] ?? 0;
    return sum + price;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-gradient">Reports</h1>
          <p className="text-sm text-slate-300">Export subscription metrics with optional date filtering.</p>
        </div>
        <form className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col text-sm">
            <label htmlFor="start" className="text-slate-200">
              Start
            </label>
            <input
              id="start"
              name="start"
              type="date"
              defaultValue={format(start, "yyyy-MM-dd")}
              className="rounded border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </div>
          <div className="flex flex-col text-sm">
            <label htmlFor="end" className="text-slate-200">
              End
            </label>
            <input
              id="end"
              name="end"
              type="date"
              defaultValue={format(end, "yyyy-MM-dd")}
              className="rounded border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </div>
          <button type="submit" className="btn-secondary px-4 py-2 text-sm">
            Apply
          </button>
          <Link
            href={`/api/admin/reports/export?start=${format(start, "yyyy-MM-dd")}&end=${format(end, "yyyy-MM-dd")}`}
            className="btn-primary px-4 py-2 text-sm"
          >
            Download CSV
          </Link>
          <Link
            href={`/api/admin/reports/pdf?start=${format(start, "yyyy-MM-dd")}&end=${format(end, "yyyy-MM-dd")}`}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Download PDF
          </Link>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-sm text-slate-300">Owners</div>
          <div className="text-3xl font-semibold text-white">{activeOwners}</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-sm text-slate-300">Active subscriptions</div>
          <div className="text-3xl font-semibold text-white">{activeSubs.length}</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-sm text-slate-300">New subscriptions (range)</div>
          <div className="text-3xl font-semibold text-white">{createdSubs.length}</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-sm text-slate-300">Booked revenue (range)</div>
          <div className="text-3xl font-semibold text-white">${revenue.toFixed(2)}</div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">City activity (patron check-ins)</h2>
          {cityRows[0] && (
            <span className="text-sm text-cyan-200">
              Most active: {cityRows[0][0]} ({cityRows[0][1]})
            </span>
          )}
        </div>
        {cityRows.length === 0 ? (
          <p className="text-sm text-slate-300 mt-2">No patron activity in this range.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-300">
                <tr>
                  <th className="px-2 py-1">City</th>
                  <th className="px-2 py-1">Check-ins</th>
                </tr>
              </thead>
              <tbody>
                {cityRows.map(([city, count]) => (
                  <tr key={city} className="border-t border-white/5 text-slate-200">
                    <td className="px-2 py-1">{city}</td>
                    <td className="px-2 py-1">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-4">
        <h2 className="text-xl font-semibold text-white">Canceled subscriptions (range)</h2>
        {canceledSubs.length === 0 ? (
          <p className="text-sm text-slate-300 mt-2">No cancellations in this range.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-300">
                <tr>
                  <th className="px-2 py-1">Owner</th>
                  <th className="px-2 py-1">Plan</th>
                  <th className="px-2 py-1">Canceled</th>
                  <th className="px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {canceledSubs.map((sub) => (
                  <tr key={sub.id} className="border-t border-white/5 text-slate-200">
                    <td className="px-2 py-1">{sub.owner.email}</td>
                    <td className="px-2 py-1">{sub.plan}</td>
                    <td className="px-2 py-1">
                      {sub.canceledAt ? new Date(sub.canceledAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-2 py-1">{sub.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
