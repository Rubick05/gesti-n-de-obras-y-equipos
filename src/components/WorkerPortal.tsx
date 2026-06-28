import React, { useState } from 'react';
import { Task, Project, Worker, TaskStatus, Tool, Loan, ToolCategory, ToolStatus } from '../types';
import {
  CheckCircle2, Circle, Clock, AlertTriangle, Edit3, Save, X,
  User, Phone, Mail, Award, Briefcase, Star, TrendingUp,
  ChevronRight, Loader2, LogOut, Users, Wrench, Search, Filter, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkerGroups } from '../hooks/useWorkerGroups';

interface WorkerPortalProps {
  myTasks: Task[];
  projects: Project[];
  workers: Worker[];
  myWorkerData: Worker | null;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => Promise<boolean>;
  onUpdateWorker: (worker: Worker) => Promise<boolean>;
  tools: Tool[];
  loans: Loan[];
}

const PRIORITY_CONFIG: Record<Task['priority'], { label: string; badge: string; dot: string }> = {
  baja:    { label: 'Baja',        badge: 'bg-slate-100 text-slate-600 border-slate-200',         dot: 'bg-slate-400' },
  media:   { label: 'Media',       badge: 'bg-sky-50 text-sky-700 border-sky-200',                dot: 'bg-sky-500' },
  alta:    { label: 'Alta',        badge: 'bg-orange-50 text-orange-700 border-orange-200',       dot: 'bg-orange-500' },
  critica: { label: 'Urgente',     badge: 'bg-red-50 text-red-700 border-red-200 font-bold',      dot: 'bg-red-500' },
};

const STATUS_COLUMNS: { status: TaskStatus; label: string; color: string; icon: React.ElementType }[] = [
  { status: 'pendiente',   label: 'Pendientes',  color: 'border-t-slate-400',  icon: Circle },
  { status: 'en_progreso', label: 'En Progreso', color: 'border-t-sky-500',    icon: Clock },
  { status: 'completada',  label: 'Completadas', color: 'border-t-emerald-500',icon: CheckCircle2 },
];

