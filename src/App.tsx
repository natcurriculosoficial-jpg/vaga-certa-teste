import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Resume from "@/pages/Resume";
import LinkedInPage from "@/pages/LinkedInPage";
import JobRadar from "@/pages/JobRadar";
import Interview from "@/pages/Interview";
import Profile from "@/pages/Profile";
import SettingsPage from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading, login, signup, loginWithGoogle, updateProfile, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-secondary text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={login} onGoogleLogin={loginWithGoogle} />} />
        <Route path="/signup" element={<Signup onSignup={signup} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!user.onboarding_complete) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding onUpdate={updateProfile} />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout onLogout={logout}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/resume" element={<Resume user={user} />} />
        <Route path="/linkedin" element={<LinkedInPage user={user} />} />
        <Route path="/job-radar" element={<JobRadar />} />
        <Route path="/interview" element={<Interview user={user} />} />
        <Route path="/profile" element={<Profile user={user} onUpdate={updateProfile} />} />
        <Route path="/settings" element={<SettingsPage onLogout={logout} />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
