import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Linkedin, Radar, Mic,
  User, Settings, LogOut, Crown, ChevronRight, ChevronLeft,
  Search, Sun, Moon, Menu, X,
} from "lucide-react";
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

const NAV_MAIN = [
  { label: "Início", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Radar de Vagas", icon: Radar, path: "/job-radar" },
  { label: "Meu Currículo", icon: FileText, path: "/resume" },
  { label: "LinkedIn Campeão", icon: Linkedin, path: "/linkedin" },
  { label: "Simular Entrevista", icon: Mic, path: "/interview" },
];

const NAV_BOTTOM = [
  { label: "Meu Perfil", icon: User, path: "/profile" },
  { label: "Configurações", icon: Settings, path: "/settings" },
];

const COLLAPSED_W = 64;
const EXPANDED_W = 228;

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
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarItem = ({
    icon: Icon,
    label,
    path,
    badge,
    onClick,
    variant = "default",
  }: {
    icon: React.ElementType;
    label: string;
    path?: string;
    badge?: number;
    onClick?: () => void;
    variant?: "default" | "warning" | "danger";
  }) => {
    const active = path ? location.pathname === path : false;
    const handleClick = () => {
      if (onClick) { onClick(); return; }
      if (path) { navigate(path); setMobileOpen(false); }
    };

    const colorClasses = variant === "warning"
      ? "text-amber-400 hover:bg-amber-400/10"
      : variant === "danger"
      ? "text-red-400 hover:bg-red-400/10"
      : active
      ? "text-white vc-sidebar-pill"
      : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]";

    const button = (
      <button
        onClick={handleClick}
        className={`relative w-full flex items-center gap-3 rounded-[10px] text-sm font-medium transition-all duration-200 ${
          collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"
        } ${colorClasses}`}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="truncate"
          >
            {label}
          </motion.span>
        )}
        {badge != null && badge > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-[hsl(220,25%,7%)] text-white">
      {/* Logo */}
      <div className={`flex items-center border-b border-white/[0.06] ${collapsed && !isMobile ? "justify-center p-4" : "px-5 py-4"}`}>
        {collapsed && !isMobile ? (
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-xs font-bold text-white">VC</span>
          </div>
        ) : (
          <Logo size="sm" />
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_MAIN.map(item => (
          <SidebarItem key={item.path} icon={item.icon} label={item.label} path={item.path} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-white/[0.06] space-y-0.5">
        {NAV_BOTTOM.map(item => (
          <SidebarItem key={item.path} icon={item.icon} label={item.label} path={item.path} />
        ))}
        <SidebarItem
          icon={Crown}
          label="Upgrade PRO"
          onClick={() => navigate("/pricing")}
          variant="warning"
        />
        <div className="pt-1 mt-1 border-t border-white/[0.06]">
          <SidebarItem icon={LogOut} label="Sair" onClick={onLogout} variant="danger" />
        </div>
      </div>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center justify-center py-3 border-t border-white/[0.06] text-white/30 hover:text-white/70 transition-colors duration-200"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen flex bg-background">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="hidden md:flex flex-col fixed h-full z-30 overflow-hidden"
        >
          <SidebarContent />
        </motion.aside>

        {/* Desktop main */}
        <motion.main
          initial={false}
          animate={{ marginLeft: collapsed ? COLLAPSED_W : EXPANDED_W }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-1 hidden md:block"
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
                  className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
                >
                  U
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
              className="md:hidden fixed inset-y-0 left-0 w-[280px] z-50"
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
        <main className="flex-1 md:hidden pb-20">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Bottom nav mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/50 z-20 flex justify-around py-2 px-1">
          {NAV_MAIN.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] truncate max-w-[56px]">{item.label.split(" ")[0]}</span>
                {active && (
                  <motion.div
                    layoutId="mobileActive"
                    className="absolute -top-1 w-5 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
