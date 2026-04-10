import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckSquare, ArrowRight } from "lucide-react";
import { useChecklist } from "@/hooks/useChecklist";
import { Skeleton } from "@/components/ui/skeleton";

export default function Checklist() {
  const navigate = useNavigate();
  const { items, completed, loading, toggle, completedCount, total, percentage } = useChecklist();

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 max-w-2xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" /> Minha Jornada
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Siga estes passos para acelerar sua recolocação profissional
        </p>
      </div>

      {/* Progress bar */}
      <div className="vc-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {completedCount} de {total} concluídos
          </span>
          <span className="text-sm font-bold text-primary">{percentage}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {items.map((item, i) => {
          const done = !!completed[item.key];
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`vc-card flex items-center gap-4 transition-opacity ${done ? "opacity-60" : ""}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggle(item.key)}
                className={`shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                  done
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-border hover:border-primary"
                }`}
              >
                {done && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.emoji}</span>
                  <span className={`text-sm font-semibold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 pl-8">{item.description}</p>
              </div>

              {/* Action button */}
              <button
                onClick={() => navigate(item.actionPath)}
                className="shrink-0 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
