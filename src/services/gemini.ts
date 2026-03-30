import { supabase } from "@/integrations/supabase/client";

async function callAI(action: string, payload: Record<string, any>): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("ai", {
      body: { action, payload },
    });

    if (error) {
      console.error("AI function error:", error);
      return "Erro ao processar com IA. Tente novamente.";
    }

    if (data?.error) {
      console.error("AI response error:", data.error);
      return data.error;
    }

    return data?.text || "Sem resposta da IA.";
  } catch (error) {
    console.error("AI call error:", error);
    return "Erro ao processar com IA. Tente novamente.";
  }
}

export async function generateText(prompt: string): Promise<string> {
  return callAI("generate_text", { prompt });
}

export async function improveText(text: string): Promise<string> {
  return callAI("improve_text", { text });
}

export async function transformToBulletPoints(text: string, role?: string): Promise<string> {
  return callAI("generate_bullets", { text, role });
}

export async function generateObjective(role: string, level: string, area: string): Promise<string> {
  return callAI("generate_objective", { role, level, area });
}

export async function generateLinkedInHeadline(role: string, area: string): Promise<string> {
  return callAI("generate_linkedin_headline", { role, area });
}

export async function generateLinkedInAbout(name: string, role: string, area: string): Promise<string> {
  return callAI("generate_linkedin_about", { name, role, area });
}

export async function analyzeJobMatch(resume: string, jobDescription: string): Promise<string> {
  return callAI("analyze_job_match", { resume, jobDescription });
}

export async function simulateInterview(role: string, company: string, previousQA?: string): Promise<string> {
  return callAI("simulate_interview", { role, company, previousQA });
}

export async function evaluateAnswer(question: string, answer: string, role: string): Promise<string> {
  return callAI("evaluate_answer", { question, answer, role });
}

export async function suggestSkills(area: string): Promise<string> {
  return callAI("suggest_skills", { area });
}
