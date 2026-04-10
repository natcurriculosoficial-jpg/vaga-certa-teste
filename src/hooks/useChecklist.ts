import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ChecklistItem {
  key: string;
  emoji: string;
  title: string;
  description: string;
  actionPath: string;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: "watch_tutorials", emoji: "🎓", title: "Assistir as aulas tutoriais", description: "Acesse a Área de Membros e assista os tutoriais do app", actionPath: "/members" },
  { key: "fill_personal_profile", emoji: "👤", title: "Preencher dados pessoais", description: "Complete seu nome, telefone, cidade e foto de perfil", actionPath: "/settings" },
  { key: "explore_features", emoji: "🧭", title: "Conhecer todas as funcionalidades", description: "Visite ao menos uma vez cada seção do app", actionPath: "/dashboard" },
  { key: "fill_resume", emoji: "📄", title: "Preencher o Currículo no app", description: "Complete todas as seções da sua página de Currículo", actionPath: "/resume" },
  { key: "fill_linkedin", emoji: "💼", title: "Otimizar seu LinkedIn", description: "Preencha ou gere com IA as informações na página LinkedIn", actionPath: "/linkedin" },
  { key: "search_jobs", emoji: "🔍", title: "Buscar Vagas no Radar", description: "Explore vagas na página Radar de Vagas", actionPath: "/job-radar" },
  { key: "apply_10_jobs", emoji: "🎯", title: "Se candidatar a pelo menos 10 vagas", description: "Candidate-se a 10 oportunidades usando o Radar de Vagas", actionPath: "/job-radar" },
  { key: "simulate_interview", emoji: "🎤", title: "Simular uma entrevista", description: "Faça ao menos uma simulação de entrevista com IA", actionPath: "/interview" },
  { key: "apply_daily", emoji: "📅", title: "Candidatar-se diariamente", description: "Meta: 1 a 3 vagas por dia para acelerar sua recolocação", actionPath: "/job-radar" },
  { key: "engage_community", emoji: "🤝", title: "Interagir na Comunidade", description: "Participe da comunidade — encontre vagas e indicações", actionPath: "/community" },
];

export function useChecklist() {
  const { session } = useAuth();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  const fetchProgress = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("checklist_progress")
      .select("item_key, completed")
      .eq("user_id", userId);
    const map: Record<string, boolean> = {};
    data?.forEach(r => { if (r.completed) map[r.item_key] = true; });
    setCompleted(map);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const toggle = useCallback(async (itemKey: string) => {
    if (!userId) return;
    const isCompleted = completed[itemKey];
    
    if (isCompleted) {
      await supabase.from("checklist_progress")
        .delete()
        .eq("user_id", userId)
        .eq("item_key", itemKey);
      setCompleted(p => { const n = { ...p }; delete n[itemKey]; return n; });
    } else {
      await supabase.from("checklist_progress")
        .upsert({ user_id: userId, item_key: itemKey, completed: true, completed_at: new Date().toISOString() });
      setCompleted(p => ({ ...p, [itemKey]: true }));
    }
  }, [userId, completed]);

  const completedCount = Object.keys(completed).length;
  const total = CHECKLIST_ITEMS.length;
  const percentage = Math.round((completedCount / total) * 100);

  return { items: CHECKLIST_ITEMS, completed, loading, toggle, completedCount, total, percentage };
}
