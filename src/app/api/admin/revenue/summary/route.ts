import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();
  if (email !== "coryarmer@gmail.com" && !email.endsWith("@BarLink360.com")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [activeSubs, trialingSubs, canceledSubs, proBars, premiumBars, addOnBars, boostsActive, boostsPending] =
      await Promise.all([
        prisma.subscription.count({ where: { status: "ACTIVE" } }),
        prisma.subscription.count({ where: { status: "TRIALING" } }),
        prisma.subscription.count({ where: { status: "CANCELED" } }),
        prisma.bar.count({
          where: {
            OR: [{ addonPro: true }, { subscriptionTier: "PRO" }],
          },
        }),
        prisma.bar.count({
          where: {
            OR: [{ addonPremium: true }, { subscriptionTier: "PREMIUM" }],
          },
        }),
        prisma.bar.count({
          where: {
            OR: [{ addonInventory: true }, { inventoryAddOnEnabled: true }],
          },
        }),
        prisma.boost.count({ where: { status: "ACTIVE" } }),
        prisma.boost.count({ where: { status: "PENDING" } }),
      ]);

    // Simple estimates; can be replaced by PayPal actuals.
    const mrrEstimate = proBars * 49 + premiumBars * 79 + addOnBars * 29 + activeSubs * 30;
    const arrEstimate = mrrEstimate * 12;
    const arpuEstimate = activeSubs > 0 ? mrrEstimate / activeSubs : 0;

    return NextResponse.json({
      activeSubs,
      trialingSubs,
      canceledSubs,
      proBars,
      premiumBars,
      addOnBars,
      boostsActive,
      boostsPending,
      mrrEstimate,
      arrEstimate,
      arpuEstimate,
    });
  } catch (error) {
    console.error("[admin/revenue/summary]", error);
    return NextResponse.json({ error: "Failed to load revenue snapshot" }, { status: 500 });
  }
}
