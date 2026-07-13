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
import { usePlan } from "@/hooks/usePlan";
import LanguagesStep from "@/components/resume/LanguagesStep";
import SkillsStep from "@/components/resume/SkillsStep";
import ResumeExport from "@/components/resume/ResumeExport";
import { EducationPeriodFields } from "@/components/resume/EducationPeriodFields";
import { Skeleton } from "@/components/ui/skeleton";

interface Experience {
  id: string; company: string; role: string; period: string; description: string;
}

function groupExperiencesByCompany(experiences: Experience[]): { company: string; roles: { role: string; period: string; description: string }[] }[] {
  const grouped: { company: string; roles: { role: string; period: string; description: string }[] }[] = [];
  for (const exp of experiences) {
    const companyLabel = exp.company?.trim() || "Sem empresa informada";
    const key = companyLabel.toLowerCase();
    const existing = grouped.find(g => g.company.trim().toLowerCase() === key);
    if (existing) {
      existing.roles.push({ role: exp.role, period: exp.period, description: exp.description });
    } else {
      grouped.push({ company: companyLabel, roles: [{ role: exp.role, period: exp.period, description: exp.description }] });
    }
  }
  return grouped;
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
  const { useCredit, plan, refreshPlan } = usePlan();
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
          supabase.from("experiences").select("id, company, role, period, description, sort_order").eq("user_id", uid).order("sort_order", { ascending: true }),
          supabase.from("education").select("id, institution, course, period, description, sort_order").eq("user_id", uid).order("sort_order", { ascending: true }),
          supabase.from("skills").select("id, name, type").eq("user_id", uid),
          supabase.from("languages").select("id, language, level").eq("user_id", uid),
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
      }).eq("id", user.id);
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

  const updateExp = useCallback((id: string, field: keyof Experience, value: string) => {
    setExperiences(p => p.map(e => e.id === id ? { ...e, [field]: value } : e));
  }, []);

  const saveExp = async (id: string, patch?: Partial<Experience>) => {
    // Read freshest state via callback to avoid stale closure
    let target: Experience | undefined;
    setExperiences(prev => {
      target = prev.find(e => e.id === id);
      if (target && patch) target = { ...target, ...patch };
      return prev;
    });
    if (!target) return;
    const { error } = await supabase.from("experiences").update({
      company: target.company, role: target.role, period: target.period, description: target.description,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast({ title: "Erro ao salvar experiência", variant: "destructive" });
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

    if (!plan.canUseAI) {
      toast({ title: "Sem créditos de IA", description: "Faça upgrade do seu plano para usar a IA.", variant: "destructive" });
      return;
    }

    setAiLoading(id);
    try {
      const { data, error } = await supabase.functions.invoke("ai-vagacerta", {
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
      if (error) {
        const body = error.context && typeof error.context.json === "function"
          ? await error.context.json().catch(() => null) : null;
        if (body?.code === "insufficient_credits") {
          toast({ title: "Sem créditos de IA", description: "Seus créditos acabaram. Faça upgrade do plano.", variant: "destructive" });
          return;
        }
        throw error;
      }
      const result = data?.text || "";
      if (!result) throw new Error("empty");
      const updated = { ...exp, description: result };
      setExperiences(p => p.map(e => e.id === id ? updated : e));
      await saveExp(id, { description: result });
      await refreshPlan();
      toast({ title: "✨ Bullets gerados com IA!", description: "Descrição atualizada com 4-6 pontos de impacto." });
    } catch (err) {
      toast({ title: "Erro ao gerar bullets", variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const generateObj = async () => {
    if (!plan.canUseAI) {
      toast({ title: "Sem créditos de IA", description: "Faça upgrade do seu plano para usar a IA.", variant: "destructive" });
      return;
    }
    setAiLoading("objective");
    try {
      const result = await gemini.generateObjective(user.target_role || "Analista", user.level || "Pleno", user.area || "TI");
      if (result === gemini.NO_CREDITS) {
        toast({ title: "Sem créditos de IA", description: "Seus créditos acabaram. Faça upgrade do plano.", variant: "destructive" });
        return;
      }
      if (!result) throw new Error("empty");
      setObjective(result);
      await refreshPlan();
      toast({ title: "Objetivo gerado com IA ✨" });
    } catch {
      toast({ title: "Falha na IA", description: "Não foi possível gerar. Tente novamente.", variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const improveObj = async () => {
    if (!objective) return;
    if (!plan.canUseAI) {
      toast({ title: "Sem créditos de IA", description: "Faça upgrade do seu plano para usar a IA.", variant: "destructive" });
      return;
    }
    setAiLoading("objective");
    try {
      const result = await gemini.improveText(objective);
      if (result === gemini.NO_CREDITS) {
        toast({ title: "Sem créditos de IA", description: "Seus créditos acabaram. Faça upgrade do plano.", variant: "destructive" });
        return;
      }
      if (!result) throw new Error("empty");
      setObjective(result);
      await refreshPlan();
      toast({ title: "Texto melhorado ✨" });
    } catch {
      toast({ title: "Falha na IA", description: "Não foi possível melhorar. Tente novamente.", variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
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
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Resumo Profissional</Label>
                  <Textarea
                    value={objective}
                    onChange={e => setObjective(e.target.value)}
                    placeholder="Escreva ou gere com IA seu resumo profissional..."
                    className="bg-muted/50 min-h-[100px]"
                  />
                  <div className="flex gap-2 flex-wrap mt-2">
                    <Button size="sm" variant="outline" onClick={generateObj} disabled={aiLoading === "objective"}>
                      {aiLoading === "objective" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      Gerar com IA
                    </Button>
                    <Button size="sm" variant="ghost" onClick={improveObj} disabled={aiLoading === "objective" || !objective}>
                      Melhorar texto
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={savePersonal} disabled={savingPersonal} className="w-full">
                {savingPersonal ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Salvar dados pessoais
              </Button>
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
                    <div className="space-y-1"><Label className="text-xs">Empresa</Label><Input value={exp.company} onChange={e => updateExp(exp.id, "company", e.target.value)} onBlur={() => saveExp(exp.id)} className="bg-muted/50" /></div>
                    <div className="space-y-1"><Label className="text-xs">Cargo</Label><Input value={exp.role} onChange={e => updateExp(exp.id, "role", e.target.value)} onBlur={() => saveExp(exp.id)} className="bg-muted/50" /></div>
                    <div className="space-y-1 md:col-span-2"><Label className="text-xs">Período</Label><Input value={exp.period} onChange={e => updateExp(exp.id, "period", e.target.value)} onBlur={() => saveExp(exp.id)} placeholder="Jan 2020 - Dez 2023" className="bg-muted/50" /></div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descrição</Label>
                    <Textarea value={exp.description} onChange={e => updateExp(exp.id, "description", e.target.value)} onBlur={() => saveExp(exp.id)} className="bg-muted/50 min-h-[100px]" placeholder="Descreva suas atividades..." />
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
                    <EducationPeriodFields value={edu.period} onCommit={v => { setEducations(p => p.map(ed => ed.id === edu.id ? { ...ed, period: v } : ed)); saveEdu({ ...edu, period: v }); }} />
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
            <div id="resume-preview" className="bg-white text-black rounded-xl p-8 text-sm" style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.4' }}>
              <h2 className="text-center font-bold uppercase tracking-wide" style={{ fontFamily: 'Arial, sans-serif', fontSize: '18pt' }}>
                {personal.name || "Seu Nome"}
              </h2>
              <p className="text-center text-xs text-gray-600 mt-1" style={{ fontFamily: 'Arial, sans-serif' }}>
                {[personal.phone, personal.city, personal.linkedin, personal.portfolio].filter(Boolean).join(" | ")}
              </p>

              {objective && (
                <div className="mt-4">
                  <p className="text-xs text-gray-800" style={{ fontFamily: 'Arial, sans-serif' }}>{objective}</p>
                </div>
              )}

              {educations.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-bold text-xs uppercase tracking-wider border-b border-gray-300 pb-1 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                    Formação Acadêmica
                  </h3>
                  {educations.map(e => (
                    <div key={e.id} className="mb-1.5">
                      <p className="font-semibold text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>{e.course}</p>
                      <p className="text-xs text-gray-500" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {e.institution}{e.period ? ` | ${e.period}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {experiences.length > 0 && (() => {
                const grouped = groupExperiencesByCompany(experiences);
                return (
                  <div className="mt-5">
                    <h3 className="font-bold text-xs uppercase tracking-wider border-b border-gray-300 pb-1 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                      Experiência Profissional
                    </h3>
                    {grouped.map((group, gi) => (
                      <div key={gi} className="mb-3">
                        <p className="font-bold text-xs italic" style={{ fontFamily: 'Arial, sans-serif' }}>{group.company}</p>
                        {group.roles.map((role, ri) => (
                          <div key={ri} className="ml-3 mb-1.5">
                            <p className="text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>
                              <span className="font-semibold">{role.role}</span>
                              {role.period ? <span className="text-gray-500"> | {role.period}</span> : null}
                            </p>
                            {role.description && (
                              <p className="text-xs text-gray-700 whitespace-pre-line ml-1 mt-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>
                                {role.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {skillNames.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-bold text-xs uppercase tracking-wider border-b border-gray-300 pb-1 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                    Habilidades e Ferramentas
                  </h3>
                  <p className="text-xs text-gray-700" style={{ fontFamily: 'Arial, sans-serif' }}>{skillNames.join(" • ")}</p>
                </div>
              )}

              {languages.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-bold text-xs uppercase tracking-wider border-b border-gray-300 pb-1 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                    Idiomas
                  </h3>
                  {languages.map((l) => (
                    <p key={l.id} className="text-xs text-gray-700" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {l.language} — {l.level}
                    </p>
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
