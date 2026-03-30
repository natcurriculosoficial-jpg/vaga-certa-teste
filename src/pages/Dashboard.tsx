import { useNavigate } from "react-router-dom";
import { FileText, Linkedin, Target, Mic, ArrowRight, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserData } from "@/hooks/useAuth";

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

export default function Dashboard({ user }: { user: UserData }) {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Olá, {user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Vamos acelerar sua recolocação profissional</p>
      </div>

      {/* Progress cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {progressCards.map(card => (
          <div key={card.label} className="glass-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-secondary" />
          Próximos passos recomendados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nextSteps.map(step => (
            <button
              key={step.path}
              onClick={() => navigate(step.path)}
              className="glass-card p-5 text-left hover:border-secondary/50 transition-all group"
            >
              <step.icon className="h-8 w-8 text-secondary mb-3" />
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-sm text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                Começar <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended jobs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-secondary" />
          Vagas recomendadas para você
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleJobs.map((job, i) => (
            <div key={i} className="glass-card p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-sm">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
              <p className="text-xs text-muted-foreground">{job.location}</p>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                Ver vaga
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <Button
        onClick={() => navigate("/resume")}
        className="fixed bottom-24 md:bottom-8 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary hover:opacity-90"
        size="icon"
      >
        <Plus className="h-6 w-6 text-foreground" />
      </Button>
    </div>
  );
}
