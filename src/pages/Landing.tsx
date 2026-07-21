import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, Linkedin, Search, MessageSquare, Check, ArrowRight,
  Sparkles, Star, Zap, Target, ShieldCheck, Clock, TrendingUp,
  Bot, Quote, GraduationCap, Users, FileDown, MapPin, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import Logo from "@/components/Logo";

/* ---------------------------------- dados --------------------------------- */

const PEOPLE = ["/person-1.jpg", "/person-2.jpg", "/person-3.jpg", "/person-4.jpg"];

const STATS = [
  { value: "3x", label: "mais entrevistas" },
  { value: "7 min", label: "para um currículo pronto" },
  { value: "7 dias", label: "de teste grátis" },
  { value: "100%", label: "em português" },
];

const STEPS = [
  { n: "1", title: "Conte sobre você", desc: "Responda 3 perguntas rápidas sobre sua área e objetivo. Sem formulário chato." },
  { n: "2", title: "A IA monta tudo", desc: "Currículo, LinkedIn e busca de vagas prontos em minutos — com a sua cara." },
  { n: "3", title: "Candidate-se e treine", desc: "Aplique nas vagas certas e treine a entrevista com a Nat IA antes do dia." },
];

const MORE_FEATURES = [
  { icon: Linkedin, label: "LinkedIn com IA" },
  { icon: GraduationCap, label: "Aulas e conteúdos" },
  { icon: Users, label: "Comunidade" },
  { icon: FileDown, label: "Export PDF & DOCX" },
];

const TESTIMONIALS = [
  { name: "Camila R.", role: "Contratada como Analista de RH", photo: "/person-2.jpg", text: "Fiz o currículo em 10 minutos e em duas semanas já tinha 3 entrevistas marcadas. O simulador me deu uma confiança que eu não tinha." },
  { name: "Diego M.", role: "Voltou ao mercado como Dev Pleno", photo: "/person-4.jpg", text: "Estava desempregado há 5 meses. O score de compatibilidade mudou meu jogo — parei de atirar pra todo lado e comecei a acertar." },
  { name: "Patrícia L.", role: "Migrou de carreira para UX", photo: "/person-3.jpg", text: "O LinkedIn otimizado pela IA fez recrutadores me chamarem. Nunca imaginei que a mudança de área seria tão rápida." },
];

const PLANS = [
  { name: "Free", price: "R$ 0", suffix: "", tagline: "Para dar o primeiro passo", highlight: false,
    perks: ["Currículo básico", "Busca de vagas (5/dia)", "Comunidade (leitura)"] },
  { name: "Essencial", price: "R$ 19,90", suffix: "/mês", tagline: "Currículo turbinado", highlight: false,
    perks: ["Currículo com IA", "LinkedIn com IA", "Export PDF", "Aulas e conteúdos"] },
  { name: "Candidato", price: "R$ 29,90", suffix: "/mês", tagline: "O mais escolhido", highlight: true,
    perks: ["Tudo do Essencial", "Simulador de entrevista", "Job Tracker", "Comunidade completa", "Filtros avançados"] },
  { name: "Profissional", price: "R$ 44,90", suffix: "/mês", tagline: "Sem limites", highlight: false,
    perks: ["Tudo do Candidato", "IA ilimitada", "Export sem marca d'água", "Suporte prioritário"] },
];

const FAQ = [
  { q: "Preciso pagar para começar?", a: "Não. Você cria sua conta grátis e ganha 7 dias de teste com todos os recursos de IA. Sem cartão de crédito para começar." },
  { q: "A IA escreve o currículo por mim?", a: "Ela faz o trabalho pesado: transforma o que você conta em bullets de impacto, escreve seu LinkedIn e sugere melhorias. Você revisa e ajusta o que quiser." },
  { q: "Funciona para qualquer área?", a: "Sim. De estágio a cargos de liderança, de TI a saúde, RH, vendas e mais. A IA se adapta à sua área e nível." },
  { q: "Posso cancelar quando quiser?", a: "Quando quiser, sem burocracia. E se pedir reembolso nos primeiros 7 dias, devolvemos seu dinheiro." },
  { q: "Meus dados estão seguros?", a: "Sim. Seus dados são privados e usados apenas para gerar seu material. Ninguém além de você tem acesso ao seu perfil." },
];

/* -------------------------------- animações ------------------------------- */

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

/* botões com ênfase (destaque + animação) reutilizáveis */
const ctaPrimary = "gradient-primary text-white btn-glow gap-2 transition-transform duration-200 hover:scale-[1.04] active:scale-95";
const ctaOnColor = "bg-white text-primary font-semibold gap-2 shadow-xl shadow-black/10 transition-transform duration-200 hover:scale-[1.04] hover:bg-white active:scale-95";

