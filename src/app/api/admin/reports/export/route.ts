import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/lib/auth";

const PLAN_PRICE: Record<string, number> = {
  MONTHLY: 30,
  SIX_MONTH: 150,
  YEARLY: 250,
};

function parseDate(value: string | null, fallbackDaysAgo: number) {
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

export async function GET(req: Request) {
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const start = parseDate(searchParams.get("start"), 30);
  const end = parseDate(searchParams.get("end"), 0);
  end.setHours(23, 59, 59, 999);

  const [activeOwners, activeSubs, canceledSubs, createdSubs, visitsByBar] = await Promise.all([
    prisma.owner.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.findMany({
      where: {
        status: "CANCELED",
        canceledAt: { gte: start, lte: end },
      },
      include: { owner: true },
      orderBy: { canceledAt: "desc" },
    }),
    prisma.subscription.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: { owner: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.barVisit.groupBy({
      by: ["barId"],
      _count: { _all: true },
      where: {
        visitedAt: { gte: start, lte: end },
      },
    }),
  ]);

  const revenue = createdSubs.reduce((sum, sub) => sum + (PLAN_PRICE[sub.plan] ?? 0), 0);

  const barIds = visitsByBar.map((v) => v.barId);
  const barsForVisits = barIds.length
    ? await prisma.bar.findMany({
        where: { id: { in: barIds } },
        select: { id: true, city: true },
      })
    : [];

  const cityActivity = visitsByBar.reduce<Record<string, number>>((acc, visit) => {
    const bar = barsForVisits.find((b) => b.id === visit.barId);
    const city = bar?.city || "Unknown";
    acc[city] = (acc[city] || 0) + visit._count._all;
    return acc;
  }, {});

  const cityRows = Object.entries(cityActivity).sort((a, b) => b[1] - a[1]);

  const header = [
    ["Metric", "Value"],
    ["Owners", activeOwners.toString()],
    ["Active subscriptions", activeSubs.toString()],
    ["New subscriptions (range)", createdSubs.length.toString()],
    ["Revenue (range)", revenue.toFixed(2)],
    [],
    ["City activity (check-ins)"],
    ["City", "Check-ins"],
  ];

  const cityLines = cityRows.map(([city, count]) => [city, count.toString()]);

  const canceledHeader = [
    [],
    ["Canceled subscriptions"],
    ["Owner", "Plan", "Canceled At", "Status"],
  ];

  const canceledRows = canceledSubs.map((sub) => [
    sub.owner.email,
    sub.plan,
    sub.canceledAt ? new Date(sub.canceledAt).toISOString() : "",
    sub.status,
  ]);

  const lines = [...header, ...cityLines, ...canceledHeader, ...canceledRows].map((cols) => cols.join(","));
  const csv = lines.join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="report-${start.toISOString().slice(0, 10)}-${end
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
