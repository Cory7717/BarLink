import { BASE_PRICES, ADDON_PRICES, SALES_TAX_RATE, EntitlementSelection } from "./pricing";

export type BasePlan = "BASIC";
export type AddOn = "PRO" | "PREMIUM" | "INVENTORY";
export type PlanInterval = "MONTHLY" | "SIX_MONTH" | "YEARLY";

export function hasBasic(bar: { basePlan?: string }): boolean {
  return (bar.basePlan || "BASIC").toUpperCase() === "BASIC";
}

export function hasPro(bar: { addonPro?: boolean; addonPremium?: boolean; subscriptionTier?: string }): boolean {
  return !!bar.addonPro || !!bar.addonPremium || (bar.subscriptionTier || "").toUpperCase() === "PRO";
}

export function hasPremium(bar: { addonPremium?: boolean; subscriptionTier?: string }): boolean {
  return !!bar.addonPremium || (bar.subscriptionTier || "").toUpperCase() === "PREMIUM";
}

export function hasInventory(bar: { addonInventory?: boolean; inventoryAddOnEnabled?: boolean }): boolean {
  return !!bar.addonInventory || !!bar.inventoryAddOnEnabled;
}

export function canUseBoosts(bar: { addonPremium?: boolean; addonPro?: boolean; subscriptionTier?: string }): boolean {
  // Boosts require premium; allow legacy premium tier.
  return hasPremium(bar);
}

export function computePreTaxMrrCents(bar: {
  planInterval?: string | null;
  addonPro?: boolean | null;
  addonPremium?: boolean | null;
  addonInventory?: boolean | null;
}): number {
  const interval = normalizeInterval(bar.planInterval);
  const entitlements: EntitlementSelection = {
    planInterval: interval,
    addonPro: !!bar.addonPro,
    addonPremium: !!bar.addonPremium,
    addonInventory: !!bar.addonInventory,
  };
  return calculateIntervalToMonthly(entitlements);
}

export function computeTotalMrrWithTaxCents(bar: {
  planInterval?: string | null;
  addonPro?: boolean | null;
  addonPremium?: boolean | null;
  addonInventory?: boolean | null;
}): number {
  const subtotal = computePreTaxMrrCents(bar);
  return subtotal + Math.round(subtotal * SALES_TAX_RATE);
}

function normalizeInterval(interval?: string | null): PlanInterval {
  const val = (interval || "MONTHLY").toUpperCase();
  if (val === "SIX_MONTH") return "SIX_MONTH";
  if (val === "YEARLY" || val === "ANNUAL" || val === "ANNUALLY") return "YEARLY";
  return "MONTHLY";
}

function calculateIntervalToMonthly(entitlements: EntitlementSelection): number {
  const interval = entitlements.planInterval;
  const subtotal = BASE_PRICES[interval]
    + (entitlements.addonPro ? ADDON_PRICES.PRO[interval] : 0)
    + (entitlements.addonPremium ? ADDON_PRICES.PREMIUM[interval] : 0)
    + (entitlements.addonInventory ? ADDON_PRICES.INVENTORY[interval] : 0);

  if (interval === "MONTHLY") return subtotal;
  if (interval === "SIX_MONTH") return Math.round(subtotal / 6);
  return Math.round(subtotal / 12);
}
