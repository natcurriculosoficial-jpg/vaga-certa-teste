import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Zap, CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePlan } from "@/hooks/usePlan";
import { CreditPixModal } from "@/components/pricing/CreditPixModal";

const PACKAGES = [
  {
    index: 0,
    label: "Recarga Pequena",
    credits: 20,
    price: 8.0,
    priceLabel: "R$ 8,00",
    costLabel: "R$ 0,40/crédito",
    highlight: false,
    badge: null as string | null,
  },
  {
    index: 1,
    label: "Recarga Média",
    credits: 50,
    price: 15.0,
    priceLabel: "R$ 15,00",
    costLabel: "R$ 0,30/crédito",
    highlight: true,
    badge: "Mais popular",
  },
  {
    index: 2,
    label: "Recarga Grande",
    credits: 100,
    price: 25.0,
    priceLabel: "R$ 25,00",
    costLabel: "R$ 0,25/crédito",
    highlight: false,
    badge: "Melhor custo",
  },
] as const;

export default function BuyCredits() {
  const navigate = useNavigate();
  const { plan } = usePlan();
  const [pixModal, setPixModal] = useState<{ open: boolean; index: number; label: string; credits: number } | null>(null);
  const [stripeLoading, setStripeLoading] = useState<number | null>(null);

  const handlePix = (pkg: (typeof PACKAGES)[number]) => {
    setPixModal({ open: true, index: pkg.index, label: pkg.label, credits: pkg.credits });
  };

  const handleCard = async (pkg: (typeof PACKAGES)[number]) => {
    setStripeLoading(pkg.index);
    try {
      const { data, error } = await supabase.functions.invoke("create-credit-recharge", {
        body: { packageIndex: pkg.index, paymentMethod: "stripe" },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e: any) {
      toast({
        title: "Erro ao iniciar pagamento",
        description: e.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setStripeLoading(null);
    }
  };

  const remaining = plan.isUnlimited ? null : Math.max(plan.aiCreditsRemaining, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Recarregar Créditos IA</h1>
            <p className="text-sm text-muted-foreground">
              Créditos são usados para gerar conteúdo com IA — currículo, LinkedIn, entrevistas.
            </p>
          </div>
        </div>

        {remaining !== null && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border text-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">
              Seu saldo atual:{" "}
              <span className="font-semibold text-foreground">{remaining} créditos</span>
            </span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {PACKAGES.map((pkg, i) => (
          <motion.div
            key={pkg.index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`relative rounded-2xl border p-6 flex flex-col gap-4 transition-all ${
              pkg.highlight
                ? "border-primary/50 bg-primary/[0.03] shadow-lg shadow-primary/10"
                : "border-border bg-card/40"
            }`}
          >
            {pkg.badge && (
              <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wide">
                {pkg.badge}
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                pkg.highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <Zap className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">{pkg.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  <span className="font-medium text-foreground">+{pkg.credits} créditos</span>
                  {" · "}
                  {pkg.costLabel}
                </div>
              </div>
            </div>

            <div className="text-3xl font-bold text-foreground">{pkg.priceLabel}</div>

            <div className="flex gap-2 mt-auto">
              <Button
                variant={pkg.highlight ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => handlePix(pkg)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                PIX
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => handleCard(pkg)}
                disabled={stripeLoading === pkg.index}
              >
                <CreditCard className="h-3.5 w-3.5" />
                {stripeLoading === pkg.index ? "Aguarde..." : "Cartão"}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Créditos não expiram · Pagamento seguro via Asaas / Stripe
      </p>

      {pixModal && (
        <CreditPixModal
          open={pixModal.open}
          onOpenChange={(o) => setPixModal(o ? pixModal : null)}
          packageIndex={pixModal.index}
          packageLabel={pixModal.label}
          credits={pixModal.credits}
        />
      )}
    </div>
  );
}
