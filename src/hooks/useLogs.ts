import { useState, useEffect, useCallback } from 'react';
import { supabase, DbActivityLog } from '../lib/supabase';
import { ActivityLog } from '../types';

export function dbToLog(db: DbActivityLog): ActivityLog {
  return {
    id: db.id,
    timestamp: db.created_at,
    type: db.entity_type as ActivityLog['type'],
    action: db.action,
    entityName: db.entity_name,
    details: db.details ?? '',
  };
}

export function useLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setLogs((data ?? []).map(dbToLog));
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addLog = async (
    entityType: ActivityLog['type'],
    action: string,
    entityName: string,
    details: string,
    userId?: string
  ) => {
    await supabase.from('activity_logs').insert({
      entity_type: entityType,
      action,
      entity_name: entityName,
      details,
      user_id: userId ?? null,
    });
    // Refresh logs after adding
    fetchLogs();
  };

  return { logs, loading, addLog, refetch: fetchLogs };
}
