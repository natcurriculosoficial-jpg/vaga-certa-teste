const GEMINI_API_KEY = "AIzaSyCKJxp3egmjT8Q_xwszwsh2yVO9eYUICo0";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta da IA.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Erro ao processar com IA. Tente novamente.";
  }
}

export async function generateText(prompt: string): Promise<string> {
  return callGemini(prompt);
}

export async function improveText(text: string): Promise<string> {
  return callGemini(
    `Melhore o seguinte texto profissional em português brasileiro. Torne-o mais impactante, claro e objetivo. Mantenha o tom profissional. Retorne apenas o texto melhorado, sem explicações:\n\n${text}`
  );
}

export async function transformToBulletPoints(text: string, role?: string): Promise<string> {
  return callGemini(
    `Transforme o seguinte texto em bullet points profissionais para currículo${role ? ` para o cargo de ${role}` : ""}. Cada bullet deve seguir a estrutura: Ação + responsabilidade + resultado mensurável. Use verbos de ação no passado. Retorne apenas os bullets, um por linha, começando com "•":\n\n${text}`
  );
}

export async function generateObjective(role: string, level: string, area: string): Promise<string> {
  return callGemini(
    `Gere um objetivo profissional direto e sem clichês para um profissional de ${area}, nível ${level}, buscando vaga de ${role}. Máximo 3 linhas. Sem aspas. Apenas o texto.`
  );
}

export async function generateLinkedInHeadline(role: string, area: string): Promise<string> {
  return callGemini(
    `Crie uma headline profissional para LinkedIn seguindo a fórmula: Cargo + especialidade + diferencial + resultado. Para um profissional de ${area} buscando ${role}. Máximo 120 caracteres. Apenas o texto.`
  );
}

export async function generateLinkedInAbout(name: string, role: string, area: string): Promise<string> {
  return callGemini(
    `Crie um resumo profissional para o LinkedIn de ${name}, profissional de ${area} buscando ${role}. Estrutura: 1) Quem é, 2) O que faz, 3) Resultados, 4) Objetivo. Tom profissional, 3-4 parágrafos. Apenas o texto.`
  );
}

export async function analyzeJobMatch(resume: string, jobDescription: string): Promise<string> {
  return callGemini(
    `Analise a compatibilidade entre este currículo e esta vaga. Retorne em formato:\n\nScore: XX%\n\nPontos Fortes:\n• ...\n\nPontos a Melhorar:\n• ...\n\nCurrículo:\n${resume}\n\nVaga:\n${jobDescription}`
  );
}

export async function simulateInterview(role: string, company: string, previousQA?: string): Promise<string> {
  const context = previousQA ? `\n\nPerguntas e respostas anteriores:\n${previousQA}` : "";
  return callGemini(
    `Você é "Nat IA", uma entrevistadora profissional. Faça UMA pergunta de entrevista para o cargo de ${role}${company ? ` na empresa ${company}` : ""}. Alterne entre perguntas comportamentais, técnicas e situacionais. Seja natural e amigável. Apenas a pergunta.${context}`
  );
}

export async function evaluateAnswer(question: string, answer: string, role: string): Promise<string> {
  return callGemini(
    `Avalie esta resposta de entrevista para ${role}.\n\nPergunta: ${question}\nResposta: ${answer}\n\nRetorne:\nNota: X/10\n\nFeedback: (2-3 frases)\n\nSugestão de melhoria: (1-2 frases com exemplo de resposta melhor)`
  );
}

export async function suggestSkills(area: string): Promise<string> {
  return callGemini(
    `Liste 10 habilidades mais relevantes para profissionais de ${area}. Divida em:\n\nHard Skills:\n• ...\n\nSoft Skills:\n• ...\n\nApenas a lista.`
  );
}
