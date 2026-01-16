import { NextRequest, NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/adminAudit";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const adminEmail = await requireAdminEmail();
    const { subscriptionId, message } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId required" }, { status: 400 });
    }
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { owner: { select: { email: true, name: true } } },
    });
    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const bodyText =
      message ||
      `Hi ${subscription.owner.name || ""}, we could not process your BarLink360 subscription. Please update payment to stay active.`;

    await sendEmail(subscription.owner.email, "Action needed: BarLink360 subscription payment issue", bodyText);

    await logAdminAction({
      action: "admin.notifyFailedSubscription",
      entityType: "subscription",
      entityId: subscriptionId,
      after: { message: bodyText, sent: true, admin: adminEmail },
    });

    return NextResponse.json({ ok: true, sent: true });
  } catch (error) {
    console.error("Admin notify failed sub error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
