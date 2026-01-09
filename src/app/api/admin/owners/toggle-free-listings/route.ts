import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { ownerId, allow } = await req.json();
    if (!ownerId || typeof allow !== "boolean") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    await prisma.owner.update({ where: { id: ownerId }, data: { allowFreeListings: allow } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 500 });
  }
}
