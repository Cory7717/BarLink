import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { SubscriptionStatus } from "@/generated/prisma";
import { logAdminAction } from "@/lib/adminAudit";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const contentType = req.headers.get("content-type") || "";
    let subscriptionId: string | null = null;
    let status: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      subscriptionId = body.subscriptionId;
      status = body.status;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      subscriptionId = String(form.get("subscriptionId") || "");
      status = String(form.get("status") || "");
    }

    if (!subscriptionId || !status) {
      return NextResponse.json({ error: "Missing subscriptionId or status" }, { status: 400 });
    }

    if (!Object.values(SubscriptionStatus).includes(status as SubscriptionStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: status as SubscriptionStatus },
    });

    // Optionally publish/unpublish bars based on ACTIVE status
    await prisma.bar.updateMany({
      where: { ownerId: updated.ownerId },
      data: { isPublished: status === "ACTIVE" },
    });

    await logAdminAction({
      action: "admin.subscriptionStatusUpdate",
      entityType: "subscription",
      entityId: subscriptionId,
      before: { status: updated.status },
      after: { status },
    });

    return NextResponse.redirect(new URL("/admin/subscriptions", req.url));
  } catch (err) {
    console.error("Admin update subscription error", err);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 500 });
  }
}
