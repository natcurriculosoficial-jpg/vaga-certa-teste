import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex justify-center"><Logo size="lg" /></div>
        <p className="text-center text-muted-foreground">Crie sua conta e comece hoje</p>
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Confirmar senha</Label>
            <Input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required className="bg-muted/50" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <button onClick={() => navigate("/login")} className="text-secondary hover:underline font-medium">Entrar</button>
        </p>
      </div>
    </div>
  );
}
