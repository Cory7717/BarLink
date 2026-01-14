import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarAccess, requireInventoryAddOn } from "@/lib/access";

export async function GET(_: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    const bar = await requireBarAccess(barId);
    requireInventoryAddOn(bar);

    // Get latest counts per product
    const counts = await prisma.inventoryCount.findMany({
      where: { barId },
      orderBy: [{ productId: "asc" }, { countedAt: "desc" }],
    });
    const latestQty = new Map<string, number>();
    for (const c of counts) {
      if (!latestQty.has(c.productId)) {
        latestQty.set(c.productId, Number(c.quantity));
      }
    }

    const products = await prisma.barProduct.findMany({
      where: {
        barId,
        isActive: true,
        reorderThreshold: { not: null },
      },
      include: { product: true },
    });

    const below = products.filter((p) => {
      const threshold = p.reorderThreshold ?? 0;
      const qty = latestQty.get(p.id) ?? 0;
      return threshold > 0 && qty <= threshold;
    });

    return NextResponse.json({ items: below });
  } catch (error) {
    console.error("Reorder error", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: message === "INVENTORY_ADDON_REQUIRED" ? 402 : 500 });
  }
}
