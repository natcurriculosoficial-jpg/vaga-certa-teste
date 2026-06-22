import { useNavigate } from "react-router-dom";
import { Sparkles, Infinity as InfinityIcon } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";

interface Props {
  collapsed?: boolean;
}

export default function CreditsIndicator({ collapsed }: Props) {
  const navigate = useNavigate();
  const { plan, loading } = usePlan();

  if (loading) return null;

  const go = () => navigate("/credits");

  // Unlimited (PRO)
  if (plan.isUnlimited) {
    if (collapsed) {
      return (
        <button
          onClick={go}
          title="IA Ilimitada"
          className="mx-auto w-10 h-10 rounded-[10px] flex items-center justify-center bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
        >
          <InfinityIcon className="h-4 w-4" />
        </button>
      );
    }
    return (
      <button
        onClick={go}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] bg-primary/10 hover:bg-primary/15 transition-colors text-left"
      >
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-white/50">Créditos IA</div>
          <div className="text-xs font-semibold text-white flex items-center gap-1">
            <InfinityIcon className="h-3 w-3" /> Ilimitado
          </div>
        </div>
      </button>
    );
  }

  // No plan / no credits
  if (plan.slug === "free" || plan.aiCreditsTotal === 0) {
    if (collapsed) {
      return (
        <button
          onClick={go}
          title="Upgrade — 0 créditos"
          className="mx-auto w-10 h-10 rounded-[10px] flex items-center justify-center bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      );
    }
    return (
      <button
        onClick={go}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-left"
      >
        <Sparkles className="h-4 w-4 text-white/60 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-white/50">Créditos IA</div>
          <div className="text-xs font-semibold text-white">0 — Upgrade</div>
        </div>
      </button>
    );
  }

  // Has plan with quota
  const total = plan.aiCreditsTotal;
  const remaining = Math.max(plan.aiCreditsRemaining, 0);
  const pct = total > 0 ? Math.min(100, Math.round((remaining / total) * 100)) : 0;

  const barColor =
    pct > 50 ? "bg-success" : pct >= 20 ? "bg-amber-400" : "bg-red-400";
  const textColor =
    pct > 50 ? "text-success" : pct >= 20 ? "text-amber-300" : "text-red-300";

  if (collapsed) {
    return (
      <button
        onClick={go}
        title={`${remaining}/${total} créditos`}
        className="mx-auto w-10 h-10 rounded-[10px] flex flex-col items-center justify-center gap-1 bg-white/[0.04] hover:bg-white/10 transition-colors"
      >
        <Sparkles className={`h-3.5 w-3.5 ${textColor}`} />
        <div className="w-6 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={go}
      className="w-full flex flex-col gap-1.5 px-3 py-2 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={`h-4 w-4 ${textColor}`} />
          <span className="text-[11px] text-white/50">Créditos IA</span>
        </div>
        <span className="text-xs font-semibold text-white tabular-nums">
          {remaining}/{total}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  );
}
