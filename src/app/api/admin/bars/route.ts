import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";

export async function GET(req: Request) {
  try {
    await requireAdminEmail();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const bars = await prisma.bar.findMany({
      where: search
        ? {
            name: { contains: search, mode: "insensitive" },
          }
        : {},
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        owner: { select: { email: true } },
      },
      take: 50,
    });
    return NextResponse.json({
      bars: bars.map((b) => ({
        id: b.id,
        name: b.name,
        city: b.city,
        state: b.state,
        ownerEmail: b.owner.email ?? "",
      })),
    });
  } catch (error) {
    console.error("Admin bars GET error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminEmail();
    const { barId } = await req.json();
    if (!barId) {
      return NextResponse.json({ error: "barId required" }, { status: 400 });
    }
    await prisma.bar.delete({ where: { id: barId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin bars DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete bar" }, { status: 500 });
  }
}
