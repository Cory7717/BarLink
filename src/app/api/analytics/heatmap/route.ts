import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";

export async function GET(req: Request) {
  try {
    const email = await requireAdminEmail(); // super admin access for now
    void email;
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const since = searchParams.get("since");
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const data = await prisma.patronSearchEvent.groupBy({
      by: ["category", "city"],
      _count: { _all: true },
      where: {
        createdAt: { gte: sinceDate },
        ...(city ? { city } : {}),
      },
      // Cannot order by _count on this Prisma version; sort after fetch
    });

    const sorted = [...data].sort((a, b) => (b._count._all || 0) - (a._count._all || 0)).slice(0, 50);

    return NextResponse.json({ data: sorted });
  } catch (error) {
    console.error("Heatmap error", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
