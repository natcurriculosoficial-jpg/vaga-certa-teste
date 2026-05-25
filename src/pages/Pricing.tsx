import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Lock, Infinity as InfinityIcon, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

type PlanKey = "trial" | "basico" | "inter" | "pro";
type Billing = "monthly" | "annual";

const PLAN_META: Record<PlanKey, { name: string; tagline: string; monthly: number; annual: number; highlight?: boolean }> = {
  trial:  { name: "Trial",         tagline: "Para conhecer a plataforma",       monthly: 0,     annual: 0 },
  basico: { name: "Básico",        tagline: "Para começar sua busca",           monthly: 19.9,  annual: 13.9 },
  inter:  { name: "Intermediário", tagline: "Para acelerar resultados",         monthly: 29.9,  annual: 22.25, highlight: true },
  pro:    { name: "PRO",           tagline: "Recolocação sem limites",          monthly: 44.9,  annual: 37.0 },
};

const PLAN_ORDER: PlanKey[] = ["trial", "basico", "inter", "pro"];

type CellValue =
  | { kind: "check" }
  | { kind: "cross" }
  | { kind: "infinity" }
  | { kind: "lock"; label?: string }
  | { kind: "text"; label: string };

const C = {
  check: { kind: "check" } as CellValue,
  cross: { kind: "cross" } as CellValue,
  inf: { kind: "infinity" } as CellValue,
  lock: (label?: string) => ({ kind: "lock", label } as CellValue),
  t: (label: string) => ({ kind: "text", label } as CellValue),
};

const FEATURES: { label: string; values: Record<PlanKey, CellValue> }[] = [
  { label: "Currículo (editor)",      values: { trial: C.check,         basico: C.check,        inter: C.check,        pro: C.check } },
  { label: "IA no currículo",         values: { trial: C.t("3x"),       basico: C.t("15/mês"),  inter: C.t("40/mês"),  pro: C.inf } },
  { label: "Exportar PDF",            values: { trial: C.t("com marca"),basico: C.t("limpo"),   inter: C.t("limpo"),   pro: C.t("limpo") } },
  { label: "Exportar DOCX",           values: { trial: C.cross,         basico: C.check,        inter: C.check,        pro: C.check } },
  { label: "LinkedIn (editor)",       values: { trial: C.check,         basico: C.check,        inter: C.check,        pro: C.check } },
  { label: "IA no LinkedIn",          values: { trial: C.cross,         basico: C.t("15/mês"),  inter: C.t("40/mês"),  pro: C.inf } },
  { label: "Checklist",               values: { trial: C.check,         basico: C.check,        inter: C.check,        pro: C.check } },
  { label: "Aulas",                   values: { trial: C.t("onboarding"),basico: C.t("todas"),  inter: C.t("todas"),   pro: C.t("todas") } },
  { label: "Radar de Vagas",          values: { trial: C.t("3x/dia"),   basico: C.t("5x/dia"),  inter: C.inf,          pro: C.inf } },
  { label: "Filtros avançados",       values: { trial: C.cross,         basico: C.cross,        inter: C.check,        pro: C.check } },
  { label: "Job Tracker",             values: { trial: C.lock(),        basico: C.lock(),       inter: C.t("15 vagas"),pro: C.inf } },
  { label: "Simulador de Entrevista", values: { trial: C.lock(),        basico: C.lock(),       inter: C.t("5x/mês"),  pro: C.inf } },
  { label: "Comunidade",              values: { trial: C.lock(),        basico: C.lock(),       inter: C.t("leitura"), pro: C.t("completa") } },
  { label: "Score de Empregabilidade",values: { trial: C.cross,         basico: C.cross,        inter: C.cross,        pro: C.check } },
  { label: "Benchmark Salarial",      values: { trial: C.cross,         basico: C.cross,        inter: C.cross,        pro: C.check } },
  { label: "Recarga de créditos",     values: { trial: C.cross,         basico: C.check,        inter: C.check,        pro: C.t("n/a") } },
];

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Cell({ value }: { value: CellValue }) {
  switch (value.kind) {
    case "check":    return <Check className="h-4 w-4 text-success mx-auto" />;
    case "cross":    return <X className="h-4 w-4 text-muted-foreground/60 mx-auto" />;
    case "infinity": return <InfinityIcon className="h-4 w-4 text-primary mx-auto" />;
    case "lock":     return (
      <div className="flex items-center justify-center gap-1 text-muted-foreground/70">
        <Lock className="h-3.5 w-3.5" />
        {value.label && <span className="text-xs">{value.label}</span>}
      </div>
    );
    case "text":
      if (value.label === "leitura") {
        return (
          <div className="flex items-center justify-center gap-1 text-foreground/80">
            <Eye className="h-3.5 w-3.5" />
            <span className="text-xs">leitura</span>
          </div>
        );
      }
      return <span className="text-xs text-foreground/80">{value.label}</span>;
  }
}

