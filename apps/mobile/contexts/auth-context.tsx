import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getPostLoginPath,
  getUserRole,
  isApprovedBarberRole,
  isBarberPendingRole,
  isCustomerRole,
  isAdminRole,
  readRegistrationRoleFromMetadata,
  type PostLoginPath,
  type UserRole,
} from '@/services/auth-roles';
import {
  signInWithEmail,
  signOut as authSignOut,
  signUpWithEmail,
  type AuthResult,
  type SignUpInput,
} from '@/services/auth';
import { registerAdminPushToken } from '@/services/push-notifications';
import { fetchUserProfile, type UserProfile } from '@/services/profiles';
import { getSupabaseClient, isAdminAuthRequired, type Session } from '@/services/supabase';

type AuthContextValue = {
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  adminAuthRequired: boolean;
  isAdmin: boolean;
  isBarber: boolean;
  isBarberPending: boolean;
  isCustomer: boolean;
  isAuthenticated: boolean;
  postLoginPath: PostLoginPath;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      setProfile(await fetchUserProfile(userId));
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user.id);
  }, [loadProfile, session?.user.id]);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setAuthLoading(false);
      return;
    }

    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    loadProfile(session.user.id);
  }, [session?.user.id, loadProfile]);

  useEffect(() => {
    if (!session?.user.id || !profile || profile.role !== 'admin') return;
    void registerAdminPushToken(session.user.id);
  }, [session?.user.id, profile?.role, profile?.id]);

  const signIn = useCallback(async (email: string, password: string) => {
    return signInWithEmail(email, password);
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    return signUpWithEmail(input);
  }, []);

  const signOut = useCallback(async () => {
    const result = await authSignOut();
    if (!result.error) {
      setSession(null);
      setProfile(null);
    }
    return result;
  }, []);

  const loading = authLoading || (Boolean(session) && profileLoading);
  const role = useMemo(() => getUserRole(profile), [profile]);

  const value = useMemo(
    () => ({
      session,
      profile,
      role,
      loading,
      adminAuthRequired: isAdminAuthRequired(),
      isAdmin: isAdminRole(profile, session?.user.email),
      isBarber: isApprovedBarberRole(profile),
      isBarberPending: isBarberPendingRole(profile, session?.user.user_metadata),
      isCustomer:
        isCustomerRole(profile) ||
        (Boolean(session) &&
          !isAdminRole(profile, session?.user.email) &&
          !isApprovedBarberRole(profile) &&
          !isBarberPendingRole(profile, session?.user.user_metadata) &&
          readRegistrationRoleFromMetadata(session?.user.user_metadata) !== 'barber' &&
          (profile === null || profile.role === 'customer')),
      isAuthenticated: Boolean(session),
      postLoginPath: getPostLoginPath(profile, session?.user.email, {
        metadata: session?.user.user_metadata,
      }),
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [session, profile, role, loading, signIn, signUp, signOut, refreshProfile]
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
