"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@/types/models";
import * as authApi from "@/lib/api/auth";

type AuthCtx = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("li_token");
    const u = localStorage.getItem("li_user");
    setToken(t);
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        setUser(null);
      }
    }
    setReady(true);
  }, []);

  const persist = useCallback((t: string, u?: User) => {
    localStorage.setItem("li_token", t);
    setToken(t);
    if (u) {
      localStorage.setItem("li_user", JSON.stringify(u));
      setUser(u);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login(email, password);
      persist(data.access_token, data.user);
    },
    [persist]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.register(email, password);
      persist(data.access_token, data.user);
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("li_token");
    localStorage.removeItem("li_user");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("li_token")) return;
    const me = await authApi.fetchMe();
    localStorage.setItem("li_user", JSON.stringify(me));
    setUser(me);
  }, []);

  const value = useMemo(
    () => ({ user, token, ready, login, register, logout, refreshUser }),
    [user, token, ready, login, register, logout, refreshUser]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
