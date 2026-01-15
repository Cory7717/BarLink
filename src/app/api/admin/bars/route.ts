import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";
import { logAdminAction } from "@/lib/adminAudit";

export async function GET(req: Request) {
  try {
    await requireAdminEmail();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";
    const activeOnly = searchParams.get("activeOnly") === "true";
    const addOn = searchParams.get("addOn") === "true";
    const tier = searchParams.get("tier") || "";
    const status = searchParams.get("status") || "";

    const bars = await prisma.bar.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
                { owner: { email: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(activeOnly
          ? {
              owner: {
                subscription: {
                  status: "ACTIVE",
                },
              },
            }
          : {}),
        ...(addOn
          ? {
              OR: [{ addonInventory: true }, { inventoryAddOnEnabled: true }],
            }
          : {}),
        ...(tier
          ? tier.toUpperCase() === "PREMIUM"
            ? { OR: [{ addonPremium: true }, { subscriptionTier: "PREMIUM" }] }
            : tier.toUpperCase() === "PRO"
            ? { OR: [{ addonPro: true }, { addonPremium: true }, { subscriptionTier: "PRO" }, { subscriptionTier: "PREMIUM" }] }
            : { subscriptionTier: tier.toUpperCase() as any }
          : {}),
        ...(status
          ? {
              subscription: {
                status: status.toUpperCase() as any,
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        basePlan: true,
        addonPro: true,
        addonPremium: true,
        addonInventory: true,
        subscriptionTier: true,
        inventoryAddOnEnabled: true,
        planInterval: true,
        boostCreditsBalance: true,
        createdAt: true,
        _count: { select: { events: true, offerings: true } },
        owner: {
          select: {
            email: true,
            subscription: { select: { status: true, plan: true, trialEndsAt: true, currentPeriodEnd: true } },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    });
    return NextResponse.json({
      bars: bars.map((b) => ({
        id: b.id,
        name: b.name,
        city: b.city,
        state: b.state,
        ownerEmail: b.owner.email ?? "",
        tier: b.subscriptionTier || "FREE",
        addOn: b.addonInventory || b.inventoryAddOnEnabled,
        addonPro: b.addonPro || b.subscriptionTier === "PRO" || b.subscriptionTier === "PREMIUM",
        addonPremium: b.addonPremium || b.subscriptionTier === "PREMIUM",
        addonInventory: b.addonInventory || b.inventoryAddOnEnabled,
        basePlan: b.basePlan || "BASIC",
        planInterval: b.planInterval || "MONTHLY",
        boostCreditsBalance: b.boostCreditsBalance ?? 0,
        createdAt: b.createdAt,
        events: b._count.events,
        offerings: b._count.offerings,
        subscriptionStatus: b.owner.subscription?.status ?? null,
        subscriptionPlan: b.owner.subscription?.plan ?? null,
        trialEndsAt: b.owner.subscription?.trialEndsAt ?? null,
        currentPeriodEnd: b.owner.subscription?.currentPeriodEnd ?? null,
      })),
    });
  } catch (error) {
    console.error("Admin bars GET error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminEmail();
    const { barId } = await req.json();
    if (!barId) {
      return NextResponse.json({ error: "barId required" }, { status: 400 });
    }
    const before = await prisma.bar.findUnique({ where: { id: barId }, select: { id: true, name: true, ownerId: true } });
    await prisma.bar.delete({ where: { id: barId } });
    await logAdminAction({
      action: "admin.deleteBar",
      entityType: "bar",
      entityId: barId,
      before,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin bars DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete bar" }, { status: 500 });
  }
}
