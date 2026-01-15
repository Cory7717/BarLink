import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";

export async function GET(req: Request) {
  try {
    await requireAdminEmail();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);
    const logs = await prisma.adminAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Admin log GET error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
