import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { notifyOwnerEmail } from "@/lib/adminNotifications";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { ownerId, allow } = await req.json();
    if (!ownerId || typeof allow !== "boolean") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    await prisma.owner.update({ where: { id: ownerId }, data: { allowFreeListings: allow } });

    // Notify owner
    const subject = allow ? "BarLink free month activated" : "BarLink free listing removed";
    const body = allow
      ? "We’ve granted you a free month of BarLink publishing. Your bar will remain visible during this period."
      : "Your free listing access has been removed. Bars will require an active subscription to stay visible.";
    notifyOwnerEmail(ownerId, subject, body).catch((err) => console.warn("Email notify failed:", err));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 500 });
  }
}
