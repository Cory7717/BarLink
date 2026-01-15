export const SALES_TAX_RATE = 0.0825;

export const BASE_PRICES = {
  MONTHLY: 3000,
  SIX_MONTH: 15000,
  YEARLY: 25000,
} as const;

export const ADDON_PRICES = {
  PRO: {
    MONTHLY: 4900,
    SIX_MONTH: 27000,
    YEARLY: 49900,
  },
  PREMIUM: {
    MONTHLY: 7900,
    SIX_MONTH: 43500,
    YEARLY: 79900,
  },
  INVENTORY: {
    MONTHLY: 2900,
    SIX_MONTH: 15900,
    YEARLY: 29900,
  },
} as const;

type Interval = keyof typeof BASE_PRICES;

export type EntitlementSelection = {
  planInterval: Interval;
  addonPro: boolean;
  addonPremium: boolean;
  addonInventory: boolean;
};

export function calculateSubtotalCents(entitlements: EntitlementSelection): number {
  const { planInterval, addonPro, addonPremium, addonInventory } = entitlements;
  let subtotal = BASE_PRICES[planInterval];
  if (addonPro) subtotal += ADDON_PRICES.PRO[planInterval];
  if (addonPremium) subtotal += ADDON_PRICES.PREMIUM[planInterval];
  if (addonInventory) subtotal += ADDON_PRICES.INVENTORY[planInterval];
  return subtotal;
}

export function calculateTaxCents(subtotalCents: number): number {
  return Math.round(subtotalCents * SALES_TAX_RATE);
}

export function calculateTotalWithTaxCents(entitlements: EntitlementSelection): number {
  const subtotal = calculateSubtotalCents(entitlements);
  return subtotal + calculateTaxCents(subtotal);
}

export function formatDisplayPrice(preTaxCents: number, includeTax = true): string {
  const base = includeTax ? preTaxCents + calculateTaxCents(preTaxCents) : preTaxCents;
  return `$${(base / 100).toFixed(2)}`;
}
