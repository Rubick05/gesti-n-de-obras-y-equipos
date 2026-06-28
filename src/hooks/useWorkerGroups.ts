import { useState, useEffect, useCallback } from 'react';
import { supabase, DbWorkerGroup, DbGroupMember } from '../lib/supabase';
import { WorkerGroup } from '../types';

export function useWorkerGroups(projectIdFilter?: string) {
  const [groups, setGroups] = useState<WorkerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Obtener todos los grupos
      let groupQuery = supabase.from('worker_groups').select('*');
      if (projectIdFilter) {
        groupQuery = groupQuery.eq('project_id', projectIdFilter);
      }
      
      const { data: dbGroups, error: groupsErr } = await groupQuery;
      if (groupsErr) throw groupsErr;

      // 2. Obtener todos los miembros
      const { data: dbMembers, error: membersErr } = await supabase
        .from('group_members')
        .select('*');
      if (membersErr) throw membersErr;

      // 3. Mapear y agrupar miembros por grupo
      const memberMap: Record<string, string[]> = {};
      (dbMembers as DbGroupMember[] || []).forEach(m => {
        if (!memberMap[m.group_id]) {
          memberMap[m.group_id] = [];
        }
        memberMap[m.group_id].push(m.worker_id);
      });

      const mappedGroups: WorkerGroup[] = (dbGroups as DbWorkerGroup[] || []).map(g => ({
        id: g.id,
        name: g.name,
        projectId: g.project_id,
        leaderId: g.leader_id || '',
        memberIds: memberMap[g.id] || []
      }));

      setGroups(mappedGroups);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectIdFilter]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (
    name: string,
    projectId: string,
    leaderId: string | null,
    memberIds: string[]
  ): Promise<WorkerGroup | null> => {
    setError(null);
    try {
      // 1. Crear el registro del grupo
      const { data: newGroup, error: groupErr } = await supabase
        .from('worker_groups')
        .insert({
          name,
          project_id: projectId,
          leader_id: leaderId || null
        })
        .select()
        .single();

      if (groupErr) throw groupErr;

      const groupId = newGroup.id;

      // 2. Insertar miembros en group_members si hay
      if (memberIds.length > 0) {
        const memberPayload = memberIds.map(wId => ({
          group_id: groupId,
          worker_id: wId
        }));
        
        const { error: membersErr } = await supabase
          .from('group_members')
          .insert(memberPayload);

        if (membersErr) throw membersErr;
      }

      const created: WorkerGroup = {
        id: groupId,
        name: newGroup.name,
        projectId: newGroup.project_id,
        leaderId: newGroup.leader_id || '',
        memberIds
      };

      setGroups(prev => [...prev, created]);
      return created;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateGroup = async (
    id: string,
    name: string,
    leaderId: string | null,
    memberIds: string[]
  ): Promise<boolean> => {
    setError(null);
    try {
      // 1. Actualizar grupo
      const { error: groupErr } = await supabase
        .from('worker_groups')
        .update({
          name,
          leader_id: leaderId || null
        })
        .eq('id', id);

      if (groupErr) throw groupErr;

      // 2. Limpiar miembros anteriores
      const { error: cleanErr } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', id);

      if (cleanErr) throw cleanErr;

      // 3. Insertar nuevos miembros
      if (memberIds.length > 0) {
        const memberPayload = memberIds.map(wId => ({
          group_id: id,
          worker_id: wId
        }));
        
        const { error: membersErr } = await supabase
          .from('group_members')
          .insert(memberPayload);

        if (membersErr) throw membersErr;
      }

      setGroups(prev =>
        prev.map(g =>
          g.id === id ? { ...g, name, leaderId: leaderId || '', memberIds } : g
        )
      );
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const deleteGroup = async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const { error: err } = await supabase
        .from('worker_groups')
        .delete()
        .eq('id', id);

      if (err) throw err;

      // Nota: ON DELETE CASCADE se encarga de limpiar group_members automáticamente en DB,
      // y en el MockQueryBuilder también.

      setGroups(prev => prev.filter(g => g.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch: fetchGroups
  };
}
