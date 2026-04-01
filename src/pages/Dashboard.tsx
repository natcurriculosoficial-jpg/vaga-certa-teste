import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, Linkedin, Radar, Mic, ArrowRight,
  TrendingUp, Sparkles, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/hooks/useAuth";
import FabMenu from "@/components/FabMenu";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export default function Dashboard({ user }: { user: Profile }) {
  const navigate = useNavigate();

  const metrics = [
    { label: "Currículo", value: "25%", sub: "completo", icon: FileText },
    { label: "Candidaturas", value: "0", sub: "vagas salvas", icon: Target },
    { label: "Entrevistas", value: "0", sub: "agendadas", icon: Mic },
    { label: "LinkedIn", value: "0%", sub: "otimizado", icon: Linkedin },
  ];

  const nextSteps = [
    { title: "Complete seu currículo", desc: "Preencha experiências e gere bullets com IA", path: "/resume", icon: FileText },
    { title: "Otimize seu LinkedIn", desc: "Headline e resumo profissional com IA", path: "/linkedin", icon: Linkedin },
    { title: "Busque vagas", desc: "Radar de vagas compatíveis com seu perfil", path: "/job-radar", icon: Radar },
  ];

  const sampleJobs = [
    { title: "Analista de Marketing Digital", company: "TechCorp", location: "São Paulo · Remoto" },
    { title: "Desenvolvedor Full Stack", company: "StartupXYZ", location: "Rio de Janeiro · Híbrido" },
    { title: "Product Manager", company: "InovaTech", location: "Curitiba · Presencial" },
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
              className="vc-card text-left group hover-lift"
            >
              <div className="p-2.5 rounded-xl gradient-primary w-fit mb-3">
                <step.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{step.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-sm text-primary opacity-0 group-hover:opacity-100 transition-all duration-200">
                Começar <ArrowRight className="h-3 w-3" />
              </div>
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
          {sampleJobs.map((job, i) => (
            <div key={i} className="vc-card space-y-3 hover-lift">
              <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center text-sm font-bold text-primary">
                {job.company[0]}
              </div>
              <h3 className="font-semibold text-foreground text-sm">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
              <p className="text-xs text-muted-foreground">{job.location}</p>
              <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => navigate("/job-radar")}>
                Ver vaga
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      <FabMenu />
    </motion.div>
  );
}
