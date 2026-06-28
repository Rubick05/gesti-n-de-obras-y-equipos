import { useState, useEffect, useCallback } from 'react';
import { supabase, DbLoan } from '../lib/supabase';
import { Loan } from '../types';

export function dbToLoan(db: DbLoan): Loan {
  return {
    id: db.id,
    toolId: db.tool_id,
    workerId: db.worker_id,
    projectId: db.project_id,
    borrowDate: db.borrow_date,
    expectedReturnDate: db.expected_return_date,
    actualReturnDate: db.actual_return_date ?? undefined,
    status: db.status,
    notes: db.notes ?? undefined,
  };
}

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) { setError(err.message); setLoading(false); return; }
    setLoans((data as DbLoan[]).map(dbToLoan));
    setLoading(false);
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const checkoutTool = async (
    toolId: string, workerId: string, projectId: string,
    expectedReturnDate: string, notes?: string
  ): Promise<Loan | null> => {
    const { data, error: err } = await supabase
      .from('loans')
      .insert({
        tool_id: toolId, worker_id: workerId, project_id: projectId,
        borrow_date: new Date().toISOString().substring(0, 10),
        expected_return_date: expectedReturnDate,
        status: 'activo',
        notes: notes || null,
      })
      .select().single();
    if (err) { setError(err.message); return null; }
    const created = dbToLoan(data as DbLoan);
    setLoans(prev => [created, ...prev]);
    return created;
  };

  const checkinTool = async (loanId: string, notes?: string): Promise<boolean> => {
    const today = new Date().toISOString().substring(0, 10);
    const loan = loans.find(l => l.id === loanId);
    const updatedNotes = notes
      ? `${loan?.notes ?? ''} | Devolución: ${notes}`.trim().replace(/^\| /, '')
      : loan?.notes;

    const { error: err } = await supabase
      .from('loans')
      .update({ status: 'devuelto', actual_return_date: today, notes: updatedNotes })
      .eq('id', loanId);
    if (err) { setError(err.message); return false; }
    setLoans(prev => prev.map(l =>
      l.id === loanId ? { ...l, status: 'devuelto', actualReturnDate: today, notes: updatedNotes } : l
    ));
    return true;
  };

  return { loans, loading, error, checkoutTool, checkinTool, refetch: fetchLoans };
}
