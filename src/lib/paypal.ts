import * as paypal from '@paypal/checkout-server-sdk';

/**
 * PayPal server SDK helper for Next.js (App Router).
 * This file is server-only by usage: only import it from server routes/actions.
 */

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET');
  }

  const isLive = process.env.PAYPAL_ENV === 'live';

  return isLive
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

export function paypalClient() {
  return new paypal.core.PayPalHttpClient(environment());
}

export const PAYPAL_PLAN_IDS = {
  MONTHLY: process.env.PAYPAL_PLAN_MONTHLY_ID ?? '',
  SIX_MONTH: process.env.PAYPAL_PLAN_SIXMONTH_ID ?? '',
  YEARLY: process.env.PAYPAL_PLAN_YEARLY_ID ?? '',
} as const;

export function getPlanIdFromKey(planKey: string): string {
  switch (planKey) {
    case 'monthly':
      return PAYPAL_PLAN_IDS.MONTHLY;
    case 'sixmonth':
      return PAYPAL_PLAN_IDS.SIX_MONTH;
    case 'yearly':
      return PAYPAL_PLAN_IDS.YEARLY;
    default:
      throw new Error(`Unknown plan: ${planKey}`);
  }
}
