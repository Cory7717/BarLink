import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarAccess, requireInventoryAddOn } from "@/lib/access";

export async function GET(_: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    const bar = await requireBarAccess(barId);
    requireInventoryAddOn(bar);

    const items = await prisma.barProduct.findMany({
      where: { barId, isActive: true },
      include: { product: true },
      orderBy: { customName: "asc" },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Inventory products GET error", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: message === "INVENTORY_ADDON_REQUIRED" ? 402 : 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    const bar = await requireBarAccess(barId);
    requireInventoryAddOn(bar);

    const { name, category, unitType, sizeMl, parLevel, reorderThreshold } = await req.json();
    if (!name || !category || !unitType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        unitType,
        sizeMl: sizeMl ? Number(sizeMl) : null,
      },
    });

    const barProduct = await prisma.barProduct.create({
      data: {
        barId,
        productId: product.id,
        parLevel: parLevel ? Number(parLevel) : null,
        reorderThreshold: reorderThreshold ? Number(reorderThreshold) : null,
        isActive: true,
      },
      include: { product: true },
    });

    return NextResponse.json({ item: barProduct });
  } catch (error) {
    console.error("Inventory products POST error", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: message === "INVENTORY_ADDON_REQUIRED" ? 402 : 500 });
  }
}
