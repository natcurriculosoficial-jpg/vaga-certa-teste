import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, User, Eye, EyeOff, Phone,
  Loader2, Sparkles, Check, X, Shield, MailCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const PW_RULES = [
  { id: "len", label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "Uma letra maiúscula (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "Um número (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { id: "symbol", label: "Um símbolo (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwRules = PW_RULES.map(r => ({ ...r, ok: r.test(password) }));
  const pwStrong = pwRules.every(r => r.ok);
  const pwMatch = password === confirm && confirm.length > 0;

  const goStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: "Preencha nome e e-mail", variant: "destructive" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({ title: "E-mail inválido", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwStrong) {
      toast({ title: "Sua senha não atende todos os requisitos", variant: "destructive" });
      return;
    }
    if (!pwMatch) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password, phone || undefined);
      toast({
        title: "✅ Conta criada com sucesso!",
        description: "Verifique seu e-mail e clique no link de confirmação para ativar sua conta.",
        duration: 8000,
      });
      setStep(3);
    } catch (err: any) {
      const msg = err.message?.includes("already registered")
        ? "Este e-mail já está cadastrado"
        : err.message || "Erro ao criar conta";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {step === 3 ? "Verifique seu e-mail" : "Criar conta gratuita"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {step === 1 ? "Seus dados básicos" : step === 2 ? "Defina uma senha segura" : "Quase lá!"}
          </p>
          {step < 3 && (
            <div className="flex gap-2 justify-center pt-1">
              {[1, 2].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? "w-8 bg-primary" : "w-4 bg-muted"}`} />
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 space-y-5 glow-sm"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <form onSubmit={goStep2} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" className="pl-10 bg-muted/40" autoComplete="name" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="pl-10 bg-muted/40" autoComplete="email" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Telefone / WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                        placeholder="(11) 99999-9999"
                        className="pl-10 bg-muted/40"
                        autoComplete="tel"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Opcional — para notificações de vagas</p>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-white font-medium">
                    Continuar
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Crie uma senha forte"
                        className="pl-10 pr-10 bg-muted/40"
                        autoComplete="new-password"
                        required
                      />
                      <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {password.length > 0 && (
                    <div className="space-y-1.5 pl-1">
                      {pwRules.map(r => (
                        <div key={r.id} className="flex items-center gap-2">
                          {r.ok
                            ? <Check className="h-3.5 w-3.5 text-green-500" />
                            : <X className="h-3.5 w-3.5 text-muted-foreground/50" />}
                          <span className={`text-xs ${r.ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                            {r.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPw ? "text" : "password"}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Repita a senha"
                        className="pl-10 pr-10 bg-muted/40"
                        autoComplete="new-password"
                        required
                      />
                      {confirm.length > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {pwMatch ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                        </span>
                      )}
                    </div>
                    {confirm.length > 0 && !pwMatch && (
                      <p className="text-xs text-red-500">As senhas não coincidem</p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Seus dados são criptografados e protegidos
                  </p>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setStep(1)}>
                      Voltar
                    </Button>
                    <Button type="submit" className="flex-1 h-11 rounded-xl gradient-primary text-white font-medium" disabled={loading || !pwStrong || !pwMatch}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Criar conta
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MailCheck className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Verifique seu e-mail</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enviamos um link de confirmação para <span className="font-medium text-foreground">{email}</span>. Clique no link para ativar sua conta e entrar.
                </p>
                <Button onClick={() => navigate("/login")} className="w-full h-11 rounded-xl gradient-primary text-white font-medium">
                  Ir para o login
                </Button>
                <p className="text-xs text-muted-foreground">Não recebeu? Verifique a pasta de spam.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 3 && (
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">Entrar</Link>
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
