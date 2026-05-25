
-- Plan columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS trial_used boolean NOT NULL DEFAULT false;

-- PLANS
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_annual numeric(10,2) NOT NULL DEFAULT 0,
  ai_credits_monthly integer, -- NULL = unlimited
  has_docx_export boolean NOT NULL DEFAULT false,
  has_advanced_filters boolean NOT NULL DEFAULT false,
  has_job_tracker boolean NOT NULL DEFAULT false,
  job_tracker_limit integer,
  has_interview boolean NOT NULL DEFAULT false,
  interview_monthly_limit integer,
  has_community_read boolean NOT NULL DEFAULT false,
  has_community_write boolean NOT NULL DEFAULT false,
  has_all_courses boolean NOT NULL DEFAULT false,
  has_priority_support boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone authenticated can view plans" ON public.plans;
CREATE POLICY "Anyone authenticated can view plans" ON public.plans
  FOR SELECT TO authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage plans" ON public.plans;
CREATE POLICY "Admins manage plans" ON public.plans
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.plans (slug,name,tagline,price_monthly,price_annual,ai_credits_monthly,has_docx_export,has_advanced_filters,has_job_tracker,job_tracker_limit,has_interview,interview_monthly_limit,has_community_read,has_community_write,has_all_courses,has_priority_support,sort_order)
VALUES
  ('essencial','Essencial','Para começar sua busca',19.90,13.90,30,true,false,false,NULL,false,NULL,false,false,false,false,1),
  ('candidato','Candidato','Para acelerar resultados',29.90,22.25,80,true,true,true,15,true,5,true,false,true,false,2),
  ('profissional','Profissional','Recolocação sem limites',44.90,37.00,NULL,true,true,true,NULL,true,NULL,true,true,true,true,3)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, tagline=EXCLUDED.tagline, price_monthly=EXCLUDED.price_monthly,
  price_annual=EXCLUDED.price_annual, ai_credits_monthly=EXCLUDED.ai_credits_monthly,
  has_docx_export=EXCLUDED.has_docx_export, has_advanced_filters=EXCLUDED.has_advanced_filters,
  has_job_tracker=EXCLUDED.has_job_tracker, job_tracker_limit=EXCLUDED.job_tracker_limit,
  has_interview=EXCLUDED.has_interview, interview_monthly_limit=EXCLUDED.interview_monthly_limit,
  has_community_read=EXCLUDED.has_community_read, has_community_write=EXCLUDED.has_community_write,
  has_all_courses=EXCLUDED.has_all_courses, has_priority_support=EXCLUDED.has_priority_support,
  sort_order=EXCLUDED.sort_order, updated_at=now();

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'trialing', -- trialing|active|canceled|expired
  billing_cycle text, -- monthly|annual
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own subscription" ON public.subscriptions;
CREATE POLICY "Users view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI CREDITS
CREATE TABLE IF NOT EXISTS public.ai_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_credits_remaining integer NOT NULL DEFAULT 0,
  plan_credits_remaining integer NOT NULL DEFAULT 0,
  bonus_credits integer NOT NULL DEFAULT 0,
  period_start timestamptz,
  period_end timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own credits" ON public.ai_credits;
CREATE POLICY "Users view own credits" ON public.ai_credits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage credits" ON public.ai_credits;
CREATE POLICY "Admins manage credits" ON public.ai_credits
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- FEATURE USAGE
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  period_month text NOT NULL, -- YYYY-MM
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature, period_month)
);
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own usage" ON public.feature_usage;
CREATE POLICY "Users view own usage" ON public.feature_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- PAYMENT HISTORY
CREATE TABLE IF NOT EXISTS public.payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL,
  provider text,
  provider_payment_id text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own payments" ON public.payment_history;
CREATE POLICY "Users view own payments" ON public.payment_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RPC: use_ai_credit
CREATE OR REPLACE FUNCTION public.use_ai_credit(p_user_id uuid, p_amount integer DEFAULT 1)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits public.ai_credits%ROWTYPE;
  v_plan public.plans%ROWTYPE;
  v_sub public.subscriptions%ROWTYPE;
  v_total integer;
  v_remaining integer;
