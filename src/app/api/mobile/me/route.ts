import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMobileRequest } from "@/lib/mobileAuth";

export async function GET(req: Request) {
  try {
    const claims = await verifyMobileRequest(req);
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.owner.findUnique({
      where: { id: claims.sub },
      include: { subscription: true },
    });

    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: owner.id,
      email: owner.email,
      name: owner.name,
      phone: owner.phone ?? null,
      subscription: owner.subscription
        ? {
            id: owner.subscription.id,
            plan: owner.subscription.plan,
            status: owner.subscription.status,
            currentPeriodEnd: owner.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: owner.subscription.cancelAtPeriodEnd,
          }
        : null,
    });
  } catch (error) {
    console.error("Mobile profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
