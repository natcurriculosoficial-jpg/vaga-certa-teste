import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export interface SavedSearch {
  id: string;
  label: string;
  query: string;
  city?: string;
  type?: string;
  createdAt: string;
}

interface AlertJob {
  id: string;
  title: string;
  company: string;
  location?: string;
}

interface Props {
  newJobCount: number;
  onClearNew: () => void;
}

export function useJobAlerts() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("vc_saved_searches") || "[]");
    } catch { return []; }
  });
  const [newJobCount, setNewJobCount] = useState(0);

  useEffect(() => {
    localStorage.setItem("vc_saved_searches", JSON.stringify(savedSearches));
  }, [savedSearches]);

  const addSearch = useCallback((search: Omit<SavedSearch, "id" | "createdAt">) => {
    const newSearch: SavedSearch = {
      ...search,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSavedSearches(prev => [...prev, newSearch]);
    toast({ title: "🔔 Alerta criado!", description: `Você será notificado sobre "${search.label}"` });
  }, []);

  const removeSearch = useCallback((id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearNew = useCallback(() => setNewJobCount(0), []);

  // Simulate polling (in production, this would call the edge function)
  useEffect(() => {
    if (savedSearches.length === 0) return;
    const interval = setInterval(() => {
      // Simulate finding new jobs occasionally
      const chance = Math.random();
      if (chance > 0.7) {
        const count = Math.floor(Math.random() * 5) + 1;
        setNewJobCount(prev => prev + count);
      }
    }, 30 * 60 * 1000); // 30 min
    return () => clearInterval(interval);
  }, [savedSearches]);

  return { savedSearches, newJobCount, addSearch, removeSearch, clearNew };
}

export function AlertBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
    >
      {count > 99 ? "99+" : count}
    </motion.div>
  );
}

export default function JobAlertsPanel({ savedSearches, onAdd, onRemove }: {
  savedSearches: SavedSearch[];
  onAdd: (s: Omit<SavedSearch, "id" | "createdAt">) => void;
  onRemove: (id: string) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newQuery, setNewQuery] = useState("");

  const handleAdd = () => {
    if (!newLabel || !newQuery) return;
    onAdd({ label: newLabel, query: newQuery });
    setNewLabel("");
    setNewQuery("");
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          Meus Alertas de Vagas
        </h3>
        <p className="text-sm text-muted-foreground">
          Salve buscas favoritas e receba notificações quando novas vagas forem encontradas.
        </p>

        {/* Add new alert */}
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Nome do alerta (ex: Dev React SP)"
            className="bg-muted/50 text-sm"
          />
          <Input
            value={newQuery}
            onChange={e => setNewQuery(e.target.value)}
            placeholder="Termo de busca (ex: React Developer)"
            className="bg-muted/50 text-sm"
          />
          <Button size="sm" onClick={handleAdd} disabled={!newLabel || !newQuery} className="gap-1">
            <Plus className="h-3 w-3" /> Criar
          </Button>
        </div>

        {/* Saved searches list */}
        <div className="space-y-2">
          <AnimatePresence>
            {savedSearches.map(search => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{search.label}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Search className="h-3 w-3" /> {search.query}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(search.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {savedSearches.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum alerta criado ainda. Crie seu primeiro alerta acima!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
