import { useState, useEffect, useCallback } from 'react';
import { supabase, DbTask } from '../lib/supabase';
import { Task } from '../types';

export function dbToTask(db: DbTask): Task {
  return {
    id: db.id,
    projectId: db.project_id,
    assignedWorkerId: db.assigned_worker_id ?? '',
    assignedGroupId: db.assigned_group_id ?? '',
    title: db.title,
    description: db.description ?? '',
    priority: db.priority,
    status: db.status,
    dueDate: db.due_date ?? '',
  };
}

export function useTasks(workerIdFilter?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('tasks').select('*').order('due_date', { ascending: true });
    if (workerIdFilter) {
      query = query.eq('assigned_worker_id', workerIdFilter);
    }
    const { data, error: err } = await query;
    if (err) { setError(err.message); setLoading(false); return; }
    setTasks((data as DbTask[]).map(dbToTask));
    setLoading(false);
  }, [workerIdFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Realtime subscription for task updates
  useEffect(() => {
    const channel = supabase
      .channel('tasks_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newTask = dbToTask(payload.new as DbTask);
          setTasks(prev => {
            // Only add if passes the worker filter
            if (workerIdFilter && newTask.assignedWorkerId !== workerIdFilter) return prev;
            return [...prev, newTask];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updated = dbToTask(payload.new as DbTask);
          setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workerIdFilter]);

  const addTask = async (task: Omit<Task, 'id'>): Promise<Task | null> => {
    const { data, error: err } = await supabase
      .from('tasks')
      .insert({
        project_id: task.projectId,
        assigned_worker_id: task.assignedWorkerId || null,
        assigned_group_id: task.assignedGroupId || null,
        title: task.title,
        description: task.description || null,
        priority: task.priority,
        status: task.status,
        due_date: task.dueDate || null,
      })
      .select().single();
    if (err) { setError(err.message); return null; }
    return dbToTask(data as DbTask);
  };

  const updateTask = async (task: Task): Promise<boolean> => {
    const { error: err } = await supabase
      .from('tasks')
      .update({
        project_id: task.projectId,
        assigned_worker_id: task.assignedWorkerId || null,
        assigned_group_id: task.assignedGroupId || null,
        title: task.title,
        description: task.description || null,
        priority: task.priority,
        status: task.status,
        due_date: task.dueDate || null,
      })
      .eq('id', task.id);
    if (err) { setError(err.message); return false; }
    return true;
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']): Promise<boolean> => {
    const { error: err } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);
    if (err) { setError(err.message); return false; }
    return true;
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    const { error: err } = await supabase.from('tasks').delete().eq('id', taskId);
    if (err) { setError(err.message); return false; }
    setTasks(prev => prev.filter(t => t.id !== taskId));
    return true;
  };

  return { tasks, loading, error, addTask, updateTask, updateTaskStatus, deleteTask, refetch: fetchTasks };
}
