import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSelect: (method: "card" | "pix") => void;
  pixAvailable: boolean;
}

export function PaymentMethodModal({ open, onOpenChange, onSelect, pixAvailable }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-card/95">
        <DialogHeader>
          <DialogTitle>Como deseja pagar?</DialogTitle>
          <DialogDescription>Escolha sua forma de pagamento preferida.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect("card")}
            className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/60 hover:bg-primary/5 transition-colors text-left"
          >
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">Cartão de Crédito</div>
              <div className="text-xs text-muted-foreground">Renovação automática mensal/anual</div>
            </div>
          </motion.button>

          {pixAvailable && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect("pix")}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-success/60 hover:bg-success/5 transition-colors text-left"
            >
              <div className="h-11 w-11 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">PIX</div>
                <div className="text-xs text-muted-foreground">Aprovação em até 2 minutos</div>
              </div>
            </motion.button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
