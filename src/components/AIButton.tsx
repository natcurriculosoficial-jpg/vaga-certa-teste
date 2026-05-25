import { useState, ReactNode } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/hooks/usePlan";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AIButtonProps {
  onGenerate: () => Promise<void> | void;
  creditsNeeded?: number;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export default function AIButton({
  onGenerate,
  creditsNeeded = 1,
  children,
  disabled,
  className,
  size = "default",
  variant = "default",
}: AIButtonProps) {
  const navigate = useNavigate();
  const { plan, useCredit } = usePlan();
  const [loading, setLoading] = useState(false);
  const [showNoCredits, setShowNoCredits] = useState(false);

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const result = await useCredit(creditsNeeded);
      if (!result.success) {
        setShowNoCredits(true);
        return;
      }
      await onGenerate();
    } finally {
      setLoading(false);
    }
  };

  const remainingLabel = plan.isUnlimited
    ? "Ilimitado"
    : `${plan.aiCreditsRemaining} crédito${plan.aiCreditsRemaining === 1 ? "" : "s"} restantes`;

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={handleClick}
              disabled={disabled || loading}
              size={size}
              variant={variant}
              className={className}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {children}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <span className="text-xs">
              ✨ {creditsNeeded} crédito{creditsNeeded === 1 ? "" : "s"} · {remainingLabel}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showNoCredits} onOpenChange={setShowNoCredits}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seus créditos de IA acabaram</DialogTitle>
            <DialogDescription>
              Faça upgrade para um plano superior ou recarregue seus créditos
              para continuar usando os recursos de IA.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowNoCredits(false);
                navigate("/pricing");
              }}
            >
              Recarregar créditos
            </Button>
            <Button
              className="gradient-primary text-white"
              onClick={() => {
                setShowNoCredits(false);
                navigate("/pricing");
              }}
            >
              Fazer upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
