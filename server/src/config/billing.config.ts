import type { PlanId } from '@lemlist/shared';

export type BillingInterval = 'monthly' | 'annual';

// Stripe Price IDs (LIVE). Price IDs are not secret. The secret API key lives
// in the STRIPE_SECRET_KEY env var, never in the repo.
export const STRIPE_PRICES: Record<'starter' | 'growth', Record<BillingInterval, string>> = {
  starter: {
    monthly: 'price_1TmDVCLqzLjO1zP3meuCrDrd',
    annual: 'price_1TmDVCLqzLjO1zP3WirBGX3E',
  },
  growth: {
    monthly: 'price_1TmDYzLqzLjO1zP32HvywCuX',
    annual: 'price_1TmDYzLqzLjO1zP3Wg0AQTnu',
  },
};

// Reverse lookup: a Stripe price ID → the plan it represents (used by webhooks).
export const PRICE_TO_PLAN: Record<string, PlanId> = Object.entries(STRIPE_PRICES).reduce(
  (acc, [plan, intervals]) => {
    for (const priceId of Object.values(intervals)) acc[priceId] = plan as PlanId;
    return acc;
  },
  {} as Record<string, PlanId>,
);

/** Number of free trial days on a new paid subscription. */
export const TRIAL_DAYS = 10;
