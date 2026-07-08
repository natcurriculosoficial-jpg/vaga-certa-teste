import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Parsed {
  start: string; // formato do <input type="month">: AAAA-MM
  end: string;
  cursando: boolean;
  previsao: string;
}

// Formatos gravados em education.period:
//   "MM/AAAA - MM/AAAA"
//   "MM/AAAA - Cursando"
//   "MM/AAAA - Cursando (previsão MM/AAAA)"
function toMonthInput(mmYYYY: string): string {
  const [m, y] = mmYYYY.split("/");
  return `${y}-${m}`;
}

function toDisplay(ym: string): string {
  const [y, m] = ym.split("-");
  return `${m}/${y}`;
}

export function parsePeriod(v: string): Parsed {
  const out: Parsed = { start: "", end: "", cursando: false, previsao: "" };
  if (!v) return out;
  const [left, ...restParts] = v.split(/\s*[-–]\s*/);
  const rest = restParts.join(" - ");
  if (/^\d{2}\/\d{4}$/.test(left?.trim() || "")) out.start = toMonthInput(left.trim());
  if (/cursando/i.test(rest)) {
    out.cursando = true;
    const m = rest.match(/previs[aã]o\s*:?\s*(\d{2}\/\d{4})/i);
    if (m) out.previsao = toMonthInput(m[1]);
  } else if (/^\d{2}\/\d{4}$/.test(rest?.trim() || "")) {
    out.end = toMonthInput(rest.trim());
  }
  return out;
}

export function buildPeriod(p: Parsed): string {
  if (!p.start && !p.end && !p.cursando) return "";
  const start = p.start ? toDisplay(p.start) : "";
  if (p.cursando) {
    const prev = p.previsao ? ` (previsão ${toDisplay(p.previsao)})` : "";
    return `${start}${start ? " - " : ""}Cursando${prev}`;
  }
  const end = p.end ? toDisplay(p.end) : "";
  return end ? `${start} - ${end}` : start;
}

interface Props {
  value: string;
  onCommit: (v: string) => void;
}

export function EducationPeriodFields({ value, onCommit }: Props) {
  const [fields, setFields] = useState<Parsed>(() => parsePeriod(value));

  useEffect(() => {
    if (buildPeriod(fields) !== value) setFields(parsePeriod(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (next: Parsed) => {
    setFields(next);
    onCommit(buildPeriod(next));
  };

  return (
    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
      <div className="space-y-1">
        <Label className="text-xs">Data de início</Label>
        <Input
          type="month"
          value={fields.start}
          onChange={(e) => setFields({ ...fields, start: e.target.value })}
          onBlur={() => commit(fields)}
          className="bg-muted/50"
        />
      </div>
      {fields.cursando ? (
        <div className="space-y-1">
          <Label className="text-xs">Previsão de conclusão</Label>
          <Input
            type="month"
            value={fields.previsao}
            onChange={(e) => setFields({ ...fields, previsao: e.target.value })}
            onBlur={() => commit(fields)}
            className="bg-muted/50"
          />
        </div>
      ) : (
        <div className="space-y-1">
          <Label className="text-xs">Data de fim</Label>
          <Input
            type="month"
            value={fields.end}
            onChange={(e) => setFields({ ...fields, end: e.target.value })}
            onBlur={() => commit(fields)}
            className="bg-muted/50"
          />
        </div>
      )}
      <label className="flex items-center gap-2 pb-2.5 cursor-pointer select-none">
        <Checkbox
          checked={fields.cursando}
          onCheckedChange={(c) =>
            commit({ ...fields, cursando: c === true, end: c === true ? "" : fields.end, previsao: c === true ? fields.previsao : "" })
          }
        />
        <span className="text-xs text-muted-foreground">Cursando</span>
      </label>
    </div>
  );
}
