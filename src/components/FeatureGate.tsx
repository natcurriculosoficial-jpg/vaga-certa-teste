import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/hooks/usePlan";

interface FeatureGateProps {
  feature: string;
  requiredPlan: "essencial" | "candidato" | "profissional";
  children: ReactNode;
  /** Override automatic plan check (e.g. when access was already checked) */
  forceLocked?: boolean;
}

const PLAN_LABEL: Record<string, string> = {
  essencial: "Essencial",
  candidato: "Candidato",
  profissional: "Profissional",
};

const PLAN_RANK: Record<string, number> = {
  free: 0,
  essencial: 1,
  candidato: 2,
  profissional: 3,
};

export default function FeatureGate({
  feature,
  requiredPlan,
  children,
  forceLocked,
}: FeatureGateProps) {
  const navigate = useNavigate();
  const { plan, loading } = usePlan();

  if (loading) return <>{children}</>;

  const userRank = PLAN_RANK[plan.slug] ?? 0;
  const requiredRank = PLAN_RANK[requiredPlan] ?? 99;
  const hasAccess = !forceLocked && userRank >= requiredRank;

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none select-none"
        style={{ filter: "blur(8px)" }}
      >
        {children}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 z-10 flex items-center justify-center p-4"
      >
        <div
          className="rounded-2xl border border-border/60 px-6 py-5 text-center max-w-sm w-full shadow-xl"
          style={{
            background: "hsl(var(--background) / 0.75)",
            backdropFilter: "blur(16px) saturate(1.4)",
            WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          }}
          data-feature={feature}
        >
          <div className="mx-auto w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Recurso bloqueado
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Disponível no plano {PLAN_LABEL[requiredPlan] ?? requiredPlan}
          </p>
          <Button
            size="sm"
            className="mt-4 w-full gradient-primary"
            onClick={() => navigate("/pricing")}
          >
            Ver planos
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
