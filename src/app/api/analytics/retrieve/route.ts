import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const barId = url.searchParams.get("barId");
    const days = parseInt(url.searchParams.get("days") || "7");

    if (!barId) {
      return NextResponse.json({ error: "barId is required" }, { status: 400 });
    }

    // Verify owner has access to this bar
    const owner = await prisma.owner.findUnique({
      where: { email: session.user.email },
      include: { bars: { select: { id: true } } },
    });

    if (!owner?.bars.some((b) => b.id === barId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Get daily analytics
    const dailyAnalytics = await prisma.barAnalytics.findMany({
      where: {
        barId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Get trends by day of week
    const clicksByDayOfWeek = await prisma.barClick.findMany({
      where: {
        barId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        dayOfWeek: true,
        source: true,
      },
    });

    const dayOfWeekTrends = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day,
      dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day],
      clicks: clicksByDayOfWeek.filter((c) => c.dayOfWeek === day).length,
      bySource: {
        search: clicksByDayOfWeek.filter((c) => c.dayOfWeek === day && c.source === "search").length,
        map: clicksByDayOfWeek.filter((c) => c.dayOfWeek === day && c.source === "map").length,
        favorites: clicksByDayOfWeek.filter((c) => c.dayOfWeek === day && c.source === "favorites").length,
        direct: clicksByDayOfWeek.filter((c) => c.dayOfWeek === day && c.source === "direct").length,
      },
    }));

    // Get top search queries
    const topSearchQueries = await prisma.searchQuery.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { count: "desc" },
      take: 10,
    });

    // Get recent top performing days
    const topDays = dailyAnalytics
      .sort((a, b) => (b.profileClicks + b.profileViews) - (a.profileClicks + a.profileViews))
      .slice(0, 7);

    // Calculate summary stats
    const totalClicks = dailyAnalytics.reduce((sum, d) => sum + d.profileClicks, 0);
    const totalViews = dailyAnalytics.reduce((sum, d) => sum + d.profileViews, 0);
    const totalSearchAppears = dailyAnalytics.reduce((sum, d) => sum + d.searchAppears, 0);

    return NextResponse.json({
      summary: {
        totalClicks,
        totalViews,
        totalSearchAppears,
        averageClicksPerDay: totalClicks / (days || 1),
        bestDay: topDays[0],
      },
      dailyAnalytics,
      dayOfWeekTrends,
      topSearchQueries,
      topDays,
    });
  } catch (error) {
    console.error("Analytics retrieval error:", error);
    return NextResponse.json({ error: "Failed to retrieve analytics" }, { status: 500 });
  }
}
