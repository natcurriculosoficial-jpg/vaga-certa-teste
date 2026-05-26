import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Sparkles, Loader2, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { usePlan } from "@/hooks/usePlan";
import { PaymentMethodModal } from "@/components/pricing/PaymentMethodModal";
import { PixModal } from "@/components/pricing/PixModal";

interface Plan {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  price_monthly: number;
  price_annual: number;
  ai_credits_monthly: number | null;
  has_docx_export: boolean;
  has_advanced_filters: boolean;
  has_job_tracker: boolean;
  job_tracker_limit: number | null;
  has_interview: boolean;
  interview_monthly_limit: number | null;
  has_community_read: boolean;
  has_community_write: boolean;
  has_all_courses: boolean;
  has_priority_support: boolean;
  sort_order: number;
  stripe_price_monthly: string | null;
  stripe_price_yearly: string | null;
  pix_price_monthly_cents: number | null;
  pix_price_yearly_cents: number | null;
}

const PLAN_RANK: Record<string, number> = {
  free: 0,
  essencial: 1,
  candidato: 2,
  profissional: 3,
};

type Billing = "monthly" | "annual";

const FEATURE_ROWS: {
  label: string;
  render: (p: Plan) => { ok: boolean; text?: string };
}[] = [
  {
    label: "Currículo com IA",
    render: (p) => ({
      ok: true,
      text: p.ai_credits_monthly === null ? "Ilimitado" : `${p.ai_credits_monthly} créditos/mês`,
    }),
  },
  { label: "LinkedIn com IA", render: () => ({ ok: true }) },
  {
    label: "Busca de Vagas",
    render: (p) => ({ ok: true, text: p.has_advanced_filters ? "Ilimitado" : "5/dia" }),
  },
  { label: "Aulas e Conteúdos", render: () => ({ ok: true }) },
  {
    label: "Export PDF",
    render: (p) => ({ ok: true, text: p.slug === "essencial" ? "com marca d'água" : "limpo" }),
  },
  { label: "Export DOCX", render: (p) => ({ ok: p.has_docx_export }) },
  { label: "Filtros avançados", render: (p) => ({ ok: p.has_advanced_filters }) },
  {
    label: "Job Tracker",
    render: (p) => ({
      ok: p.has_job_tracker,
      text: p.has_job_tracker ? (p.job_tracker_limit ? `${p.job_tracker_limit} vagas` : "Ilimitado") : undefined,
    }),
  },
  {
    label: "Simulador de Entrevista",
    render: (p) => ({
      ok: p.has_interview,
      text: p.has_interview ? (p.interview_monthly_limit ? `${p.interview_monthly_limit}/mês` : "Ilimitado") : undefined,
    }),
  },
  { label: "Comunidade (ler)", render: (p) => ({ ok: p.has_community_read }) },
  { label: "Comunidade (postar)", render: (p) => ({ ok: p.has_community_write }) },
  { label: "Suporte prioritário", render: (p) => ({ ok: p.has_priority_support }) },
];

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Pricing() {
  const navigate = useNavigate();
  const { plan: userPlan } = usePlan();
  const [billing, setBilling] = useState<Billing>("monthly");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [methodModalPlan, setMethodModalPlan] = useState<Plan | null>(null);
  const [pixPlan, setPixPlan] = useState<Plan | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      setPlans((data as Plan[]) || []);
      setLoading(false);
    })();
  }, []);

  const discount = useMemo(() => {
    if (plans.length === 0) return 0;
    const ratios = plans
      .filter((p) => p.price_monthly > 0)
      .map((p) => 1 - p.price_annual / p.price_monthly);
    return Math.round(Math.max(...ratios, 0) * 100);
  }, [plans]);

  const handleSubscribe = async (p: Plan) => {
    if (p.slug === userPlan.slug) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login?redirect=/pricing");
      return;
    }

    const pixCents = billing === "annual" ? p.pix_price_yearly_cents : p.pix_price_monthly_cents;
    const stripePrice = billing === "annual" ? p.stripe_price_yearly : p.stripe_price_monthly;

    // If only one method is available, skip the chooser
    if (!pixCents && stripePrice) {
      await startCardCheckout(p);
      return;
    }
    if (pixCents && !stripePrice) {
      setPixPlan(p);
      return;
    }
    if (!pixCents && !stripePrice) {
      toast({
        title: "Plano indisponível",
        description: "Este plano não está configurado para cobrança no momento.",
        variant: "destructive",
      });
      return;
    }

    setMethodModalPlan(p);
  };

  const startCardCheckout = async (p: Plan) => {
    const priceId = billing === "annual" ? p.stripe_price_yearly : p.stripe_price_monthly;
    if (!priceId) {
      toast({
        title: "Cartão indisponível",
        description: "Pagamento com cartão não está configurado para este plano.",
        variant: "destructive",
      });
      return;
    }
    setCheckoutLoading(p.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId,
          planSlug: p.slug,
          billingCycle: billing === "annual" ? "yearly" : "monthly",
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("Resposta inválida do checkout");
    } catch (e: any) {
      toast({
        title: "Não foi possível iniciar o checkout",
        description: e.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      setCheckoutLoading(null);
    }
  };

  const handleMethodSelect = (method: "card" | "pix") => {
    const p = methodModalPlan;
    setMethodModalPlan(null);
    if (!p) return;
    if (method === "card") startCardCheckout(p);
    else setPixPlan(p);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" /> Planos Vaga Certa
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Escolha o plano ideal para sua recolocação
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Comece grátis e evolua conforme acelera sua busca por uma nova oportunidade.
        </p>

        <div className="inline-flex items-center gap-3 mt-4 rounded-full border border-border bg-muted/30 px-4 py-2">
          <span className={`text-sm font-medium ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
            Mensal
          </span>
          <Switch
            checked={billing === "annual"}
            onCheckedChange={(c) => setBilling(c ? "annual" : "monthly")}
            aria-label="Alternar cobrança anual"
          />
          <span className={`text-sm font-medium ${billing === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
            Anual
          </span>
          {discount > 0 && (
            <Badge className="bg-success/15 text-success border-success/20 hover:bg-success/15">
              Economize até {discount}%
            </Badge>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p, idx) => {
            const isHighlight = p.slug === "candidato";
            const price = billing === "monthly" ? p.price_monthly : p.price_annual;
            const isCurrent = p.slug === userPlan.slug;
            const userRank = PLAN_RANK[userPlan.slug] ?? 0;
            const planRank = PLAN_RANK[p.slug] ?? 0;
            const isUpgrade = planRank > userRank;
            const isDowngrade = planRank < userRank && !isCurrent;
            const isLoading = checkoutLoading === p.id;
            const buttonLabel = isCurrent
              ? "Seu plano atual"
              : isUpgrade
                ? "Fazer upgrade"
                : isDowngrade
                  ? "Plano inferior"
                  : "Assinar";

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className={`relative rounded-2xl p-6 space-y-5 flex flex-col backdrop-blur-xl ${
                  isHighlight
                    ? "bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/40 shadow-xl shadow-primary/20"
                    : "bg-card/80 border border-border"
                }`}
              >
                {isHighlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 rounded-full gradient-primary text-white shadow-md">
                    Mais popular
                  </span>
                )}

                <div>
                  <h2 className="text-lg font-bold text-foreground">{p.name}</h2>
                  {p.tagline && <p className="text-xs text-muted-foreground mt-1">{p.tagline}</p>}
                </div>

                <div className="min-h-[88px]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{brl(price)}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {billing === "annual"
                      ? `cobrado ${brl(price * 12)}/ano`
                      : "cobrado mensalmente"}
                  </div>
                  {((billing === "annual" ? p.pix_price_yearly_cents : p.pix_price_monthly_cents) ?? 0) > 0 && (
                    <Badge variant="secondary" className="mt-2 gap-1 bg-success/10 text-success border-success/20 hover:bg-success/10">
                      <Smartphone className="h-3 w-3" /> PIX disponível
                    </Badge>
                  )}
                </div>

                <Button
                  className={`w-full ${isHighlight && !isCurrent && !isDowngrade ? "gradient-primary text-white" : ""}`}
                  variant={isCurrent || isDowngrade ? "outline" : isHighlight ? "default" : "outline"}
                  disabled={isCurrent || isDowngrade || isLoading}
                  onClick={() => handleSubscribe(p)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Redirecionando...
                    </>
                  ) : (
                    buttonLabel
                  )}
                </Button>


                <ul className="space-y-2.5 text-sm pt-3 border-t border-border/60">
                  {FEATURE_ROWS.map((row) => {
                    const v = row.render(p);
                    return (
                      <li key={row.label} className="flex items-start gap-2">
                        {v.ok ? (
                          <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-xs ${v.ok ? "text-foreground" : "text-muted-foreground/60"}`}>
                          {row.label}
                          {v.ok && v.text && (
                            <span className="text-muted-foreground"> — {v.text}</span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Você pode alterar ou cancelar seu plano a qualquer momento.
      </p>

      <PaymentMethodModal
        open={!!methodModalPlan}
        onOpenChange={(o) => !o && setMethodModalPlan(null)}
        onSelect={handleMethodSelect}
        pixAvailable={
          !!(methodModalPlan &&
            ((billing === "annual"
              ? methodModalPlan.pix_price_yearly_cents
              : methodModalPlan.pix_price_monthly_cents) ?? 0) > 0)
        }
      />

      {pixPlan && (
        <PixModal
          open={!!pixPlan}
          onOpenChange={(o) => !o && setPixPlan(null)}
          planSlug={pixPlan.slug}
          billingCycle={billing === "annual" ? "yearly" : "monthly"}
        />
      )}
    </div>
  );
}
