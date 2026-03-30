import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Etapa {step} de 4</p>
          <Progress value={step * 25} className="h-2" />
        </div>

        <div className="glass-card p-6 min-h-[300px] flex flex-col">
          {step === 1 && (
            <div className="space-y-4 flex-1">
              <h2 className="text-xl font-semibold text-foreground">Qual é sua situação atual?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {situations.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSituation(s.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      situation === s.id
                        ? "border-secondary bg-secondary/10 text-foreground"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-secondary/50"
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <p className="mt-2 text-sm font-medium">{s.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 flex-1">
              <h2 className="text-xl font-semibold text-foreground">Qual é sua área profissional?</h2>
              <Input
                placeholder="Buscar área..."
                value={areaSearch}
                onChange={e => setAreaSearch(e.target.value)}
                className="bg-muted/50"
              />
              <div className="flex flex-wrap gap-2">
                {filteredAreas.map(a => (
                  <button
                    key={a}
                    onClick={() => { setArea(a); setAreaSearch(a); }}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      area === a ? "border-secondary bg-secondary/10 text-foreground" : "border-border text-muted-foreground hover:border-secondary/50"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 flex-1">
              <h2 className="text-xl font-semibold text-foreground">Qual cargo você busca?</h2>
              <Input
                placeholder="Ex: Analista de Marketing"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="bg-muted/50"
              />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nível</p>
                <div className="flex flex-wrap gap-2">
                  {levels.map(l => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        level === l ? "border-secondary bg-secondary/10 text-foreground" : "border-border text-muted-foreground hover:border-secondary/50"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 flex-1">
              <h2 className="text-xl font-semibold text-foreground">Faça upload do seu currículo (opcional)</h2>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-secondary/50 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Arraste um PDF ou DOCX aqui</p>
                <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Não tem currículo? Sem problema, vamos criar do zero! 🚀
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4 mt-auto">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>Voltar</Button>
            )}
            <div className="ml-auto flex gap-2">
              {step === 4 && (
                <Button variant="ghost" onClick={finish} disabled={saving}>Pular</Button>
              )}
              <Button onClick={next} disabled={
                saving || (step === 1 && !situation) || (step === 2 && !area) || (step === 3 && (!targetRole || !level))
              }>
                {saving ? "Salvando..." : step === 4 ? "Concluir" : "Próximo"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
