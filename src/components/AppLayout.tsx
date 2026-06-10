import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Linkedin, Radar, Mic,
  Settings, LogOut, Crown, PanelLeft, PanelLeftClose,
  Search, Sun, Moon, Menu, X, BookOpen,
  CheckSquare, Users,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "@/hooks/useTheme";
import PageTransition from "./PageTransition";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CreditsIndicator from "./CreditsIndicator";

const NAV_MAIN = [
  { label: "Início", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Minha Jornada", icon: CheckSquare, path: "/checklist" },
  { label: "Radar de Vagas", icon: Radar, path: "/job-radar" },
  { label: "Meu Currículo", icon: FileText, path: "/resume" },
  { label: "LinkedIn Campeão", icon: Linkedin, path: "/linkedin" },
  { label: "Simular Entrevista", icon: Mic, path: "/interview" },
  { label: "Área de Membros", icon: BookOpen, path: "/members" },
  { label: "Comunidade", icon: Users, path: "/community" },
];

const NAV_BOTTOM = [
  { label: "Configurações", icon: Settings, path: "/settings" },
];

export default function AppLayout({
  children,
  onLogout,
}: {
  children: ReactNode;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { resolved, setTheme } = useTheme();
  const { isAdmin } = useAdmin();
  const { user: profile } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = resolved === "dark";

  const SidebarItem = ({
    icon: Icon,
    label,
    path,
    onClick,
    variant = "default",
    isCollapsed,
  }: {
    icon: React.ElementType;
    label: string;
    path?: string;
    onClick?: () => void;
    variant?: "default" | "warning" | "danger";
    isCollapsed: boolean;
  }) => {
    const active = path ? location.pathname === path : false;
    const handleClick = () => {
      if (onClick) { onClick(); return; }
      if (path) { navigate(path); setMobileOpen(false); }
    };

    const colorClasses = variant === "warning"
      ? isDark ? "text-amber-300 hover:bg-amber-400/10" : "text-amber-600 hover:bg-amber-400/10"
      : variant === "danger"
      ? isDark ? "text-red-300 hover:bg-red-500/10 hover:text-red-200" : "text-red-500 hover:bg-red-500/10"
      : active
      ? isDark ? "bg-primary/15 text-white font-medium" : "bg-primary/20 text-primary font-medium"
      : isDark ? "text-white/60 hover:bg-white/[0.04] hover:text-white" : "text-slate-600 hover:bg-black/[0.06] hover:text-slate-900";

    const button = (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`relative flex items-center transition-colors duration-150 ${
          isCollapsed
            ? "w-10 h-10 justify-center rounded-[10px] mx-auto"
            : "w-full px-3 py-2.5 rounded-[10px] gap-3"
        } ${colorClasses}`}
      >
        {active && variant === "default" && !isCollapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r bg-primary" />
        )}
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15 }}
              className="truncate text-sm font-medium"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-medium ml-2">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = isMobile ? false : collapsed;
    const firstName = profile?.name?.split(" ")[0] || "Usuário";
    const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

    return (
      <div
        className={`flex flex-col h-full relative ${isDark ? "text-white" : "text-slate-700"}`}
        style={{ background: isDark ? "hsl(220 25% 11%)" : "#deddff" }}
      >
        {/* Logo / header */}
        <div className={`flex items-center ${isCollapsed ? "justify-center py-4 px-2" : "px-5 py-4 gap-3"}`}>
          {isCollapsed ? (
            <div className="w-9 h-9 rounded-[10px] gradient-primary flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">VC</span>
            </div>
          ) : (
            <Logo size="sm" />
          )}
        </div>

        {/* Gradient divider */}
        <div className={`h-px mx-3 bg-gradient-to-r from-transparent ${isDark ? "via-white/10" : "via-black/[0.08]"} to-transparent`} />

        {/* Welcome */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 py-3 overflow-hidden"
            >
              <p className={`text-[11px] uppercase tracking-wide ${isDark ? "text-white/40" : "text-slate-500"}`}>Bem-vindo de volta</p>
              <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-slate-800"}`}>{firstName}</p>
              <p className={`text-[11px] mt-0.5 ${isDark ? "text-white/30" : "text-slate-400"}`}>{today}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`h-px mx-3 bg-gradient-to-r from-transparent ${isDark ? "via-white/10" : "via-black/[0.08]"} to-transparent`} />

        {/* Main nav */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {NAV_MAIN.map(navItem => (
            <SidebarItem key={navItem.path} icon={navItem.icon} label={navItem.label} path={navItem.path} isCollapsed={isCollapsed} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 space-y-1">
          <div className={isCollapsed ? "mb-1" : "mb-2 px-1"}>
            <CreditsIndicator collapsed={isCollapsed} />
          </div>
          <div className={`h-px mb-2 bg-gradient-to-r from-transparent ${isDark ? "via-white/10" : "via-black/[0.08]"} to-transparent`} />
          {NAV_BOTTOM.map(navItem => (
            <SidebarItem key={navItem.path} icon={navItem.icon} label={navItem.label} path={navItem.path} isCollapsed={isCollapsed} />
          ))}
          {isAdmin && (
            <SidebarItem icon={Shield} label="Admin" path="/admin" isCollapsed={isCollapsed} />
          )}
          <SidebarItem
            icon={Crown}
            label="Upgrade PRO"
            onClick={() => navigate("/pricing")}
            variant="warning"
            isCollapsed={isCollapsed}
          />
          <SidebarItem icon={LogOut} label="Sair" onClick={onLogout} variant="danger" isCollapsed={isCollapsed} />
        </div>

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`flex items-center justify-center py-3 border-t ${isDark ? "border-white/5 text-white/40 hover:text-white/90" : "border-black/[0.06] text-slate-400 hover:text-slate-700"} transition-colors duration-200`}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  };

  const sidebarWidth = collapsed ? 80 : 256;
  // 20px left + width + 20px right gap = mainLeft
  const mainLeft = sidebarWidth + 40;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        {/* Desktop floating sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarWidth }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="hidden md:block fixed left-5 top-5 z-30 overflow-hidden rounded-2xl shadow-2xl"
          style={{ height: "calc(100vh - 40px)" }}
        >
          <SidebarContent />
        </motion.aside>

        {/* Desktop main */}
        <motion.main
          initial={false}
          animate={{ marginLeft: mainLeft }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="hidden md:block min-h-screen"
        >
          {/* Topbar */}
          <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9 bg-muted/40 border-transparent focus:border-ring/30 h-9 text-sm input-glow"
                />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
                >
                  <AnimatePresence mode="wait">
                    {resolved === "dark" ? (
                      <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Sun className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Moon className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
                <button
                  onClick={() => navigate("/profile")}
                  className="h-8 w-8 rounded-xl overflow-hidden gradient-primary flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.name || "U")[0].toUpperCase()
                  )}
                </button>
              </div>
            </div>
          </header>

          <PageTransition>{children}</PageTransition>
        </motion.main>

        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-20 w-full">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}>
              {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              transition={{ duration: 0.25 }}
              className="md:hidden fixed inset-y-0 left-0 w-[280px] z-50 overflow-hidden rounded-r-2xl"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
            >
              <SidebarContent isMobile />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile content */}
        <main className="md:hidden pb-24">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Bottom nav mobile - glass */}
        <nav className="md:hidden fixed bottom-3 left-3 right-3 z-20 rounded-2xl border border-border/40 bg-background/70 backdrop-blur-xl shadow-lg px-2 py-2 flex justify-around">
          {NAV_MAIN.slice(0, 5).map(navItem => {
            const active = location.pathname === navItem.path;
            return (
              <button
                key={navItem.path}
                title={navItem.label}
                onClick={() => navigate(navItem.path)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  active ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`}
              >
                <navItem.icon className="h-5 w-5" />
                <span className="text-[10px] truncate max-w-[56px]">{navItem.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
