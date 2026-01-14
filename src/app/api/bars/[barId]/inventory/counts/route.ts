import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarAccess, requireInventoryAddOn } from "@/lib/access";

export async function GET(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    const bar = await requireBarAccess(barId);
    requireInventoryAddOn(bar);

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 50);
    const counts = await prisma.inventoryCount.findMany({
      where: { barId },
      orderBy: { countedAt: "desc" },
      take: Math.min(limit, 200),
      include: {
        product: { include: { product: true } },
      },
    });
    return NextResponse.json({ counts });
  } catch (error) {
    console.error("Counts GET error", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: message === "INVENTORY_ADDON_REQUIRED" ? 402 : 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    const bar = await requireBarAccess(barId);
    requireInventoryAddOn(bar);

    const body = await req.json();
    const { barProductId, quantity, unit, notes } = body;
    if (!barProductId || quantity === undefined || !unit) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const count = await prisma.inventoryCount.create({
      data: {
        barId,
        productId: barProductId,
        quantity: Number(quantity),
        unit,
        remainingBucket: body.remainingBucket || null,
        method: body.method || "manual",
        confidence: body.confidence ? Number(body.confidence) : null,
        remainingPercent: body.remainingPercent ? Number(body.remainingPercent) : null,
        notes: notes || null,
      },
    });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Counts POST error", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: message === "INVENTORY_ADDON_REQUIRED" ? 402 : 500 });
  }
}
