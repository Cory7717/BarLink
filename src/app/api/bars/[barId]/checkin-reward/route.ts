import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: { owner: true },
    });

    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { reward } = await req.json();
    await prisma.bar.update({
      where: { id: barId },
      data: { checkInReward: reward || null },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update check-in reward error:", error);
    return NextResponse.json({ error: "Failed to update reward" }, { status: 500 });
  }
}
