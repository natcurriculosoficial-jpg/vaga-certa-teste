import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface JobFilters {
  query: string;
  city: string;
  type: string;
  salary: string;
  regime: string;
}

const EMPTY_FILTERS: JobFilters = { query: "", city: "", type: "all", salary: "all", regime: "all" };

interface Props {
  filters: JobFilters;
  onChange: (f: JobFilters) => void;
}

export function getActiveFilterCount(f: JobFilters): number {
  let c = 0;
  if (f.query) c++;
  if (f.city) c++;
  if (f.type !== "all") c++;
  if (f.salary !== "all") c++;
  if (f.regime !== "all") c++;
  return c;
}

export type JobTier = "gold" | "silver" | "bronze" | null;

export function classifyJob(
  job: { title: string; location?: string | null; type?: string | null },
  filters: JobFilters
): JobTier {
  const active = getActiveFilterCount(filters);
  if (active === 0) return null;

  let matches = 0;
  if (filters.query && job.title.toLowerCase().includes(filters.query.toLowerCase())) matches++;
  if (filters.city && job.location?.toLowerCase().includes(filters.city.toLowerCase())) matches++;
  if (filters.type !== "all" && job.type === filters.type) matches++;
  // salary and regime are metadata-level filters, count as match if set
  if (filters.salary !== "all") matches++;
  if (filters.regime !== "all") matches++;

  const ratio = matches / active;
  if (ratio >= 1) return "gold";
  if (ratio >= 0.5) return "silver";
  if (filters.query && job.title.toLowerCase().includes(filters.query.toLowerCase())) return "bronze";
  return null;
}

const tierConfig = {
  gold: { label: "🥇 Ouro", className: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" },
  silver: { label: "🥈 Prata", className: "bg-slate-400/15 text-slate-500 border-slate-400/30" },
  bronze: { label: "🥉 Bronze", className: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
};

export function TierBadge({ tier }: { tier: JobTier }) {
  if (!tier) return null;
  const c = tierConfig[tier];
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${c.className}`}>{c.label}</span>;
}

export default function JobFilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const activeCount = getActiveFilterCount(filters);

  const update = useCallback((key: keyof JobFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  }, [filters, onChange]);

  const clear = () => onChange(EMPTY_FILTERS);

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={e => update("query", e.target.value)}
            placeholder="Buscar cargo ou empresa..."
            className="pl-10 bg-muted/50"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
              {activeCount}
            </Badge>
          )}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clear} className="gap-1 text-muted-foreground">
            <X className="h-3 w-3" /> Limpar
          </Button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 glass-card">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cidade</label>
                <Input
                  value={filters.city}
                  onChange={e => update("city", e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="bg-muted/50 h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                <Select value={filters.type} onValueChange={v => update("type", v)}>
                  <SelectTrigger className="bg-muted/50 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Remoto">Remoto</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Faixa Salarial</label>
                <Select value={filters.salary} onValueChange={v => update("salary", v)}>
                  <SelectTrigger className="bg-muted/50 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="0-3000">Até R$ 3.000</SelectItem>
                    <SelectItem value="3000-6000">R$ 3.000 - 6.000</SelectItem>
                    <SelectItem value="6000-10000">R$ 6.000 - 10.000</SelectItem>
                    <SelectItem value="10000+">Acima de R$ 10.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Regime</label>
                <Select value={filters.regime} onValueChange={v => update("regime", v)}>
                  <SelectTrigger className="bg-muted/50 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Estágio">Estágio</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { EMPTY_FILTERS };
