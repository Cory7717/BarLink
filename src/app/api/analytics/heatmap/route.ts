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
      take: 50,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Heatmap error", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