/* -------------------------- mockups das features -------------------------- */

function ResumeMock() {
  return (
    <div className="glass-card rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm">JS</div>
        <div className="flex-1">
          <div className="h-3 w-28 rounded bg-foreground/80 mb-1.5" />
          <div className="h-2 w-20 rounded bg-muted-foreground/40" />
        </div>
        <Badge className="bg-success/15 text-success border-success/20 gap-1"><TrendingUp className="h-3 w-3" /> 92%</Badge>
      </div>
      <div className="space-y-2.5">
        {[100, 85, 92].map((w, i) => (
          <motion.div key={i}
            initial={{ opacity: 0.4, width: "40%" }}
            whileInView={{ opacity: 1, width: `${w}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 + i * 0.2 }}
            className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-success shrink-0" />
            <div className="h-2.5 rounded bg-muted-foreground/25 flex-1" />
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
        <Bot className="h-4 w-4 text-primary" />
        <span className="text-xs text-primary font-medium">Reescrito para a vaga de Analista</span>
      </div>
    </div>
  );
}

function InterviewMock() {
  const msgs = [
    { who: "Nat IA", text: "Qual foi seu maior resultado no último ano?", me: false },
    { who: "Você", text: "Aumentei as vendas em 30% no trimestre…", me: true },
    { who: "Nat IA", text: "Nota 9/10! Comece pelo número — ele prende a atenção. 💡", me: false },
  ];
  return (
    <div className="glass-card rounded-2xl p-5 shadow-xl space-y-2.5">
      {msgs.map((m, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.15 }}
          className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[88%] ${m.me ? "bg-primary text-white ml-auto" : "bg-muted text-foreground"}`}>
          <p className={`text-[10px] font-semibold mb-0.5 ${m.me ? "text-white/80" : "text-primary"}`}>{m.who}</p>
          {m.text}
        </motion.div>
      ))}
    </div>
  );
}

function ScoreMock() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
            <path d="M18 2.5a15.5 15.5 0 110 31 15.5 15.5 0 010-31" fill="none" className="stroke-muted" strokeWidth="3" />
            <motion.path d="M18 2.5a15.5 15.5 0 110 31 15.5 15.5 0 010-31" fill="none"
              className="stroke-primary" strokeWidth="3" strokeLinecap="round" strokeDasharray="97.4"
              initial={{ strokeDashoffset: 97.4 }} whileInView={{ strokeDashoffset: 97.4 * 0.13 }}
              viewport={{ once: true }} transition={{ duration: 1.1, ease: "easeOut" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-gradient">87%</span>
            <span className="text-[10px] text-muted-foreground">match</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" /> Experiência compatível</div>
          <div className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" /> Skills-chave presentes</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Target className="h-4 w-4 text-amber-500" /> Adicione "Power BI"</div>
        </div>
      </div>
    </div>
  );
}

function JobsMock() {
  const jobs = [
    { role: "Analista de Dados Pleno", co: "TechCorp", loc: "Remoto", m: "94%" },
    { role: "Business Analyst", co: "Nubank", loc: "São Paulo", m: "88%" },
    { role: "Analista de BI", co: "iFood", loc: "Híbrido", m: "82%" },
  ];
  return (
    <div className="glass-card rounded-2xl p-4 shadow-xl space-y-2.5">
      {jobs.map((j, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.12 }}
          className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-3.5 py-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{j.role}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {j.co} · <MapPin className="h-3 w-3" /> {j.loc}
            </p>
          </div>
          <Badge className="bg-success/15 text-success border-success/20 shrink-0">{j.m}</Badge>
        </motion.div>
      ))}
    </div>
  );
}

