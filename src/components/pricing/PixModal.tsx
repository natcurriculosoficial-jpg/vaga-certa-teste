import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, RefreshCw, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { usePlan } from "@/hooks/usePlan";
import { formatCpf, isCpfComplete, readFunctionsError, functionsErrorMessage, getProfileCpf } from "./pix-utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  planSlug: string;
  billingCycle: "monthly" | "yearly";
}

interface PixData {
  paymentId: string;
  qrCodeImage: string;
  pixCode: string;
  amount: number;
  expiresAt?: string;
}

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PixModal({ open, onOpenChange, planSlug, billingCycle }: Props) {
  const { refreshPlan } = usePlan();
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [needCpf, setNeedCpf] = useState(false);
  const [cpf, setCpf] = useState("");
  const pollRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const generate = async (cpfValue?: string) => {
    setLoading(true);
    setExpired(false);
    setConfirmed(false);
    setPix(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix-charge", {
        body: { planSlug, billingCycle, ...(cpfValue ? { cpf: cpfValue } : {}) },
      });
      if (error) throw error;
      setNeedCpf(false);
      setPix(data as PixData);
      if (data?.expiresAt) {
        const left = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
        setSecondsLeft(left);
      } else {
        setSecondsLeft(30 * 60);
      }
    } catch (e: any) {
      const body = await readFunctionsError(e);
      if (body?.error === "cpf_required") {
        setNeedCpf(true);
        return;
      }
      toast({
        title: "Erro ao gerar PIX",
        description: functionsErrorMessage(body) || e.message || "Tente novamente.",
        variant: "destructive",
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  // Generate on open (pede CPF antes se o perfil ainda não tiver)
  useEffect(() => {
    if (open && !pix && !loading && !needCpf) {
      (async () => {
        const savedCpf = await getProfileCpf();
        if (savedCpf) {
          generate();
        } else {
          setNeedCpf(true);
        }
      })();
    }
    if (!open) {
      setPix(null);
      setConfirmed(false);
      setExpired(false);
      setSecondsLeft(null);
      setCopied(false);
      setNeedCpf(false);
      setCpf("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Countdown
  useEffect(() => {
    if (!open || secondsLeft === null || confirmed) return;
    if (secondsLeft <= 0) {
      setExpired(true);
      return;
    }
    tickRef.current = window.setTimeout(() => setSecondsLeft((s) => (s ?? 0) - 1), 1000);
    return () => {
      if (tickRef.current) clearTimeout(tickRef.current);
    };
  }, [open, secondsLeft, confirmed]);

  // Polling for subscription activation
  useEffect(() => {
    if (!open || !pix || confirmed || expired) return;

    const check = async () => {
      // Só confirma quando o webhook do Asaas registrar o pagamento desta cobrança
      const { data } = await (supabase as any)
        .from("payment_history")
        .select("id")
        .eq("external_payment_id", pix.paymentId)
        .eq("status", "succeeded")
        .limit(1)
        .maybeSingle();
      if (data) {
        setConfirmed(true);
        toast({ title: "🎉 Pagamento confirmado!", description: "Seu plano foi ativado." });
        await refreshPlan();
        setTimeout(() => onOpenChange(false), 2200);
      }
    };

    pollRef.current = window.setInterval(check, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, pix, confirmed, expired, onOpenChange, refreshPlan]);

  const handleCopy = async () => {
    if (!pix) return;
    await navigator.clipboard.writeText(pix.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mm = String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, "0");
  const ss = String((secondsLeft ?? 0) % 60).padStart(2, "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-card/95">
        <DialogHeader>
          <DialogTitle>Pague com PIX</DialogTitle>
          <DialogDescription>
            Após o pagamento, seu plano será ativado automaticamente em até 2 minutos.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {needCpf && !loading && !confirmed && (
            <motion.div
              key="cpf"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 py-2"
            >
              <p className="text-sm text-muted-foreground">
                Para gerar o PIX, informe seu CPF (exigência do banco emissor).
              </p>
              <input
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                autoFocus
                className="w-full px-3 py-2 text-sm font-mono bg-muted/40 border border-border rounded-md"
              />
              <Button
                className="w-full"
                disabled={!isCpfComplete(cpf)}
                onClick={() => generate(cpf)}
              >
                Gerar PIX
              </Button>
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando seu QR Code...</p>
            </motion.div>
          )}

          {confirmed && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 gap-3"
            >
              <CheckCircle2 className="h-16 w-16 text-success" />
              <p className="text-lg font-semibold text-foreground">Pagamento confirmado!</p>
              <p className="text-sm text-muted-foreground">Ativando seu plano...</p>
            </motion.div>
          )}

          {expired && !confirmed && (
            <motion.div
              key="expired"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-8 gap-4"
            >
              <p className="text-sm text-muted-foreground">Este PIX expirou.</p>
              <Button onClick={() => generate()} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Gerar novo PIX
              </Button>
            </motion.div>
          )}

          {pix && !loading && !confirmed && !expired && (
            <motion.div
              key="pix"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-2xl border border-border shadow-md">
                  <img
                    src={`data:image/png;base64,${pix.qrCodeImage}`}
                    alt="QR Code PIX"
                    className="w-56 h-56"
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{brl(pix.amount)}</div>
                {secondsLeft !== null && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Expira em <span className="font-mono font-semibold">{mm}:{ss}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Ou copie o código PIX:
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={pix.pixCode}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-muted/40 border border-border rounded-md truncate"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant={copied ? "default" : "outline"}
                    onClick={handleCopy}
                    className="gap-1.5 shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Aguardando confirmação do pagamento...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
