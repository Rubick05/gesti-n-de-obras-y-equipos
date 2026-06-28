import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginView from './components/LoginView';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import TasksView from './components/TasksView';
import TeamView from './components/TeamView';
import InventoryView from './components/InventoryView';
import BudgetView from './components/BudgetView';
import WorkerPortal from './components/WorkerPortal';
import UsersView from './components/UsersView';
import { Loader2 } from 'lucide-react';

// ── Hooks de Supabase ──────────────────────────────────────────────────────
import { useProjects } from './hooks/useProjects';
import { useWorkers } from './hooks/useWorkers';
import { useTasks } from './hooks/useTasks';
import { useTools } from './hooks/useTools';
import { useLoans } from './hooks/useLoans';
import { useExpenses } from './hooks/useExpenses';
import { useLogs } from './hooks/useLogs';

type AdminView = 'dashboard' | 'projects' | 'tasks' | 'team' | 'inventory' | 'budget' | 'users';

// ── Loading Screen ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-bold text-sm">Constructora Vanguardia</p>
        <p className="text-slate-500 text-xs font-mono mt-1">Cargando sistema...</p>
      </div>
    </div>
  );
}

// ── Admin App (full access) ────────────────────────────────────────────────
function AdminApp() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const { profile } = useAuth();

  const { projects, addProject, updateProject } = useProjects();
  const { workers, addWorker, updateWorker, deleteWorker } = useWorkers();
  const { tasks, addTask, updateTask, updateTaskStatus, deleteTask } = useTasks();
  const { tools, addTool, updateTool, deleteTool, setToolStatus } = useTools();
  const { loans, checkoutTool, checkinTool } = useLoans();
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const { logs, addLog } = useLogs();

  // Wrappers que agregan log de actividad
  const handleAddProject = async (proj: Parameters<typeof addProject>[0]) => {
    const created = await addProject(proj);
    if (created) addLog('project', 'Obra Registrada', created.name, `Código: ${created.code}. Presupuesto: $${created.budget.toLocaleString()}`, profile?.id);
  };

  const handleUpdateProject = async (proj: Parameters<typeof updateProject>[0]) => {
    const ok = await updateProject(proj);
    if (ok) addLog('project', 'Obra Actualizada', proj.name, `Estado: ${proj.status}`, profile?.id);
  };

  const handleAddWorker = async (w: Parameters<typeof addWorker>[0]) => {
    const created = await addWorker(w);
    if (created) addLog('worker', 'Personal Registrado', created.name, `Puesto: ${created.role}`, profile?.id);
  };

  const handleUpdateWorker = async (w: Parameters<typeof updateWorker>[0]) => {
    await updateWorker(w);
    addLog('worker', 'Personal Actualizado', w.name, `Estado: ${w.status}`, profile?.id);
  };

  const handleDeleteWorker = async (id: string) => {
    const w = workers.find(x => x.id === id);
    await deleteWorker(id);
    if (w) addLog('worker', 'Personal Eliminado', w.name, 'Removido del sistema', profile?.id);
  };

  const handleAddTask = async (t: Parameters<typeof addTask>[0]) => {
    const created = await addTask(t);
    if (created) addLog('task', 'Tarea Asignada', created.title, `Prioridad: ${created.priority}`, profile?.id);
  };

  const handleUpdateTask = async (t: Parameters<typeof updateTask>[0]) => {
    await updateTask(t);
    addLog('task', 'Tarea Actualizada', t.title, `Estado: ${t.status}`, profile?.id);
  };

  const handleDeleteTask = async (id: string) => {
    const t = tasks.find(x => x.id === id);
    await deleteTask(id);
    if (t) addLog('task', 'Tarea Eliminada', t.title, 'Removida del tablero', profile?.id);
  };

  const handleAddTool = async (tool: Parameters<typeof addTool>[0]) => {
    const created = await addTool(tool);
    if (created) addLog('tool', 'Herramienta Inventariada', created.name, `Código: ${created.code}`, profile?.id);
  };

  const handleUpdateTool = async (tool: Parameters<typeof updateTool>[0]) => {
    await updateTool(tool);
    addLog('tool', 'Herramienta Actualizada', tool.name, `Estado: ${tool.status}`, profile?.id);
  };

  const handleDeleteTool = async (id: string) => {
    const t = tools.find(x => x.id === id);
    await deleteTool(id);
    if (t) addLog('tool', 'Herramienta Dada de Baja', t.name, 'Removida del inventario', profile?.id);
  };

  const handleCheckoutTool = async (
    toolId: string, workerId: string, projectId: string, expectedReturnDate: string, notes?: string
  ) => {
    const loan = await checkoutTool(toolId, workerId, projectId, expectedReturnDate, notes);
    if (loan) {
      await setToolStatus(toolId, 'en_uso');
      const tool = tools.find(t => t.id === toolId);
      const worker = workers.find(w => w.id === workerId);
      addLog('loan', 'Préstamo de Herramienta', tool?.name ?? 'Herramienta', `Prestado a ${worker?.name}`, profile?.id);
    }
  };

  const handleCheckinTool = async (loanId: string, notes?: string) => {
    const loan = loans.find(l => l.id === loanId);
    const ok = await checkinTool(loanId, notes);
    if (ok && loan) {
      await setToolStatus(loan.toolId, 'disponible');
      const tool = tools.find(t => t.id === loan.toolId);
      addLog('loan', 'Herramienta Devuelta', tool?.name ?? 'Herramienta', 'Devolución registrada', profile?.id);
    }
  };

  const handleAddExpense = async (expense: Parameters<typeof addExpense>[0]) => {
    await addExpense(expense);
    const proj = projects.find(p => p.id === expense.projectId);
    addLog('expense', 'Gasto Registrado', proj?.name ?? 'Proyecto', `$${expense.amount.toLocaleString()} — ${expense.category}`, profile?.id);
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
    addLog('expense', 'Gasto Eliminado', 'Presupuesto', 'Registro eliminado', profile?.id);
  };

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {activeView === 'dashboard' && (
        <DashboardView
          projects={projects} workers={workers} tasks={tasks}
          tools={tools} loans={loans} logs={logs}
          onNavigate={setActiveView} onSelectProject={setSelectedProjectId}
          expenses={expenses}
        />
      )}
      {activeView === 'projects' && (
        <ProjectsView
          projects={projects} tasks={tasks} tools={tools}
          loans={loans} workers={workers}
          onAddProject={handleAddProject} onUpdateProject={handleUpdateProject}
          selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId}
        />
      )}
      {activeView === 'tasks' && (
        <TasksView
          tasks={tasks} projects={projects} workers={workers}
          onAddTask={handleAddTask} onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId}
        />
      )}
      {activeView === 'team' && (
        <TeamView
          workers={workers} tasks={tasks}
          onAddWorker={handleAddWorker} onUpdateWorker={handleUpdateWorker}
          onDeleteWorker={handleDeleteWorker}
        />
      )}
      {activeView === 'inventory' && (
        <InventoryView
          tools={tools} loans={loans} workers={workers} projects={projects}
          onAddTool={handleAddTool} onUpdateTool={handleUpdateTool} onDeleteTool={handleDeleteTool}
          onCheckoutTool={handleCheckoutTool} onCheckinTool={handleCheckinTool}
        />
      )}
      {activeView === 'budget' && (
        <BudgetView
          projects={projects} expenses={expenses}
          onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense}
        />
      )}
      {activeView === 'users' && (
        <UsersView workers={workers} />
      )}
    </Layout>
  );
}

// ── Worker App (restricted portal) ────────────────────────────────────────
function WorkerApp() {
  const { profile } = useAuth();
  const workerId = profile?.worker_id ?? '';

  const { projects } = useProjects();
  const { workers, updateWorker } = useWorkers();
  const { tasks, updateTaskStatus } = useTasks(workerId || undefined);
  const { tools } = useTools();
  const { loans } = useLoans();

  const myWorkerData = workers.find(w => w.id === workerId) ?? null;

  return (
    <WorkerPortal
      myTasks={tasks}
      projects={projects}
      workers={workers}
      myWorkerData={myWorkerData}
      onUpdateTaskStatus={updateTaskStatus}
      onUpdateWorker={updateWorker}
      tools={tools}
      loans={loans}
    />
  );
}

// ── Root with auth gate ────────────────────────────────────────────────────
function AppInner() {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!session || !profile) return <LoginView />;
  if (profile.role === 'admin') return <AdminApp />;
  return <WorkerApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
