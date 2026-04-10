import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Linkedin, Radar, Mic,
  User, Settings, LogOut, Crown, ChevronRight, ChevronLeft,
  Search, Sun, Moon, Menu, X, BookOpen, Shield,
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
      ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
      : variant === "danger"
      ? "text-red-500 hover:text-red-600 hover:bg-red-500/10"
      : active
      ? "bg-primary/10 text-primary font-medium"
      : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent";

    const button = (
      <button
        onClick={handleClick}
        className={`relative flex items-center transition-all duration-150 ${
          collapsed
            ? "w-10 h-10 justify-center rounded-[10px] mx-auto"
            : "w-full px-3 py-2.5 rounded-[10px] gap-3"
        } ${colorClasses}`}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="truncate text-sm font-medium"
          >
            {label}
          </motion.span>
        )}
        {badge != null && badge > 0 && (
          <span className="absolute top-0 right-0 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-medium ml-1">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
        {/* Logo */}
        <div className={`flex items-center border-b border-sidebar-border ${isCollapsed ? "justify-center py-4 px-2" : "px-5 py-4"}`}>
          {isCollapsed ? (
            <div className="w-9 h-9 rounded-[10px] gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-white">VC</span>
            </div>
          ) : (
            <Logo size="sm" />
          )}
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {NAV_MAIN.map(navItem => (
            <SidebarItem key={navItem.path} icon={navItem.icon} label={navItem.label} path={navItem.path} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-sidebar-border space-y-1">
          {NAV_BOTTOM.map(navItem => (
            <SidebarItem key={navItem.path} icon={navItem.icon} label={navItem.label} path={navItem.path} />
          ))}
          {isAdmin && (
            <SidebarItem icon={Shield} label="Admin" path="/admin" />
          )}
          <SidebarItem
            icon={Crown}
            label="Upgrade PRO"
            onClick={() => navigate("/pricing")}
            variant="warning"
          />
          <div className="pt-1 mt-1 border-t border-sidebar-border">
            <SidebarItem icon={LogOut} label="Sair" onClick={onLogout} variant="danger" />
          </div>
        </div>

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="flex items-center justify-center py-3 border-t border-sidebar-border text-muted-foreground hover:text-sidebar-foreground transition-colors duration-200"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen flex bg-background">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 64 : 228 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="hidden md:flex flex-col fixed h-full z-30 overflow-hidden"
        >
          <SidebarContent />
        </motion.aside>

        {/* Desktop main */}
        <motion.main
          initial={false}
          animate={{ marginLeft: collapsed ? 64 : 228 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
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
          {NAV_MAIN.map(navItem => {
            const active = location.pathname === navItem.path;
            return (
              <button
                key={navItem.path}
                onClick={() => navigate(navItem.path)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <navItem.icon className="h-5 w-5" />
                <span className="text-[10px] truncate max-w-[56px]">{navItem.label.split(" ")[0]}</span>
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
