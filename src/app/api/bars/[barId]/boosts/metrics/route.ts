import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarAccess, requireTier } from "@/lib/access";

export async function GET(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    const bar = await requireBarAccess(barId);
    requireTier(bar, "PREMIUM");

    const { searchParams } = new URL(req.url);
    const boostId = searchParams.get("boostId");
    if (!boostId) {
      return NextResponse.json({ error: "boostId required" }, { status: 400 });
    }

    const metrics = await prisma.boostMetric.findMany({
      where: { boostId },
      orderBy: { date: "asc" },
      take: 90,
    });
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("Boost metrics error", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: message === "PAYWALL" ? 402 : 500 });
  }
}
