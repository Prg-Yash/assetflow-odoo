import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, getToken, clearToken, setActiveOrgId, getActiveOrgId } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  status?: string;
  roleId?: string | null;
  organizationId?: string | null;
}

export interface OrgMembership {
  organizationId: string;
  name: string;
  slug: string;
  role: string;
  isActiveContext: boolean;
  logo?: string | null;
  email?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  activeOrg: OrgMembership | null;
  memberships: OrgMembership[];
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  signOut: () => Promise<void>;
  setMemberships: (m: OrgMembership[]) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextValue>({
  user: null,
  activeOrg: null,
  memberships: [],
  isLoading: true,
  isAuthenticated: false,
  refreshSession: async () => {},
  switchOrg: async () => {},
  signOut: async () => {},
  setMemberships: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeOrg, setActiveOrg] = useState<OrgMembership | null>(null);
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await apiFetch<{ session: any; user: AuthUser }>('/api/v1/auth/get-session');
      if (res?.user) {
        setUser(res.user);

        // Re-hydrate last active org from secure storage
        const storedOrgId = await getActiveOrgId();
        if (storedOrgId) {
          // Fetch memberships to find the right one
          try {
            const memRes = await apiFetch<{ data: OrgMembership[] }>('/api/v1/organizations/my-memberships');
            if (memRes?.data) {
              setMemberships(memRes.data);
              const found = memRes.data.find((m) => m.organizationId === storedOrgId);
              if (found) setActiveOrg(found);
            }
          } catch {
            // Ignore, user will pick org on the orgs screen
          }
        }
      } else {
        setUser(null);
        setActiveOrg(null);
      }
    } catch {
      setUser(null);
      setActiveOrg(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const switchOrg = useCallback(async (orgId: string) => {
    await apiFetch('/api/v1/organizations/switch', {
      method: 'POST',
      body: JSON.stringify({ organizationId: orgId }),
    });
    await setActiveOrgId(orgId);
    const found = memberships.find((m) => m.organizationId === orgId);
    if (found) setActiveOrg(found);
  }, [memberships]);

  const signOut = useCallback(async () => {
    try {
      await apiFetch('/api/v1/auth/sign-out', { method: 'POST' });
    } catch (e) {
      console.log('sign-out error:', e);
    }
    await clearToken();
    setUser(null);
    setActiveOrg(null);
    setMemberships([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrg,
        memberships,
        isLoading,
        isAuthenticated: !!user,
        refreshSession,
        switchOrg,
        signOut,
        setMemberships,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
