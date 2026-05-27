import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PlanInfo {
  slug: string;
  name: string;
  status: string;
  billingCycle: string | null;
  trialEnd: string | null;
  periodEnd: string | null;

  aiCreditsRemaining: number; // -1 = unlimited
  aiCreditsTotal: number;
  bonusCredits: number;
  isUnlimited: boolean;

  canUseAI: boolean;
  canExportDocx: boolean;
  hasJobTracker: boolean;
  hasInterview: boolean;
  hasCommunityRead: boolean;
  hasCommunityWrite: boolean;
  hasAllCourses: boolean;
  hasAdvancedFilters: boolean;
  hasPrioritySupport: boolean;
}

const FREE_PLAN: PlanInfo = {
  slug: "free",
  name: "Free",
  status: "free",
  billingCycle: null,
  trialEnd: null,
  periodEnd: null,
  aiCreditsRemaining: 0,
  aiCreditsTotal: 0,
  bonusCredits: 0,
  isUnlimited: false,
  canUseAI: false,
  canExportDocx: false,
  hasJobTracker: false,
  hasInterview: false,
  hasCommunityRead: false,
  hasCommunityWrite: false,
  hasAllCourses: false,
  hasAdvancedFilters: false,
  hasPrioritySupport: false,
};

export function usePlan() {
  const { session } = useAuth();
  const [plan, setPlan] = useState<PlanInfo>(FREE_PLAN);
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    if (!session?.user?.id) {
      setPlan(FREE_PLAN);
      setLoading(false);
      return;
    }

    try {
      const userId = session.user.id;

      const nowIso = new Date().toISOString();
      const { data: sub } = await (supabase as any)
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("user_id", userId)
        .in("status", ["active", "trialing", "canceled"])
        .or(`current_period_end.is.null,current_period_end.gte.${nowIso}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: credits } = await (supabase as any)
        .from("ai_credits")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!sub || !sub.plans) {
        setPlan(FREE_PLAN);
        setLoading(false);
        return;
      }

      const p = sub.plans;
      const isUnlimited = p.ai_credits_monthly === null;
      const totalCredits = credits
        ? (credits.trial_credits_remaining || 0) +
          (credits.plan_credits_remaining || 0) +
          (credits.bonus_credits || 0)
        : 0;

      setPlan({
        slug: p.slug,
        name: p.name,
        status: sub.status,
        billingCycle: sub.billing_cycle,
        trialEnd: sub.trial_end,
        periodEnd: sub.current_period_end,
        aiCreditsRemaining: isUnlimited ? -1 : totalCredits,
        aiCreditsTotal: p.ai_credits_monthly || 0,
        bonusCredits: credits?.bonus_credits || 0,
        isUnlimited,
        canUseAI: isUnlimited || totalCredits > 0,
        canExportDocx: !!p.has_docx_export,
        hasJobTracker: !!p.has_job_tracker,
        hasInterview: !!p.has_interview,
        hasCommunityRead: !!p.has_community_read,
        hasCommunityWrite: !!p.has_community_write,
        hasAllCourses: !!p.has_all_courses,
        hasAdvancedFilters: !!p.has_advanced_filters,
        hasPrioritySupport: !!p.has_priority_support,
      });
    } catch (err) {
      console.error("Error fetching plan:", err);
      setPlan(FREE_PLAN);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const useCredit = useCallback(
    async (amount: number = 1): Promise<{ success: boolean; remaining: number }> => {
      if (!session?.user?.id) return { success: false, remaining: 0 };

      const { data, error } = await (supabase as any).rpc("use_ai_credit", {
        p_user_id: session.user.id,
        p_amount: amount,
      });

      if (error || !data) return { success: false, remaining: 0 };

      await fetchPlan();
      return { success: !!data.success, remaining: data.remaining ?? 0 };
    },
    [session?.user?.id, fetchPlan]
  );

  const checkAccess = useCallback(
    async (feature: string): Promise<{ allowed: boolean; reason?: string }> => {
      if (!session?.user?.id) return { allowed: false, reason: "not_authenticated" };

      const { data, error } = await (supabase as any).rpc("check_feature_access", {
        p_user_id: session.user.id,
        p_feature: feature,
      });

      if (error || !data) return { allowed: false, reason: "error" };
      return { allowed: !!data.allowed, reason: data.reason };
    },
    [session?.user?.id]
  );

  return {
    plan,
    loading,
    useCredit,
    checkAccess,
    refreshPlan: fetchPlan,
    isTrial: plan.status === "trialing",
    isFree: plan.slug === "free",
    isPro: plan.slug === "profissional",
  };
}
