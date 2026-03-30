import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Check, Plus, X, Loader2, Wrench, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import * as gemini from "@/services/gemini";

interface SkillsStepProps {
  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
  userArea?: string | null;
  userRole?: string | null;
}

interface GeneratedSkills {
  technical: string[];
  behavioral: string[];
  tools: string[];
}

export default function SkillsStep({ skills, setSkills, userArea, userRole }: SkillsStepProps) {
  const [skillInput, setSkillInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedSkills | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((p) => [...p, trimmed]);
      setSkillInput("");
    }
  };

  const generateSkills = async (keepSelected = false) => {
    setGenerating(true);
    try {
      const alreadySelected = keepSelected ? Array.from(selected) : [];
      const allExisting = [...skills, ...alreadySelected];
      const role = userRole || "Profissional";
      const area = userArea || "TI";

      const prompt = `Given a professional with the title "${role}" working in "${area}" in Brazil,
generate exactly 24 relevant skills for their resume, split into:
- 12 technical skills (specific to their field)
- 8 behavioral/soft skills (in Portuguese)
- 4 tools/platforms commonly used in their role
Return ONLY valid JSON: { "technical": string[], "behavioral": string[], "tools": string[] }
Do not repeat these skills: [${allExisting.join(", ")}]
All skills in Brazilian Portuguese.`;

      const result = await gemini.generateText(prompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as GeneratedSkills;
        setGenerated(parsed);
        if (!keepSelected) setSelected(new Set());
      } else {
        toast({ title: "Erro ao gerar habilidades", description: "Tente novamente", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao gerar habilidades", variant: "destructive" });
    }
    setGenerating(false);
  };

  const toggleSkill = (skill: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });
  };

  const addSelected = () => {
    const newSkills = Array.from(selected).filter((s) => !skills.includes(s));
    setSkills((p) => [...p, ...newSkills]);
    setSelected(new Set());
    setGenerated(null);
    toast({ title: `${newSkills.length} habilidades adicionadas ✨` });
  };

  const renderPills = (items: string[], icon: React.ReactNode, label: string) => (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((skill) => {
          const isSelected = selected.has(skill);
          const alreadyAdded = skills.includes(skill);
          return (
            <motion.button
              key={skill}
              whileTap={{ scale: 0.95 }}
              onClick={() => !alreadyAdded && toggleSkill(skill)}
              disabled={alreadyAdded}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
                alreadyAdded
                  ? "bg-muted/30 text-muted-foreground border-border cursor-not-allowed opacity-50"
                  : isSelected
                  ? "bg-secondary text-secondary-foreground border-secondary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-secondary/50 hover:bg-secondary/5"
              }`}
            >
              {isSelected && <Check className="h-3 w-3 inline mr-1" />}
              {skill}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* AI Generate button */}
      {!generated && !generating && (
        <Button
          onClick={() => generateSkills(false)}
          className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Gerar Habilidades com IA
        </Button>
      )}

      {/* Loading skeleton */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando seu perfil e área de atuação...
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-8 rounded-full"
                  style={{ width: `${60 + Math.random() * 60}px`, animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated skills */}
      {generated && !generating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{selected.size}</span> habilidades selecionadas
            </p>
          </div>

          {renderPills(generated.technical, <Wrench className="h-3.5 w-3.5" />, "Habilidades Técnicas")}
          {renderPills(generated.behavioral, <Users className="h-3.5 w-3.5" />, "Habilidades Comportamentais")}
          {renderPills(generated.tools, <Globe className="h-3.5 w-3.5" />, "Ferramentas e Plataformas")}

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={addSelected} disabled={selected.size === 0} className="flex-1">
              <Check className="h-3.5 w-3.5 mr-1" /> Adicionar selecionadas ({selected.size})
            </Button>
            <Button size="sm" variant="outline" onClick={() => generateSkills(true)}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Gerar outras
            </Button>
          </div>
        </motion.div>
      )}

      {/* Manual add */}
      <div className="flex gap-2">
        <Input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          placeholder="Adicionar habilidade manualmente..."
          className="bg-muted/50"
        />
        <Button size="sm" onClick={addSkill}>Adicionar</Button>
      </div>

      {/* Current skills */}
      {skills.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Minhas habilidades ({skills.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <motion.span
                key={s}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-secondary/30 bg-secondary/10 text-foreground flex items-center gap-1"
              >
                {s}
                <button
                  onClick={() => setSkills((p) => p.filter((sk) => sk !== s))}
                  className="text-muted-foreground hover:text-destructive ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
