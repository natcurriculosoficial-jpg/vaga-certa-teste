import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
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
import Members from "@/pages/Members";
import FeatureGate from "@/components/FeatureGate";
import { useParams } from "react-router-dom";
import CourseViewer from "@/pages/CourseViewer";
import Admin from "@/pages/Admin";
import Checklist from "@/pages/Checklist";
import Community from "@/pages/Community";

const ONBOARDING_COURSE_ID = "00000000-0000-0000-0000-000000000001";
function GatedCourseViewer() {
  const { id } = useParams<{ id: string }>();
  if (id === ONBOARDING_COURSE_ID) return <CourseViewer />;
  return (
    <FeatureGate feature="all_courses" requiredPlan="essencial">
      <CourseViewer />
    </FeatureGate>
  );
}

const queryClient = new QueryClient();

function PostLoginRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const target = sessionStorage.getItem("postLoginRedirect");
      if (target) {
        sessionStorage.removeItem("postLoginRedirect");
        navigate(target, { replace: true });
      }
    } catch {}
  }, [navigate]);
  return null;
}

function AppRoutes() {
  const { user, loading, login, signup, loginWithGoogle, updateProfile, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl gradient-primary animate-pulse" />
          <p className="text-muted-foreground text-sm animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
      <PostLoginRedirect />

      <Routes>
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/resume" element={<Resume user={user} />} />
        <Route path="/linkedin" element={<LinkedInPage user={user} />} />
        <Route path="/job-radar" element={<FeatureGate feature="job_tracker" requiredPlan="candidato"><JobRadar /></FeatureGate>} />
        <Route path="/interview" element={<FeatureGate feature="interview" requiredPlan="candidato"><Interview user={user} /></FeatureGate>} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/community" element={<FeatureGate feature="community_read" requiredPlan="candidato"><Community /></FeatureGate>} />
        <Route path="/profile" element={<Profile user={user} onUpdate={updateProfile} />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/members" element={<FeatureGate feature="all_courses" requiredPlan="essencial"><Members /></FeatureGate>} />
        <Route path="/members/course/:id" element={<GatedCourseViewer />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