export default function WorkerPortal({
  myTasks, projects, workers, myWorkerData, onUpdateTaskStatus, onUpdateWorker, tools, loans
}: WorkerPortalProps) {
  const { profile, updateProfile, logout } = useAuth();
  const { groups, loading: groupsLoading } = useWorkerGroups();

  const [editingProfile, setEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(myWorkerData?.phone ?? '');
  const [editSpecialty, setEditSpecialty] = useState(myWorkerData?.specialty ?? '');
  const [editName, setEditName] = useState(profile?.name ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'profile' | 'groups' | 'inventory'>('tasks');

  const [searchTool, setSearchTool] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const myGroups = groups.filter(g =>
    myWorkerData && (g.leaderId === myWorkerData.id || g.memberIds.includes(myWorkerData.id))
  );

  const today = new Date().toISOString().substring(0, 10);

  const isOverdue = (dueDate: string) => dueDate && dueDate < today;
  const isDueToday = (dueDate: string) => dueDate === today;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const getToolImage = (tool: Tool) => {
    if (tool.imageUrl) return tool.imageUrl;
    const fallbacks: Record<ToolCategory, string> = {
      maquinaria_pesada: 'https://images.unsplash.com/photo-1579294800821-694d95e86143?w=500&auto=format&fit=crop&q=60',
      herramienta_electrica: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60',
      medicion: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
      manual: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop&q=60',
      seguridad: 'https://images.unsplash.com/photo-1590103512988-3e8208477880?w=500&auto=format&fit=crop&q=60',
      otros: 'https://images.unsplash.com/photo-1530124566582-ab059d8598a5?w=500&auto=format&fit=crop&q=60'
    };
    return fallbacks[tool.category] || fallbacks.otros;
  };

  const pendingCount   = myTasks.filter(t => t.status === 'pendiente').length;
  const progressCount  = myTasks.filter(t => t.status === 'en_progreso').length;
  const completedCount = myTasks.filter(t => t.status === 'completada').length;
  const totalCount     = myTasks.length;
  const completionPct  = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleStatusCycle = async (task: Task) => {
    const next: TaskStatus = task.status === 'completada' ? 'pendiente'
      : task.status === 'pendiente' ? 'en_progreso' : 'completada';
    setUpdatingTaskId(task.id);
    await onUpdateTaskStatus(task.id, next);
    setUpdatingTaskId(null);
  };

  const handleSaveProfile = async () => {
    if (!myWorkerData) return;
    setSavingProfile(true);
    await onUpdateWorker({ ...myWorkerData, phone: editPhone, specialty: editSpecialty });
    await updateProfile({ name: editName });
    setSavingProfile(false);
    setEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-slate-50" id="worker-portal">
      
      {/* Header personal */}
      <div className="bg-slate-900 text-white px-6 py-8 relative overflow-hidden" id="worker-portal-header">
        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg shrink-0"
            style={{ backgroundColor: profile?.avatar_color ?? '#ea580c' }}
          >
            {getInitials(profile?.name ?? myWorkerData?.name ?? '??')}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Portal Personal</span>
              <button
                onClick={logout}
                className="bg-slate-800 hover:bg-red-950 hover:text-red-300 border border-slate-700 text-slate-350 text-[10px] font-mono py-0.5 px-2 rounded flex items-center gap-1 transition cursor-pointer shadow-2xs"
                id="btn-worker-logout"
              >
                <LogOut className="h-3 w-3" /> Cerrar Sesión
              </button>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">{profile?.name ?? myWorkerData?.name}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{myWorkerData?.role} • {myWorkerData?.specialty}</p>
          </div>
          {/* Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-black font-mono text-orange-400">{pendingCount}</div>
              <div className="text-[10px] text-slate-500 font-mono">Pendientes</div>
            </div>
            <div className="w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-black font-mono text-sky-400">{progressCount}</div>
              <div className="text-[10px] text-slate-500 font-mono">En Progreso</div>
            </div>
            <div className="w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-black font-mono text-emerald-400">{completedCount}</div>
              <div className="text-[10px] text-slate-500 font-mono">Completadas</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="max-w-4xl mx-auto mt-5 relative z-10">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-slate-400 font-mono">Progreso General</span>
              <span className="text-[10px] text-slate-300 font-mono font-bold">{completionPct}% completado</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6" id="worker-portal-tabs">
        <div className="max-w-4xl mx-auto flex gap-1">
          {[
            { id: 'tasks' as const, label: 'Mis Tareas', icon: Briefcase },
            { id: 'inventory' as const, label: 'Inventario de Bodega', icon: Wrench },
            { id: 'groups' as const, label: 'Mis Grupos y Obras', icon: Users },
            { id: 'profile' as const, label: 'Mi Perfil', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition -mb-px ${
                activeTab === id
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              id={`tab-${id}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        
        {/* PESTAÑA: MIS TAREAS (Kanban) */}
        {activeTab === 'tasks' && (
          <div className="animate-fadeIn" id="worker-tasks-kanban">
            {totalCount === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Star className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700">Sin tareas asignadas</h3>
                <p className="text-slate-400 text-xs mt-1">El administrador aún no te ha asignado tareas. Vuelve más tarde.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATUS_COLUMNS.map(({ status, label, color, icon: ColIcon }) => {
                  const colTasks = myTasks.filter(t => t.status === status);
                  return (
                    <div key={status} className={`bg-white rounded-2xl border border-slate-200 border-t-4 shadow-2xs overflow-hidden ${color}`} id={`kanban-col-${status}`}>
                      {/* Column header */}
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ColIcon className={`h-4 w-4 ${status === 'completada' ? 'text-emerald-500' : status === 'en_progreso' ? 'text-sky-500' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold text-slate-700">{label}</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-2 py-0.5 rounded-full">{colTasks.length}</span>
                      </div>

                      {/* Task cards */}
                      <div className="p-3 space-y-3 min-h-24">
                        {colTasks.map(task => {
                          const proj = projects.find(p => p.id === task.projectId);
                          const pr = PRIORITY_CONFIG[task.priority];
                          const overdue = task.status !== 'completada' && isOverdue(task.dueDate);
                          const dueToday = task.status !== 'completada' && isDueToday(task.dueDate);
                          const isUpdating = updatingTaskId === task.id;

                          return (
                            <div
                              key={task.id}
                              className={`rounded-xl p-3.5 border transition group ${
                                task.status === 'completada'
                                  ? 'bg-slate-50 border-slate-100 opacity-70'
                                  : overdue
                                  ? 'bg-red-50/50 border-red-200'
                                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                              }`}
                              id={`worker-task-${task.id}`}
                            >
                              {/* Priority + overdue badge */}
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${pr.badge}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${pr.dot}`} />
                                  {pr.label}
                                </span>
                                {overdue && (
                                  <span className="text-[9px] text-red-600 font-bold flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Vencida
                                  </span>
                                )}
                                {dueToday && !overdue && (
                                  <span className="text-[9px] text-amber-600 font-bold flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Hoy
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <p className={`text-sm font-bold leading-snug mb-1.5 ${task.status === 'completada' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {task.title}
                              </p>

                              {/* Description */}
                              {task.description && (
                                <p className="text-[10.5px] text-slate-500 leading-relaxed mb-2 line-clamp-2">{task.description}</p>
                              )}

                              {/* Project + date */}
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-3">
                                <span className="truncate max-w-[120px]">{proj?.code} • {proj?.name.split(' ')[0]}</span>
                                {task.dueDate && <span className={overdue ? 'text-red-500 font-bold' : ''}>{task.dueDate}</span>}
                              </div>

                              {/* Action button */}
                              <button
                                onClick={() => handleStatusCycle(task)}
                                disabled={isUpdating}
                                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[10.5px] font-bold transition cursor-pointer border ${
                                  task.status === 'completada'
                                    ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                    : task.status === 'en_progreso'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs'
                                    : 'bg-sky-600 hover:bg-sky-700 text-white border-transparent shadow-xs'
                                } disabled:opacity-60`}
                                id={`btn-task-status-${task.id}`}
                              >
                                {isUpdating ? (
                                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Actualizando...</>
                                ) : task.status === 'completada' ? (
                                  <><Circle className="h-3.5 w-3.5" /> Marcar como pendiente</>
                                ) : task.status === 'en_progreso' ? (
                                  <><CheckCircle2 className="h-3.5 w-3.5" /> Marcar como completada</>
                                ) : (
                                  <><ChevronRight className="h-3.5 w-3.5" /> Comenzar tarea</>
                                )}
                              </button>
                            </div>
                          );
                        })}

                        {colTasks.length === 0 && (
                          <div className="text-center py-6 text-[10px] text-slate-300 font-mono">
                            Sin tareas aquí
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: INVENTARIO DE BODEGA */}
        {activeTab === 'inventory' && (
          <div className="animate-fadeIn space-y-6" id="worker-inventory-tab">
            {/* Tarjeta Didáctica */}
            <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex gap-3 text-xs text-orange-900" id="worker-inventory-didactic-card">
              <div className="bg-orange-100 p-2 rounded-lg text-orange-700 h-max">
                <Wrench className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-orange-950">Inventario General y Control de Bodega</p>
                <p className="text-orange-850 mt-0.5">
                  Consulta todas las herramientas registradas. Si necesitas algún equipo que está **En Uso**, puedes ver quién lo tiene y en qué obra para coordinar su entrega directamente.
                </p>
              </div>
            </div>

            {/* SECCIÓN: MIS HERRAMIENTAS PRESTADAS */}
            {myWorkerData && (
              <div className="space-y-3" id="worker-my-borrowed-tools">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Star className="h-4 w-4 text-orange-500 fill-orange-500/20" /> Mis Herramientas Prestadas (Préstamos Activos)
                </h4>
                {(() => {
                  const myActiveLoans = loans.filter(l => l.workerId === myWorkerData.id && l.status === 'activo');
                  if (myActiveLoans.length === 0) {
                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
                        No tienes ninguna herramienta prestada a tu nombre actualmente.
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myActiveLoans.map(loan => {
                        const tool = tools.find(t => t.id === loan.toolId);
                        if (!tool) return null;
                        const proj = projects.find(p => p.id === loan.projectId);
                        return (
                          <div key={loan.id} className="bg-orange-50/30 border border-orange-200 rounded-xl p-4 flex gap-4 transition hover:shadow-2xs">
                            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                              <img src={getToolImage(tool)} alt={tool.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-xs text-slate-900 truncate">{tool.name}</h4>
                                <span className="font-mono text-[9px] bg-orange-100 text-orange-850 px-1.5 py-0.5 rounded border border-orange-200 font-bold shrink-0">
                                  {tool.code}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono">Marca: {tool.brand} • Ubic. Original: {tool.location || 'Central'}</p>
                              {proj && (
                                <p className="text-[10px] text-slate-750 flex items-center gap-1">
                                  <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  Obra: <span className="font-semibold text-slate-900">{proj.name}</span>
                                </p>
                              )}
                              <p className="text-[9.5px] font-mono text-slate-500 pt-0.5 flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                Devolver antes de: <span className="font-bold text-slate-700">{loan.expectedReturnDate}</span>
                              </p>
                              {loan.notes && (
                                <p className="text-[10px] italic text-slate-500 bg-white/70 px-2 py-1 rounded border border-slate-100 mt-1.5">
                                  "{loan.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SECCIÓN: CATÁLOGO GENERAL */}
            <div className="space-y-4" id="worker-catalog-section">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Catálogo General de Equipos
              </h4>

              {/* Filtros de búsqueda */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-3 items-center shadow-2xs">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código o marca de equipo..."
                    value={searchTool}
                    onChange={e => setSearchTool(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="flex-1 md:flex-initial bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="todos">Todas las Categorías</option>
                    <option value="maquinaria_pesada">Maquinaria Pesada</option>
                    <option value="herramienta_electrica">Herramientas Eléctricas</option>
                    <option value="medicion">Equipos de Medición</option>
                    <option value="manual">Herramientas Manuales</option>
                    <option value="seguridad">Equipos de Seguridad</option>
                    <option value="otros">Otros Materiales</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="flex-1 md:flex-initial bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="todos">Disponibilidad</option>
                    <option value="disponible">Disponibles</option>
                    <option value="en_uso">En Uso</option>
                    <option value="mantenimiento">En Reparación</option>
                  </select>
                </div>
              </div>

              {/* Grilla de Herramientas */}
              {(() => {
                const categoryLabels: Record<ToolCategory, string> = {
                  maquinaria_pesada: 'Maquinaria Pesada',
                  herramienta_electrica: 'Herramientas Eléctricas',
                  medicion: 'Equipos de Medición',
                  manual: 'Herramientas Manuales',
                  seguridad: 'Equipos de Seguridad',
                  otros: 'Otros Materiales'
                };

                const statusConfigs: Record<ToolStatus, { bg: string, text: string, label: string }> = {
                  disponible: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-250', text: 'text-emerald-700', label: 'Disponible' },
                  en_uso: { bg: 'bg-orange-50 text-orange-850 border-orange-250', text: 'text-orange-700', label: 'En Uso (Prestado)' },
                  mantenimiento: { bg: 'bg-amber-50 text-amber-800 border-amber-250', text: 'text-amber-700', label: 'En Reparación' },
                  baja: { bg: 'bg-slate-100 text-slate-500 border-slate-200', text: 'text-slate-500', label: 'Retirado' }
                };

                const filtered = tools.filter(t => {
                  if (filterCategory !== 'todos' && t.category !== filterCategory) return false;
                  if (filterStatus !== 'todos' && t.status !== filterStatus) return false;
                  if (searchTool) {
                    const q = searchTool.toLowerCase();
                    return (
                      t.name.toLowerCase().includes(q) ||
                      t.code.toLowerCase().includes(q) ||
                      t.brand.toLowerCase().includes(q)
                    );
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                      <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-800 text-sm">No se encontraron herramientas</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                        Intenta modificando los filtros de búsqueda o categoría en el menú superior.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(tool => {
                      const statusStyle = statusConfigs[tool.status];
                      const activeLoan = loans.find(l => l.toolId === tool.id && l.status === 'activo');
                      const borrower = activeLoan ? workers.find(w => w.id === activeLoan.workerId) : null;
                      const targetProj = activeLoan ? projects.find(p => p.id === activeLoan.projectId) : null;
                      const toolImg = getToolImage(tool);

                      return (
                        <div key={tool.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-2xs transition duration-200" id={`worker-tool-card-${tool.id}`}>
                          {/* Image + status */}
                          <div className="relative h-32 w-full bg-slate-100 shrink-0">
                            <img src={toolImg} alt={tool.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2">
                              <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full bg-white/95 ${statusStyle.bg}`}>
                                {statusStyle.label}
                              </span>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <span className="text-[8.5px] uppercase font-mono tracking-wider font-semibold bg-slate-900/90 text-white px-2 py-0.5 rounded">
                                {categoryLabels[tool.category]}
                              </span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1">
                              <h4 className="font-bold text-xs text-slate-900 tracking-tight leading-snug">{tool.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono">Marca: {tool.brand || '—'} • Ubicación: {tool.location || 'Central'}</p>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-auto">
                              <span className="bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[9.5px] font-bold px-2 py-0.5 rounded">
                                {tool.code}
                              </span>
                            </div>

                            {/* Loan assignment info if in_use */}
                            {tool.status === 'en_uso' && activeLoan && borrower && (
                              <div className="bg-orange-50/50 p-2.5 rounded-lg border border-orange-100/70 text-[10.5px] space-y-1">
                                <div className="text-[8.5px] text-orange-600 font-bold uppercase tracking-wider font-mono">Asignación Actual</div>
                                <div className="text-slate-700">
                                  Llevado por: <span className="font-semibold text-slate-900">{borrower.name}</span>
                                </div>
                                {targetProj && (
                                  <div className="text-slate-700 truncate">
                                    En la obra: <span className="font-semibold text-slate-900">{targetProj.name}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* PESTAÑA: MIS GRUPOS Y OBRAS */}
        {activeTab === 'groups' && myWorkerData && (
          <div className="animate-fadeIn space-y-6" id="worker-groups-tab">
            {groupsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                <span className="text-xs text-slate-500 font-mono ml-2">Cargando grupos...</span>
              </div>
            ) : myGroups.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700">No perteneces a ningún grupo</h3>
                <p className="text-slate-400 text-xs mt-1">El administrador aún no te ha asignado a una cuadrilla o grupo de trabajo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {myGroups.map(group => {
                  const project = projects.find(p => p.id === group.projectId);
                  const leader = workers.find(w => w.id === group.leaderId);
                  const isLeader = group.leaderId === myWorkerData.id;
                  
                  const memberList = group.memberIds
                    .map(mId => workers.find(w => w.id === mId))
                    .filter((w): w is Worker => !!w);

                  return (
                    <div 
                      key={group.id} 
                      className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
                      id={`worker-group-card-${group.id}`}
                    >
                      {/* Cabecera del Grupo */}
                      <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-600 p-2.5 rounded-xl text-white">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-base tracking-tight">{group.name}</h3>
                            <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Grupo de Trabajo / Cuadrilla</p>
                          </div>
                        </div>

                        {project && (
                          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5 text-orange-500" />
                            <div>
                              <p className="text-[9px] text-slate-500 font-mono leading-none">PROYECTO</p>
                              <p className="text-xs font-bold text-slate-200 mt-0.5">{project.code} - {project.name}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Responsable (Líder) del Grupo */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                            Responsable del Grupo
                          </h4>
                          {leader ? (
                            <div className={`p-4 rounded-xl border flex gap-3.5 ${
                              isLeader ? 'bg-orange-50/50 border-orange-200' : 'bg-slate-50 border-slate-100'
                            }`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${
                                isLeader ? 'bg-orange-600' : 'bg-slate-700'
                              }`}>
                                {getInitials(leader.name)}
                              </div>
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-sm text-slate-800 truncate">{leader.name}</span>
                                  {isLeader ? (
                                    <span className="bg-orange-105 text-orange-850 text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                                      Tú (Líder)
                                    </span>
                                  ) : (
                                    <span className="bg-slate-205 text-slate-700 text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                                      Líder
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-550">{leader.role} • {leader.specialty || 'General'}</p>
                                
                                <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-100 mt-1.5 text-[11px] text-slate-400 font-mono">
                                  {leader.phone && (
                                    <span className="flex items-center gap-1 text-slate-650">
                                      <Phone className="h-3 w-3" /> {leader.phone}
                                    </span>
                                  )}
                                  {leader.email && (
                                    <span className="flex items-center gap-1 text-slate-650">
                                      <Mail className="h-3 w-3" /> {leader.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No hay responsable asignado a este grupo.</p>
                          )}
                        </div>

                        {/* Compañeros del Grupo */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                            Miembros del Grupo ({memberList.length})
                          </h4>
                          
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {memberList.map(member => {
                              const isMe = member.id === myWorkerData.id;
                              return (
                                <div 
                                  key={member.id} 
                                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                                    isMe ? 'bg-slate-100/70 border-slate-250 font-semibold' : 'bg-white border-slate-150'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-[10px] shrink-0">
                                      {getInitials(member.name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-bold text-slate-850 truncate">
                                        {member.name} {isMe && <span className="text-slate-400 font-normal">(Tú)</span>}
                                      </p>
                                      <p className="text-[10px] text-slate-400 truncate">{member.role} • {member.specialty || 'General'}</p>
                                    </div>
                                  </div>

                                  {!isMe && member.phone && (
                                    <a 
                                      href={`tel:${member.phone}`}
                                      className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition shrink-0"
                                      title={`Llamar a ${member.name}`}
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </div>
                              );
                            })}

                            {memberList.length === 0 && (
                              <p className="text-xs text-slate-400 italic">No hay miembros registrados en este grupo.</p>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: MI PERFIL */}
        {activeTab === 'profile' && myWorkerData && (
          <div className="animate-fadeIn max-w-xl" id="worker-profile-tab">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-orange-600" />
                  Información Personal
                </h3>
                {!editingProfile ? (
                  <button
                    onClick={() => {
                      setEditPhone(myWorkerData.phone);
                      setEditSpecialty(myWorkerData.specialty);
                      setEditName(profile?.name ?? myWorkerData.name);
                      setEditingProfile(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                    id="btn-edit-profile"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProfile(false)}
                      className="flex items-center gap-1 text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition">
                      <X className="h-3.5 w-3.5" /> Cancelar
                    </button>
                    <button onClick={handleSaveProfile} disabled={savingProfile}
                      className="flex items-center gap-1 text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg font-bold transition disabled:opacity-60"
                      id="btn-save-profile">
                      {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {savingProfile ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Avatar + name */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg text-white shadow shrink-0"
                    style={{ backgroundColor: profile?.avatar_color ?? '#ea580c' }}
                  >
                    {getInitials(editingProfile ? editName : (profile?.name ?? myWorkerData.name))}
                  </div>
                  <div className="flex-1">
                    {editingProfile ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                        placeholder="Tu nombre completo" id="input-profile-name" />
                    ) : (
                      <div>
                        <p className="font-bold text-slate-900">{profile?.name ?? myWorkerData.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{myWorkerData.role}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fields */}
                {[
                  { icon: Mail, label: 'Correo Electrónico', value: myWorkerData.email, editable: false },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
                      <p className="text-sm text-slate-700 font-mono">{value || '—'}</p>
                    </div>
                  </div>
                ))}

                {/* Phone (editable) */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Teléfono</p>
                    {editingProfile ? (
                      <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-900 focus:outline-none focus:border-orange-500 mt-0.5"
                        placeholder="+507 0000-0000" id="input-profile-phone" />
                    ) : (
                      <p className="text-sm text-slate-700 font-mono">{myWorkerData.phone || '—'}</p>
                    )}
                  </div>
                </div>

                {/* Specialty (editable) */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <Award className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Especialidad</p>
                    {editingProfile ? (
                      <input value={editSpecialty} onChange={e => setEditSpecialty(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500 mt-0.5"
                        placeholder="Ej. Concreto Estructural" id="input-profile-specialty" />
                    ) : (
                      <p className="text-sm text-slate-700">{myWorkerData.specialty || '—'}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-3 flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3" /> Estadísticas de Tareas
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Pendientes', value: pendingCount, color: 'text-slate-600' },
                      { label: 'En Progreso', value: progressCount, color: 'text-sky-600' },
                      { label: 'Completadas', value: completedCount, color: 'text-emerald-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <div className={`text-xl font-black font-mono ${color}`}>{value}</div>
                        <div className="text-[9.5px] text-slate-400 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Progreso general</span><span>{completionPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${completionPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
