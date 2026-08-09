import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/endpoints';
import apiClient from '../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  id: string;
  email: string;
  firstName: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** All permission codes the current user holds (empty [] for roleless users — valid, not an error) */
  permissions: string[];
  /** True while the initial /me/permissions call is in-flight */
  permissionsLoading: boolean;
  /** Check a single permission code */
  hasPermission: (code: string) => boolean;
  /** True if the user holds AT LEAST ONE of the given codes */
  hasAnyPermission: (codes: string[]) => boolean;
  /** True if the user holds ALL of the given codes */
  hasAllPermissions: (codes: string[]) => boolean;
  /** Re-fetch permissions from the server (call after login or role changes) */
  reloadPermissions: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  // ── Load permissions from the server ────────────────────────────────────────
  // Called once after login and on every full page reload (if token is present).
  // A roleless user legitimately receives [] — this is not an error state.
  // We intentionally do NOT persist permissions in localStorage because a user's
  // roles can change server-side at any time.
  const reloadPermissions = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setPermissions([]);
      return;
    }
    setPermissionsLoading(true);
    try {
      const res = await apiClient.get('/api/account/me/permissions');
      setPermissions(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Network error or 401 (token revoked) — treat as no permissions
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  // ── Restore session from localStorage on mount ───────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setAccessToken(token);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // ── Fetch permissions once a token is available ──────────────────────────────
  useEffect(() => {
    if (accessToken) {
      reloadPermissions();
    } else {
      setPermissions([]);
    }
  }, [accessToken, reloadPermissions]);

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    // Persist token first so request interceptor picks it up for reloadPermissions
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    const userData: User = {
      id: data.userId || '',
      email: data.email || email,
      firstName: (data.fullName || '').split(' ')[0] || '',
      fullName: data.fullName || '',
      role: data.role || '',
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setAccessToken(data.accessToken);
    setUser(userData);
    // Permissions will reload automatically via the useEffect above (accessToken changed)
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) authApi.revokeToken(refreshToken).catch(() => {});
    localStorage.clear();
    setUser(null);
    setAccessToken(null);
    setPermissions([]);
  };

  // ── Permission helpers ───────────────────────────────────────────────────────
  const hasPermission = useCallback(
    (code: string) => permissions.includes(code),
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (codes: string[]) => codes.some(c => permissions.includes(c)),
    [permissions],
  );

  const hasAllPermissions = useCallback(
    (codes: string[]) => codes.every(c => permissions.includes(c)),
    [permissions],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        permissions,
        permissionsLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        reloadPermissions,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
