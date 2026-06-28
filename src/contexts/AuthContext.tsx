import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, DbProfile } from '../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: DbProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isWorker: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<DbProfile, 'name' | 'avatar_color'>>) => Promise<{ error: string | null }>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile from Supabase
  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[AuthContext] Error loading profile:', error.message);
      return null;
    }
    return data as DbProfile;
  }, []);

  // Bootstrap session on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const p = await loadProfile(currentSession.user.id);
        if (mounted) setProfile(p);
      }

      setLoading(false);
    };

    init();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const p = await loadProfile(newSession.user.id);
          if (mounted) setProfile(p);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Login
  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      // Human-readable Spanish error messages
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Tu correo no ha sido confirmado. Revisa tu bandeja de entrada.' };
      }
      return { error: `Error de acceso: ${error.message}` };
    }

    return { error: null };
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  // Update profile
  const updateProfile = async (
    updates: Partial<Pick<DbProfile, 'name' | 'avatar_color'>>
  ): Promise<{ error: string | null }> => {
    if (!user) return { error: 'No hay sesión activa.' };

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) return { error: error.message };

    // Reload profile locally
    const p = await loadProfile(user.id);
    setProfile(p);
    return { error: null };
  };

  const value: AuthContextValue = {
    session,
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isWorker: profile?.role === 'worker',
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
