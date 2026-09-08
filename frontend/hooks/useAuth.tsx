'use client';

import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import * as authApi from '@/lib/api/auth';
import type { Role, User } from '@/types/api';
import { STAFF_ROLES } from '@/types/api';

type AuthState = {
  user: User | null;
  /** true until the first /api/auth/me round-trip finishes */
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isStaff: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await authApi.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authApi.login(email, password);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      login,
      logout,
      refresh,
      isStaff: STAFF_ROLES.includes(user?.role as Role),
    }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}

/** Where a user should land after sign-in, by role. */
export function homeForRole(role?: Role | null): string {
  if (role && STAFF_ROLES.includes(role)) return '/admin/dashboard';
  if (role === 'DESK_OFFICER') return '/admin/messages';
  return '/resident/dashboard';
}
