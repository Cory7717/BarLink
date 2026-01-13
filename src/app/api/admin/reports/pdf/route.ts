import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

  type DocWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };
  const doc: DocWithAutoTable = new jsPDF() as DocWithAutoTable;
  const rangeLabel = `${start.toISOString().slice(0, 10)} to ${end.toISOString().slice(0, 10)}`;

  doc.setFontSize(14);
  doc.text("BarLink Admin Report", 14, 16);
  doc.setFontSize(10);
  doc.text(`Range: ${rangeLabel}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [["Metric", "Value"]],
    body: [
      ["Owners", activeOwners.toString()],
      ["Active subscriptions", activeSubs.toString()],
      ["New subscriptions (range)", createdSubs.length.toString()],
      ["Revenue (range)", `$${revenue.toFixed(2)}`],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [12, 74, 110] },
  });

  const summaryEnd = doc.lastAutoTable?.finalY || 28;

  autoTable(doc, {
    startY: summaryEnd + 8,
    head: [["City activity (check-ins)", "Count"]],
    body: cityRows.length ? cityRows.map(([city, count]) => [city, count.toString()]) : [["No activity", "-"]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175] },
  });

  const cityEnd = doc.lastAutoTable?.finalY || summaryEnd + 8;

  autoTable(doc, {
    startY: cityEnd + 8,
    head: [["Canceled subscriptions", "", "", ""]],
    body: [],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [124, 45, 18] },
  });

  const cancelHeaderEnd = doc.lastAutoTable?.finalY || cityEnd + 8;

  autoTable(doc, {
    startY: cancelHeaderEnd + 2,
    head: [["Owner", "Plan", "Canceled At", "Status"]],
    body: canceledSubs.length
      ? canceledSubs.map((sub) => [
          sub.owner.email,
          sub.plan,
          sub.canceledAt ? new Date(sub.canceledAt).toISOString().slice(0, 10) : "",
          sub.status,
        ])
      : [["None", "-", "-", "-"]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [124, 45, 18] },
  });

  const pdf = doc.output("arraybuffer");

  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="report-${rangeLabel.replace(/\\s+/g, "")}.pdf"`,
    },
  });
}
