import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type EdgeInvokeResult<T = any> = {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number | null;
  notDeployed: boolean;
};

/**
 * Wrapper around supabase.functions.invoke that detects "function not found"
 * (HTTP 404) and returns a friendly message instead of a cryptic error.
 */
export async function invokeEdgeFunction<T = any>(
  name: string,
  options?: { body?: unknown; headers?: Record<string, string> }
): Promise<EdgeInvokeResult<T>> {
  try {
    const { data, error } = await supabase.functions.invoke(name, options as any);

    if (error) {
      const anyErr = error as any;
      const status: number | null = anyErr?.context?.status ?? anyErr?.status ?? null;
      const message: string = anyErr?.message || "Erro ao chamar a função";
      const notDeployed =
        status === 404 ||
        /not\s*found/i.test(message) ||
        /Failed to send a request/i.test(message);

      return {
        ok: false,
        data: null,
        error: notDeployed
          ? `A função "${name}" ainda não foi publicada no Supabase. Faça o deploy para usar este recurso.`
          : message,
        status,
        notDeployed,
      };
    }

    return { ok: true, data: (data as T) ?? null, error: null, status: 200, notDeployed: false };
  } catch (e: any) {
    const message = e?.message || String(e);
    const notDeployed = /not\s*found|404|Failed to fetch/i.test(message);
    return {
      ok: false,
      data: null,
      error: notDeployed
        ? `A função "${name}" ainda não foi publicada no Supabase. Faça o deploy para usar este recurso.`
        : message,
      status: null,
      notDeployed,
    };
  }
}

/** Helper that shows a toast for friendly errors. */
export async function invokeEdgeFunctionWithToast<T = any>(
  name: string,
  options?: { body?: unknown; headers?: Record<string, string> }
): Promise<EdgeInvokeResult<T>> {
  const result = await invokeEdgeFunction<T>(name, options);
  if (!result.ok) {
    toast({
      title: result.notDeployed ? "Função indisponível" : "Erro na função",
      description: result.error || "Tente novamente em instantes.",
      variant: "destructive",
    });
  }
  return result;
}
