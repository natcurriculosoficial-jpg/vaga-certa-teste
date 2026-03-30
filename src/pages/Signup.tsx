import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SignupProps {
  onSignup: (name: string, email: string, password: string) => Promise<void>;
}

export default function Signup({ onSignup }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Senhas não conferem", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await onSignup(name, email, password);
      toast({ title: "Conta criada com sucesso! 🎉", description: "Verifique seu e-mail para confirmar." });
    } catch (err: any) {
      toast({ title: "Erro ao criar conta", description: err.message, variant: "destructive" });
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
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center">
          <Logo size="lg" />
        </motion.div>
        <p className="text-center text-muted-foreground">Crie sua conta e comece hoje</p>
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 space-y-5 glow-sm"
        >
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <div className="input-glow rounded-xl">
              <Input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required className="bg-muted/30 border-transparent rounded-xl h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <div className="input-glow rounded-xl">
              <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-muted/30 border-transparent rounded-xl h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <div className="input-glow rounded-xl">
              <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="bg-muted/30 border-transparent rounded-xl h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Confirmar senha</Label>
            <div className="input-glow rounded-xl">
              <Input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required className="bg-muted/30 border-transparent rounded-xl h-11" />
            </div>
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
          </Button>
        </motion.form>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <button onClick={() => navigate("/login")} className="text-secondary hover:underline font-medium">Entrar</button>
        </p>
      </motion.div>
    </div>
  );
}
