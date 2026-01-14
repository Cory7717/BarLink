import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const TIER_ORDER: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  PREMIUM: 2,
};

export async function requireSessionEmail() {
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!email) {
    throw new Error("UNAUTHORIZED");
  }
  return email.toLowerCase();
}

export async function requireAdminEmail() {
  const email = await requireSessionEmail();
  if (!isAdminEmail(email)) {
    throw new Error("UNAUTHORIZED");
  }
  return email;
}

export async function requireBarAccess(barId: string) {
  const email = await requireSessionEmail();
  const bar = await prisma.bar.findUnique({
    where: { id: barId },
    include: {
      owner: true,
      memberships: {
        where: { userId: email },
      },
    },
  });
  if (!bar) {
    throw new Error("NOT_FOUND");
  }
  const isOwner = bar.owner.email?.toLowerCase() === email;
  const hasMembership = bar.memberships.some((m) => m.role === "OWNER" || m.role === "MANAGER" || m.role === "STAFF");
  if (!isOwner && !hasMembership && !isAdminEmail(email)) {
    throw new Error("UNAUTHORIZED");
  }
  return bar;
}

export function requireTier(bar: { subscriptionTier: string }, minimum: "FREE" | "PRO" | "PREMIUM") {
  const current = TIER_ORDER[bar.subscriptionTier] ?? 0;
  const required = TIER_ORDER[minimum];
  if (current < required) {
    throw new Error("PAYWALL");
  }
}

export function requireInventoryAddOn(bar: { inventoryAddOnEnabled: boolean }) {
  if (!bar.inventoryAddOnEnabled) {
    throw new Error("INVENTORY_ADDON_REQUIRED");
  }
}
