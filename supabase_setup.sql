-- ============================================================
-- Tailan — Subscriptions Table Setup
-- Run this in the Supabase SQL Editor (project: zkljsychjcnzcgsxfzeo)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status                          text NOT NULL DEFAULT 'inactive',
  -- status values: 'active' | 'on_trial' | 'inactive' | 'cancelled' | 'expired' | 'paused'
  lemon_squeezy_subscription_id   text,
  lemon_squeezy_customer_id       text,
  lemon_squeezy_variant_id        text,
  current_period_end              timestamptz,
  created_at                      timestamptz DEFAULT now(),
  updated_at                      timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription row
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (webhooks) can insert/update
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- To manually activate a subscription for testing:
-- ============================================================
-- INSERT INTO public.subscriptions (user_id, status, current_period_end)
-- VALUES ('<your-user-id>', 'active', now() + interval '30 days');
