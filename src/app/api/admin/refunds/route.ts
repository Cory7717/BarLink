import { NextRequest, NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/access";
import { logAdminAction } from "@/lib/adminAudit";

// Placeholder for PayPal refund integration. Currently logs intent only.
export async function POST(req: NextRequest) {
  try {
    const adminEmail = await requireAdminEmail();
    const { subscriptionId, amount, reason } = await req.json();
    if (!subscriptionId || typeof amount !== "number") {
      return NextResponse.json({ error: "subscriptionId and amount required" }, { status: 400 });
    }

    // TODO: integrate with PayPal API to issue refund. For now, log intent only.
    await logAdminAction({
      action: "admin.refundIntent",
      entityType: "subscription",
      entityId: subscriptionId,
      after: { amount, reason },
    });

    return NextResponse.json({ ok: true, message: "Refund intent logged. Connect PayPal API to execute." });
  } catch (error) {
    console.error("Admin refund POST error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
