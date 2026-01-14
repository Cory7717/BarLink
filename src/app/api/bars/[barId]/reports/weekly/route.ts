import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarAccess } from "@/lib/access";

export async function GET(_: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    await requireBarAccess(barId);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const searches = await prisma.patronSearchEvent.groupBy({
      by: ["category"],
      _count: { _all: true },
      where: { createdAt: { gte: since }, barId },
      orderBy: { _count: { _all: "desc" } },
      take: 10,
    });

    const actions = await prisma.barAction.groupBy({
      by: ["action"],
      _count: { _all: true },
      where: { createdAt: { gte: since }, barId },
    });
    const funnel = new Map(actions.map((a) => [a.action, a._count._all]));

    const counts = await prisma.inventoryCount.findMany({
      where: { barId },
      orderBy: { countedAt: "desc" },
      take: 200,
      include: { product: true },
    });

    const lowStock = counts.filter((c) => {
      const par = c.product.parLevel ?? null;
      return par !== null && Number(c.quantity) < par;
    });

    const events = await prisma.event.findMany({
      where: { barId, startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 10,
    });

    return NextResponse.json({
      topSearches: searches,
      funnel: {
        searches: funnel.get("search") || 0,
        profileViews: funnel.get("profile_view") || 0,
        directions: funnel.get("get_directions") || 0,
        websiteClicks: funnel.get("website_click") || 0,
      },
      lowStock,
      upcomingEvents: events,
    });
  } catch (error) {
    console.error("Weekly report error", error);
    return NextResponse.json({ error: "Failed or unauthorized" }, { status: 500 });
  }
}
