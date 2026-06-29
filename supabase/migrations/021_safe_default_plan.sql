-- 021: Safe default plan for new subscription rows + clean up leaked trials
-- Run this in the Supabase SQL Editor. Idempotent.

-- New users must start on the restrictive Free plan, never the feature-rich
-- internal "trial" plan. The original table default (plan='trial',
-- status='trialing', no expiry) meant an abandoned checkout left a placeholder
-- subscription row granting full Growth-tier features (25 inboxes, 15k emails,
-- SARA, A/B) for free, forever. Align the DB default with the application
-- default (Free), which is the real source of truth in billing.service.ts.
ALTER TABLE subscriptions ALTER COLUMN plan SET DEFAULT 'free';
ALTER TABLE subscriptions ALTER COLUMN status SET DEFAULT 'free';

-- Repair any already-leaked rows. A row marked trialing/trial with no real
-- Stripe subscription behind it is an abandoned-checkout placeholder, not a
-- paid trial — genuine Stripe trials always carry a stripe_subscription_id.
-- Drop those back to Free so they stop receiving paid features for free.
UPDATE subscriptions
SET plan = 'free', status = 'free'
WHERE stripe_subscription_id IS NULL
  AND (status = 'trialing' OR plan = 'trial');
