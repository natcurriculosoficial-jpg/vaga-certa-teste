import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, FileText, Linkedin, Target, Mic, User, Settings,
  LogOut, Menu, X, Crown, ChevronLeft, ChevronRight,
  Search, Sun, Moon,
} from "lucide-react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "@/hooks/useTheme";
import PageTransition from "./PageTransition";

const navItems = [
  { label: "Início", icon: Home, path: "/dashboard" },
  { label: "Meu Currículo", icon: FileText, path: "/resume" },
  { label: "LinkedIn Campeão", icon: Linkedin, path: "/linkedin" },
  { label: "Radar de Vagas", icon: Target, path: "/job-radar" },
  { label: "Simulador de Entrevista", icon: Mic, path: "/interview" },
];

const bottomNavItems = [
  { label: "Meu Perfil", icon: User, path: "/profile" },
  { label: "Configurações", icon: Settings, path: "/settings" },
];

export default function AppLayout({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolved, setTheme } = useTheme();

  const sidebarWidth = collapsed ? "w-[68px]" : "w-64";

  const NavButton = ({ item, compact = false }: { item: typeof navItems[0]; compact?: boolean }) => {
    const active = location.pathname === item.path;
    return (
      <button
        onClick={() => { navigate(item.path); setMobileOpen(false); }}
        className={`group relative w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          compact ? "px-2 py-2.5 justify-center" : "px-3 py-2.5"
        } ${
          active
            ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-secondary"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        }`}
      >
        <item.icon className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
          active ? "text-primary dark:text-secondary" : "group-hover:text-foreground"
        }`} />
        {!compact && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
        {active && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary dark:bg-secondary"
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex flex-col glass-sidebar fixed h-full z-30 overflow-hidden"
      >
        {/* Logo */}
        <div className={`flex items-center border-b border-sidebar-border/50 ${collapsed ? "justify-center p-4" : "justify-between p-5"}`}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-white">VC</span>
            </div>
          ) : (
            <Logo size="sm" />
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <div className="space-y-0.5">
            {!collapsed && (
              <p className="px-3 py-2 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Menu</p>
            )}
            {navItems.map(item => (
              <NavButton key={item.path} item={item} compact={collapsed} />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-sidebar-border/50 space-y-0.5">
            {!collapsed && (
              <p className="px-3 py-2 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Conta</p>
            )}
            {bottomNavItems.map(item => (
              <NavButton key={item.path} item={item} compact={collapsed} />
            ))}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-sidebar-border/50 space-y-1">
          <button
            onClick={() => navigate("/pricing")}
            className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 text-warning hover:bg-warning/10 ${
              collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5"
            }`}
          >
            <Crown className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Upgrade PRO</span>}
          </button>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 text-destructive hover:bg-destructive/10 ${
              collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5"
            }`}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <motion.main
        initial={false}
        animate={{ marginLeft: collapsed ? 68 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-1 pb-20 md:pb-0 hidden md:block"
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
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                U
              </button>
            </div>
          </div>
        </header>

        <PageTransition>{children}</PageTransition>
      </motion.main>

      {/* Mobile */}
      <main className="flex-1 md:hidden pb-20">
        {/* Mobile header */}
        <header className="flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-20">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
            >
              {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-background/98 backdrop-blur-xl"
            >
              <div className="flex justify-end p-4">
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <motion.nav
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-4 space-y-1"
              >
                {[...navItems, ...bottomNavItems].map(item => (
                  <NavButton key={item.path} item={item} />
                ))}
                <div className="pt-4 border-t border-border/50 mt-4 space-y-1">
                  <button
                    onClick={() => { navigate("/pricing"); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warning hover:bg-warning/10 transition-colors"
                  >
                    <Crown className="h-[18px] w-[18px]" />
                    Upgrade PRO
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                    Sair
                  </button>
                </div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom navigation mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/50 z-20 flex justify-around py-2 px-1">
          {navItems.slice(0, 5).map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-all duration-200 ${
                  active ? "text-primary dark:text-secondary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
                {active && (
                  <motion.div
                    layoutId="mobileActive"
                    className="absolute -top-1 w-5 h-0.5 rounded-full bg-primary dark:bg-secondary"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
