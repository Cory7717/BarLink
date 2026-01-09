import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || "").trim();
    if (!query) {
      return NextResponse.json({ owners: [], users: [] });
    }

    const owners = await prisma.owner.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { bars: { some: { name: { contains: query, mode: "insensitive" } } } },
        ],
      },
      include: {
        bars: true,
        subscription: true,
      },
      take: 25,
    });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 25,
    });

    return NextResponse.json({ owners, users });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