export default function Pricing() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<Billing>("monthly");
  const currentPlan: PlanKey = "trial"; // TODO: integrar com plano real do usuário

  const handleSubscribe = (key: PlanKey) => {
    if (key === currentPlan) { navigate("/dashboard"); return; }
    toast({ title: "Em breve", description: "A contratação de planos será liberada em breve." });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" /> Planos Vaga Certa
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Escolha o plano ideal para sua recolocação</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Comece grátis e evolua conforme acelera sua busca por uma nova oportunidade.
        </p>

        {/* Billing toggle */}
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
          <Badge className="bg-success/15 text-success border-success/20 hover:bg-success/15">
            Economize ~25%
          </Badge>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLAN_ORDER.map((key) => {
          const plan = PLAN_META[key];
          const price = billing === "monthly" ? plan.monthly : plan.annual;
          const isFree = plan.monthly === 0;
          const isCurrent = key === currentPlan;

          return (
            <div
              key={key}
              className={`relative rounded-2xl p-6 space-y-5 flex flex-col bg-card border transition-shadow ${
                plan.highlight
                  ? "border-primary/40 ring-1 ring-primary/30 shadow-lg shadow-primary/10"
                  : "border-border"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 rounded-full gradient-primary text-white">
                  Mais popular
                </span>
              )}

              <div>
                <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
              </div>

              <div className="min-h-[72px]">
                {isFree ? (
                  <>
                    <div className="text-3xl font-bold text-foreground">Grátis</div>
                    <div className="text-xs text-muted-foreground mt-1">para sempre</div>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">{formatBRL(price)}</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {billing === "annual"
                        ? `cobrado ${formatBRL(price * 12)}/ano`
                        : "cobrado mensalmente"}
                    </div>
                  </>
                )}
              </div>

              <Button
                className="w-full"
                variant={plan.highlight ? "default" : "outline"}
                disabled={isCurrent}
                onClick={() => handleSubscribe(key)}
              >
                {isCurrent ? "Plano atual" : isFree ? "Começar grátis" : `Assinar ${plan.name}`}
              </Button>

              {/* Top features quick view */}
              <ul className="space-y-2 text-sm pt-2 border-t border-border/60">
                {FEATURES.slice(0, 6).map((f) => (
                  <li key={f.label} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-xs truncate">{f.label}</span>
                    <span className="shrink-0"><Cell value={f.values[key]} /></span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Comparativo completo</h3>
          <p className="text-xs text-muted-foreground">Todos os recursos lado a lado</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-muted/40">
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Recurso</th>
                {PLAN_ORDER.map((key) => (
                  <th key={key} className={`px-3 py-3 text-center font-semibold ${PLAN_META[key].highlight ? "text-primary" : "text-foreground"}`}>
                    {PLAN_META[key].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr key={f.label} className={i % 2 === 0 ? "bg-transparent" : "bg-muted/20"}>
                  <td className="px-5 py-3 text-foreground/90">{f.label}</td>
                  {PLAN_ORDER.map((key) => (
                    <td key={key} className="px-3 py-3 text-center">
                      <Cell value={f.values[key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Você pode alterar ou cancelar seu plano a qualquer momento.
      </p>
    </div>
  );
}
