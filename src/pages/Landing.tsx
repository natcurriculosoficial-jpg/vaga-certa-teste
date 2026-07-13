import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, Linkedin, Search, MessageSquare,
  Check, ArrowRight, Zap, ShieldCheck, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";

const FEATURES = [
  { icon: FileText, title: "Currículo com IA", desc: "Monte um currículo profissional com bullets de impacto gerados por IA em minutos." },
  { icon: Linkedin, title: "LinkedIn otimizado", desc: "Headline e resumo do LinkedIn escritos pela IA para atrair recrutadores." },
  { icon: Search, title: "Busca de vagas", desc: "Encontre vagas compatíveis com seu perfil e acompanhe suas candidaturas." },
  { icon: MessageSquare, title: "Simulador de entrevista", desc: "Treine com a Nat IA, receba perguntas reais e feedback para se preparar." },
];

const PLANS = [
  { name: "Free", price: "R$ 0", tagline: "Para começar", highlight: false,
    perks: ["Currículo básico", "Busca de vagas (5/dia)", "Comunidade (leitura)"] },
  { name: "Essencial", price: "R$ 19,90", tagline: "Currículo turbinado", highlight: false,
    perks: ["Currículo com IA", "LinkedIn com IA", "Export PDF", "Aulas e conteúdos"] },
  { name: "Candidato", price: "R$ 29,90", tagline: "O mais popular", highlight: true,
    perks: ["Tudo do Essencial", "Simulador de entrevista", "Job Tracker", "Comunidade completa", "Filtros avançados"] },
  { name: "Profissional", price: "R$ 44,90", tagline: "Sem limites", highlight: false,
    perks: ["Tudo do Candidato", "IA ilimitada", "Export sem marca d'água", "Suporte prioritário"] },
];

function brl(v: string) { return v; }

export default function Landing() {
  const navigate = useNavigate();
  const goSignup = () => navigate("/signup");
  const goLogin = () => navigate("/login");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goLogin}>Entrar</Button>
            <Button size="sm" className="gradient-primary text-white" onClick={goSignup}>
              Criar conta grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge variant="secondary" className="gap-1 mb-5">
            <Zap className="h-3 w-3" /> Sua recolocação profissional acelerada por IA
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            Conquiste a vaga certa <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">com ajuda da IA</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Currículo, LinkedIn, busca de vagas e simulação de entrevista — tudo em um só lugar,
            com inteligência artificial que trabalha por você. Comece grátis com 7 dias de teste.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="gradient-primary text-white gap-2 w-full sm:w-auto" onClick={goSignup}>
              Começar agora — é grátis <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={goLogin}>
              Já tenho conta
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> 7 dias de teste grátis</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Sem cartão para começar</span>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card/60 p-6"
            >
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Planos para cada momento da sua busca</h2>
          <p className="text-muted-foreground mt-2">Comece grátis e evolua quando precisar. Cancele quando quiser.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                p.highlight
                  ? "bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/40 shadow-xl shadow-primary/10"
                  : "bg-card/60 border border-border"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 rounded-full gradient-primary text-white shadow-md whitespace-nowrap">
                  Mais popular
                </span>
              )}
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{p.tagline}</p>
              <div className="mt-3 mb-4">
                <span className="text-3xl font-bold">{brl(p.price)}</span>
                {p.name !== "Free" && <span className="text-sm text-muted-foreground">/mês</span>}
              </div>
              <ul className="space-y-2 text-sm flex-1">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{perk}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full mt-5 ${p.highlight ? "gradient-primary text-white" : ""}`}
                variant={p.highlight ? "default" : "outline"}
                onClick={goSignup}
              >
                {p.name === "Free" ? "Começar grátis" : "Assinar"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="rounded-3xl gradient-primary p-10 md:p-14 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <Users className="h-10 w-10 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold">Pronto para conquistar sua próxima vaga?</h2>
            <p className="mt-3 text-white/90 max-w-xl mx-auto">
              Crie sua conta agora e ganhe 7 dias de teste grátis com todos os recursos de IA.
            </p>
            <Button size="lg" variant="secondary" className="mt-7 gap-2" onClick={goSignup}>
              Criar minha conta grátis <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size="sm" variant="icon" />
            <span>© {new Date().getFullYear()} Vaga Certa</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={goLogin} className="hover:text-foreground">Entrar</button>
            <button onClick={goSignup} className="hover:text-foreground">Criar conta</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
