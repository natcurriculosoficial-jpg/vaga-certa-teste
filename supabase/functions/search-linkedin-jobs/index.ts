const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, location } = await req.json().catch(() => ({ query: "", location: "" }));

    if (!query) {
      return new Response(JSON.stringify({ jobs: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const encodedQuery = encodeURIComponent(query);
    const encodedLocation = encodeURIComponent(location || "Brasil");

    const linkedinUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodedQuery}&location=${encodedLocation}&start=0&count=15`;

    let jobs: any[] = [];

    try {
      const response = await fetch(linkedinUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; JobSearchBot/1.0)",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
      });

      if (response.ok) {
        const html = await response.text();
        jobs = parseLinkedInJobs(html, query, location);
      }
    } catch (e) {
      console.error("LinkedIn fetch error:", e);
    }

    if (jobs.length === 0) {
      jobs = generateFallbackJobs(query, location);
    }

    return new Response(JSON.stringify({ jobs, source: jobs[0]?.source || "fallback" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("LinkedIn search error:", error);
    return new Response(JSON.stringify({ jobs: [], error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function parseLinkedInJobs(html: string, query: string, location: string) {
  const jobs: any[] = [];
  const titlePattern = /<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/g;
  const companyPattern = /<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/h4>/g;
  const locationPattern = /<span[^>]*class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/g;
  const linkPattern = /<a[^>]*class="[^"]*base-card__full-link[^"]*"[^>]*href="([^"]+)"/g;

  const titles: string[] = [];
  const companies: string[] = [];
  const locations: string[] = [];
  const links: string[] = [];

  let m;
  while ((m = titlePattern.exec(html)) !== null) titles.push(m[1].replace(/<[^>]+>/g, "").trim());
  while ((m = companyPattern.exec(html)) !== null) companies.push(m[1].replace(/<[^>]+>/g, "").trim());
  while ((m = locationPattern.exec(html)) !== null) locations.push(m[1].replace(/<[^>]+>/g, "").trim());
  while ((m = linkPattern.exec(html)) !== null) links.push(m[1].split("?")[0]);

  const count = Math.min(titles.length, companies.length, 10);
  for (let i = 0; i < count; i++) {
    if (titles[i] && companies[i]) {
      jobs.push({
        id: `li_${i}_${Date.now()}`,
        title: titles[i],
        company: companies[i],
        location: locations[i] || location || "Brasil",
        type: "A verificar",
        url: links[i] || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location || "Brasil")}`,
        source: "LinkedIn",
      });
    }
  }

  return jobs;
}

function generateFallbackJobs(query: string, location: string) {
  return [{
    id: `li_fallback_${Date.now()}`,
    title: query,
    company: "Ver no LinkedIn",
    location: location || "Brasil",
    type: "Remoto/Presencial",
    url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location || "Brasil")}`,
    source: "LinkedIn",
  }];
}
