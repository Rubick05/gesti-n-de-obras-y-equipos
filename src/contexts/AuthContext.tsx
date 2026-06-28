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

  // Bootstrap session on mount
  useEffect(() => {
    const saved = localStorage.getItem('cv_session_profile');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setProfile(p);
        setUser({ id: p.id, email: p.email } as any);
        setSession({ user: { id: p.id } } as any);
      } catch (e) {
        console.error('[AuthContext] Error loading profile from storage:', e);
      }
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (emailInput: string, passwordInput: string): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_credentials')
        .select('*')
        .eq('email', emailInput.trim().toLowerCase())
        .eq('password', passwordInput)
        .maybeSingle();

      setLoading(false);

      if (error) {
        console.error('[AuthContext] Login database error:', error.message);
        return { error: 'Error de conexión con la base de datos.' };
      }

      if (!data) {
        return { error: 'Correo, usuario o contraseña incorrectos. Intenta nuevamente.' };
      }

      const profileData: DbProfile = {
        id: data.id,
        name: data.name,
        role: data.role as 'admin' | 'worker',
        avatar_color: data.avatar_color || '#ea580c',
        worker_id: data.worker_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      localStorage.setItem('cv_session_profile', JSON.stringify(profileData));
      
      setProfile(profileData);
      setUser({ id: data.id, email: data.email } as any);
      setSession({ user: { id: data.id } } as any);

      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: `Error inesperado: ${err.message}` };
    }
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem('cv_session_profile');
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  // Update profile
  const updateProfile = async (
    updates: Partial<Pick<DbProfile, 'name' | 'avatar_color'>>
  ): Promise<{ error: string | null }> => {
    if (!profile) return { error: 'No hay sesión activa.' };

    try {
      const { error } = await supabase
        .from('user_credentials')
        .update({
          name: updates.name,
          avatar_color: updates.avatar_color,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) return { error: error.message };

      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('cv_session_profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
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
