import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.owner.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!owner?.subscription || !owner.subscription.paypalSubscriptionId) {
      return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });
    }

    const paypalBase =
      process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    const cancelUrl = `${paypalBase}/v1/billing/subscriptions/${owner.subscription.paypalSubscriptionId}/cancel`;

    const paypalRes = await fetch(cancelUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify({ reason: "User requested cancellation" }),
    });

    if (!paypalRes.ok) {
      const errorText = await paypalRes.text();
      console.error("PayPal cancel error:", paypalRes.status, errorText);
      return NextResponse.json({ error: "Failed to cancel subscription with PayPal" }, { status: 502 });
    }

    await prisma.subscription.update({
      where: { id: owner.subscription.id },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
        cancelAtPeriodEnd: false,
      },
    });

    // Unpublish all bars owned by this owner
    await prisma.bar.updateMany({
      where: { ownerId: owner.id },
      data: { isPublished: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription cancel error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
