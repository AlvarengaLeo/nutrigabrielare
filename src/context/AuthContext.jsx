import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// ─── Storage key ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'majes-auth';

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  // Keep localStorage in sync whenever the user state changes
  useEffect(() => {
    persistUser(user);
  }, [user]);

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Mock login — accepts any email/password combo.
   */
  const login = useCallback((email, _password) => {
    const newUser = {
      id: 'mock-user-1',
      email,
      firstName: email.split('@')[0],
      lastName: '',
    };
    setUser(newUser);
    return newUser;
  }, []);

  /**
   * Mock registration.
   */
  const register = useCallback((firstName, lastName, email, _password) => {
    const newUser = {
      id: `mock-user-${Date.now()}`,
      email,
      firstName,
      lastName,
    };
    setUser(newUser);
    return newUser;
  }, []);

  /**
   * Mock Google OAuth login.
   */
  const loginWithGoogle = useCallback(() => {
    const newUser = {
      id: 'mock-google-1',
      email: 'usuario@gmail.com',
      firstName: 'Usuario',
      lastName: 'Google',
    };
    setUser(newUser);
    return newUser;
  }, []);

  /**
   * Log out and clear persisted session.
   */
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [user, login, register, loginWithGoogle, logout],
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
