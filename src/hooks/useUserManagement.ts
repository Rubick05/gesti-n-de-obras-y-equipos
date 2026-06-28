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

  // Determinar si estamos en entorno Mock/Local o en la nube de Supabase
  const isMock = 'auth' in supabase && supabase.auth.constructor.name === 'MockAuth';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (account: Omit<UserAccount, 'id' | 'createdAt'>): Promise<UserAccount | null> => {
    try {
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
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUser = async (id: string, updates: Partial<Omit<UserAccount, 'id' | 'createdAt'>>): Promise<boolean> => {
    try {
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
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const { error: err } = await supabase
        .from('user_credentials')
        .delete()
        .eq('id', id);

      if (err) throw err;

      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
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
