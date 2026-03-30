import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { Profile } from "@/hooks/useAuth";

export default function ProfilePage({ user, onUpdate }: { user: Profile; onUpdate: (data: Partial<Profile>) => Promise<void> }) {
  const [name, setName] = useState(user.name || "");
  const [area, setArea] = useState(user.area || "");
  const [targetRole, setTargetRole] = useState(user.target_role || "");
  const [level, setLevel] = useState(user.level || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate({ name, area, target_role: targetRole, level });
      toast({ title: "Perfil atualizado! ✅" });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">👤 Meu Perfil</h1>
      <div className="glass-card p-6 space-y-4">
        <div className="space-y-2"><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} className="bg-muted/50" /></div>
        <div className="space-y-2"><Label>E-mail</Label><Input value={user.email} disabled className="bg-muted/50 opacity-60" /></div>
        <div className="space-y-2"><Label>Área profissional</Label><Input value={area} onChange={e => setArea(e.target.value)} className="bg-muted/50" /></div>
        <div className="space-y-2"><Label>Cargo desejado</Label><Input value={targetRole} onChange={e => setTargetRole(e.target.value)} className="bg-muted/50" /></div>
        <div className="space-y-2"><Label>Nível</Label><Input value={level} onChange={e => setLevel(e.target.value)} className="bg-muted/50" /></div>
        <Button onClick={save} className="w-full" disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
