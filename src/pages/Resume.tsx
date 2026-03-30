import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Sparkles, Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserData } from "@/hooks/useAuth";
import * as gemini from "@/services/gemini";

interface Experience {
  id: string; company: string; role: string; period: string; description: string;
}
interface Education {
  id: string; institution: string; course: string; period: string;
}
interface Course {
  id: string; name: string; institution: string;
}

export default function Resume({ user }: { user: UserData }) {
  const [personal, setPersonal] = useState({
    name: user.name || "", email: user.email || "", phone: "", city: "", linkedin: "", portfolio: ""
  });
  const [objective, setObjective] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [languages, setLanguages] = useState<{ lang: string; level: string }[]>([]);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const addExperience = () => setExperiences(p => [...p, { id: crypto.randomUUID(), company: "", role: "", period: "", description: "" }]);
  const addEducation = () => setEducations(p => [...p, { id: crypto.randomUUID(), institution: "", course: "", period: "" }]);
  const addCourse = () => setCourses(p => [...p, { id: crypto.randomUUID(), name: "", institution: "" }]);
  const addLanguage = () => setLanguages(p => [...p, { lang: "", level: "Básico" }]);

  const updateExp = (id: string, field: keyof Experience, value: string) =>
    setExperiences(p => p.map(e => e.id === id ? { ...e, [field]: value } : e));

  const generateBullets = async (id: string) => {
    const exp = experiences.find(e => e.id === id);
    if (!exp?.description) return;
    setAiLoading(id);
    const result = await gemini.transformToBulletPoints(exp.description, user.target_role || undefined);
    updateExp(id, "description", result);
    setAiLoading(null);
    toast({ title: "Bullets gerados com IA ✨" });
  };

  const generateObj = async () => {
    setAiLoading("objective");
    const result = await gemini.generateObjective(user.target_role || "Analista", user.level || "Pleno", user.area || "TI");
    setObjective(result);
    setAiLoading(null);
    toast({ title: "Objetivo gerado com IA ✨" });
  };

  const improveObj = async () => {
    if (!objective) return;
    setAiLoading("objective");
    const result = await gemini.improveText(objective);
    setObjective(result);
    setAiLoading(null);
    toast({ title: "Texto melhorado ✨" });
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(p => [...p, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const suggestSkillsAI = async () => {
    setAiLoading("skills");
    const result = await gemini.suggestSkills(user.area || "TI");
    toast({ title: "Sugestões geradas ✨", description: result.slice(0, 100) + "..." });
    setAiLoading(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">📄 Meu Currículo</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Editor */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/50 p-1">
              <TabsTrigger value="personal" className="text-xs">Dados</TabsTrigger>
              <TabsTrigger value="objective" className="text-xs">Objetivo</TabsTrigger>
              <TabsTrigger value="experience" className="text-xs">Experiências</TabsTrigger>
              <TabsTrigger value="education" className="text-xs">Formação</TabsTrigger>
              <TabsTrigger value="courses" className="text-xs">Cursos</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs">Habilidades</TabsTrigger>
              <TabsTrigger value="languages" className="text-xs">Idiomas</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="glass-card p-5 space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({ name: "Nome", email: "E-mail", phone: "Telefone", city: "Cidade/Estado", linkedin: "LinkedIn", portfolio: "Portfólio" }).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input value={(personal as any)[key]} onChange={e => setPersonal(p => ({ ...p, [key]: e.target.value }))} className="bg-muted/50" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="objective" className="glass-card p-5 space-y-4 mt-4">
              <Textarea
                value={objective}
                onChange={e => setObjective(e.target.value)}
                placeholder="Seu objetivo profissional..."
                className="bg-muted/50 min-h-[120px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={generateObj} disabled={aiLoading === "objective"}>
                  {aiLoading === "objective" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  Gerar com IA
                </Button>
                <Button size="sm" variant="outline" onClick={improveObj} disabled={aiLoading === "objective" || !objective}>
                  Melhorar texto
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4 mt-4">
              {experiences.length === 0 && (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  <p>Você ainda não adicionou experiências</p>
                </div>
              )}
              {experiences.map(exp => (
                <div key={exp.id} className="glass-card p-5 space-y-3">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Experiência</h3>
                    <Button size="icon" variant="ghost" onClick={() => setExperiences(p => p.filter(e => e.id !== exp.id))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Empresa</Label><Input value={exp.company} onChange={e => updateExp(exp.id, "company", e.target.value)} className="bg-muted/50" /></div>
                    <div className="space-y-1"><Label className="text-xs">Cargo</Label><Input value={exp.role} onChange={e => updateExp(exp.id, "role", e.target.value)} className="bg-muted/50" /></div>
                    <div className="space-y-1 md:col-span-2"><Label className="text-xs">Período</Label><Input value={exp.period} onChange={e => updateExp(exp.id, "period", e.target.value)} placeholder="Jan 2020 - Dez 2023" className="bg-muted/50" /></div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descrição</Label>
                    <Textarea value={exp.description} onChange={e => updateExp(exp.id, "description", e.target.value)} className="bg-muted/50 min-h-[100px]" placeholder="Descreva suas atividades..." />
                  </div>
                  <Button size="sm" onClick={() => generateBullets(exp.id)} disabled={aiLoading === exp.id}>
                    {aiLoading === exp.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                    Gerar bullets com IA
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addExperience} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Adicionar experiência
              </Button>
            </TabsContent>

            <TabsContent value="education" className="space-y-4 mt-4">
              {educations.length === 0 && (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  <p>Nenhuma formação adicionada</p>
                </div>
              )}
              {educations.map(edu => (
                <div key={edu.id} className="glass-card p-5 space-y-3">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Formação</h3>
                    <Button size="icon" variant="ghost" onClick={() => setEducations(p => p.filter(e => e.id !== edu.id))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Instituição</Label><Input value={edu.institution} onChange={e => setEducations(p => p.map(ed => ed.id === edu.id ? { ...ed, institution: e.target.value } : ed))} className="bg-muted/50" /></div>
                    <div className="space-y-1"><Label className="text-xs">Curso</Label><Input value={edu.course} onChange={e => setEducations(p => p.map(ed => ed.id === edu.id ? { ...ed, course: e.target.value } : ed))} className="bg-muted/50" /></div>
                    <div className="space-y-1 md:col-span-2"><Label className="text-xs">Período</Label><Input value={edu.period} onChange={e => setEducations(p => p.map(ed => ed.id === edu.id ? { ...ed, period: e.target.value } : ed))} className="bg-muted/50" /></div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addEducation} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Adicionar formação
              </Button>
            </TabsContent>

            <TabsContent value="courses" className="space-y-4 mt-4">
              {courses.map(c => (
                <div key={c.id} className="glass-card p-4 flex gap-3 items-center">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input value={c.name} onChange={e => setCourses(p => p.map(cc => cc.id === c.id ? { ...cc, name: e.target.value } : cc))} placeholder="Nome do curso" className="bg-muted/50" />
                    <Input value={c.institution} onChange={e => setCourses(p => p.map(cc => cc.id === c.id ? { ...cc, institution: e.target.value } : cc))} placeholder="Instituição" className="bg-muted/50" />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setCourses(p => p.filter(cc => cc.id !== c.id))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addCourse} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Adicionar curso
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="glass-card p-5 space-y-4 mt-4">
              <div className="flex gap-2">
                <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} placeholder="Adicionar habilidade..." className="bg-muted/50" />
                <Button size="sm" onClick={addSkill}>Adicionar</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full text-sm border border-border bg-muted/50 text-foreground flex items-center gap-1">
                    {s}
                    <button onClick={() => setSkills(p => p.filter(sk => sk !== s))} className="text-muted-foreground hover:text-destructive ml-1">&times;</button>
                  </span>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={suggestSkillsAI} disabled={aiLoading === "skills"}>
                {aiLoading === "skills" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                Sugerir com IA
              </Button>
            </TabsContent>

            <TabsContent value="languages" className="space-y-4 mt-4">
              {languages.map((l, i) => (
                <div key={i} className="glass-card p-4 flex gap-3 items-center">
                  <Input value={l.lang} onChange={e => setLanguages(p => p.map((ll, ii) => ii === i ? { ...ll, lang: e.target.value } : ll))} placeholder="Idioma" className="bg-muted/50 flex-1" />
                  <select
                    value={l.level}
                    onChange={e => setLanguages(p => p.map((ll, ii) => ii === i ? { ...ll, level: e.target.value } : ll))}
                    className="bg-muted/50 border border-input rounded-md px-3 py-2 text-sm text-foreground"
                  >
                    {["Básico", "Intermediário", "Avançado", "Fluente"].map(lv => <option key={lv} value={lv}>{lv}</option>)}
                  </select>
                  <Button size="icon" variant="ghost" onClick={() => setLanguages(p => p.filter((_, ii) => ii !== i))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addLanguage} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Adicionar idioma
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview */}
        <div className="lg:w-96 shrink-0">
          <div className="sticky top-4 bg-foreground text-background rounded-xl p-6 space-y-4 text-sm">
            <h2 className="text-lg font-bold border-b border-background/20 pb-2">{personal.name || "Seu Nome"}</h2>
            <div className="text-xs space-y-0.5 text-background/70">
              {personal.email && <p>{personal.email}</p>}
              {personal.phone && <p>{personal.phone}</p>}
              {personal.city && <p>{personal.city}</p>}
            </div>
            {objective && (
              <div><h3 className="font-semibold text-xs uppercase tracking-wider mb-1">Objetivo</h3><p className="text-xs text-background/80">{objective}</p></div>
            )}
            {experiences.length > 0 && (
              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider mb-2">Experiência</h3>
                {experiences.map(e => (
                  <div key={e.id} className="mb-2">
                    <p className="font-medium text-xs">{e.role}{e.company ? ` — ${e.company}` : ""}</p>
                    {e.period && <p className="text-xs text-background/60">{e.period}</p>}
                    {e.description && <p className="text-xs text-background/70 mt-0.5 whitespace-pre-line">{e.description}</p>}
                  </div>
                ))}
              </div>
            )}
            {educations.length > 0 && (
              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider mb-2">Formação</h3>
                {educations.map(e => (
                  <div key={e.id} className="mb-1">
                    <p className="font-medium text-xs">{e.course}{e.institution ? ` — ${e.institution}` : ""}</p>
                    {e.period && <p className="text-xs text-background/60">{e.period}</p>}
                  </div>
                ))}
              </div>
            )}
            {skills.length > 0 && (
              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider mb-1">Habilidades</h3>
                <p className="text-xs text-background/70">{skills.join(" • ")}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="secondary" className="text-xs flex-1" onClick={() => toast({ title: "Função de download em breve!" })}>
                <Download className="h-3 w-3 mr-1" /> PDF
              </Button>
              <Button size="sm" variant="secondary" className="text-xs flex-1" onClick={() => toast({ title: "Função de download em breve!" })}>
                <Download className="h-3 w-3 mr-1" /> DOCX
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
