import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Linkedin, Radar, Mic } from "lucide-react";

const FAB_ITEMS = [
  { id: "curriculo", label: "Meu Currículo", icon: FileText, gradient: "from-violet-500 to-violet-600", route: "/resume", angle: 90 },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, gradient: "from-sky-500 to-sky-600", route: "/linkedin", angle: 65 },
  { id: "radar", label: "Radar de Vagas", icon: Radar, gradient: "from-indigo-500 to-indigo-600", route: "/job-radar", angle: 40 },
  { id: "entrevista", label: "Simular Entrevista", icon: Mic, gradient: "from-emerald-500 to-emerald-600", route: "/interview", angle: 12 },
];

const RADIUS = 82;

export default function FabMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className="fixed bottom-24 md:bottom-8 right-6 z-50"
        onMouseEnter={() => !isMobile && setOpen(true)}
        onMouseLeave={() => !isMobile && setOpen(false)}
      >
        <AnimatePresence>
          {open &&
            FAB_ITEMS.map((item, i) => {
              const rad = (item.angle * Math.PI) / 180;
              const x = Math.cos(rad) * -RADIUS;
              const y = Math.sin(rad) * -RADIUS;

              return (
                <motion.div
                  key={item.id}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
                  animate={{ x, y, opacity: 1, scale: 1 }}
                  exit={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.06 }}
                  className="absolute bottom-0 right-0"
                >
                  <div className="relative group">
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <span className="whitespace-nowrap bg-card text-foreground text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg border border-border">
                        {item.label}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { navigate(item.route); setOpen(false); }}
                      className={`h-11 w-11 rounded-full bg-gradient-to-br ${item.gradient} text-white shadow-lg flex items-center justify-center`}
                      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.20)" }}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>

        <motion.button
          onClick={() => isMobile && setOpen(o => !o)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative h-14 w-14 rounded-2xl gradient-primary text-white flex items-center justify-center btn-glow"
          style={{ boxShadow: "0 6px 20px rgba(124,58,237,0.35)" }}
        >
          {!open && (
            <motion.span
              className="absolute inset-0 rounded-2xl gradient-primary opacity-40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Plus className="h-6 w-6" />
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}
