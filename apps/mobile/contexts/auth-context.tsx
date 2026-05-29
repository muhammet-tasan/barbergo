import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { signInWithEmail, signOut as authSignOut, type AuthResult } from '@/services/auth';
import { getSupabaseClient, isAdminAuthRequired, type Session } from '@/services/supabase';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  adminAuthRequired: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return signInWithEmail(email, password);
  }, []);

  const signOut = useCallback(async () => {
    const result = await authSignOut();
    if (!result.error) {
      setSession(null);
    }
    return result;
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      adminAuthRequired: isAdminAuthRequired(),
      signIn,
      signOut,
    }),
    [session, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
