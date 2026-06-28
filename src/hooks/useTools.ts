import { useState, useEffect, useCallback } from 'react';
import { supabase, DbTool } from '../lib/supabase';
import { Tool } from '../types';

export function dbToTool(db: DbTool): Tool {
  return {
    id: db.id,
    code: db.code,
    name: db.name,
    category: db.category,
    status: db.status,
    brand: db.brand ?? '',
    serialNumber: db.serial_number ?? '',
    location: db.location ?? '',
    imageUrl: db.image_url ?? undefined,
  };
}

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from('tools').select('*').order('name');
    if (err) { setError(err.message); setLoading(false); return; }
    setTools((data as DbTool[]).map(dbToTool));
    setLoading(false);
  }, []);

  useEffect(() => { fetchTools(); }, [fetchTools]);

  const addTool = async (tool: Omit<Tool, 'id'>): Promise<Tool | null> => {
    const { data, error: err } = await supabase
      .from('tools')
      .insert({ code: tool.code, name: tool.name, category: tool.category, status: tool.status, brand: tool.brand || null, serial_number: tool.serialNumber || null, location: tool.location || null, image_url: tool.imageUrl || null })
      .select().single();
    if (err) { setError(err.message); return null; }
    const created = dbToTool(data as DbTool);
    setTools(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  };

  const updateTool = async (tool: Tool): Promise<boolean> => {
    const { error: err } = await supabase
      .from('tools')
      .update({ code: tool.code, name: tool.name, category: tool.category, status: tool.status, brand: tool.brand || null, serial_number: tool.serialNumber || null, location: tool.location || null, image_url: tool.imageUrl || null })
      .eq('id', tool.id);
    if (err) { setError(err.message); return false; }
    setTools(prev => prev.map(t => t.id === tool.id ? tool : t));
    return true;
  };

  const deleteTool = async (toolId: string): Promise<boolean> => {
    const { error: err } = await supabase.from('tools').delete().eq('id', toolId);
    if (err) { setError(err.message); return false; }
    setTools(prev => prev.filter(t => t.id !== toolId));
    return true;
  };

  const setToolStatus = async (toolId: string, status: Tool['status']): Promise<boolean> => {
    const { error: err } = await supabase.from('tools').update({ status }).eq('id', toolId);
    if (err) { setError(err.message); return false; }
    setTools(prev => prev.map(t => t.id === toolId ? { ...t, status } : t));
    return true;
  };

  return { tools, loading, error, addTool, updateTool, deleteTool, setToolStatus, refetch: fetchTools };
}
