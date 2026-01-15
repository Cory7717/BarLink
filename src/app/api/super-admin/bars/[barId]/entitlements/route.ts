import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { calculateSubtotalCents, calculateTaxCents, calculateTotalWithTaxCents } from "@/lib/pricing";

export async function PATCH(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email || !isAdminEmail(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { barId } = await params;
  const body = await req.json();
  const addonPro = !!body.addonPro;
  const addonPremium = !!body.addonPremium;
  const addonInventory = !!body.addonInventory;
  const planInterval = (body.planInterval || "MONTHLY").toUpperCase();
  const boostCreditsBalance = body.boostCreditsBalance ?? 0;

  const bar = await prisma.bar.update({
    where: { id: barId },
    data: {
      basePlan: "BASIC",
      addonPro,
      addonPremium,
      addonInventory,
      planInterval,
      boostCreditsBalance: Number(boostCreditsBalance),
      lastCalculatedTaxRate: 0.0825,
    },
    select: {
      id: true,
      name: true,
      basePlan: true,
      addonPro: true,
      addonPremium: true,
      addonInventory: true,
      planInterval: true,
      boostCreditsBalance: true,
    },
  });

  const entitlements = {
    planInterval: planInterval as any,
    addonPro,
    addonPremium,
    addonInventory,
  };
  const subtotalCents = calculateSubtotalCents(entitlements);
  const taxCents = calculateTaxCents(subtotalCents);
  const totalCents = calculateTotalWithTaxCents(entitlements);

  return NextResponse.json({
    bar,
    pricing: {
      subtotalCents,
      taxCents,
      totalCents,
    },
  });
}
