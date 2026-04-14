import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, Linkedin, Radar, Mic, ArrowRight,
  TrendingUp, Sparkles, Target, CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/hooks/useAuth";
import { useChecklist } from "@/hooks/useChecklist";
import { supabase } from "@/integrations/supabase/client";
import FabMenu from "@/components/FabMenu";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  type: string | null;
  url: string | null;
  status: string;
}

export default function Dashboard({ user }: { user: Profile }) {
  const navigate = useNavigate();
  const { completedCount, total, percentage } = useChecklist();

  const [resumeStatus, setResumeStatus] = useState({ hasExperience: false, hasBullets: false });
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState<SavedJob[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const [expRes, jobsCountRes, jobsRes] = await Promise.all([
        supabase.from("experiences").select("id, description").eq("user_id", authUser.id),
        supabase.from("saved_jobs").select("id", { count: "exact", head: true }).eq("user_id", authUser.id),
        supabase.from("saved_jobs").select("id, title, company, location, type, url, status")
          .eq("user_id", authUser.id)
          .in("status", ["saved", "applied", "process"])
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      const hasExp = (expRes.data?.length ?? 0) > 0;
      const hasBullets = expRes.data?.some(e => e.description?.includes("•")) ?? false;
      setResumeStatus({ hasExperience: hasExp, hasBullets });
      setSavedJobsCount(jobsCountRes.count ?? 0);
      setRecommendedJobs(jobsRes.data || []);
    };
    fetchStatus();
  }, []);

  const resumeComplete = resumeStatus.hasExperience && resumeStatus.hasBullets;

  const metrics = [
    { label: "Currículo", value: resumeComplete ? "100%" : resumeStatus.hasExperience ? "50%" : "0%", sub: resumeComplete ? "completo" : "pendente", icon: FileText },
    { label: "Candidaturas", value: String(savedJobsCount), sub: "vagas salvas", icon: Target },
    { label: "Entrevistas", value: "0", sub: "agendadas", icon: Mic },
    { label: "LinkedIn", value: user.linkedin_url ? "100%" : "0%", sub: user.linkedin_url ? "conectado" : "pendente", icon: Linkedin },
  ];

  const nextSteps = [
    {
      title: "Complete seu currículo",
      desc: resumeComplete ? "✅ Concluído! Currículo com bullets de IA" : "Preencha experiências e gere bullets com IA",
      path: "/resume",
      icon: FileText,
      done: resumeComplete,
    },
    {
      title: "Otimize seu LinkedIn",
      desc: user.linkedin_url ? "✅ LinkedIn conectado ao perfil" : "Headline e resumo profissional com IA",
      path: "/linkedin",
      icon: Linkedin,
      done: !!user.linkedin_url,
    },
    {
      title: "Busque vagas",
      desc: savedJobsCount > 0 ? `✅ ${savedJobsCount} vaga(s) no tracker` : "Radar de vagas compatíveis com seu perfil",
      path: "/job-radar",
      icon: Radar,
      done: savedJobsCount > 0,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-6xl mx-auto space-y-8"
    >
      {/* Hero banner */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl vc-hero-gradient p-6 md:p-8">
        <svg className="absolute right-0 top-0 h-full w-1/3 opacity-20" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="url(#blobGrad)" />
        </svg>

        <div className="relative z-10">
          <p className="text-primary/70 dark:text-primary-foreground/70 text-sm font-medium flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5" /> Seja bem-vindo de volta 👋
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-primary-foreground">
            Olá, {user.name?.split(" ")[0] || "Usuário"}!
          </h1>
          <p className="text-muted-foreground dark:text-primary-foreground/60 mt-1">
            Vamos acelerar sua recolocação profissional hoje
          </p>
          <Button
            className="mt-4 gradient-primary text-white btn-glow rounded-xl"
            onClick={() => navigate("/job-radar")}
          >
            <Radar className="h-4 w-4 mr-2" />
            Ver vagas do dia
          </Button>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {metrics.map(m => (
          <div key={m.label} className="vc-card flex flex-col items-start gap-2">
            <div className="p-2 rounded-xl bg-accent">
              <m.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="vc-metric text-foreground">{m.value}</p>
            <p className="text-sm font-semibold text-foreground">{m.label}</p>
            <p className="text-xs text-muted-foreground">{m.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Checklist progress */}
      <motion.div variants={item}>
        <button
          onClick={() => navigate("/checklist")}
          className="vc-card w-full text-left hover-lift flex items-center gap-4"
        >
          <div className="p-2.5 rounded-xl gradient-primary">
            <CheckSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Minha Jornada</p>
            <p className="text-xs text-muted-foreground">{completedCount}/{total} etapas concluídas — {percentage}% 🎯</p>
            <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </motion.div>

      {/* Next steps */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          Próximos passos recomendados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nextSteps.map(step => (
            <motion.button
              key={step.path}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(step.path)}
              className={`vc-card text-left group hover-lift ${step.done ? "border border-green-500/30" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl w-fit mb-3 ${step.done ? "bg-green-500/10" : "gradient-primary"}`}>
                  <step.icon className={`h-5 w-5 ${step.done ? "text-green-500" : "text-primary-foreground"}`} />
                </div>
                {step.done && <span className="text-green-500 text-lg">✅</span>}
              </div>
              <h3 className={`font-semibold ${step.done ? "text-foreground/70" : "text-foreground"}`}>{step.title}</h3>
              <p className={`text-sm mt-1.5 leading-relaxed ${step.done ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>{step.desc}</p>
              {!step.done && (
                <div className="flex items-center gap-1 mt-3 text-sm text-primary opacity-0 group-hover:opacity-100 transition-all duration-200">
                  Começar <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recommended jobs */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent">
              <Target className="h-4 w-4 text-primary" />
            </div>
            Vagas recomendadas para você
          </h2>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/job-radar")}>
            Ver todas <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendedJobs.length === 0 ? (
            <div className="md:col-span-3 vc-card text-center py-8 space-y-3">
              <Target className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="font-medium text-foreground">Nenhuma vaga salva ainda</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Use o Radar de Vagas para buscar oportunidades compatíveis com seu perfil de {user.target_role || "profissional"}
              </p>
              <Button onClick={() => navigate("/job-radar")} className="gradient-primary text-white">
                Buscar vagas agora
              </Button>
            </div>
          ) : (
            recommendedJobs.map((job) => (
              <div key={job.id} className="vc-card space-y-3 hover-lift">
                <div className="flex justify-between items-start">
                  <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center text-sm font-bold text-primary">
                    {job.company?.[0] ?? "?"}
                  </div>
                  {job.status && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {job.status === "saved" ? "Salva" : job.status === "applied" ? "Candidatei" : "Em análise"}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-sm">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <p className="text-xs text-muted-foreground">{job.location}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl"
                  onClick={() => job.url ? window.open(job.url, "_blank") : navigate("/job-radar")}
                >
                  {job.url ? "Ver vaga" : "Ver no radar"}
                </Button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <FabMenu />
    </motion.div>
  );
}
