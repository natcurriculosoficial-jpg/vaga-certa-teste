import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Briefcase, Bell, Lock, Mail, Phone,
  Eye, EyeOff, Save, Sparkles, Loader2, Upload,
  Shield, Check, X, Camera, Instagram
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationPrefs {
  job_radar_new: boolean;
  job_radar_alerts: boolean;
  interview_tips: boolean;
  resume_feedback: boolean;
  weekly_digest: boolean;
}

const SENIORITY_LEVELS = [
  "Estágio", "Trainee", "Júnior", "Pleno", "Sênior",
  "Especialista", "Coordenador", "Gerente", "Diretor", "C-Level",
];

const PROF_AREAS = [
  "Tecnologia / TI", "Marketing & Growth", "Vendas / Comercial",
  "Finanças / Contabilidade", "RH / Pessoas", "Design / UX",
  "Produto / Product Management", "Dados / Analytics",
  "Operações / Logística", "Jurídico", "Saúde", "Educação", "Outro",
];

export default function Settings() {
  const { user: profile, session, updateProfile } = useAuth();
  const [tab, setTab] = useState<"personal" | "professional" | "notifications">("personal");

  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [city, setCity] = useState(profile?.city || "");
  const [linkedin, setLinkedin] = useState(profile?.linkedin_url || "");
  const [portfolio, setPortfolio] = useState(profile?.portfolio_url || "");
  const [instagram, setInstagram] = useState(profile?.instagram_url || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  const [targetRole, setTargetRole] = useState(profile?.target_role || "");
  const [level, setLevel] = useState(profile?.level || "");
  const [area, setArea] = useState(profile?.area || "");
  const [objective, setObjective] = useState(profile?.objective || "");
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [notifs, setNotifs] = useState<NotificationPrefs>({
    job_radar_new: true,
    job_radar_alerts: true,
    interview_tips: false,
    resume_feedback: false,
    weekly_digest: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setPhone(profile.phone || "");
    setCity(profile.city || "");
    setLinkedin(profile.linkedin_url || "");
    setPortfolio(profile.portfolio_url || "");
    setInstagram(profile.instagram_url || "");
    setAvatarUrl(profile.avatar_url || "");
    setTargetRole(profile.target_role || "");
    setLevel(profile.level || "");
    setArea(profile.area || "");
    setObjective(profile.objective || "");
  }, [profile]);

  const checkStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    setPwStrength(s);
  };

  const strengthLabel = ["Muito fraca", "Fraca", "Média", "Boa", "Forte"];
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  const savePersonal = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, phone, city, linkedin_url: linkedin, portfolio_url: portfolio, instagram_url: instagram });

      if (pwNew) {
        if (pwNew !== pwConfirm) {
          toast({ title: "As senhas não coincidem", variant: "destructive" });
          setSaving(false);
          return;
        }
        if (pwStrength < 2) {
          toast({ title: "Senha muito fraca. Use letras, números e símbolos.", variant: "destructive" });
          setSaving(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: pwNew });
        if (error) throw error;
        setPwNew("");
        setPwConfirm("");
        toast({ title: "✅ Senha atualizada com sucesso!" });
      }

      toast({ title: "✅ Perfil pessoal salvo!" });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveProfessional = async () => {
    setSaving(true);
    try {
      await updateProfile({ target_role: targetRole, level, area, objective });
      toast({ title: "✅ Perfil profissional salvo!" });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const generateAiSummary = async () => {
    if (!targetRole || !area) {
      toast({ title: "Preencha cargo e área antes de gerar", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai", {
        body: {
          action: "generate_text",
          payload: {
            prompt: `Gere um resumo profissional conciso (3-4 frases) para: Cargo: ${targetRole}, Nível: ${level}, Área: ${area}. Objetivo: ${objective || "crescimento profissional"}. Apenas o texto, sem título.`,
          },
        },
      });
      if (error) throw error;
      const summary = data?.text || "";
      setAiSummary(summary);
      toast({ title: "✨ Resumo profissional gerado!" });
    } catch (e: any) {
      toast({ title: "Erro ao gerar resumo", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!session?.user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem muito grande (máx 5MB)", variant: "destructive" });
      return;
    }
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${session.user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl + `?t=${Date.now()}`;
      await updateProfile({ avatar_url: url });
      setAvatarUrl(url);

      // auto-complete checklist
      await supabase.from("checklist_progress").upsert({
        user_id: session.user.id,
        item_key: "fill_personal_profile",
        completed: true,
        completed_at: new Date().toISOString(),
      });

      toast({ title: "✅ Foto atualizada!" });
    } catch (e: any) {
      toast({ title: "Erro no upload", description: e.message, variant: "destructive" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const uploadResume = async (file: File) => {
    if (!session?.user) return;
    toast({ title: "Upload de currículo disponível em breve", description: "Funcionalidade em desenvolvimento." });
  };

  const toggleNotif = (key: keyof NotificationPrefs) => {
    setNotifs(p => ({ ...p, [key]: !p[key] }));
    toast({ title: `Notificação ${notifs[key] ? "desligada" : "ativada"}` });
  };

  const TABS = [
    { id: "personal" as const, label: "Perfil Pessoal", icon: User },
    { id: "professional" as const, label: "Perfil Profissional", icon: Briefcase },
    { id: "notifications" as const, label: "Notificações", icon: Bell },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 max-w-2xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">⚙️ Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie seu perfil, preferências e notificações
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* PERSONAL TAB */}
      {tab === "personal" && (
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Avatar header */}
          <div className="vc-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                {(profile?.name || "U")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">{profile?.name || "Seu Nome"}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
          </div>

          {/* Personal fields */}
          <div className="vc-card space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Informações pessoais</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome completo</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">E-mail</Label>
                <Input value={profile?.email || ""} disabled className="bg-muted/20 opacity-60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Telefone / WhatsApp</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Cidade / Estado</Label>
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="São Paulo - SP" className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">URL do LinkedIn</Label>
                <Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/seuperfil" className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Portfólio / Site</Label>
                <Input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="seusite.com.br" className="bg-muted/40" />
              </div>
            </div>
          </div>

          {/* Change password */}
          <div className="vc-card space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground text-sm">Alterar senha</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 relative">
                <Label className="text-xs">Nova senha</Label>
                <Input
                  type={showPw ? "text" : "password"}
                  value={pwNew}
                  onChange={e => { setPwNew(e.target.value); checkStrength(e.target.value); }}
                  placeholder="Nova senha"
                  className="bg-muted/40 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-7 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {pwNew && (
                  <div className="space-y-1 mt-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength ? strengthColor[pwStrength] : "bg-muted"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{strengthLabel[pwStrength]}</p>
                  </div>
                )}
              </div>
              <div className="space-y-1.5 relative">
                <Label className="text-xs">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={pwConfirm}
                    onChange={e => setPwConfirm(e.target.value)}
                    placeholder="Repita a senha"
                    className="bg-muted/40 pr-10"
                    autoComplete="new-password"
                  />
                  {pwConfirm && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {pwNew === pwConfirm
                        ? <Check className="h-4 w-4 text-green-500" />
                        : <X className="h-4 w-4 text-red-500" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Use 8+ caracteres, maiúsculas, números e símbolos para uma senha forte
            </p>
          </div>

          <Button onClick={savePersonal} disabled={saving} className="gradient-primary text-white btn-glow w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar alterações
          </Button>
        </motion.div>
      )}

      {/* PROFESSIONAL TAB */}
      {tab === "professional" && (
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="vc-card space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Informações profissionais</h3>
            <p className="text-xs text-muted-foreground">
              Essas informações alimentam a IA em todas as funcionalidades do app
              (currículo, radar de vagas, LinkedIn, simulador de entrevista).
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Cargo desejado / atual</Label>
                <Input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Ex: Desenvolvedor Frontend Sênior" className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nível de senioridade</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="bg-muted/40"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {SENIORITY_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Área profissional</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="bg-muted/40"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {PROF_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Resumo profissional / objetivo de carreira</Label>
                <Textarea
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  placeholder="Descreva sua experiência, objetivos e diferenciais profissionais..."
                  className="bg-muted/40 min-h-[120px] text-sm resize-none"
                />
              </div>
            </div>

            {/* AI summary */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Resumo gerado pela IA</p>
              </div>
              {aiSummary ? (
                <p className="text-sm text-foreground/80 leading-relaxed">{aiSummary}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Preencha os campos acima e clique em Gerar. A IA vai criar um resumo
                  profissional que será usado em todo o app.
                </p>
              )}
              <Button
                onClick={generateAiSummary}
                disabled={aiLoading}
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
                {aiSummary ? "Regenerar resumo" : "✨ Gerar com IA"}
              </Button>
            </div>
          </div>

          {/* Upload resume */}
          <div className="vc-card space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground text-sm">Currículo em arquivo</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Envie seu currículo em PDF ou DOCX. Ele será usado como referência para a IA.
            </p>
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {resumeFile ? resumeFile.name : "Clique para selecionar ou arraste o arquivo"}
              </span>
              <span className="text-xs text-muted-foreground/60">PDF, DOCX — máx. 5MB</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setResumeFile(f); uploadResume(f); }
                }}
              />
            </label>
          </div>

          <Button onClick={saveProfessional} disabled={saving} className="gradient-primary text-white btn-glow w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar perfil profissional
          </Button>
        </motion.div>
      )}

      {/* NOTIFICATIONS TAB */}
      {tab === "notifications" && (
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="vc-card space-y-5">
            <h3 className="font-semibold text-foreground text-sm">Radar de Vagas</h3>
            {([
              { key: "job_radar_new" as const, label: "Novas vagas compatíveis", desc: "Notificar quando encontrar vagas que batem com seu perfil profissional" },
              { key: "job_radar_alerts" as const, label: "Alertas de buscas salvas", desc: "Atualizações das buscas que você configurou como alerta" },
            ]).map(n => (
              <div key={n.key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                </div>
                <Switch checked={notifs[n.key]} onCheckedChange={() => toggleNotif(n.key)} />
              </div>
            ))}
          </div>

          <div className="vc-card space-y-5">
            <h3 className="font-semibold text-foreground text-sm">Currículo & Entrevista</h3>
            {([
              { key: "interview_tips" as const, label: "Dicas de entrevista", desc: "Receber dicas e lembretes antes de entrevistas agendadas" },
              { key: "resume_feedback" as const, label: "Feedback do currículo", desc: "Sugestões de melhoria do currículo geradas pela IA" },
            ]).map(n => (
              <div key={n.key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                </div>
                <Switch checked={notifs[n.key]} onCheckedChange={() => toggleNotif(n.key)} />
              </div>
            ))}
          </div>

          <div className="vc-card space-y-5">
            <h3 className="font-semibold text-foreground text-sm">Resumo semanal</h3>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Digest semanal</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Resumo das suas candidaturas, vagas e progresso toda segunda-feira
                </p>
              </div>
              <Switch checked={notifs.weekly_digest} onCheckedChange={() => toggleNotif("weekly_digest")} />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
