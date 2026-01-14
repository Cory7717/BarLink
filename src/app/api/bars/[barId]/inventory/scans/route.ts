import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarAccess, requireInventoryAddOn } from "@/lib/access";
import { analyzeInventoryPhoto } from "@/lib/visionInventory";

export async function POST(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    const bar = await requireBarAccess(barId);
    requireInventoryAddOn(bar);

    const body = await req.json();
    const imageUrl = body.imageUrl || null;
    const session = await prisma.inventoryScanSession.create({
      data: {
        barId,
        createdByUserId: bar.ownerId,
        imageUrl,
      },
    });

    type DetectionRecord = {
      id: string;
      sessionId: string;
      productGuessText: string;
      productId: string | null;
      bbox: unknown;
      confidence: number;
      remainingBucket: string | null;
      sizeMlGuess: number | null;
    };
    let detections: DetectionRecord[] = [];
    if (imageUrl) {
      const ai = await analyzeInventoryPhoto(imageUrl);
      detections = await Promise.all(
        ai.items.map((item) =>
          prisma.inventoryScanDetection.create({
            data: {
              sessionId: session.id,
              productGuessText: item.nameGuess,
              confidence: item.confidence,
              remainingBucket: item.remainingBucket,
              sizeMlGuess: item.sizeMlGuess || null,
            },
          })
        )
      );
    }

    return NextResponse.json({ session, detections });
  } catch (error) {
    console.error("Scan session error", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: message === "INVENTORY_ADDON_REQUIRED" ? 402 : 500 });
  }
}
