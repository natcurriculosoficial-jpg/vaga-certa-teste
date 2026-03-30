import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Mic } from "lucide-react";
import { UserData } from "@/hooks/useAuth";
import * as geminiService from "@/services/gemini";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Interview({ user }: { user: UserData }) {
  const [role, setRole] = useState(user.targetRole || "");
  const [company, setCompany] = useState("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const start = async () => {
    setStarted(true);
    setLoading(true);
    const question = await geminiService.simulateInterview(role, company);
    setMessages([{ role: "assistant", content: `Olá! Eu sou a **Nat IA** 🎤, sua entrevistadora virtual.\n\nVamos simular uma entrevista para ${role}${company ? ` na ${company}` : ""}. Vou fazer perguntas variadas para te preparar.\n\n**Primeira pergunta:**\n\n${question}` }]);
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Evaluate answer
    const lastQuestion = messages.filter(m => m.role === "assistant").pop()?.content || "";
    const evaluation = await geminiService.evaluateAnswer(lastQuestion, input, role);

    // Generate next question
    const prevQA = newMessages.map(m => `${m.role === "assistant" ? "Entrevistador" : "Candidato"}: ${m.content}`).join("\n");
    const nextQuestion = await geminiService.simulateInterview(role, company, prevQA);

    setMessages(prev => [...prev, {
      role: "assistant",
      content: `${evaluation}\n\n---\n\n**Próxima pergunta:**\n\n${nextQuestion}`
    }]);
    setLoading(false);
  };

  if (!started) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">🎤 Simulador de Entrevista</h1>
        <p className="text-muted-foreground">Treine com a Nat IA, sua entrevistadora virtual</p>
        <div className="glass-card p-6 space-y-4">
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Input value={role} onChange={e => setRole(e.target.value)} placeholder="Ex: Product Manager" className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Empresa (opcional)</Label>
            <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Ex: Google" className="bg-muted/50" />
          </div>
          <Button onClick={start} disabled={!role} className="w-full">
            <Mic className="h-4 w-4 mr-2" /> Iniciar entrevista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen max-w-3xl mx-auto">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          🎤 Nat IA — Entrevista para {role}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-line ${
              msg.role === "user" ? "bg-primary text-primary-foreground" : "glass-card text-foreground"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass-card px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-secondary" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Digite sua resposta..."
            className="bg-muted/50"
            disabled={loading}
          />
          <Button onClick={send} disabled={loading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