BEGIN
  SELECT * INTO v_sub FROM public.subscriptions
    WHERE user_id = p_user_id AND status IN ('active','trialing')
    ORDER BY created_at DESC LIMIT 1;
  IF FOUND THEN
    SELECT * INTO v_plan FROM public.plans WHERE id = v_sub.plan_id;
    IF v_plan.ai_credits_monthly IS NULL THEN
      RETURN jsonb_build_object('success', true, 'remaining', -1, 'unlimited', true);
    END IF;
  END IF;

  SELECT * INTO v_credits FROM public.ai_credits WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'remaining', 0, 'reason', 'no_credits');
  END IF;

  v_total := COALESCE(v_credits.trial_credits_remaining,0) + COALESCE(v_credits.plan_credits_remaining,0) + COALESCE(v_credits.bonus_credits,0);
  IF v_total < p_amount THEN
    RETURN jsonb_build_object('success', false, 'remaining', v_total, 'reason', 'insufficient');
  END IF;

  -- Deduct: trial -> plan -> bonus
  DECLARE
    v_left integer := p_amount;
    v_take integer;
  BEGIN
    v_take := LEAST(v_left, v_credits.trial_credits_remaining);
    v_credits.trial_credits_remaining := v_credits.trial_credits_remaining - v_take;
    v_left := v_left - v_take;
    IF v_left > 0 THEN
      v_take := LEAST(v_left, v_credits.plan_credits_remaining);
      v_credits.plan_credits_remaining := v_credits.plan_credits_remaining - v_take;
      v_left := v_left - v_take;
    END IF;
    IF v_left > 0 THEN
      v_credits.bonus_credits := v_credits.bonus_credits - v_left;
    END IF;
  END;

  UPDATE public.ai_credits SET
    trial_credits_remaining = v_credits.trial_credits_remaining,
    plan_credits_remaining = v_credits.plan_credits_remaining,
    bonus_credits = v_credits.bonus_credits,
    updated_at = now()
  WHERE user_id = p_user_id;

  v_remaining := v_credits.trial_credits_remaining + v_credits.plan_credits_remaining + v_credits.bonus_credits;
  RETURN jsonb_build_object('success', true, 'remaining', v_remaining);
END;
$$;

-- RPC: check_feature_access
CREATE OR REPLACE FUNCTION public.check_feature_access(p_user_id uuid, p_feature text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan public.plans%ROWTYPE;
  v_sub public.subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM public.subscriptions
    WHERE user_id = p_user_id AND status IN ('active','trialing')
    ORDER BY created_at DESC LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'no_subscription');
  END IF;
  SELECT * INTO v_plan FROM public.plans WHERE id = v_sub.plan_id;

  CASE p_feature
    WHEN 'interview' THEN RETURN jsonb_build_object('allowed', v_plan.has_interview);
    WHEN 'job_tracker' THEN RETURN jsonb_build_object('allowed', v_plan.has_job_tracker);
    WHEN 'community_read' THEN RETURN jsonb_build_object('allowed', v_plan.has_community_read);
    WHEN 'community_write' THEN RETURN jsonb_build_object('allowed', v_plan.has_community_write);
    WHEN 'all_courses' THEN RETURN jsonb_build_object('allowed', v_plan.has_all_courses);
    WHEN 'docx_export' THEN RETURN jsonb_build_object('allowed', v_plan.has_docx_export);
    WHEN 'advanced_filters' THEN RETURN jsonb_build_object('allowed', v_plan.has_advanced_filters);
    ELSE RETURN jsonb_build_object('allowed', false, 'reason', 'unknown_feature');
  END CASE;
END;
$$;

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_credits_updated_at BEFORE UPDATE ON public.ai_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_usage_updated_at BEFORE UPDATE ON public.feature_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
