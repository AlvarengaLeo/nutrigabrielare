import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function mapUser(authUser, profile) {
  return {
    id: authUser.id,
    email: authUser.email,
    firstName:
      profile?.first_name ||
      authUser.user_metadata?.first_name ||
      authUser.email?.split('@')[0] ||
      '',
    lastName:
      profile?.last_name ||
      authUser.user_metadata?.last_name ||
      '',
  };
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser) => {
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', authUser.id)
      .single();
    return data;
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(mapUser(session.user, profile));
      }
      setLoading(false);
    });

    // Subscribe to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(mapUser(session.user, profile));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error };
    return { data };
  }, []);

  const register = useCallback(async (firstName, lastName, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });
    if (error) return { error };
    return { data };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/tienda',
      },
    });
    if (error) return { error };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [user, loading, login, register, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
