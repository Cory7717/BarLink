import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { hasBasic, hasInventory, hasPremium, hasPro } from "./entitlements";

export async function requireBarMembership(barId: string) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) throw new Error("UNAUTHORIZED");

  const bar = await prisma.bar.findUnique({
    where: { id: barId },
    include: {
      owner: { select: { email: true } },
      memberships: { select: { userId: true, role: true } },
    },
  });
  if (!bar) throw new Error("NOT_FOUND");

  const isOwner = bar.owner?.email?.toLowerCase() === email;
  const hasMembership = bar.memberships.some((m) => m.userId === email || m.role === "OWNER" || m.role === "MANAGER" || m.role === "STAFF");

  if (!isOwner && !hasMembership && !isAdminEmail(email)) {
    throw new Error("UNAUTHORIZED");
  }

  return bar;
}

export function requireBasic(bar: { basePlan?: string }) {
  if (!hasBasic(bar)) {
    throw new Error("BASIC_REQUIRED");
  }
}

export function requireAddOn(bar: { addonPro?: boolean; addonPremium?: boolean; addonInventory?: boolean; subscriptionTier?: string; inventoryAddOnEnabled?: boolean }, addOn: "PRO" | "PREMIUM" | "INVENTORY") {
  if (addOn === "INVENTORY") {
    if (!hasInventory(bar)) throw new Error("INVENTORY_ADDON_REQUIRED");
    return;
  }
  if (addOn === "PREMIUM") {
    if (!hasPremium(bar)) throw new Error("PREMIUM_REQUIRED");
    return;
  }
  // PRO allows premium as a superset
  if (!hasPro(bar)) throw new Error("PRO_REQUIRED");
}
