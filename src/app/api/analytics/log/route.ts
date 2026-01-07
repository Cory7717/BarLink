import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barId, eventType, source, query } = body;

    if (!barId || !eventType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Log the individual click
    await prisma.barClick.create({
      data: {
        barId,
        source: source || eventType,
        query: query || null,
        dayOfWeek,
      },
    });

    // Update daily analytics
    const existingAnalytics = await prisma.barAnalytics.findUnique({
      where: {
        barId_date: {
          barId,
          date: dateOnly,
        },
      },
    });

    if (existingAnalytics) {
      const updateData: Record<string, number> = {};

      if (eventType === "profile_view") {
        updateData.profileViews = existingAnalytics.profileViews + 1;
      } else if (eventType === "profile_click") {
        updateData.profileClicks = existingAnalytics.profileClicks + 1;
      } else if (eventType === "search_appear") {
        updateData.searchAppears = existingAnalytics.searchAppears + 1;
      }

      await prisma.barAnalytics.update({
        where: {
          barId_date: {
            barId,
            date: dateOnly,
          },
        },
        data: updateData,
      });
    } else {
      const createData: Record<string, unknown> = {
        barId,
        date: dateOnly,
        dayOfWeek,
      };

      if (eventType === "profile_view") {
        createData.profileViews = 1;
      } else if (eventType === "profile_click") {
        createData.profileClicks = 1;
      } else if (eventType === "search_appear") {
        createData.searchAppears = 1;
      }

      await prisma.barAnalytics.create({
        data: createData as Parameters<typeof prisma.barAnalytics.create>[0]["data"],
      });
    }

    // Log search query if provided
    if (query) {
      const existingQuery = await prisma.searchQuery.findUnique({
        where: {
          query_location_category: {
            query: query.toLowerCase(),
            location: body.location || "",
            category: body.category || "",
          },
        },
      });

      if (existingQuery) {
        await prisma.searchQuery.update({
          where: {
            query_location_category: {
              query: query.toLowerCase(),
              location: body.location || "",
              category: body.category || "",
            },
          },
          data: { count: existingQuery.count + 1 },
        });
      } else {
        await prisma.searchQuery.create({
          data: {
            query: query.toLowerCase(),
            location: body.location || "",
            category: body.category || "",
            dayOfWeek,
            count: 1,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics logging error:", error);
    return NextResponse.json({ error: "Failed to log analytics" }, { status: 500 });
  }
}
