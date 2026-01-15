import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/adminAudit";

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

export async function POST(req: Request) {
  try {
    const adminEmail = await requireAdmin();
    const { ownerId, allowFreeListings } = await req.json();
    if (!ownerId || typeof allowFreeListings !== "boolean") {
      return NextResponse.json({ error: "ownerId and allowFreeListings required" }, { status: 400 });
    }
    const before = await prisma.owner.findUnique({ where: { id: ownerId }, select: { id: true, allowFreeListings: true } });
    const updated = await prisma.owner.update({
      where: { id: ownerId },
      data: { allowFreeListings },
    });
    await logAdminAction({
      action: "admin.updateOwner",
      entityType: "owner",
      entityId: ownerId,
      before,
      after: { allowFreeListings },
    });
    return NextResponse.json({ owner: updated });
  } catch (error) {
    console.error("Admin owner update error", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
