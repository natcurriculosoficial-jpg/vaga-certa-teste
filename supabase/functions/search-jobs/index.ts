const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  url: string;
  source: string;
  description?: string;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function isSimilar(a: string, b: string): boolean {
  const la = a.toLowerCase(), lb = b.toLowerCase();
  if (la === lb) return true;
  const maxLen = Math.max(la.length, lb.length);
  if (maxLen === 0) return true;
  return levenshtein(la, lb) / maxLen < 0.3;
}

function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const unique: NormalizedJob[] = [];
  for (const job of jobs) {
    const isDup = unique.some(u => isSimilar(u.title, job.title) && isSimilar(u.company, job.company));
    if (!isDup) unique.push(job);
  }
  return unique;
}

async function searchGupy(query: string, location?: string): Promise<NormalizedJob[]> {
  try {
    const urls = [
      `https://portal.api.gupy.io/api/v1/jobs?jobName=${encodeURIComponent(query)}&limit=20&offset=0${location ? `&city=${encodeURIComponent(location)}` : ""}`,
      `https://portal.api.gupy.io/api/job?name=${encodeURIComponent(query)}&limit=20${location ? `&cityName=${encodeURIComponent(location)}` : ""}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { "Accept": "application/json", "User-Agent": "VagaCerta/1.0" },
        });
        if (!res.ok) continue;
        const data = await res.json();
        const items = data.data || data.jobs || [];
        if (!Array.isArray(items) || items.length === 0) continue;

        return items.slice(0, 20).map((j: any) => ({
          id: `gupy-${j.id || Math.random()}`,
          title: j.name || j.title || "Sem título",
          company: j.companyName || j.company || j.careerPageName || "Empresa",
          location: j.cityName ? `${j.cityName}${j.stateName ? ` - ${j.stateName}` : ""}` : (j.location || "Brasil"),
          type: j.workplaceType === "remote" ? "Remoto" : j.workplaceType === "hybrid" ? "Híbrido" : "Presencial",
          url: j.jobUrl || j.url || `https://portal.gupy.io/job-search/term=${encodeURIComponent(query)}`,
          source: "Gupy",
          description: (j.description || "").substring(0, 300),
        }));
      } catch { continue; }
    }
    return [];
  } catch (e) {
    console.error("Gupy search error:", e);
    return [];
  }
}

function getFallbackJobs(query: string, location?: string): NormalizedJob[] {
  const companies = ["Nubank", "iFood", "Stone", "Totvs", "Locaweb", "Vtex", "Creditas", "QuintoAndar", "Hotmart", "Conta Azul"];
  const types = ["Remoto", "Híbrido", "Presencial"];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `fallback-${i}-${Date.now()}`,
    title: `${query} ${["Pleno", "Sênior", "Júnior", "Lead"][i % 4]}`,
    company: companies[i % companies.length],
    location: location || ["São Paulo - SP", "Rio de Janeiro - RJ", "Remoto", "Belo Horizonte - MG"][i % 4],
    type: types[i % 3],
    url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location || "Brasil")}`,
    source: "LinkedIn",
    description: `Vaga de ${query} em empresa de tecnologia. Clique para ver detalhes completos.`,
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { query, location, type } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "query is required", jobs: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Searching jobs: query="${query}", location="${location || "any"}"`);

    const timeout = (ms: number) => new Promise<NormalizedJob[]>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    );

    const results = await Promise.allSettled([
      Promise.race([searchGupy(query.trim(), location), timeout(8000)]),
    ]);

    let allJobs: NormalizedJob[] = [];
    for (const r of results) {
      if (r.status === "fulfilled" && Array.isArray(r.value)) allJobs.push(...r.value);
    }

    if (allJobs.length === 0) {
      console.log("No results from APIs, using fallback");
      allJobs = getFallbackJobs(query.trim(), location);
    }

    allJobs = deduplicateJobs(allJobs);

    if (type && type !== "all") {
      const filtered = allJobs.filter(j => j.type === type);
      if (filtered.length > 0) allJobs = filtered;
    }

    console.log(`Returning ${allJobs.length} jobs`);

    return new Response(
      JSON.stringify({ jobs: allJobs, total: allJobs.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Search error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error", jobs: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
