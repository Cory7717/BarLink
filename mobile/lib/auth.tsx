import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api, setAccessToken } from "./api";
import type { MobileAuthResponse, MobileAuthToken, OwnerProfile } from "@BarLink360/shared";
import { queryClient } from "./queryClient";

const TOKEN_KEY = "BarLink360_mobile_token";

type AuthContextValue = {
  owner: OwnerProfile | null;
  token: MobileAuthToken | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadStoredToken(): Promise<MobileAuthToken | null> {
  try {
    const raw = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MobileAuthToken;
  } catch {
    return null;
  }
}

async function persistToken(token: MobileAuthToken | null) {
  if (!token) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAccessToken(null);
    return;
  }
  setAccessToken(token.accessToken);
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(token));
}

function isExpired(token: MobileAuthToken | null) {
  if (!token?.expiresAt) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= token.expiresAt - 60; // 1 minute clock skew
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [token, setTokenState] = useState<MobileAuthToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadStoredToken();
      if (stored && !isExpired(stored)) {
        setTokenState(stored);
        setAccessToken(stored.accessToken);
        try {
          const profile = await api.me();
          setOwner(profile);
        } catch (error) {
          console.warn("Failed to load profile from stored token", error);
        }
      }
      setLoading(false);
    })();
  }, []);

  const setSession = useCallback(async (response: MobileAuthResponse | null) => {
    if (!response) {
      setOwner(null);
      setTokenState(null);
      await persistToken(null);
      return;
    }
    setOwner(response.owner);
    setTokenState(response.token);
    await persistToken(response.token);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login({ email, password });
      await setSession(res);
      await queryClient.invalidateQueries({ queryKey: ["owner-bars"] });
    },
    [setSession]
  );

  const refresh = useCallback(async () => {
    if (!token) return;
    if (!isExpired(token)) return;
    const res = await api.refresh();
    await setSession(res);
  }, [token, setSession]);

  const logout = useCallback(async () => {
    await setSession(null);
    await queryClient.resetQueries();
  }, [setSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      owner,
      token,
      loading,
      login,
      logout,
      refresh,
    }),
    [owner, token, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
