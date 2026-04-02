import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExternalLink, Sparkles, Loader2, Download, Bell, Search as SearchIcon, Plus, Linkedin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import * as geminiService from "@/services/gemini";
import JobFilterPanel, { type JobFilters, EMPTY_FILTERS, classifyJob, TierBadge, getActiveFilterCount } from "@/components/jobs/JobFilters";
import JobKanban, { type KanbanJob } from "@/components/jobs/JobKanban";
import JobAlertsPanel, { useJobAlerts, AlertBadge } from "@/components/jobs/JobAlerts";
import { Input } from "@/components/ui/input";

const statusLabels: Record<string, string> = {
  saved: "Salvas", applied: "Candidatei", process: "Em análise",
  interview: "Entrevista", offer: "Oferta", archived: "Arquivado",
};

export default function JobRadar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<KanbanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>(() => ({
    query: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "all",
    salary: searchParams.get("salary") || "all",
    regime: searchParams.get("regime") || "all",
  }));

  // External search
  const [extQuery, setExtQuery] = useState("");
  const [extCity, setExtCity] = useState("");
  const [extResults, setExtResults] = useState<any[]>([]);
  const [extLoading, setExtLoading] = useState(false);

  // Match IA
  const [matchResult, setMatchResult] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [jobDesc, setJobDesc] = useState("");

  // Manual job form
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualJob, setManualJob] = useState({ title: "", company: "", location: "", type: "Remoto", url: "" });

  // Alerts
  const { savedSearches, newJobCount, addSearch, removeSearch, clearNew } = useJobAlerts();

  // Persist filters to URL with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.query) params.set("q", filters.query);
      if (filters.city) params.set("city", filters.city);
      if (filters.type !== "all") params.set("type", filters.type);
      if (filters.salary !== "all") params.set("salary", filters.salary);
      if (filters.regime !== "all") params.set("regime", filters.regime);
      setSearchParams(params, { replace: true });
    }, 400);
    return () => clearTimeout(timeout);
  }, [filters, setSearchParams]);

  // Load saved jobs — fixed: always sets loading=false
  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) { setJobs([]); }
          return;
        }

        const { data, error } = await supabase
          .from("saved_jobs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (cancelled) return;

        if (error) {
          console.error("Erro ao carregar vagas:", error);
          toast({ title: "Erro ao carregar vagas", description: error.message, variant: "destructive" });
          setJobs([]);
        } else {
          setJobs((data || []).map(j => ({
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            type: j.type,
            url: j.url,
            notes: j.notes,
            status: j.status,
            created_at: j.created_at,
            updated_at: j.updated_at,
          })));
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadJobs();
    return () => { cancelled = true; };
  }, []);

  // Filter jobs
  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (filters.query && !j.title.toLowerCase().includes(filters.query.toLowerCase()) && !j.company.toLowerCase().includes(filters.query.toLowerCase())) return false;
      if (filters.city && j.location && !j.location.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.type !== "all" && j.type !== filters.type) return false;
      return true;
    }).map(j => ({
      ...j,
      tier: classifyJob(j, filters),
    })).sort((a, b) => {
      const order = { gold: 0, silver: 1, bronze: 2 };
      const ta = a.tier ? order[a.tier as keyof typeof order] : 3;
      const tb = b.tier ? order[b.tier as keyof typeof order] : 3;
      return ta - tb;
    });
  }, [jobs, filters]);

  const moveJob = useCallback(async (id: string, newStatus: string) => {
    setJobs(p => p.map(j => j.id === id ? { ...j, status: newStatus } : j));
    const { error } = await supabase.from("saved_jobs").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast({ title: "Erro ao mover vaga", variant: "destructive" });
    } else {
      toast({ title: `Vaga movida para ${statusLabels[newStatus] || newStatus}` });
    }
  }, []);

  const updateNotes = useCallback(async (id: string, notes: string) => {
    setJobs(p => p.map(j => j.id === id ? { ...j, notes } : j));
    await supabase.from("saved_jobs").update({ notes }).eq("id", id);
    toast({ title: "Notas salvas!" });
  }, []);

  const saveExternalJob = useCallback(async (job: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      url: job.url,
      description: job.description,
      status: "saved",
    }).select().single();

    if (!error && data) {
      setJobs(prev => [{
        id: data.id, title: data.title, company: data.company,
        location: data.location, type: data.type, url: data.url,
        notes: data.notes, status: data.status,
        created_at: data.created_at, updated_at: data.updated_at,
      }, ...prev]);
      toast({ title: "✅ Vaga salva no seu tracker!" });
    }
  }, []);

  const addManualJob = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !manualJob.title || !manualJob.company) return;

    const { data, error } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      ...manualJob,
      status: "saved",
    }).select().single();

    if (!error && data) {
      setJobs(prev => [{
        id: data.id, title: data.title, company: data.company,
        location: data.location, type: data.type, url: data.url,
        notes: data.notes, status: data.status,
        created_at: data.created_at, updated_at: data.updated_at,
      }, ...prev]);
      setShowManualForm(false);
      setManualJob({ title: "", company: "", location: "", type: "Remoto", url: "" });
      toast({ title: "✅ Vaga adicionada ao tracker!" });
    }
  };

  const searchExternal = async () => {
    if (!extQuery) return;
    setExtLoading(true);
    setExtResults([]);
    try {
      const [mainRes, linkedinRes] = await Promise.allSettled([
        supabase.functions.invoke("search-jobs", {
          body: { query: extQuery, location: extCity || undefined },
        }),
        supabase.functions.invoke("search-linkedin-jobs", {
          body: { query: extQuery, location: extCity || "Brasil" },
        }),
      ]);

      let allJobs: any[] = [];

      if (linkedinRes.status === "fulfilled" && linkedinRes.value.data?.jobs) {
        allJobs.push(...linkedinRes.value.data.jobs.map((j: any) => ({ ...j, source: j.source || "LinkedIn" })));
      }
      if (mainRes.status === "fulfilled" && mainRes.value.data?.jobs) {
        allJobs.push(...mainRes.value.data.jobs.map((j: any) => ({ ...j, source: j.source || "Gupy" })));
      }

      setExtResults(allJobs);
      if (allJobs.length === 0) toast({ title: "Nenhuma vaga encontrada para essa busca" });
    } catch {
      toast({ title: "Erro na busca externa", variant: "destructive" });
    }
    setExtLoading(false);
  };

  const analyzeMatch = async () => {
    if (!jobDesc) return;
    setMatchLoading(true);
    const result = await geminiService.analyzeJobMatch("Currículo do usuário (dados do perfil)", jobDesc);
    setMatchResult(result);
    setMatchLoading(false);
  };

  const exportCSV = () => {
    const header = "Título,Empresa,Local,Tipo,Status\n";
    const rows = jobs.map(j => `"${j.title}","${j.company}","${j.location || ""}","${j.type || ""}","${statusLabels[j.status] || j.status}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vagas_vaga_certa.csv"; a.click();
    toast({ title: "CSV exportado! 📊" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🎯 Radar de Vagas</h1>
          <p className="text-muted-foreground text-sm">Encontre, acompanhe e gerencie suas candidaturas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1">
            <Download className="h-3 w-3" /> CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="search">Minhas Vagas</TabsTrigger>
          <TabsTrigger value="external" className="gap-1">
            <SearchIcon className="h-3 w-3" /> Buscar
          </TabsTrigger>
          <TabsTrigger value="tracker">Kanban</TabsTrigger>
          <TabsTrigger value="match">Match IA</TabsTrigger>
          <TabsTrigger value="alerts" className="relative gap-1">
            <Bell className="h-3 w-3" /> Alertas
            <AlertBadge count={newJobCount} />
          </TabsTrigger>
        </TabsList>

        {/* My Jobs with filters */}
        <TabsContent value="search" className="space-y-4 mt-4">
          <JobFilterPanel filters={filters} onChange={setFilters} />

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="glass-card p-8 text-center space-y-4">
                  <div className="text-5xl">🎯</div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Nenhuma vaga no tracker ainda</p>
                    <p className="text-xs text-muted-foreground">
                      Use a aba Buscar para encontrar vagas em sites externos e salvar aqui
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => {
                        const trigger = document.querySelector('[value="external"]') as HTMLElement;
                        trigger?.click();
                      }}
                    >
                      🔍 Buscar vagas
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowManualForm(true)}>
                      <Plus className="h-3 w-3" /> Adicionar manualmente
                    </Button>
                  </div>
                </div>
              )}
              {filtered.map(job => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm">{job.title}</h3>
                      <TierBadge tier={job.tier} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.company} • {job.location}</p>
                    <div className="flex gap-2 mt-1.5">
                      {job.type && <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">{job.type}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Select value={job.status} onValueChange={(v) => moveJob(job.id, v)}>
                      <SelectTrigger className="w-32 text-xs bg-muted/50 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {job.url && (
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                        <a href={job.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Manual job form */}
          {showManualForm && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
              <h3 className="font-semibold text-foreground text-sm">Adicionar vaga manualmente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={manualJob.title}
                  onChange={e => setManualJob(p => ({ ...p, title: e.target.value }))}
                  placeholder="Título da vaga *"
                  className="bg-muted/50"
                />
                <Input
                  value={manualJob.company}
                  onChange={e => setManualJob(p => ({ ...p, company: e.target.value }))}
                  placeholder="Empresa *"
                  className="bg-muted/50"
                />
                <Input
                  value={manualJob.location}
                  onChange={e => setManualJob(p => ({ ...p, location: e.target.value }))}
                  placeholder="Localização (ex: São Paulo - SP)"
                  className="bg-muted/50"
                />
                <Select value={manualJob.type} onValueChange={v => setManualJob(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remoto">Remoto</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={manualJob.url}
                  onChange={e => setManualJob(p => ({ ...p, url: e.target.value }))}
                  placeholder="URL da vaga (opcional)"
                  className="bg-muted/50 md:col-span-2"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addManualJob} disabled={!manualJob.title || !manualJob.company}>
                  Salvar vaga
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowManualForm(false)}>
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* External Search */}
        <TabsContent value="external" className="space-y-4 mt-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">🔍 Buscar vagas em sites externos</h3>
            <p className="text-xs text-muted-foreground">Busca em portais como Gupy, Indeed e outros.</p>
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                value={extQuery}
                onChange={e => setExtQuery(e.target.value)}
                placeholder="Cargo (ex: Desenvolvedor React)"
                className="bg-muted/50"
                onKeyDown={e => e.key === "Enter" && searchExternal()}
              />
              <Input
                value={extCity}
                onChange={e => setExtCity(e.target.value)}
                placeholder="Cidade (opcional)"
                className="bg-muted/50 md:w-48"
                onKeyDown={e => e.key === "Enter" && searchExternal()}
              />
              <Button onClick={searchExternal} disabled={extLoading || !extQuery} className="gap-1">
                {extLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
                Buscar
              </Button>
            </div>
          </div>

          {/* No results feedback */}
          {extResults.length === 0 && !extLoading && extQuery && (
            <div className="glass-card p-5 space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum resultado encontrado para "<span className="text-foreground font-medium">{extQuery}</span>"
              </p>
              <p className="text-xs text-muted-foreground">
                Tente termos mais genéricos como "desenvolvedor", "analista", "gerente"
              </p>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => window.open(
                  `https://br.linkedin.com/jobs/search/?keywords=${encodeURIComponent(extQuery)}&location=${encodeURIComponent(extCity || 'Brasil')}`,
                  '_blank'
                )}
              >
                <Linkedin className="h-3 w-3" /> Ver no LinkedIn
              </Button>
            </div>
          )}

          {extResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{extResults.length} vagas encontradas</p>
              {extResults.map((job: any) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{job.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.company} • {job.location}</p>
                    <div className="flex gap-2 mt-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">{job.type}</span>
                      {job.source === "LinkedIn" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 border border-sky-500/20">LinkedIn</span>
                      )}
                      {job.source === "Gupy" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Gupy</span>
                      )}
                      {job.source !== "LinkedIn" && job.source !== "Gupy" && job.source && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{job.source}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => saveExternalJob(job)}>
                      <Plus className="h-3 w-3" /> Salvar
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                      <a href={job.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Kanban */}
        <TabsContent value="tracker" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground space-y-2">
              <p>Nenhuma vaga no tracker ainda</p>
              <p className="text-xs">Busque vagas na aba "Buscar" e salve para acompanhar aqui</p>
            </div>
          ) : (
            <JobKanban jobs={jobs} onMoveJob={moveJob} onUpdateNotes={updateNotes} />
          )}
        </TabsContent>

        {/* Match IA */}
        <TabsContent value="match" className="mt-4 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Analisar compatibilidade com IA</h3>
            <Textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Cole a descrição da vaga aqui..."
              className="bg-muted/50 min-h-[150px]"
            />
            <Button onClick={analyzeMatch} disabled={matchLoading || !jobDesc}>
              {matchLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Analisar compatibilidade
            </Button>
            {matchResult && (
              <div className="glass-card p-4 whitespace-pre-line text-sm text-foreground">{matchResult}</div>
            )}
          </div>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="mt-4">
          <JobAlertsPanel
            savedSearches={savedSearches}
            onAdd={addSearch}
            onRemove={removeSearch}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
