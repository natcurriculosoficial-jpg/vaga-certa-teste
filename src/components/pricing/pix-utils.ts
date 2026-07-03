import { supabase } from "@/integrations/supabase/client";

export function formatCpf(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3}\.\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3}\.\d{3}\.\d{3})(\d{1,2})/, "$1-$2");
}

export function isCpfComplete(v: string): boolean {
  return v.replace(/\D/g, "").length === 11;
}

/** Lê o corpo JSON de um FunctionsHttpError (supabase.functions.invoke). */
export async function readFunctionsError(e: any): Promise<any | null> {
  try {
    if (e?.context && typeof e.context.json === "function") {
      return await e.context.json();
    }
  } catch {
    // corpo não é JSON
  }
  return null;
}

/** Extrai uma mensagem legível do corpo de erro retornado pelas edge functions. */
export function functionsErrorMessage(body: any): string | undefined {
  if (!body) return undefined;
  if (body.message) return body.message;
  if (Array.isArray(body.detail) && body.detail[0]?.description) {
    return body.detail[0].description;
  }
  if (typeof body.error === "string" && body.error !== "cpf_required") {
    return body.error;
  }
  return undefined;
}

/** CPF já salvo no perfil do usuário logado, se houver. */
export async function getProfileCpf(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await (supabase as any)
    .from("profiles")
    .select("cpf")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.cpf || null;
}
