import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarMembership, requireAddOn, requireBasic } from "@/lib/requireEntitlements";

export async function POST(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    const bar = await requireBarMembership(barId);
    requireBasic(bar);
    requireAddOn(bar, "PREMIUM");

    const body = await req.json();
    const { eventId, startAt, endAt, budgetCents } = body;
    if (!startAt || !endAt || !budgetCents) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const boost = await prisma.boost.create({
      data: {
        barId,
        eventId: eventId || null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        budgetCents: Number(budgetCents),
        status: "ACTIVE",
      },
    });
    return NextResponse.json({ boost });
  } catch (error) {
    console.error("Create boost error", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: message === "PAYWALL" ? 402 : 500 });
  }
}
