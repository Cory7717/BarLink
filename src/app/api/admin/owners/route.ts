import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdmin();
    const owners = await prisma.owner.findMany({
      select: { id: true, name: true, email: true, allowFreeListings: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ owners });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