const SHOWCASE = [
  {
    badge: "Currículo com IA", icon: FileText,
    title: "Um currículo que passa no filtro — humano e robô",
    desc: "A IA transforma o que você faz em bullets de impacto, no formato que recrutadores e sistemas de triagem (ATS) querem ver.",
    points: ["Bullets com verbo + ação + resultado", "Otimizado por palavra-chave da vaga", "Pronto para PDF ou DOCX"],
    mock: <ResumeMock />, reverse: false,
  },
  {
    badge: "Simulador de entrevista", icon: MessageSquare,
    title: "Chegue na entrevista sabendo o que vão perguntar",
    desc: "A Nat IA simula entrevistas reais da sua área, avalia cada resposta e te diz exatamente onde melhorar — quantas vezes quiser.",
    points: ["Perguntas reais do seu cargo", "Nota e feedback a cada resposta", "Treine sem limite de tentativas"],
    mock: <InterviewMock />, reverse: true,
  },
  {
    badge: "Score de compatibilidade", icon: Target,
    title: "Descubra seu match antes de se candidatar",
    desc: "Cole a descrição da vaga e veja na hora o quanto você combina — e exatamente o que ajustar para subir suas chances.",
    points: ["Match instantâneo com a vaga", "Pontos fortes e gaps destacados", "Sugestões práticas de ajuste"],
    mock: <ScoreMock />, reverse: false,
  },
  {
    badge: "Busca de vagas", icon: Search,
    title: "As vagas certas chegam até você",
    desc: "Encontre oportunidades compatíveis com seu perfil e acompanhe cada candidatura num painel organizado, sem planilha.",
    points: ["Vagas ranqueadas por compatibilidade", "Acompanhe o status de cada uma", "Filtros avançados por área e local"],
    mock: <JobsMock />, reverse: true,
  },
];

/* -------------------------------- componente ------------------------------ */

