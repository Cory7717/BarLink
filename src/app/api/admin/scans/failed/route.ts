import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";

export async function GET(req: NextRequest) {
  try {
    await requireAdminEmail();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);
    const scans = await prisma.inventoryScanSession.findMany({
      where: {
        detections: { none: {} },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: {
        id: true,
        barId: true,
        imageUrl: true,
        createdAt: true,
        bar: { select: { name: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ scans });
  } catch (error) {
    console.error("Admin failed scans GET error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
