import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (email !== "coryarmer@gmail.com" && !email.endsWith("@barlink.com")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const now = Date.now();
    const sevenDays = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDays = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      incompleteSubs,
      pastDueSubs,
      openTickets,
      failedScans,
      totalScans,
      idleBars14d,
      barsCount,
      ownersCount,
    ] = await Promise.all([
      prisma.subscription.count({ where: { status: "INCOMPLETE" } }),
      prisma.subscription.count({ where: { status: "PAST_DUE" } }),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.inventoryScanSession.count({ where: { createdAt: { gte: sevenDays }, detections: { none: {} } } }),
      prisma.inventoryScanSession.count({ where: { createdAt: { gte: sevenDays } } }),
      prisma.bar.count({
        where: {
          createdAt: { lte: new Date(now - 14 * 24 * 60 * 60 * 1000) },
          events: { none: {} },
          offerings: { none: {} },
        },
      }),
      prisma.bar.count(),
      prisma.owner.count(),
    ]);

    const failureRate = totalScans ? Number((failedScans / totalScans).toFixed(2)) : 0;

    const trialsEnding = await prisma.subscription.count({
      where: {
        status: "ACTIVE",
        trialEndsAt: { gte: new Date(), lte: new Date(now + 7 * 24 * 60 * 60 * 1000) },
      },
    });

    const alerts = [];
    if (pastDueSubs > 0) alerts.push({ label: "Past-due subscriptions", value: pastDueSubs });
    if (incompleteSubs > 0) alerts.push({ label: "Incomplete payments", value: incompleteSubs });
    if (openTickets > 0) alerts.push({ label: "Open support tickets", value: openTickets });
    if (failureRate > 0.2 && totalScans >= 5) alerts.push({ label: "Inventory scan failure rate high", value: `${failureRate * 100}%` });
    if (idleBars14d > 0) alerts.push({ label: "Bars idle 14d (no content)", value: idleBars14d });
    if (trialsEnding > 0) alerts.push({ label: "Trials ending in 7d", value: trialsEnding });

    return NextResponse.json({
      barsCount,
      ownersCount,
      incompleteSubs,
      pastDueSubs,
      trialsEnding,
      openTickets,
      failedScans,
      totalScans,
      failureRate,
      idleBars14d,
      alerts,
      windowStart: sevenDays,
      window30d: thirtyDays,
    });
  } catch (error) {
    console.error("[admin/system/summary]", error);
    return NextResponse.json({ error: "Failed to load system summary" }, { status: 500 });
  }
}