export default function Landing() {
  const navigate = useNavigate();
  const goSignup = () => navigate("/signup");
  const goLogin = () => navigate("/login");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ---------------------------------- Header --------------------------------- */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goLogin} className="hidden sm:inline-flex">Entrar</Button>
            <Button size="sm" className={ctaPrimary} onClick={goSignup}>Criar conta grátis</Button>
          </div>
        </div>
      </header>

      {/* ----------------------------------- Hero ---------------------------------- */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-20 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-40 -left-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="secondary" className="gap-1.5 mb-5 py-1.5 px-3">
              <Sparkles className="h-3.5 w-3.5" /> Recolocação profissional com IA
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              A vaga certa não<br className="hidden sm:block" /> espera.{" "}
              <span className="text-gradient">Você também não deveria.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Currículo, LinkedIn, busca de vagas e simulação de entrevista — a IA faz o trabalho pesado
              enquanto você foca no que importa: <strong className="text-foreground">ser chamado.</strong>
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className={`${ctaPrimary} h-12 text-base`} onClick={goSignup}>
                Começar grátis agora <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 text-base transition-transform hover:scale-[1.03] active:scale-95" onClick={goLogin}>
                Já tenho conta
              </Button>
            </div>

            {/* prova social com fotos reais */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                {PEOPLE.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-background" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Profissionais já aceleraram sua busca</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> 7 dias grátis</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Sem cartão para começar</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-success" /> Pronto em minutos</span>
            </div>
          </motion.div>

          {/* mockup animado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }} className="relative">
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass-card rounded-3xl p-5 shadow-2xl border-border/70">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-muted-foreground">Meu Currículo · Vaga Certa</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">JS</div>
                <div className="flex-1">
                  <div className="h-3 w-32 rounded bg-foreground/80 mb-1.5" />
                  <div className="h-2 w-24 rounded bg-muted-foreground/40" />
                </div>
                <Badge className="bg-success/15 text-success border-success/20 gap-1"><TrendingUp className="h-3 w-3" /> 92%</Badge>
              </div>
              <div className="space-y-2.5">
                {[100, 88, 94, 76].map((w, i) => (
                  <motion.div key={i} initial={{ opacity: 0.3, width: "40%" }} animate={{ opacity: 1, width: `${w}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.3, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
                    className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    <div className="h-2.5 rounded bg-muted-foreground/25 flex-1" />
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2.5">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-xs text-primary font-medium">IA otimizando para a vaga…</span>
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }} className="ml-auto flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </motion.span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
              className="absolute -bottom-5 -left-4 sm:-left-8 glass-card rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-success/15 flex items-center justify-center"><MessageSquare className="h-4 w-4 text-success" /></div>
              <div><p className="text-xs font-semibold">Nova entrevista! 🎉</p><p className="text-[11px] text-muted-foreground">há 2 minutos</p></div>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative border-y border-border/60 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-gradient">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------- A dor ---------------------------------- */}
      <section className="max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Você envia dezenas de currículos<br className="hidden md:block" /> e o retorno é…{" "}
            <span className="text-muted-foreground line-through decoration-red-400/70">silêncio.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Não é você. É o material. Recrutadores gastam segundos em cada currículo e robôs descartam os que não falam a língua deles.
            O Vaga Certa resolve isso — do currículo à entrevista.
          </p>
        </motion.div>
      </section>

      {/* ------------------------------ Como funciona ----------------------------- */}
      <section className="max-w-6xl mx-auto px-4 pb-8 md:pb-16">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-14">
          <Badge variant="secondary" className="mb-3">Simples assim</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Do zero à vaga em 3 passos</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <motion.div key={step.n} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative rounded-2xl border border-border bg-card/60 p-7">
              <div className="w-12 h-12 rounded-2xl gradient-primary text-white font-bold text-lg flex items-center justify-center mb-5">{step.n}</div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------------- Features (showcase) -------------------------- */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
          <Badge variant="secondary" className="mb-3">Veja por dentro</Badge>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mx-auto">
            Tudo o que você precisa para ser <span className="text-gradient">chamado</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Não é só um gerador de currículo. É o sistema completo da candidatura à contratação.</p>
        </motion.div>

        <div className="space-y-16 md:space-y-24">
          {SHOWCASE.map((f, i) => (
            <div key={f.badge} className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* texto */}
              <motion.div {...fadeUp} transition={{ duration: 0.5 }} className={f.reverse ? "lg:order-2" : ""}>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-4">
                  <f.icon className="h-3.5 w-3.5" /> {f.badge}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold leading-snug">{f.title}</h3>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed">{f.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-success" />
                      </span>
                      <span className="text-sm text-foreground/90">{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              {/* mockup */}
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className={`relative ${f.reverse ? "lg:order-1" : ""}`}>
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl rounded-3xl" />
                <div className="relative">{f.mock}</div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* faixa "e mais" */}
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mt-16 md:mt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MORE_FEATURES.map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <m.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ------------------------------ Depoimentos ------------------------------- */}
      <section className="max-w-6xl mx-auto px-4 pb-20 md:pb-28">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-14">
          <Badge variant="secondary" className="mb-3">Histórias reais</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">De "sem resposta" para contratado</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col">
              <Quote className="h-7 w-7 text-primary/30 mb-3" />
              <div className="flex items-center gap-0.5 text-amber-400 mb-3">
                {[...Array(5)].map((_, s) => <Star key={s} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border/60">
                <img src={t.photo} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------------------- Planos --------------------------------- */}
      <section className="max-w-6xl mx-auto px-4 pb-20 md:pb-28">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">Preços justos</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Escolha seu ritmo</h2>
          <p className="text-muted-foreground mt-2">Comece grátis. Evolua quando precisar. Cancele quando quiser.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((p, i) => (
            <motion.div key={p.name} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-2xl p-6 flex flex-col ${
                p.highlight ? "bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/40 shadow-xl shadow-primary/10" : "bg-card/60 border border-border"
              }`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 rounded-full gradient-primary text-white shadow-md whitespace-nowrap">Mais popular</span>
              )}
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{p.tagline}</p>
              <div className="mt-3 mb-5">
                <span className="text-3xl font-extrabold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.suffix}</span>
              </div>
              <ul className="space-y-2.5 text-sm flex-1">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{perk}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full mt-6 ${p.highlight ? ctaPrimary : "transition-transform hover:scale-[1.03] active:scale-95"}`}
                variant={p.highlight ? "default" : "outline"} onClick={goSignup}>
                {p.name === "Free" ? "Começar grátis" : "Assinar"}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ----------------------------------- FAQ ---------------------------------- */}
      <section className="max-w-3xl mx-auto px-4 pb-20 md:pb-28">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-10">
          <Badge variant="secondary" className="mb-3">Dúvidas</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Perguntas frequentes</h2>
        </motion.div>
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* -------------------------------- CTA final ------------------------------- */}
      <section className="max-w-5xl mx-auto px-4 pb-20 md:pb-28">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl gradient-primary p-10 md:p-16 text-center text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 -left-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 -right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs mb-5">
              <Zap className="h-3.5 w-3.5" /> Leva menos de 5 minutos
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight max-w-2xl mx-auto">Sua próxima vaga começa hoje</h2>
            <p className="mt-4 text-white/90 max-w-xl mx-auto text-lg">
              Crie sua conta grátis, ganhe 7 dias com todos os recursos de IA e pare de esperar por respostas.
            </p>
            <Button size="lg" className={`${ctaOnColor} mt-8 h-12 text-base`} onClick={goSignup}>
              Criar minha conta grátis <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-4 text-xs text-white/70">Sem cartão · Cancele quando quiser</p>
          </div>
        </motion.div>
      </section>

      {/* --------------------------------- Footer --------------------------------- */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" variant="icon" />
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Vaga Certa — Sua recolocação, acelerada.</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <button onClick={goLogin} className="text-muted-foreground hover:text-foreground transition-colors">Entrar</button>
            <button onClick={goSignup} className="text-muted-foreground hover:text-foreground transition-colors">Criar conta</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
