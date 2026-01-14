import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";

export async function GET(req: Request) {
  try {
    await requireAdminEmail();
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const actions = await prisma.barAction.groupBy({
      by: ["action"],
      _count: { _all: true },
      where: { createdAt: { gte: sinceDate } },
    });

    const map = new Map(actions.map((a) => [a.action, a._count._all]));
    return NextResponse.json({
      searches: map.get("search") || 0,
      profileViews: map.get("profile_view") || 0,
      directions: map.get("get_directions") || 0,
      websiteClicks: map.get("website_click") || 0,
      saves: map.get("save_event") || 0,
      follows: map.get("follow_bar") || 0,
    });
  } catch (error) {
    console.error("Funnel error", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
