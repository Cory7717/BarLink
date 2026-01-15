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
    const thirtyDays = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      promoRedemptions,
      uniqueCodes,
      newBars30d,
      followers,
      events30d,
      searchEvents,
    ] = await Promise.all([
      prisma.promoRedemption.count({ where: { redeemedAt: { gte: thirtyDays } } }),
      prisma.promoRedemption.groupBy({ by: ["promoCodeId"], where: { redeemedAt: { gte: thirtyDays } } }),
      prisma.bar.count({ where: { createdAt: { gte: thirtyDays } } }),
      prisma.barFollower.count(),
      prisma.event.count({ where: { startDate: { gte: thirtyDays } } }),
      prisma.patronSearchEvent.findMany({
        where: { createdAt: { gte: thirtyDays } },
        select: { city: true, category: true },
      }),
    ]);

    const cityCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    for (const e of searchEvents) {
      if (e.city) cityCounts[e.city] = (cityCounts[e.city] || 0) + 1;
      if (e.category) categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    }
    const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0];
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    return NextResponse.json({
      promoRedemptions,
      uniqueCodes: uniqueCodes.length,
      newBars30d,
      followers,
      events30d,
      topCity: topCity ? { city: topCity[0], count: topCity[1] } : null,
      topCategory: topCategory ? { category: topCategory[0], count: topCategory[1] } : null,
    });
  } catch (error) {
    console.error("[admin/marketing/summary]", error);
    return NextResponse.json({ error: "Failed to load marketing summary" }, { status: 500 });
  }
}
