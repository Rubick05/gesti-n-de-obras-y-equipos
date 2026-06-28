import { useState, useEffect, useCallback } from 'react';
import { supabase, DbWorker } from '../lib/supabase';
import { Worker } from '../types';

export function dbToWorker(db: DbWorker): Worker {
  return {
    id: db.id,
    name: db.name,
    role: db.role,
    email: db.email ?? '',
    phone: db.phone ?? '',
    specialty: db.specialty ?? '',
    status: db.status,
  };
}

export function useWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('workers')
      .select('*')
      .order('name', { ascending: true });
    if (err) { setError(err.message); setLoading(false); return; }
    setWorkers((data as DbWorker[]).map(dbToWorker));
    setLoading(false);
  }, []);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const addWorker = async (w: Omit<Worker, 'id'>): Promise<Worker | null> => {
    const { data, error: err } = await supabase
      .from('workers')
      .insert({ name: w.name, role: w.role, email: w.email || null, phone: w.phone || null, specialty: w.specialty || null, status: w.status })
      .select().single();
    if (err) { setError(err.message); return null; }
    const created = dbToWorker(data as DbWorker);
    setWorkers(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  };

  const updateWorker = async (w: Worker): Promise<boolean> => {
    const { error: err } = await supabase
      .from('workers')
      .update({ name: w.name, role: w.role, email: w.email || null, phone: w.phone || null, specialty: w.specialty || null, status: w.status })
      .eq('id', w.id);
    if (err) { setError(err.message); return false; }
    setWorkers(prev => prev.map(x => x.id === w.id ? w : x));
    return true;
  };

  const deleteWorker = async (workerId: string): Promise<boolean> => {
    const { error: err } = await supabase.from('workers').delete().eq('id', workerId);
    if (err) { setError(err.message); return false; }
    setWorkers(prev => prev.filter(w => w.id !== workerId));
    return true;
  };

  return { workers, loading, error, addWorker, updateWorker, deleteWorker, refetch: fetchWorkers };
}
