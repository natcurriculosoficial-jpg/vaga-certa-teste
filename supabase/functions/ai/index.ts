import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build system prompt based on action
    let systemPrompt = "Você é um assistente de carreira profissional brasileiro. Responda sempre em português brasileiro. Seja direto, profissional e objetivo.";
    let userPrompt = "";

    switch (action) {
      case "improve_text":
        systemPrompt = "Você é um especialista em escrita profissional brasileira. Melhore textos para currículos e perfis profissionais.";
        userPrompt = `Melhore o seguinte texto profissional. Torne-o mais impactante, claro e objetivo. Mantenha o tom profissional. Retorne apenas o texto melhorado, sem explicações:\n\n${payload.text}`;
        break;

      case "generate_bullets":
        systemPrompt = "Você é um especialista em currículos profissionais brasileiros. Transforme descrições em bullet points de alto impacto.";
        userPrompt = `Transforme o seguinte texto em bullet points profissionais para currículo${payload.role ? ` para o cargo de ${payload.role}` : ""}. Cada bullet deve seguir a estrutura: Ação + responsabilidade + resultado mensurável. Use verbos de ação no passado. Retorne apenas os bullets, um por linha, começando com "•":\n\n${payload.text}`;
        break;

      case "generate_objective":
        systemPrompt = "Você é um especialista em currículos profissionais brasileiros.";
        userPrompt = `Gere um objetivo profissional direto e sem clichês para um profissional de ${payload.area}, nível ${payload.level}, buscando vaga de ${payload.role}. Máximo 3 linhas. Sem aspas. Apenas o texto.`;
        break;

      case "generate_linkedin_headline":
        systemPrompt = "Você é um especialista em otimização de perfis LinkedIn para o mercado brasileiro.";
        userPrompt = `Crie uma headline profissional para LinkedIn seguindo a fórmula: Cargo + especialidade + diferencial + resultado. Para um profissional de ${payload.area} buscando ${payload.role}. Máximo 120 caracteres. Apenas o texto.`;
        break;

      case "generate_linkedin_about":
        systemPrompt = "Você é um especialista em otimização de perfis LinkedIn para o mercado brasileiro.";
        userPrompt = `Crie um resumo profissional para o LinkedIn de ${payload.name}, profissional de ${payload.area} buscando ${payload.role}. Estrutura: 1) Quem é, 2) O que faz, 3) Resultados, 4) Objetivo. Tom profissional, 3-4 parágrafos. Apenas o texto.`;
        break;

      case "analyze_job_match":
        systemPrompt = "Você é um analista de compatibilidade entre candidatos e vagas no mercado brasileiro.";
        userPrompt = `Analise a compatibilidade entre este currículo e esta vaga. Retorne em formato:\n\nScore: XX%\n\nPontos Fortes:\n• ...\n\nPontos a Melhorar:\n• ...\n\nCurrículo:\n${payload.resume}\n\nVaga:\n${payload.jobDescription}`;
        break;

      case "simulate_interview":
        const context = payload.previousQA ? `\n\nPerguntas e respostas anteriores:\n${payload.previousQA}` : "";
        systemPrompt = 'Você é "Nat IA", uma entrevistadora profissional amigável e direta.';
        userPrompt = `Faça UMA pergunta de entrevista para o cargo de ${payload.role}${payload.company ? ` na empresa ${payload.company}` : ""}. Alterne entre perguntas comportamentais, técnicas e situacionais. Seja natural e amigável. Apenas a pergunta.${context}`;
        break;

      case "evaluate_answer":
        systemPrompt = "Você é um especialista em avaliação de entrevistas profissionais.";
        userPrompt = `Avalie esta resposta de entrevista para ${payload.role}.\n\nPergunta: ${payload.question}\nResposta: ${payload.answer}\n\nRetorne:\nNota: X/10\n\nFeedback: (2-3 frases)\n\nSugestão de melhoria: (1-2 frases com exemplo de resposta melhor)`;
        break;

      case "suggest_skills":
        systemPrompt = "Você é um especialista em desenvolvimento profissional brasileiro.";
        userPrompt = `Liste 10 habilidades mais relevantes para profissionais de ${payload.area}. Divida em:\n\nHard Skills:\n• ...\n\nSoft Skills:\n• ...\n\nApenas a lista.`;
        break;

      case "generate_text":
        userPrompt = payload.prompt;
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Sem resposta da IA.";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI function error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
