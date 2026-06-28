import { useState, useEffect, useCallback } from 'react';
import { supabase, DbUserCredential } from '../lib/supabase';

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'admin' | 'worker';
  workerId: string | null;
  createdAt: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we are in mock mode (checking if the table is user_credentials)
  const isMock = 'auth' in supabase && supabase.auth.constructor.name === 'MockAuth';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isMock) {
        // En modo mock, podemos obtener la contraseña de la tabla user_credentials
        const { data, error: err } = await supabase
          .from('user_credentials')
          .select('*')
          .order('name');
        
        if (err) throw err;
        
        setUsers(
          (data as DbUserCredential[]).map(d => ({
            id: d.id,
            email: d.email,
            password: d.password,
            name: d.name,
            role: d.role,
            workerId: d.worker_id,
            createdAt: d.created_at
          }))
        );
      } else {
        // En Supabase real, listamos perfiles (no tienen contraseña visible en cliente)
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .order('name');
        
        if (err) throw err;
        
        setUsers(
          (data as any[]).map(d => ({
            id: d.id,
            email: d.email || '—', // El email se puede jalar si se extiende en profiles
            name: d.name,
            role: d.role,
            workerId: d.worker_id,
            createdAt: d.created_at
          }))
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isMock]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (account: Omit<UserAccount, 'id' | 'createdAt'>): Promise<UserAccount | null> => {
    try {
      if (isMock) {
        const { data, error: err } = await supabase
          .from('user_credentials')
          .insert({
            email: account.email,
            password: account.password || '123456',
            name: account.name,
            role: account.role,
            worker_id: account.workerId,
          })
          .select()
          .single();

        if (err) throw err;

        const created: UserAccount = {
          id: data.id,
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
          workerId: data.worker_id,
          createdAt: data.created_at
        };

        setUsers(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        return created;
      } else {
        // En real mode, explicamos que requiere Supabase Auth Admin API
        throw new Error('La creación de usuarios reales en Supabase requiere usar el panel de Authentication o una Edge Function.');
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateUser = async (id: string, updates: Partial<Omit<UserAccount, 'id' | 'createdAt'>>): Promise<boolean> => {
    try {
      if (isMock) {
        const { error: err } = await supabase
          .from('user_credentials')
          .update({
            email: updates.email,
            password: updates.password,
            name: updates.name,
            role: updates.role,
            worker_id: updates.workerId,
          })
          .eq('id', id);

        if (err) throw err;

        setUsers(prev =>
          prev.map(u => (u.id === id ? { ...u, ...updates } : u))
        );
        return true;
      } else {
        // En real mode, actualizamos perfil (excepto contraseña)
        const { error: err } = await supabase
          .from('profiles')
          .update({
            name: updates.name,
            role: updates.role,
            worker_id: updates.workerId,
          })
          .eq('id', id);

        if (err) throw err;

        setUsers(prev =>
          prev.map(u => (u.id === id ? { ...u, ...updates } : u))
        );
        return true;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      if (isMock) {
        const { error: err } = await supabase
          .from('user_credentials')
          .delete()
          .eq('id', id);

        if (err) throw err;

        // También borrar de profiles
        await supabase.from('profiles').delete().eq('id', id);

        setUsers(prev => prev.filter(u => u.id !== id));
        return true;
      } else {
        // En real mode, requiere Auth Admin API
        throw new Error('La eliminación de usuarios reales en Supabase requiere usar el panel de Authentication o una Edge Function.');
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
    isMock
  };
}
