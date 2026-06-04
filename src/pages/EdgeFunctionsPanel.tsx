import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Play, Server } from "lucide-react";
import { invokeEdgeFunction, EdgeInvokeResult } from "@/lib/edgeFunctions";

type FnDef = {
  name: string;
  description: string;
  defaultBody: string;
  expected: "deployed" | "pending";
};

const FUNCTIONS: FnDef[] = [
  {
    name: "ai-vagacerta",
    description: "Gera/melhora textos com IA (currículo, LinkedIn, entrevista).",
    defaultBody: JSON.stringify({ prompt: "ping" }, null, 2),
    expected: "deployed",
  },
  {
    name: "create-checkout",
    description: "Cria sessão de checkout (Stripe) para upgrade de plano.",
    defaultBody: JSON.stringify({ plan: "candidato" }, null, 2),
    expected: "deployed",
  },
  {
    name: "create-pix-charge",
    description: "Gera cobrança PIX para pagamento de plano.",
    defaultBody: JSON.stringify({ plan: "candidato", amount: 100 }, null, 2),
    expected: "deployed",
  },
  {
    name: "search-jobs",
    description: "Busca vagas em fontes externas. (Pendente de deploy)",
    defaultBody: JSON.stringify({ query: "desenvolvedor", location: "Remoto" }, null, 2),
    expected: "pending",
  },
  {
    name: "search-linkedin-jobs",
    description: "Busca vagas no LinkedIn. (Pendente de deploy)",
    defaultBody: JSON.stringify({ query: "desenvolvedor" }, null, 2),
    expected: "pending",
  },
];

type RowState = {
  loading: boolean;
  body: string;
  result: EdgeInvokeResult | null;
};

export default function EdgeFunctionsPanel() {
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      FUNCTIONS.map((f) => [f.name, { loading: false, body: f.defaultBody, result: null }])
    )
  );

  const update = (name: string, patch: Partial<RowState>) =>
    setRows((p) => ({ ...p, [name]: { ...p[name], ...patch } }));

  const runOne = async (fn: FnDef) => {
    update(fn.name, { loading: true, result: null });
    let parsed: unknown = undefined;
    try {
      parsed = JSON.parse(rows[fn.name].body || "{}");
    } catch {
      update(fn.name, {
        loading: false,
        result: {
          ok: false,
          data: null,
          error: "JSON inválido no corpo da requisição.",
          status: null,
          notDeployed: false,
        },
      });
      return;
    }
    const result = await invokeEdgeFunction(fn.name, { body: parsed });
    update(fn.name, { loading: false, result });
  };

  const runAll = async () => {
    for (const fn of FUNCTIONS) await runOne(fn);
  };

  const statusBadge = (fn: FnDef, r: RowState) => {
    if (r.loading)
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Testando
        </Badge>
      );
    if (!r.result)
      return (
        <Badge variant="outline" className={fn.expected === "pending" ? "border-amber-500/40 text-amber-600" : ""}>
          {fn.expected === "pending" ? "Pendente deploy" : "Não testado"}
        </Badge>
      );
    if (r.result.ok)
      return (
        <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" /> OK
        </Badge>
      );
    if (r.result.notDeployed)
      return (
        <Badge className="gap-1 bg-amber-500/15 text-amber-600 hover:bg-amber-500/20">
          <AlertTriangle className="h-3 w-3" /> Não publicada
        </Badge>
      );
    return (
      <Badge className="gap-1 bg-red-500/15 text-red-600 hover:bg-red-500/20">
        <XCircle className="h-3 w-3" /> Erro {r.result.status ?? ""}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 text-white">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-medium mb-3">
            <Server className="h-3.5 w-3.5" /> Diagnóstico
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Edge Functions</h1>
          <p className="text-white/85 text-sm md:text-base">
            Verifique o status e teste manualmente cada função do backend.
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="flex justify-end">
        <Button onClick={runAll}>
          <Play className="h-4 w-4 mr-1" /> Testar todas
        </Button>
      </div>

      <div className="space-y-4">
        {FUNCTIONS.map((fn) => {
          const r = rows[fn.name];
          return (
            <Card key={fn.name} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm font-semibold">{fn.name}</code>
                    {statusBadge(fn, r)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{fn.description}</p>
                </div>
                <Button size="sm" onClick={() => runOne(fn)} disabled={r.loading}>
                  {r.loading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Play className="h-3 w-3 mr-1" />
                  )}
                  Testar
                </Button>
              </div>

              <Textarea
                value={r.body}
                onChange={(e) => update(fn.name, { body: e.target.value })}
                className="font-mono text-xs min-h-[80px] bg-muted/40"
                spellCheck={false}
              />

              {r.result && (
                <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-2">
                  {r.result.ok ? (
                    <>
                      <div className="text-emerald-600 font-medium">Resposta:</div>
                      <pre className="overflow-auto max-h-60 whitespace-pre-wrap">
                        {JSON.stringify(r.result.data, null, 2)}
                      </pre>
                    </>
                  ) : (
                    <>
                      <div className={`font-medium ${r.result.notDeployed ? "text-amber-600" : "text-red-600"}`}>
                        {r.result.notDeployed ? "Função não publicada" : `Erro${r.result.status ? ` (${r.result.status})` : ""}`}
                      </div>
                      <div>{r.result.error}</div>
                      {r.result.notDeployed && (
                        <div className="text-muted-foreground">
                          Como resolver: faça o deploy da função <code>{fn.name}</code> no seu
                          Supabase (Edge Functions → Deploy) e configure os secrets necessários.
                          Depois clique em "Testar" novamente.
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
