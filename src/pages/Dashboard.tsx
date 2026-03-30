import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Linkedin, Target, Mic, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/hooks/useAuth";
import FabMenu from "@/components/FabMenu";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/hooks/useAuth";

const progressCards = [
  { label: "Currículo", icon: FileText, value: "25%", color: "text-secondary" },
  { label: "LinkedIn", icon: Linkedin, value: "0%", color: "text-secondary" },
  { label: "Candidaturas", icon: Target, value: "0", color: "text-success" },
  { label: "Entrevistas", icon: Mic, value: "0", color: "text-warning" },
];

const nextSteps = [
  { title: "Complete seu currículo", desc: "Preencha suas experiências e gere bullets com IA", path: "/resume", icon: FileText },
  { title: "Otimize seu LinkedIn", desc: "Crie uma headline e resumo profissional", path: "/linkedin", icon: Linkedin },
  { title: "Busque vagas", desc: "Encontre oportunidades compatíveis com seu perfil", path: "/job-radar", icon: Target },
];

const sampleJobs = [
  { title: "Analista de Marketing Digital", company: "TechCorp", location: "São Paulo - Remoto" },
  { title: "Desenvolvedor Full Stack", company: "StartupXYZ", location: "Rio de Janeiro - Híbrido" },
  { title: "Product Manager", company: "InovaTech", location: "Curitiba - Presencial" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export default function Dashboard({ user }: { user: Profile }) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Olá, {user.name?.split(" ")[0] || "Usuário"}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Vamos acelerar sua recolocação profissional</p>
      </motion.div>

      {/* Progress cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {progressCards.map((card, i) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="glass-card p-4 space-y-2 hover-lift cursor-default"
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-muted/50 ${card.color}`}>
                <card.icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Next steps */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondary/10">
            <TrendingUp className="h-4 w-4 text-secondary" />
          </div>
          Próximos passos recomendados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nextSteps.map((step, i) => (
            <motion.button
              key={step.path}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(step.path)}
              className="glass-card p-5 text-left hover:border-secondary/30 transition-all group hover-lift"
            >
              <div className="p-2.5 rounded-xl bg-secondary/10 w-fit mb-3">
                <step.icon className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{step.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-sm text-secondary opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
                Começar <ArrowRight className="h-3 w-3" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recommended jobs */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondary/10">
            <Target className="h-4 w-4 text-secondary" />
          </div>
          Vagas recomendadas para você
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleJobs.map((job, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="glass-card p-5 space-y-3 hover-lift"
            >
              <h3 className="font-semibold text-foreground text-sm">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
              <p className="text-xs text-muted-foreground">{job.location}</p>
              <Button variant="outline" size="sm" className="mt-2 w-full rounded-xl hover:bg-muted/40">
                Ver vaga
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAB */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-24 md:bottom-8 right-6 z-10"
      >
        <Button
          onClick={() => navigate("/resume")}
          className="h-14 w-14 rounded-2xl shadow-lg gradient-primary hover:opacity-90 transition-opacity"
          size="icon"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
