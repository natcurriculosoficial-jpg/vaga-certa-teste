import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, Linkedin, Search, MessageSquare, Check, ArrowRight,
  Sparkles, Star, Zap, Target, ShieldCheck, Clock, TrendingUp,
  FileCheck2, Bot, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import Logo from "@/components/Logo";

/* ---------------------------------- dados --------------------------------- */

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

const FEATURES = [
  { icon: FileText, color: "from-violet-500 to-purple-600", title: "Currículo que passa no filtro", desc: "Bullets de impacto gerados por IA, no formato que os recrutadores (e os robôs de triagem) querem ver." },
  { icon: Linkedin, color: "from-blue-500 to-cyan-500", title: "LinkedIn magnético", desc: "Headline e resumo escritos para aparecer nas buscas e atrair recrutadores até você." },
  { icon: Search, color: "from-emerald-500 to-green-600", title: "As vagas certas, sem garimpo", desc: "Encontre oportunidades compatíveis com seu perfil e organize suas candidaturas num só lugar." },
  { icon: MessageSquare, color: "from-orange-500 to-amber-500", title: "Simulador de entrevista", desc: "Treine com a Nat IA, receba perguntas reais e feedback honesto antes de encarar o recrutador." },
  { icon: Target, color: "from-pink-500 to-rose-500", title: "Score de compatibilidade", desc: "Cole a vaga e descubra na hora seu match — e o que ajustar para aumentar suas chances." },
  { icon: FileCheck2, color: "from-indigo-500 to-blue-600", title: "Export profissional", desc: "Baixe em PDF ou DOCX, com layout limpo e sem marca d'água nos planos superiores." },
];

