import React, { useState } from 'react';
import { Project, Expense, ExpenseCategory } from '../types';
import {
  DollarSign, TrendingDown, PlusCircle, Trash2, Filter,
  AlertTriangle, CheckCircle, BarChart3, ArrowUpCircle, Calendar, User,
  PackageOpen, Hammer, Truck, FileText, Boxes, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BudgetViewProps {
  projects: Project[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

const CATEGORY_LABELS: Record<ExpenseCategory, { label: string; icon: React.ElementType; color: string }> = {
  materiales:     { label: 'Materiales',       icon: Boxes,       color: 'bg-blue-100 text-blue-700 border-blue-200' },
  mano_de_obra:   { label: 'Mano de Obra',     icon: Hammer,      color: 'bg-orange-100 text-orange-700 border-orange-200' },
  maquinaria:     { label: 'Maquinaria',        icon: Truck,       color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  subcontrato:    { label: 'Subcontrato',       icon: User,        color: 'bg-purple-100 text-purple-700 border-purple-200' },
  administrativo: { label: 'Administrativo',   icon: FileText,    color: 'bg-slate-100 text-slate-700 border-slate-200' },
  otro:           { label: 'Otro',              icon: HelpCircle,  color: 'bg-stone-100 text-stone-700 border-stone-200' },
};

const fmt = (n: number) => new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function BudgetView({ projects, expenses, onAddExpense, onDeleteExpense }: BudgetViewProps) {
  const { profile } = useAuth();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id ?? '');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [fProject, setFProject] = useState(projects[0]?.id ?? '');
  const [fCategory, setFCategory] = useState<ExpenseCategory>('materiales');
  const [fAmount, setFAmount] = useState('');
  const [fDescription, setFDescription] = useState('');
  const [fDate, setFDate] = useState(new Date().toISOString().substring(0, 10));
  const [submitting, setSubmitting] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Budget computations for selected project
  const projectExpenses = expenses.filter(e => e.projectId === selectedProjectId);
  const filteredExpenses = filterCategory === 'todos'
    ? projectExpenses
    : projectExpenses.filter(e => e.category === filterCategory);

  const totalSpent = projectExpenses.reduce((s, e) => s + e.amount, 0);
  const budgetLeft = (selectedProject?.budget ?? 0) - totalSpent;
  const execPct = selectedProject?.budget
    ? Math.min(Math.round((totalSpent / selectedProject.budget) * 100), 100)
    : 0;

  // By category totals for selected project
  const categoryTotals = (Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map(cat => ({
    cat,
    total: projectExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fAmount || parseFloat(fAmount) <= 0 || !fDescription) return;
    setSubmitting(true);
    await onAddExpense({
      projectId: fProject,
      category: fCategory,
      amount: parseFloat(fAmount),
      description: fDescription,
      date: fDate,
      authorizedBy: profile?.name ?? 'Admin',
    });
    setFAmount('');
    setFDescription('');
    setFDate(new Date().toISOString().substring(0, 10));
    setSubmitting(false);
    setShowForm(false);
  };

  const progressColor = execPct >= 100 ? 'bg-red-500' : execPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
  const statusColor   = execPct >= 100 ? 'text-red-600 bg-red-50 border-red-200' : execPct >= 80 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  return (
    <div className="space-y-6 animate-fadeIn" id="budget-view-main">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4" id="budget-view-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Presupuesto y Gastos</h1>
          <p className="text-slate-500 text-xs mt-1">Registra y da seguimiento a los gastos de cada proyecto. Solo visible para administradores.</p>
        </div>
        <button
          onClick={() => { setFProject(selectedProjectId || (projects[0]?.id ?? '')); setShowForm(true); }}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
          id="btn-add-expense"
        >
          <PlusCircle className="h-4 w-4" /> Registrar Gasto
        </button>
      </div>

      {/* Selector de Proyecto */}
      <div className="flex gap-2 flex-wrap" id="budget-project-tabs">
        {projects.map(p => (
          <button
            key={p.id}
            onClick={() => { setSelectedProjectId(p.id); setFilterCategory('todos'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              selectedProjectId === p.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            <span className="font-mono text-[9px] opacity-60">{p.code}</span>
            {p.name.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      {selectedProject && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="budget-kpi-cards">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Presupuesto Total</span>
                <div className="p-2 bg-slate-100 rounded-lg"><DollarSign className="h-4 w-4 text-slate-600" /></div>
              </div>
              <span className="text-2xl font-black font-mono text-slate-900">{fmt(selectedProject.budget)}</span>
              <span className="text-[10px] text-slate-400 mt-1">Asignado para {selectedProject.code}</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Ejecutado</span>
                <div className="p-2 bg-orange-50 rounded-lg"><TrendingDown className="h-4 w-4 text-orange-600" /></div>
              </div>
              <span className="text-2xl font-black font-mono text-orange-600">{fmt(totalSpent)}</span>
              <div className="mt-2">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${execPct}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">{execPct}% del presupuesto ejecutado</span>
              </div>
            </div>

            <div className={`rounded-2xl border p-5 shadow-2xs flex flex-col justify-between ${statusColor}`}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Saldo Disponible</span>
                {budgetLeft >= 0
                  ? <CheckCircle className="h-5 w-5 opacity-70" />
                  : <AlertTriangle className="h-5 w-5 opacity-70" />}
              </div>
              <span className="text-2xl font-black font-mono">{fmt(Math.abs(budgetLeft))}</span>
              <span className="text-[10px] opacity-70 mt-1">
                {budgetLeft >= 0 ? 'Restante para gastar' : 'PRESUPUESTO EXCEDIDO'}
              </span>
            </div>
          </div>

          {/* Distribución por categoría */}
          {categoryTotals.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs" id="budget-category-breakdown">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4.5 w-4.5 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">Distribución por Categoría</h3>
              </div>
              <div className="space-y-3">
                {categoryTotals.sort((a, b) => b.total - a.total).map(({ cat, total }) => {
                  const catInfo = CATEGORY_LABELS[cat];
                  const pct = totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0;
                  const Icon = catInfo.icon;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border w-40 shrink-0 ${catInfo.color}`}>
                        <Icon className="h-3 w-3" /> {catInfo.label}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-slate-700 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700 w-28 text-right">{fmt(total)}</span>
                      <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Formulario de Gasto */}
          {showForm && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-2xs animate-fadeIn" id="expense-form-panel">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-950 flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-orange-600" /> Registrar Nuevo Gasto
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-500 text-xs border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition">Cancelar</button>
              </div>
              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" id="expense-form">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Proyecto *</label>
                  <select value={fProject} onChange={e => setFProject(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-slate-900">
                    {projects.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría *</label>
                  <select value={fCategory} onChange={e => setFCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-slate-900">
                    {(Object.entries(CATEGORY_LABELS) as [ExpenseCategory, typeof CATEGORY_LABELS[ExpenseCategory]][]).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monto (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">$</span>
                    <input required type="number" min="0.01" step="0.01" placeholder="0.00"
                      value={fAmount} onChange={e => setFAmount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-slate-900"
                      id="input-expense-amount" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha del Gasto</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="date" value={fDate} onChange={e => setFDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-slate-900"
                      id="input-expense-date" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción del Gasto *</label>
                  <textarea required rows={2} placeholder="Describe qué se adquirió o contrató, proveedor, unidades, etc."
                    value={fDescription} onChange={e => setFDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-slate-900 resize-none"
                    id="input-expense-description" />
                </div>
                <div className="md:col-span-2 text-right">
                  <button type="submit" disabled={submitting}
                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                    id="btn-save-expense">
                    {submitting ? 'Guardando...' : 'Registrar Gasto'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tabla de gastos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden" id="expense-table">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <PackageOpen className="h-4.5 w-4.5 text-slate-500" />
                Detalle de Gastos — {selectedProject.name}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-semibold text-slate-700 focus:outline-none">
                  <option value="todos">Todas las categorías</option>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs" id="expense-empty-state">
                <PackageOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No hay gastos registrados para esta selección.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredExpenses.map(exp => {
                  const catInfo = CATEGORY_LABELS[exp.category];
                  const Icon = catInfo.icon;
                  return (
                    <div key={exp.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition" id={`expense-row-${exp.id}`}>
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 mt-0.5 ${catInfo.color}`}>
                          <Icon className="h-3 w-3" /> {catInfo.label}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{exp.description}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>{exp.date}</span>
                            {exp.authorizedBy && <><span>•</span><span>Por: {exp.authorizedBy}</span></>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-base font-black font-mono text-slate-900">{fmt(exp.amount)}</span>
                        <button onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar gasto" id={`btn-delete-expense-${exp.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredExpenses.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">{filteredExpenses.length} registros mostrados</span>
                <span className="font-black text-slate-900">
                  Total: {fmt(filteredExpenses.reduce((s, e) => s + e.amount, 0))}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
