import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";

export async function GET(req: NextRequest) {
  try {
    await requireAdminEmail();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const bars = searchParams.get("bars") === "true";

    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        disabled: true,
        createdAt: true,
        visits: bars
          ? {
              select: { barId: true },
              take: 5,
            }
          : undefined,
      },
      take: 100,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
