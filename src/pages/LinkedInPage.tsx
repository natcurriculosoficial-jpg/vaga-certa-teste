import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, ExternalLink, Loader2, Linkedin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserData } from "@/hooks/useAuth";
import * as gemini from "@/services/gemini";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/usePlan";

const linkedinLinks: Record<string, string> = {
  headline: "https://www.linkedin.com/in/me/edit/intro/",
  about: "https://www.linkedin.com/in/me/edit/summary/",
  experience: "https://www.linkedin.com/in/me/details/experience/",
  education: "https://www.linkedin.com/in/me/details/education/",
  highlights: "https://www.linkedin.com/in/me/edit/featured/",
  competencies: "https://www.linkedin.com/in/me/details/skills/",
  certifications: "https://www.linkedin.com/in/me/details/certifications/",
  projects: "https://www.linkedin.com/in/me/details/projects/",
  languages: "https://www.linkedin.com/in/me/details/languages/",
  url: "https://www.linkedin.com/public-profile/settings",
};

const linkedinLabels: Record<string, string> = {
  headline: "Editar Headline",
  about: "Editar Sobre",
  experience: "Ver Experiências",
  education: "Ver Formação",
  highlights: "Gerenciar Destaques",
  competencies: "Gerenciar Competências",
  certifications: "Gerenciar Certificações",
  projects: "Gerenciar Projetos",
  languages: "Gerenciar Idiomas",
  url: "Personalizar URL",
};

const sections = [
  { id: "headline", label: "Headline", placeholder: "Ex: Especialista em Marketing Digital | Growth Hacker | +5 anos gerando resultados" },
  { id: "about", label: "Sobre (Resumo)", placeholder: "Seu resumo profissional...", multiline: true },
  { id: "experience", label: "Experiências", placeholder: "Descreva suas experiências...", multiline: true },
  { id: "education", label: "Formação", placeholder: "Sua formação acadêmica..." },
  { id: "highlights", label: "Destaques", placeholder: "Principais conquistas...", multiline: true },
  { id: "competencies", label: "Competências", placeholder: "Suas principais competências..." },
  { id: "certifications", label: "Certificações", placeholder: "Suas certificações..." },
  { id: "projects", label: "Projetos", placeholder: "Projetos relevantes...", multiline: true },
  { id: "languages", label: "Idiomas", placeholder: "Ex: Inglês (Fluente), Espanhol (Intermediário)" },
  { id: "url", label: "URL Personalizada", placeholder: "linkedin.com/in/seu-nome" },
];

export default function LinkedInPage({ user }: { user: UserData }) {
  const { useCredit, plan } = usePlan();
  const [fields, setFields] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const loaded = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved sections from profile
  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("linkedin_sections")
        .eq("id", user.id)
        .single();
      if (data?.linkedin_sections && typeof data.linkedin_sections === "object") {
        setFields(data.linkedin_sections as Record<string, string>);
      }
      loaded.current = true;
    };
    load();
  }, [user.id]);

  // Auto-save whenever fields change (after initial load)
  useEffect(() => {
    if (!loaded.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await (supabase as any).from("profiles").update({ linkedin_sections: fields }).eq("id", user.id);
    }, 1500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [fields, user.id]);

  const update = (id: string, value: string) => setFields(p => ({ ...p, [id]: value }));

  const copy = (id: string) => {
    navigator.clipboard.writeText(fields[id] || "");
    toast({ title: "Copiado com sucesso! 📋" });
  };

  const generate = async (id: string) => {
    if (!plan.canUseAI) {
      toast({ title: "Sem créditos de IA", description: "Faça upgrade do seu plano para usar a IA.", variant: "destructive" });
      return;
    }
    const credit = await useCredit(1);
    if (!credit.success) {
      toast({ title: "Sem créditos de IA", description: "Seus créditos acabaram. Faça upgrade do plano.", variant: "destructive" });
      return;
    }
    setAiLoading(id);
    let result = "";
    if (id === "headline") {
      result = await gemini.generateLinkedInHeadline(user.target_role || "Analista", user.area || "TI");
    } else if (id === "about") {
      result = await gemini.generateLinkedInAbout(user.name || "Profissional", user.target_role || "Analista", user.area || "TI");
    } else {
      result = await gemini.generateText(`Gere conteúdo profissional para a seção "${sections.find(s => s.id === id)?.label}" do LinkedIn de um profissional de ${user.area || "TI"} buscando ${user.target_role || "nova posição"}. Apenas o texto.`);
    }
    update(id, result);
    setAiLoading(null);
    toast({ title: "Conteúdo gerado com IA ✨" });
  };

  const improve = async (id: string) => {
    if (!fields[id]) return;
    if (!plan.canUseAI) {
      toast({ title: "Sem créditos de IA", description: "Faça upgrade do seu plano para usar a IA.", variant: "destructive" });
      return;
    }
    const credit = await useCredit(1);
    if (!credit.success) {
      toast({ title: "Sem créditos de IA", description: "Seus créditos acabaram. Faça upgrade do plano.", variant: "destructive" });
      return;
    }
    setAiLoading(id);
    const result = await gemini.improveText(fields[id]);
    update(id, result);
    setAiLoading(null);
    toast({ title: "Texto melhorado ✨" });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 text-white">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-medium mb-3">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn Optimizer
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">💼 LinkedIn Campeão</h1>
          <p className="text-white/85 text-sm md:text-base">Otimize cada seção do seu LinkedIn com IA — copie e cole direto</p>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="space-y-4">
        {sections.map(section => (
          <div key={section.id} className="glass-card p-5 space-y-3">
            <Label className="text-sm font-semibold">{section.label}</Label>
            {section.multiline ? (
              <Textarea
                value={fields[section.id] || ""}
                onChange={e => update(section.id, e.target.value)}
                placeholder={section.placeholder}
                className="bg-muted/50 min-h-[100px]"
              />
            ) : (
              <Input
                value={fields[section.id] || ""}
                onChange={e => update(section.id, e.target.value)}
                placeholder={section.placeholder}
                className="bg-muted/50"
              />
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => generate(section.id)} disabled={aiLoading === section.id}>
                {aiLoading === section.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                Gerar com IA
              </Button>
              <Button size="sm" variant="outline" onClick={() => improve(section.id)} disabled={aiLoading === section.id || !fields[section.id]}>
                Melhorar com IA
              </Button>
              <Button size="sm" variant="ghost" onClick={() => copy(section.id)} disabled={!fields[section.id]}>
                <Copy className="h-3 w-3 mr-1" /> Copiar
              </Button>
              {linkedinLinks[section.id] && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={linkedinLinks[section.id]} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" /> {linkedinLabels[section.id] || "Editar no LinkedIn"}
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
