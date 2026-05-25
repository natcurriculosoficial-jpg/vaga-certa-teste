
## 1. Página de Pricing (`src/pages/Pricing.tsx`) — reescrita

Substituir a página atual (2 planos) por uma estrutura de **4 planos** com toggle Mensal/Anual.

### Estrutura visual

- Header centralizado com título "Escolha seu plano" e subtítulo.
- **Toggle Mensal / Anual** (componente `Switch` do shadcn) com badge "Economize ~25%" no lado Anual.
- Grid responsivo: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` com 4 cards de plano.
- Card do **Intermediário** destacado como "Mais popular" (ring primary, badge no topo).
- Abaixo do grid: **tabela comparativa completa** de features (desktop) / acordeão por plano (mobile).

### Planos e preços

| Plano | Mensal | Anual (equivalente/mês) |
|---|---|---|
| Trial | Grátis | Grátis |
| Básico | R$ 19,90 | R$ 13,90 |
| Intermediário | R$ 29,90 | R$ 22,25 |
| PRO | R$ 44,90 | R$ 37,00 |

Quando anual ativo, mostrar preço/mês + texto pequeno "cobrado anualmente (R$ X,XX/ano)".

### Tabela comparativa (linhas)

Currículo (editor), IA no currículo, Exportar PDF, Exportar DOCX, LinkedIn (editor), IA no LinkedIn, Checklist, Aulas, Radar de Vagas, Filtros avançados, Job Tracker, Simulador de Entrevista, Comunidade, Score de Empregabilidade, Benchmark Salarial, Recarga de créditos — exatamente com os valores fornecidos pelo usuário (✅ / ❌ / quotas / 🔒blur etc).

Ícones consistentes: `Check` (success), `X` (muted), `Lock` para "🔒blur", `Infinity` para "♾️", `Eye` para leitura.

### CTAs

- Trial: "Plano atual" (disabled) se for o plano do usuário, senão "Começar grátis".
- Demais: "Assinar {Plano}" → por enquanto apenas `toast` "Em breve" (sem integração de pagamento — não foi pedida).

### Estado

```ts
const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
```

Sem mudanças em backend, hooks ou banco — é puramente apresentação.

---

## 2. Sidebar — corrigir cor de hover/ativo (`src/components/AppLayout.tsx`)

Problema atual: item ativo usa `bg-white/15` com borda branca + box-shadow roxo neon, gerando um "halo" feio sobre o fundo `hsl(220 25% 8%)`.

Mudanças:

- **Item ativo**: trocar `bg-white/15 ... border border-white/10` por um fundo sutil baseado no primary do design system: `bg-primary/15 text-white` com uma borda esquerda fina (`border-l-2 border-primary`) em vez de borda completa.
- **Remover o `boxShadow` inline** (`0 0 20px hsl(250 84% 60% / 0.35)`) que cria o glow agressivo.
- **Hover (não-ativo)**: trocar `hover:bg-white/10` por `hover:bg-white/[0.04]` (muito mais discreto).
- **Variants warning/danger**: reduzir intensidade do hover (`hover:bg-amber-400/10`, `hover:bg-red-500/10`).
- **Bottom nav mobile**: revisar `bg-primary/10` ativo para ficar consistente com a nova paleta.

Sem outras alterações estruturais na sidebar (mantém layout, animação de colapso, gradient divider etc).

---

## Arquivos afetados

- `src/pages/Pricing.tsx` — reescrito
- `src/components/AppLayout.tsx` — ajuste cirúrgico de classes no `SidebarItem` e na bottom nav
