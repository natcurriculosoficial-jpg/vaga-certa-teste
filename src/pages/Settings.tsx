import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage({ onLogout }: { onLogout: () => Promise<void> }) {
  const handleLogout = async () => {
    await onLogout();
    toast({ title: "Até logo! 👋" });
  };

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">⚙️ Configurações</h1>
      <div className="glass-card p-6 space-y-4">
        <Button variant="outline" className="w-full" onClick={() => toast({ title: "Função disponível em breve" })}>
          Alterar senha
        </Button>
        <Button variant="outline" className="w-full" onClick={() => toast({ title: "Função disponível em breve" })}>
          Notificações
        </Button>
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
