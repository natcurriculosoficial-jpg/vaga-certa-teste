import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserData } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import * as gemini from "@/services/gemini";
import LanguagesStep from "@/components/resume/LanguagesStep";
import SkillsStep from "@/components/resume/SkillsStep";
import ResumeExport from "@/components/resume/ResumeExport";
import { Skeleton } from "@/components/ui/skeleton";

interface Experience {
  id: string; company: string; role: string; period: string; description: string;
}
interface Education {
  id: string; institution: string; course: string; period: string; description?: string;
}

interface SkillItem {
  id: string;
  name: string;
  type: string;
}

interface LanguageItem {
  id: string;
  language: string;
  level: string;
}

export default function Resume({ user }: { user: UserData }) {
  const [personal, setPersonal] = useState({
    name: user.name || "", email: user.email || "", phone: user.phone || "",
    city: user.city || "", linkedin: user.linkedin_url || "", portfolio: user.portfolio_url || ""
  });
  const [objective, setObjective] = useState(user.objective || "");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Load all resume data from Supabase
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setDataLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser || cancelled) { setDataLoading(false); return; }
        const uid = authUser.id;

        const [expRes, eduRes, skillRes, langRes] = await Promise.all([
          supabase.from("experiences").select("*").eq("user_id", uid).order("sort_order", { ascending: true }),
          supabase.from("education").select("*").eq("user_id", uid).order("sort_order", { ascending: true }),
          supabase.from("skills").select("*").eq("user_id", uid),
          supabase.from("languages").select("*").eq("user_id", uid),
        ]);

        if (cancelled) return;

        if (expRes.data) setExperiences(expRes.data.map(e => ({
          id: e.id, company: e.company, role: e.role, period: e.period || "", description: e.description || ""
        })));
        if (eduRes.data) setEducations(eduRes.data.map(e => ({
          id: e.id, institution: e.institution, course: e.course, period: e.period || "", description: e.description || ""
        })));
        if (skillRes.data) setSkills(skillRes.data.map(s => ({ id: s.id, name: s.name, type: s.type })));
        if (langRes.data) setLanguages(langRes.data.map(l => ({ id: l.id, language: l.language, level: l.level })));
      } catch (err) {
        console.error("Error loading resume data:", err);
        toast({ title: "Erro ao carregar dados do currículo", variant: "destructive" });
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Save personal data + objective to profiles
  const savePersonal = async () => {
    setSavingPersonal(true);
    try {
      const { error } = await supabase.from("profiles").update({
        name: personal.name,
        phone: personal.phone,
        city: personal.city,
        linkedin_url: personal.linkedin,
        portfolio_url: personal.portfolio,
        objective,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.user_id);
      if (error) throw error;
      toast({ title: "✅ Dados pessoais salvos!" });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSavingPersonal(false);
    }
  };

  // Experiences CRUD
  const addExperience = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data, error } = await supabase.from("experiences").insert({
      user_id: authUser.id,
      company: "",
      role: "",
      period: "",
      description: "",
      sort_order: experiences.length,
    }).select().single();
    if (!error && data) {
      setExperiences(p => [...p, { id: data.id, company: data.company, role: data.role, period: data.period || "", description: data.description || "" }]);
      toast({ title: "✅ Experiência adicionada" });
    }
  };

  const updateExp = useCallback(async (id: string, field: keyof Experience, value: string) => {
    setExperiences(p => p.map(e => e.id === id ? { ...e, [field]: value } : e));
    // Debounced save handled by blur
  }, []);

  const saveExp = async (exp: Experience) => {
    const { error } = await supabase.from("experiences").update({
      company: exp.company, role: exp.role, period: exp.period, description: exp.description,
      updated_at: new Date().toISOString(),
    }).eq("id", exp.id);
    if (error) toast({ title: "Erro ao salvar experiência", variant: "destructive" });
    else toast({ title: "✅ Experiência salva!" });
  };

  const deleteExp = async (id: string) => {
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (!error) {
      setExperiences(p => p.filter(e => e.id !== id));
      toast({ title: "Experiência removida" });
    }
  };

  // Education CRUD
  const addEducation = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data, error } = await supabase.from("education").insert({
      user_id: authUser.id,
      institution: "",
      course: "",
      period: "",
      sort_order: educations.length,
    }).select().single();
    if (!error && data) {
      setEducations(p => [...p, { id: data.id, institution: data.institution, course: data.course, period: data.period || "" }]);
      toast({ title: "✅ Formação adicionada" });
    }
  };

  const saveEdu = async (edu: Education) => {
    const { error } = await supabase.from("education").update({
      institution: edu.institution, course: edu.course, period: edu.period,
      updated_at: new Date().toISOString(),
    }).eq("id", edu.id);
    if (error) toast({ title: "Erro ao salvar formação", variant: "destructive" });
    else toast({ title: "✅ Formação salva!" });
  };

  const deleteEdu = async (id: string) => {
    const { error } = await supabase.from("education").delete().eq("id", id);
    if (!error) {
      setEducations(p => p.filter(e => e.id !== id));
      toast({ title: "Formação removida" });
    }
  };

  // Skills CRUD
  const addSkill = async (name: string, type: string = "hard") => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data, error } = await supabase.from("skills").insert({
      user_id: authUser.id, name, type,
    }).select().single();
    if (!error && data) {
      setSkills(p => [...p, { id: data.id, name: data.name, type: data.type }]);
    }
  };

  const removeSkill = async (id: string) => {
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (!error) setSkills(p => p.filter(s => s.id !== id));
  };

  // Languages CRUD
  const addLanguage = async (language: string, level: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data, error } = await supabase.from("languages").insert({
      user_id: authUser.id, language, level,
    }).select().single();
    if (!error && data) {
      setLanguages(p => [...p, { id: data.id, language: data.language, level: data.level }]);
    }
  };

  const removeLanguage = async (id: string) => {
    const { error } = await supabase.from("languages").delete().eq("id", id);
    if (!error) setLanguages(p => p.filter(l => l.id !== id));
  };

  const updateLanguageLevel = async (id: string, level: string) => {
    setLanguages(p => p.map(l => l.id === id ? { ...l, level } : l));
    await supabase.from("languages").update({ level }).eq("id", id);
  };

  // AI features
  const generateBullets = async (id: string) => {
    const exp = experiences.find(e => e.id === id);
    if (!exp) return;

    setAiLoading(id);
    try {
      const { data, error } = await supabase.functions.invoke("ai", {
        body: {
          action: "generate_bullets",
          payload: {
            text: exp.description || `Profissional atuando como ${exp.role} na empresa ${exp.company}`,
            experienceRole: exp.role,
            targetRole: user.target_role,
            area: user.area,
            level: user.level,
          },
        },
      });
      if (error) throw error;
      const result = data?.text || "";
      const updated = { ...exp, description: result };
      setExperiences(p => p.map(e => e.id === id ? updated : e));
      await saveExp(updated);
      toast({ title: "✨ Bullets gerados com IA!", description: "Descrição atualizada com 4-6 pontos de impacto." });
    } catch (err) {
      toast({ title: "Erro ao gerar bullets", variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
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

  // Data for export
  const skillNames = skills.map(s => s.name);
  const resumeData = {
    ...personal,
    objective,
    experiences: experiences.map(({ id, ...rest }) => rest),
    educations: educations.map(({ id, description, ...rest }) => rest),
    courses: [] as { name: string; institution: string }[],
    skills: skillNames,
    languages: languages.map(l => ({ lang: l.language, level: l.level })),
  };

  if (dataLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">📄 Meu Currículo</h1>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

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
              <TabsTrigger value="skills" className="text-xs">Habilidades</TabsTrigger>
              <TabsTrigger value="languages" className="text-xs">Idiomas</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="glass-card p-5 space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({ name: "Nome", email: "E-mail", phone: "Telefone", city: "Cidade/Estado", linkedin: "LinkedIn", portfolio: "Portfólio" }).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      value={(personal as any)[key]}
                      onChange={e => setPersonal(p => ({ ...p, [key]: e.target.value }))}
                      className="bg-muted/50"
                      disabled={key === "email"}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={savePersonal} disabled={savingPersonal} className="w-full">
                {savingPersonal ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Salvar dados pessoais
              </Button>
            </TabsContent>

            <TabsContent value="objective" className="glass-card p-5 space-y-4 mt-4">
              <Textarea value={objective} onChange={e => setObjective(e.target.value)} placeholder="Seu objetivo profissional..." className="bg-muted/50 min-h-[120px]" />
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={generateObj} disabled={aiLoading === "objective"}>
                  {aiLoading === "objective" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  Gerar com IA
                </Button>
                <Button size="sm" variant="outline" onClick={improveObj} disabled={aiLoading === "objective" || !objective}>
                  Melhorar texto
                </Button>
                <Button size="sm" variant="outline" onClick={savePersonal} disabled={savingPersonal}>
                  {savingPersonal ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Salvar objetivo
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
                    <Button size="icon" variant="ghost" onClick={() => deleteExp(exp.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Empresa</Label><Input value={exp.company} onChange={e => updateExp(exp.id, "company", e.target.value)} onBlur={() => saveExp(exp)} className="bg-muted/50" /></div>
                    <div className="space-y-1"><Label className="text-xs">Cargo</Label><Input value={exp.role} onChange={e => updateExp(exp.id, "role", e.target.value)} onBlur={() => saveExp(exp)} className="bg-muted/50" /></div>
                    <div className="space-y-1 md:col-span-2"><Label className="text-xs">Período</Label><Input value={exp.period} onChange={e => updateExp(exp.id, "period", e.target.value)} onBlur={() => saveExp(exp)} placeholder="Jan 2020 - Dez 2023" className="bg-muted/50" /></div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descrição</Label>
                    <Textarea value={exp.description} onChange={e => updateExp(exp.id, "description", e.target.value)} onBlur={() => saveExp(exp)} className="bg-muted/50 min-h-[100px]" placeholder="Descreva suas atividades..." />
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
                    <Button size="icon" variant="ghost" onClick={() => deleteEdu(edu.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Instituição</Label><Input value={edu.institution} onChange={e => setEducations(p => p.map(ed => ed.id === edu.id ? { ...ed, institution: e.target.value } : ed))} onBlur={() => saveEdu(edu)} className="bg-muted/50" /></div>
                    <div className="space-y-1"><Label className="text-xs">Curso</Label><Input value={edu.course} onChange={e => setEducations(p => p.map(ed => ed.id === edu.id ? { ...ed, course: e.target.value } : ed))} onBlur={() => saveEdu(edu)} className="bg-muted/50" /></div>
                    <div className="space-y-1 md:col-span-2"><Label className="text-xs">Período</Label><Input value={edu.period} onChange={e => setEducations(p => p.map(ed => ed.id === edu.id ? { ...ed, period: e.target.value } : ed))} onBlur={() => saveEdu(edu)} className="bg-muted/50" /></div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addEducation} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Adicionar formação
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="glass-card p-5 mt-4">
              <SkillsStep
                skills={skills}
                onAddSkill={addSkill}
                onRemoveSkill={removeSkill}
                userArea={user.area}
                userRole={user.target_role}
              />
            </TabsContent>

            <TabsContent value="languages" className="glass-card p-5 mt-4">
              <LanguagesStep
                languages={languages}
                onAddLanguage={addLanguage}
                onRemoveLanguage={removeLanguage}
                onUpdateLevel={updateLanguageLevel}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview */}
        <div className="lg:w-96 shrink-0">
          <div className="sticky top-4">
            <div id="resume-preview" className="bg-white text-black rounded-xl p-6 space-y-4 text-sm">
              <h2 className="text-lg font-bold border-b border-gray-200 pb-2">{personal.name || "Seu Nome"}</h2>
              <div className="text-xs space-y-0.5 text-gray-500">
                {personal.email && <p>{personal.email}</p>}
                {personal.phone && <p>{personal.phone}</p>}
                {personal.city && <p>{personal.city}</p>}
              </div>
              {objective && (
                <div><h3 className="font-semibold text-xs uppercase tracking-wider mb-1">Objetivo</h3><p className="text-xs text-gray-700">{objective}</p></div>
              )}
              {experiences.length > 0 && (
                <div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider mb-2">Experiência</h3>
                  {experiences.map(e => (
                    <div key={e.id} className="mb-2">
                      <p className="font-medium text-xs">{e.role}{e.company ? ` — ${e.company}` : ""}</p>
                      {e.period && <p className="text-xs text-gray-400">{e.period}</p>}
                      {e.description && <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-line">{e.description}</p>}
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
                      {e.period && <p className="text-xs text-gray-400">{e.period}</p>}
                    </div>
                  ))}
                </div>
              )}
              {skillNames.length > 0 && (
                <div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider mb-1">Habilidades</h3>
                  <p className="text-xs text-gray-600">{skillNames.join(" • ")}</p>
                </div>
              )}
              {languages.length > 0 && (
                <div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider mb-1">Idiomas</h3>
                  {languages.map((l) => (
                    <p key={l.id} className="text-xs text-gray-600">{l.language} — {l.level}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3">
              <ResumeExport data={resumeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
