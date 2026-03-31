import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

// Simple Levenshtein distance for deduplication
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
    const params = new URLSearchParams({ name: query, limit: "20" });
    if (location) params.set("cityName", location);

    const res = await fetch(`https://portal.api.gupy.io/api/job?${params}`, {
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.data || []).map((j: any) => ({
      id: `gupy-${j.id}`,
      title: j.name || "Sem título",
      company: j.companyName || j.careerPageName || "Empresa",
      location: j.cityName ? `${j.cityName}${j.stateName ? ` - ${j.stateName}` : ""}` : "Brasil",
      type: j.workplaceType === "remote" ? "Remoto" : j.workplaceType === "hybrid" ? "Híbrido" : "Presencial",
      url: j.jobUrl || `https://portal.gupy.io/job-search/term=${encodeURIComponent(query)}`,
      source: "Gupy",
      description: j.description?.substring(0, 300) || "",
    }));
  } catch (e) {
    console.error("Gupy search error:", e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, location, type } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Search sources in parallel
    const results = await Promise.allSettled([
      searchGupy(query, location),
    ]);

    let allJobs: NormalizedJob[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") allJobs.push(...r.value);
    }

    // Deduplicate
    allJobs = deduplicateJobs(allJobs);

    // Filter by type if specified
    if (type && type !== "all") {
      allJobs = allJobs.filter(j => j.type === type);
    }

    return new Response(JSON.stringify({ jobs: allJobs, total: allJobs.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Search error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
