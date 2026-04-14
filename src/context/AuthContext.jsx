import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  hasRequiredPublicRuntimeConfig,
  publicRuntimeConfig,
  publicRuntimeConfigErrorMessage,
} from '../config/runtimeConfig.js';
import { supabase } from '../lib/supabase';

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

const SUPABASE_URL = publicRuntimeConfig.supabaseUrl;
const SUPABASE_ANON_KEY = publicRuntimeConfig.supabaseAnonKey;

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
    role: profile?.role || 'customer',
  };
}

function normalizeRedirectPath(redirectPath = '/tienda') {
  if (!redirectPath || typeof redirectPath !== 'string') {
    return '/tienda';
  }

  if (
    redirectPath.startsWith('http://') ||
    redirectPath.startsWith('https://')
  ) {
    try {
      const url = new URL(redirectPath);
      return `${url.pathname}${url.search}${url.hash}` || '/tienda';
    } catch {
      return '/tienda';
    }
  }

  return redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
}

// Direct REST call to get_my_profile RPC — completely bypasses Supabase JS client and its lock issues
async function fetchProfileDirect(accessToken) {
  if (!hasRequiredPublicRuntimeConfig) {
    return null;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_my_profile`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // ignore
  }
  return null;
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const handledManually = useRef(false);

  // Listen for auth state changes
  useEffect(() => {
    if (!hasRequiredPublicRuntimeConfig) {
      console.error(`[auth] ${publicRuntimeConfigErrorMessage}`);
      setLoading(false);
      return undefined;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && session.access_token) {
        const profile = await fetchProfileDirect(session.access_token);
        setUser(mapUser(session.user, profile));
      }
      setLoading(false);
    });

    // Subscribe to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (handledManually.current) {
        handledManually.current = false;
        setLoading(false);
        return;
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }
      if (session?.user && session.access_token) {
        const profile = await fetchProfileDirect(session.access_token);
        setUser(mapUser(session.user, profile));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    if (!hasRequiredPublicRuntimeConfig) {
      return { error: new Error(publicRuntimeConfigErrorMessage) };
    }

    handledManually.current = true;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      handledManually.current = false;
      return { error };
    }
    if (data?.user && data?.session?.access_token) {
      const profile = await fetchProfileDirect(data.session.access_token);
      setUser(mapUser(data.user, profile));
    }
    return { data };
  }, []);

  const register = useCallback(async (firstName, lastName, email, password) => {
    if (!hasRequiredPublicRuntimeConfig) {
      return { error: new Error(publicRuntimeConfigErrorMessage) };
    }

    handledManually.current = true;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });
    if (error) {
      handledManually.current = false;
      return { error };
    }
    if (data?.user && data?.session?.access_token) {
      const profile = await fetchProfileDirect(data.session.access_token);
      setUser(mapUser(data.user, profile));
    } else {
      handledManually.current = false;
    }
    return { data };
  }, []);

  const loginWithGoogle = useCallback(async (redirectPath = '/tienda') => {
    if (!hasRequiredPublicRuntimeConfig) {
      return { error: new Error(publicRuntimeConfigErrorMessage) };
    }

    const safeRedirectPath = normalizeRedirectPath(redirectPath);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + safeRedirectPath,
      },
    });
    if (error) return { error };
  }, []);

  const logout = useCallback(async () => {
    if (!hasRequiredPublicRuntimeConfig) {
      setUser(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────

  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor' || isAdmin;
  const isGestor = user?.role === 'gestor' || isAdmin;

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      isAdmin,
      isEditor,
      isGestor,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [user, loading, isAdmin, isEditor, isGestor, login, register, loginWithGoogle, logout],
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
