// ── useProjects: CRUD de proyectos con Supabase ──────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { supabase, DbProject } from '../lib/supabase';
import { Project } from '../types';

// Convertir snake_case DB → camelCase frontend
export function dbToProject(db: DbProject): Project {
  return {
    id: db.id,
    name: db.name,
    code: db.code,
    location: db.location ?? '',
    startDate: db.start_date ?? '',
    endDate: db.end_date ?? '',
    budget: db.budget,
    description: db.description ?? '',
    status: db.status,
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) { setError(err.message); setLoading(false); return; }
    setProjects((data as DbProject[]).map(dbToProject));
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const addProject = async (proj: Omit<Project, 'id'>): Promise<Project | null> => {
    const { data, error: err } = await supabase
      .from('projects')
      .insert({
        name: proj.name, code: proj.code, location: proj.location,
        start_date: proj.startDate || null, end_date: proj.endDate || null,
        budget: proj.budget, description: proj.description, status: proj.status,
      })
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    const created = dbToProject(data as DbProject);
    setProjects(prev => [created, ...prev]);
    return created;
  };

  const updateProject = async (proj: Project): Promise<boolean> => {
    const { error: err } = await supabase
      .from('projects')
      .update({
        name: proj.name, code: proj.code, location: proj.location,
        start_date: proj.startDate || null, end_date: proj.endDate || null,
        budget: proj.budget, description: proj.description, status: proj.status,
      })
      .eq('id', proj.id);
    if (err) { setError(err.message); return false; }
    setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
    return true;
  };

  return { projects, loading, error, addProject, updateProject, refetch: fetchProjects };
}
