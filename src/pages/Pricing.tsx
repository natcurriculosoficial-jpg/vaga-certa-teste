import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    features: [
      { text: "Currículo básico", included: true },
      { text: "LinkedIn limitado", included: true },
      { text: "5 análises IA/mês", included: true },
      { text: "3 vagas/dia", included: true },
      { text: "Simulador de entrevista", included: false },
      { text: "IA ilimitada", included: false },
      { text: "Radar completo", included: false },
    ],
    current: true,
  },
  {
    name: "PRO",
    price: "R$ 29,90",
    period: "/mês",
    features: [
      { text: "Currículo ilimitado", included: true },
      { text: "LinkedIn completo", included: true },
      { text: "IA ilimitada", included: true },
      { text: "Vagas ilimitadas", included: true },
      { text: "Simulador liberado", included: true },
      { text: "Radar completo", included: true },
      { text: "Suporte prioritário", included: true },
    ],
    current: false,
    highlight: true,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Escolha seu plano</h1>
        <p className="text-muted-foreground">Desbloqueie todo o potencial da Vaga Certa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map(plan => (
          <div key={plan.name} className={`glass-card p-6 space-y-6 ${plan.highlight ? "border-secondary ring-1 ring-secondary/30" : ""}`}>
            {plan.highlight && (
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                Mais popular
              </span>
            )}
            <div>
              <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
              <div className="mt-2">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-3">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {f.included ? (
                    <Check className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={f.included ? "text-foreground" : "text-muted-foreground"}>{f.text}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.highlight ? "default" : "outline"}
              onClick={() => {
                if (plan.current) navigate("/dashboard");
              }}
            >
              {plan.current ? "Plano atual" : "Assinar PRO"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
