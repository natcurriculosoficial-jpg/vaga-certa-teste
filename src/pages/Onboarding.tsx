import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Profile } from "@/hooks/useAuth";

const situations = [
  { id: "employed", label: "Empregado buscando nova vaga", emoji: "💼" },
  { id: "unemployed", label: "Desempregado", emoji: "🔍" },
  { id: "first", label: "Primeiro emprego", emoji: "🚀" },
  { id: "transition", label: "Transição de carreira", emoji: "🔄" },
];

const areas = ["RH", "Marketing", "TI", "Financeiro", "Vendas", "Engenharia", "Jurídico", "Saúde", "Educação", "Design", "Administração", "Outros"];
const levels = ["Estágio", "Júnior", "Pleno", "Sênior", "Gerência", "Diretoria"];

export default function Onboarding({ onUpdate }: { onUpdate: (data: Partial<Profile>) => Promise<void> }) {
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState("");
  const [area, setArea] = useState("");
  const [areaSearch, setAreaSearch] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [level, setLevel] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const filteredAreas = areas.filter(a => a.toLowerCase().includes(areaSearch.toLowerCase()));

  const next = () => {
    if (step < 4) setStep(step + 1);
    else finish();
  };

  const finish = async () => {
    setSaving(true);
    try {
      await onUpdate({ situation, area, target_role: targetRole, level, onboarding_complete: true });
      toast({ title: "Perfil configurado! 🎉", description: "Vamos começar sua jornada." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const stepContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex-1"
      >
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Qual é sua situação atual?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {situations.map(s => (
                <motion.button
                  key={s.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSituation(s.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                    situation === s.id
                      ? "border-secondary bg-secondary/10 text-foreground shadow-sm"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-secondary/30 hover:bg-muted/40"
                  }`}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <p className="mt-2 text-sm font-medium">{s.label}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Qual é sua área profissional?</h2>
            <div className="input-glow rounded-xl">
              <Input placeholder="Buscar área..." value={areaSearch} onChange={e => setAreaSearch(e.target.value)} className="bg-muted/30 border-transparent rounded-xl h-11" />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredAreas.map(a => (
                <motion.button
                  key={a}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setArea(a); setAreaSearch(a); }}
                  className={`px-4 py-2 rounded-xl text-sm border transition-all duration-200 ${
                    area === a ? "border-secondary bg-secondary/10 text-foreground" : "border-border text-muted-foreground hover:border-secondary/30"
                  }`}
                >
                  {a}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Qual cargo você busca?</h2>
            <div className="input-glow rounded-xl">
              <Input placeholder="Ex: Analista de Marketing" value={targetRole} onChange={e => setTargetRole(e.target.value)} className="bg-muted/30 border-transparent rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Nível</p>
              <div className="flex flex-wrap gap-2">
                {levels.map(l => (
                  <motion.button
                    key={l}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLevel(l)}
                    className={`px-4 py-2 rounded-xl text-sm border transition-all duration-200 ${
                      level === l ? "border-secondary bg-secondary/10 text-foreground" : "border-border text-muted-foreground hover:border-secondary/30"
                    }`}
                  >
                    {l}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Faça upload do seu currículo (opcional)</h2>
            <motion.div
              whileHover={{ borderColor: "hsl(var(--secondary) / 0.5)" }}
              className="border-2 border-dashed border-border rounded-2xl p-8 text-center transition-colors cursor-pointer"
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Arraste um PDF ou DOCX aqui</p>
              <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
            </motion.div>
            <p className="text-sm text-muted-foreground text-center">
              Não tem currículo? Sem problema, vamos criar do zero! 🚀
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6 relative z-10"
      >
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground font-medium">Etapa {step} de 4</p>
          <Progress value={step * 25} className="h-1.5" />
        </div>

        <div className="glass-card p-6 min-h-[320px] flex flex-col glow-sm">
          {stepContent}

          <div className="flex justify-between pt-4 mt-auto">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="rounded-xl">Voltar</Button>
            )}
            <div className="ml-auto flex gap-2">
              {step === 4 && (
                <Button variant="ghost" onClick={finish} disabled={saving} className="rounded-xl">Pular</Button>
              )}
              <Button
                onClick={next}
                disabled={saving || (step === 1 && !situation) || (step === 2 && !area) || (step === 3 && (!targetRole || !level))}
                className="rounded-xl gradient-primary text-white hover:opacity-90"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : step === 4 ? "Concluir" : "Próximo"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
