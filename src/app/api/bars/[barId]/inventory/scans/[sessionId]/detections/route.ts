import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarMembership, requireAddOn, requireBasic } from "@/lib/requireEntitlements";

export async function GET(_: Request, { params }: { params: Promise<{ barId: string; sessionId: string }> }) {
  try {
    const { barId, sessionId } = await params;
    const bar = await requireBarMembership(barId);
    requireBasic(bar);
    requireAddOn(bar, "INVENTORY");

    const detections = await prisma.inventoryScanDetection.findMany({
      where: { sessionId },
      orderBy: { confidence: "desc" },
    });
    return NextResponse.json({ detections });
  } catch (error) {
    console.error("Detections GET error", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: message === "INVENTORY_ADDON_REQUIRED" ? 402 : 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ barId: string; sessionId: string }> }) {
  try {
    const { barId, sessionId } = await params;
    const bar = await requireBarMembership(barId);
    requireBasic(bar);
    requireAddOn(bar, "INVENTORY");

    const { detections } = await req.json();
    if (!Array.isArray(detections)) {
      return NextResponse.json({ error: "detections array required" }, { status: 400 });
    }

    type IncomingDetection = {
      productGuessText?: string;
      productId?: string;
      bbox?: unknown;
      confidence?: number;
      remainingBucket?: string;
      sizeMlGuess?: number;
    };

    const created = await prisma.$transaction(
      (detections as IncomingDetection[]).map((d) =>
        prisma.inventoryScanDetection.create({
          data: {
            sessionId,
            productGuessText: d.productGuessText || "Unknown",
            productId: d.productId || null,
            bbox: d.bbox ?? undefined,
            confidence: typeof d.confidence === "number" ? d.confidence : 0,
            remainingBucket: d.remainingBucket || null,
            sizeMlGuess: d.sizeMlGuess ? Number(d.sizeMlGuess) : null,
          },
        })
      )
    );
    return NextResponse.json({ detections: created });
  } catch (error) {
    console.error("Detections POST error", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: message === "INVENTORY_ADDON_REQUIRED" ? 402 : 500 });
  }
}
