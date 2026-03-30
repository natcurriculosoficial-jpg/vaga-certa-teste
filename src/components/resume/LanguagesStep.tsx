import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TOP_LANGUAGES = [
  { name: "Inglês", flag: "🇺🇸", nativeName: "English", speakers: "1.5 bilhão" },
  { name: "Mandarim", flag: "🇨🇳", nativeName: "普通话", speakers: "1.1 bilhão" },
  { name: "Espanhol", flag: "🇪🇸", nativeName: "Español", speakers: "560 milhões" },
  { name: "Árabe", flag: "🇸🇦", nativeName: "العربية", speakers: "420 milhões" },
  { name: "Francês", flag: "🇫🇷", nativeName: "Français", speakers: "280 milhões" },
];

const LEVELS = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"];

interface LanguageEntry {
  lang: string;
  level: string;
}

interface LanguagesStepProps {
  languages: LanguageEntry[];
  setLanguages: React.Dispatch<React.SetStateAction<LanguageEntry[]>>;
}

export default function LanguagesStep({ languages, setLanguages }: LanguagesStepProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLang, setCustomLang] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const isSelected = (name: string) => languages.some((l) => l.lang === name);

  const toggleTopLang = (name: string) => {
    if (isSelected(name)) {
      setLanguages((p) => p.filter((l) => l.lang !== name));
      setExpandedCard(null);
    } else {
      setExpandedCard(name);
    }
  };

  const selectLevel = (name: string, level: string) => {
    setLanguages((p) => [...p.filter((l) => l.lang !== name), { lang: name, level }]);
    setExpandedCard(null);
  };

  const addCustom = () => {
    const trimmed = customLang.trim();
    if (trimmed && !isSelected(trimmed)) {
      setLanguages((p) => [...p, { lang: trimmed, level: "Básico" }]);
      setCustomLang("");
      setShowCustomInput(false);
    }
  };

  const updateLevel = (lang: string, level: string) => {
    setLanguages((p) => p.map((l) => (l.lang === lang ? { ...l, level } : l)));
  };

  return (
    <div className="space-y-6">
      {/* Top 5 cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Idiomas mais comuns</h3>
        <div className="flex flex-wrap gap-2.5">
          {TOP_LANGUAGES.map((lang) => {
            const selected = isSelected(lang.name);
            const expanded = expandedCard === lang.name;
            return (
              <div key={lang.name} className="relative">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleTopLang(lang.name)}
                  className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-200 ${
                    selected
                      ? "border-secondary bg-secondary/10 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{lang.name}</p>
                    <p className="text-xs text-muted-foreground">{lang.nativeName}</p>
                  </div>
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-secondary-foreground" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Level dropdown */}
                <AnimatePresence>
                  {expanded && !selected && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      className="absolute top-full left-0 mt-1.5 z-20 glass-card p-1.5 rounded-xl shadow-lg min-w-[160px]"
                    >
                      <p className="text-xs text-muted-foreground px-2 py-1 font-medium">Nível de proficiência</p>
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          onClick={() => selectLevel(lang.name, level)}
                          className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-muted/60 text-foreground transition-colors"
                        >
                          {level}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Added languages */}
      {languages.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Idiomas adicionados</h3>
          <div className="space-y-2">
            {languages.map((l) => (
              <motion.div
                key={l.lang}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-medium text-sm text-foreground truncate">{l.lang}</span>
                  <span className="text-muted-foreground text-xs">—</span>
                  <select
                    value={l.level}
                    onChange={(e) => updateLevel(l.lang, e.target.value)}
                    className="bg-muted/50 border border-input rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-secondary"
                  >
                    {LEVELS.map((lv) => (
                      <option key={lv} value={lv}>{lv}</option>
                    ))}
                  </select>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setLanguages((p) => p.filter((ll) => ll.lang !== l.lang))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Custom add */}
      <AnimatePresence>
        {showCustomInput ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <Input
              value={customLang}
              onChange={(e) => setCustomLang(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Nome do idioma..."
              className="bg-muted/50 flex-1"
              autoFocus
            />
            <Button size="sm" onClick={addCustom}>Adicionar</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCustomInput(false)}>Cancelar</Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button variant="outline" onClick={() => setShowCustomInput(true)} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Adicionar outro idioma
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