const TESTIMONIALS = [
  { name: "Camila R.", role: "Contratada como Analista de RH", text: "Fiz o currículo em 10 minutos e em duas semanas já tinha 3 entrevistas marcadas. O simulador me deu uma confiança que eu não tinha.", initials: "CR", color: "from-violet-500 to-purple-600" },
  { name: "Diego M.", role: "Voltou ao mercado como Dev Pleno", text: "Estava desempregado há 5 meses. O score de compatibilidade mudou meu jogo — parei de atirar pra todo lado e comecei a acertar.", initials: "DM", color: "from-blue-500 to-cyan-500" },
  { name: "Patrícia L.", role: "Migrou de carreira para UX", text: "O LinkedIn otimizado pela IA fez recrutadores me chamarem. Nunca imaginei que a mudança de área seria tão rápida.", initials: "PL", color: "from-pink-500 to-rose-500" },
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
            <Button size="sm" className="gradient-primary text-white btn-glow" onClick={goSignup}>
              Criar conta grátis
            </Button>
          </div>
        </div>
      </header>

      {/* ----------------------------------- Hero ---------------------------------- */}
      <section className="relative">
        {/* blobs decorativos */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-20 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-40 -left-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          {/* copy */}
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
              <Button size="lg" className="gradient-primary text-white btn-glow gap-2 h-12 text-base" onClick={goSignup}>
                Começar grátis agora <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 text-base" onClick={goLogin}>
                Já tenho conta
              </Button>
            </div>

            {/* prova social */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {["from-violet-500 to-purple-600", "from-blue-500 to-cyan-500", "from-emerald-500 to-green-600", "from-pink-500 to-rose-500"].map((c, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full bg-gradient-to-br ${c} border-2 border-background`} />
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
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass-card rounded-3xl p-5 shadow-2xl border-border/70"
            >
              {/* barra do "app" */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-muted-foreground">Meu Currículo · Vaga Certa</span>
              </div>

              {/* header do currículo */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">JS</div>
                <div className="flex-1">
                  <div className="h-3 w-32 rounded bg-foreground/80 mb-1.5" />
                  <div className="h-2 w-24 rounded bg-muted-foreground/40" />
                </div>
                <Badge className="bg-success/15 text-success border-success/20 gap-1">
                  <TrendingUp className="h-3 w-3" /> 92%
                </Badge>
              </div>

              {/* bullets sendo "gerados" */}
              <div className="space-y-2.5">
                {[100, 88, 94, 76].map((w, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3, width: "40%" }}
                    animate={{ opacity: 1, width: `${w}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.3, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    <div className="h-2.5 rounded bg-muted-foreground/25 flex-1" />
                  </motion.div>
                ))}
              </div>

              {/* rodapé IA */}
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2.5">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-xs text-primary font-medium">IA otimizando para a vaga…</span>
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }} className="ml-auto flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </motion.span>
              </div>
            </motion.div>

            {/* card flutuante de notificação */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-5 -left-4 sm:-left-8 glass-card rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-success/15 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs font-semibold">Nova entrevista! 🎉</p>
                <p className="text-[11px] text-muted-foreground">há 2 minutos</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* barra de stats */}
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
        <div className="grid md:grid-cols-3 gap-6 relative">
          {STEPS.map((step, i) => (
            <motion.div key={step.n} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative rounded-2xl border border-border bg-card/60 p-7">
              <div className="w-12 h-12 rounded-2xl gradient-primary text-white font-bold text-lg flex items-center justify-center mb-5">
                {step.n}
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* -------------------------------- Features -------------------------------- */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-14">
          <Badge variant="secondary" className="mb-3">Tudo num só lugar</Badge>
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mx-auto">
            Um arsenal completo para a sua recolocação
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp} transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group rounded-2xl border border-border bg-card/60 p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ----------------------------- Destaque Nat IA ---------------------------- */}
      <section className="max-w-6xl mx-auto px-4 pb-20 md:pb-28">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl gradient-primary text-white p-8 md:p-14">
          <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-white/30 gap-1.5 mb-4">
                <Bot className="h-3.5 w-3.5" /> Conheça a Nat IA
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Chegue na entrevista sabendo o que vão te perguntar
              </h2>
              <p className="mt-4 text-white/90 text-lg">
                A Nat IA simula entrevistas reais da sua área, avalia suas respostas e te diz exatamente
                onde melhorar. É como treinar com um recrutador — quantas vezes quiser.
              </p>
              <Button size="lg" variant="secondary" className="mt-7 gap-2" onClick={goSignup}>
                Treinar de graça <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { who: "Nat IA", text: "Conte sobre um desafio que você superou no trabalho.", me: false },
                { who: "Você", text: "Reduzi o tempo de entrega em 30% reorganizando o fluxo da equipe…", me: true },
                { who: "Nat IA", text: "Ótimo exemplo! Nota 9/10. Reforce o resultado com um número logo no início. 💡", me: false },
              ].map((m, i) => (
                <motion.div key={i} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.15 }}
                  className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] ${m.me ? "bg-white/20 ml-auto" : "bg-white/95 text-foreground"}`}>
                  <p className={`text-[11px] font-semibold mb-1 ${m.me ? "text-white/80" : "text-primary"}`}>{m.who}</p>
                  {m.text}
                </motion.div>
              ))}
            </div>
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
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.initials}
                </div>
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
                p.highlight
                  ? "bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/40 shadow-xl shadow-primary/10"
                  : "bg-card/60 border border-border"
              }`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 rounded-full gradient-primary text-white shadow-md whitespace-nowrap">
                  Mais popular
                </span>
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
                className={`w-full mt-6 ${p.highlight ? "gradient-primary text-white btn-glow" : ""}`}
                variant={p.highlight ? "default" : "outline"}
                onClick={goSignup}
              >
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
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight max-w-2xl mx-auto">
              Sua próxima vaga começa hoje
            </h2>
            <p className="mt-4 text-white/90 max-w-xl mx-auto text-lg">
              Crie sua conta grátis, ganhe 7 dias com todos os recursos de IA e pare de esperar por respostas.
            </p>
            <Button size="lg" variant="secondary" className="mt-8 h-12 text-base gap-2" onClick={goSignup}>
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
