import { useState, useEffect, useCallback } from "react";

export interface UserData {
  name: string;
  email: string;
  situation?: string;
  area?: string;
  targetRole?: string;
  level?: string;
  onboardingComplete?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("vc_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = useCallback((email: string, _password: string) => {
    const stored = localStorage.getItem("vc_users");
    const users: Record<string, UserData & { password: string }> = stored ? JSON.parse(stored) : {};
    const found = users[email];
    if (found && found.password === _password) {
      const { password: _, ...userData } = found;
      localStorage.setItem("vc_user", JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    // Demo: allow any login
    const demo: UserData = { name: "Usuário Demo", email };
    localStorage.setItem("vc_user", JSON.stringify(demo));
    setUser(demo);
    return true;
  }, []);

  const signup = useCallback((name: string, email: string, password: string) => {
    const stored = localStorage.getItem("vc_users");
    const users: Record<string, any> = stored ? JSON.parse(stored) : {};
    users[email] = { name, email, password, onboardingComplete: false };
    localStorage.setItem("vc_users", JSON.stringify(users));
    const userData: UserData = { name, email, onboardingComplete: false };
    localStorage.setItem("vc_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const updateUser = useCallback((data: Partial<UserData>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("vc_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("vc_user");
    setUser(null);
  }, []);

  return { user, loading, login, signup, updateUser, logout };
}
