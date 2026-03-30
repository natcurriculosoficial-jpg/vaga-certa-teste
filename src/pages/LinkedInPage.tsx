import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserData } from "@/hooks/useAuth";
import * as gemini from "@/services/gemini";

const linkedinLinks: Record<string, string> = {
  headline: "https://www.linkedin.com/in/me/edit/intro/",
  about: "https://www.linkedin.com/in/me/edit/summary/",
  experience: "https://www.linkedin.com/in/me/edit/experience/",
  education: "https://www.linkedin.com/in/me/edit/education/",
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
  const [fields, setFields] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const update = (id: string, value: string) => setFields(p => ({ ...p, [id]: value }));

  const copy = (id: string) => {
    navigator.clipboard.writeText(fields[id] || "");
    toast({ title: "Copiado com sucesso! 📋" });
  };

  const generate = async (id: string) => {
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
    setAiLoading(id);
    const result = await gemini.improveText(fields[id]);
    update(id, result);
    setAiLoading(null);
    toast({ title: "Texto melhorado ✨" });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">💼 LinkedIn Campeão</h1>
      <p className="text-muted-foreground">Otimize cada seção do seu LinkedIn com IA</p>

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
                    <ExternalLink className="h-3 w-3 mr-1" /> Editar no LinkedIn
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
