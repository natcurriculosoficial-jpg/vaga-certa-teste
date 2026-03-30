import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, ExternalLink, Sparkles, Loader2, GripVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import * as geminiService from "@/services/gemini";

interface Job {
  id: string; title: string; company: string; location: string; type: string; source: string; url: string;
  status: "saved" | "applied" | "process" | "interview" | "rejected";
}

const sampleJobs: Job[] = [
  { id: "1", title: "Analista de Marketing Digital", company: "TechCorp", location: "São Paulo", type: "Remoto", source: "LinkedIn", url: "#", status: "saved" },
  { id: "2", title: "Desenvolvedor Full Stack", company: "StartupXYZ", location: "Rio de Janeiro", type: "Híbrido", source: "Indeed", url: "#", status: "saved" },
  { id: "3", title: "Product Manager", company: "InovaTech", location: "Curitiba", type: "Presencial", source: "Catho", url: "#", status: "applied" },
  { id: "4", title: "UX Designer Sênior", company: "DesignLab", location: "Florianópolis", type: "Remoto", source: "LinkedIn", url: "#", status: "process" },
  { id: "5", title: "Data Analyst", company: "DataDriven", location: "Belo Horizonte", type: "Remoto", source: "Indeed", url: "#", status: "saved" },
];

const statusLabels: Record<string, string> = {
  saved: "Salvas", applied: "Aplicadas", process: "Em processo", interview: "Entrevista", rejected: "Rejeitadas"
};
const statusColors: Record<string, string> = {
  saved: "border-secondary/30 bg-secondary/5", applied: "border-primary/30 bg-primary/5",
  process: "border-warning/30 bg-warning/5", interview: "border-success/30 bg-success/5",
  rejected: "border-destructive/30 bg-destructive/5"
};

export default function JobRadar() {
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [matchResult, setMatchResult] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [jobDesc, setJobDesc] = useState("");

  const filtered = jobs.filter(j =>
    (j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === "all" || j.type === typeFilter)
  );

  const moveJob = (id: string, newStatus: Job["status"]) => {
    setJobs(p => p.map(j => j.id === id ? { ...j, status: newStatus } : j));
    toast({ title: `Vaga movida para ${statusLabels[newStatus]}` });
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
    const rows = jobs.map(j => `${j.title},${j.company},${j.location},${j.type},${statusLabels[j.status]}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vagas_vaga_certa.csv"; a.click();
    toast({ title: "CSV exportado! 📊" });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🎯 Radar de Vagas</h1>
          <p className="text-muted-foreground">Encontre e acompanhe suas candidaturas</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>Exportar CSV</Button>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="search">Buscar</TabsTrigger>
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
          <TabsTrigger value="match">Match IA</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cargo ou empresa..." className="pl-10 bg-muted/50" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40 bg-muted/50"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Remoto">Remoto</SelectItem>
                <SelectItem value="Presencial">Presencial</SelectItem>
                <SelectItem value="Híbrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            {filtered.length === 0 && <div className="glass-card p-8 text-center text-muted-foreground">Nenhuma vaga encontrada</div>}
            {filtered.map(job => (
              <div key={job.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">{job.type}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">{job.source}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={job.status} onValueChange={(v) => moveJob(job.id, v as Job["status"])}>
                    <SelectTrigger className="w-32 text-xs bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" asChild>
                    <a href={job.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracker" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {(Object.keys(statusLabels) as Array<Job["status"]>).map(status => (
              <div key={status} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <GripVertical className="h-3 w-3" /> {statusLabels[status]} ({jobs.filter(j => j.status === status).length})
                </h3>
                <div className="space-y-2 min-h-[100px]">
                  {jobs.filter(j => j.status === status).map(job => (
                    <div key={job.id} className={`p-3 rounded-lg border ${statusColors[status]}`}>
                      <p className="text-xs font-medium text-foreground">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="match" className="mt-4 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Analisar compatibilidade com IA</h3>
            <Textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Cole a descrição da vaga aqui..." className="bg-muted/50 min-h-[150px]" />
            <Button onClick={analyzeMatch} disabled={matchLoading || !jobDesc}>
              {matchLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Analisar compatibilidade
            </Button>
            {matchResult && (
              <div className="glass-card p-4 whitespace-pre-line text-sm text-foreground">{matchResult}</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
