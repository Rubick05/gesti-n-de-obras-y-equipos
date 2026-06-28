import { useState, useEffect, useCallback } from 'react';
import { supabase, DbExpense } from '../lib/supabase';
import { Expense } from '../types';

export function dbToExpense(db: DbExpense): Expense {
  return {
    id: db.id,
    projectId: db.project_id,
    category: db.category,
    amount: db.amount,
    description: db.description,
    date: db.expense_date,
    authorizedBy: db.authorized_by ?? '',
  };
}

export function useExpenses(projectIdFilter?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('expenses').select('*').order('expense_date', { ascending: false });
    if (projectIdFilter) query = query.eq('project_id', projectIdFilter);
    const { data, error: err } = await query;
    if (err) { setError(err.message); setLoading(false); return; }
    setExpenses((data as DbExpense[]).map(dbToExpense));
    setLoading(false);
  }, [projectIdFilter]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const addExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense | null> => {
    const { data, error: err } = await supabase
      .from('expenses')
      .insert({
        project_id: expense.projectId,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        expense_date: expense.date,
        authorized_by: expense.authorizedBy || null,
      })
      .select().single();
    if (err) { setError(err.message); return null; }
    const created = dbToExpense(data as DbExpense);
    setExpenses(prev => [created, ...prev]);
    return created;
  };

  const deleteExpense = async (expenseId: string): Promise<boolean> => {
    const { error: err } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (err) { setError(err.message); return false; }
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    return true;
  };

  // Summary: total spent per project
  const getTotalForProject = (projectId: string): number => {
    return expenses
      .filter(e => e.projectId === projectId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return { expenses, loading, error, addExpense, deleteExpense, getTotalForProject, refetch: fetchExpenses };
}
