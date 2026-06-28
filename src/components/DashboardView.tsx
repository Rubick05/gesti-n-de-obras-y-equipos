import React from 'react';
import { Project, Worker, Task, Tool, Loan, ActivityLog, Expense } from '../types';
import {
  Building2,
  Users,
  CheckSquare,
  Wrench,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
  ClipboardList,
  ChevronRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Wallet
} from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

interface DashboardViewProps {
  projects: Project[];
  workers: Worker[];
  tasks: Task[];
  tools: Tool[];
  loans: Loan[];
  logs: ActivityLog[];
  expenses?: Expense[];
  onNavigate: (view: 'dashboard' | 'projects' | 'tasks' | 'team' | 'inventory' | 'budget') => void;
  onSelectProject: (projectId: string) => void;
}

export default function DashboardView({
  projects,
  workers,
  tasks,
  tools,
  loans,
  logs,
  expenses = [],
  onNavigate,
  onSelectProject
}: DashboardViewProps) {
  // Cálculos estadísticos
  const activeProjectsCount = projects.filter(p => p.status === 'en_progreso').length;
  const activeWorkersCount = workers.filter(w => w.status === 'activo').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'completada').length;
  
  const inUseToolsCount = tools.filter(t => t.status === 'en_uso').length;
  const totalToolsCount = tools.length;
  const toolUtilization = totalToolsCount > 0 ? Math.round((inUseToolsCount / totalToolsCount) * 100) : 0;

  // Préstamos activos
  const activeLoans = loans.filter(l => l.status === 'activo');

  // Préstamos vencidos
  const todayStr = new Date().toISOString().substring(0, 10);
  const overdueLoans = activeLoans.filter(l => l.expectedReturnDate < todayStr);

  // Obtener progreso del proyecto
  const getProjectProgress = (projId: string) => {
    const projTasks = tasks.filter(t => t.projectId === projId);
    if (projTasks.length === 0) return 0;
    const completed = projTasks.filter(t => t.status === 'completada').length;
    return Math.round((completed / projTasks.length) * 100);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="dashboard-view-container">
      
      {/* BANNER PRINCIPAL CON EXPLICACIONES CLARAS */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="dashboard-hero-banner">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10 relative space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-orange-600 text-white font-mono tracking-wider text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
            <Zap className="h-3 w-3 animate-pulse" />
            Panel de Control Constructora
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
            Control de Obras y Préstamo de Herramientas
          </h1>
          <p className="text-slate-450 text-xs md:text-sm max-w-xl leading-relaxed">
            Sigue el progreso de tus obras activas, gestiona el préstamo de herramientas a tus trabajadores y supervisa las tareas pendientes de manera sencilla y clara.
          </p>
        </div>
        <div className="border border-slate-800 bg-slate-950/60 p-4 rounded-xl flex items-center gap-3 shrink-0 z-10 w-full md:w-auto" id="current-worksite-indicator">
          <div className="bg-orange-600/10 p-2.5 rounded-lg text-orange-500">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Fecha de Hoy</div>
            <div className="text-sm font-semibold font-mono text-white">{todayStr}</div>
          </div>
        </div>
      </div>

      {/* TARJETA DIDÁCTICA DE INICIO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex gap-4 items-start" id="didactic-intro-card">
        <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-sm">¡Bienvenido al Panel de Control Vanguardia!</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Esta aplicación te permite llevar el control total de tus proyectos de construcción. Puedes dar de alta <strong>Obras</strong>, registrar a tu <strong>Personal</strong>, y gestionar la entrega de <strong>Herramientas</strong> de bodega de forma rápida y sencilla. Navega por las pestañas del menú lateral para administrar cada sección.
          </p>
        </div>
      </div>

      {/* GRID PRINCIPAL DE ESTADÍSTICAS (BENTO LAYOUT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5" id="dashboard-bento-grid">
        
        {/* CAJA 1: OBRAS EN PROGRESO */}
        <div 
          onClick={() => onNavigate('projects')}
          className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-2xs hover:border-orange-500 transition duration-200 cursor-pointer group" 
          id="bento-kpi-projects"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Obras en Progreso</span>
            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 group-hover:bg-orange-50 group-hover:text-orange-655 transition">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black font-mono text-slate-950 leading-none">{activeProjectsCount}</span>
            <span className="text-xs text-slate-400 block mt-1">de {projects.length} obras registradas</span>
          </div>
        </div>

        {/* CAJA 2: PERSONAL ACTIVO */}
        <div 
          onClick={() => onNavigate('team')}
          className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-2xs hover:border-orange-500 transition duration-200 cursor-pointer group" 
          id="bento-kpi-workers"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Trabajadores Activos</span>
            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 group-hover:bg-orange-50 group-hover:text-orange-655 transition">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black font-mono text-slate-950 leading-none">{activeWorkersCount}</span>
            <span className="text-xs text-slate-400 block mt-1">de {workers.length} operarios contratados</span>
          </div>
        </div>

        {/* CAJA 3: TAREAS PENDIENTES */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-2xs hover:border-orange-500 transition duration-200 cursor-pointer group" 
          id="bento-kpi-tasks"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Tareas Pendientes</span>
            <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black font-mono text-orange-600 leading-none">{pendingTasksCount}</span>
            <span className="text-xs text-slate-400 block mt-1">tareas por completar</span>
          </div>
        </div>

        {/* CAJA 4: EQUIPOS PRESTADOS */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-2xs hover:border-orange-500 transition duration-200 cursor-pointer group" 
          id="bento-kpi-utilization"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Equipos Prestados</span>
            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 group-hover:bg-orange-50 group-hover:text-orange-655 transition">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black font-mono text-slate-950 leading-none">{toolUtilization}%</span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-slate-900 h-full rounded-full" style={{ width: `${toolUtilization}%` }}></div>
            </div>
          </div>
        </div>

        {/* CAJA 5: PROGRESO DE OBRAS PRINCIPALES */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between" id="bento-projects-board">
          <div>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-800" />
                <h2 className="font-bold text-slate-950 text-sm">Progreso General de las Obras</h2>
              </div>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-orange-600 hover:text-orange-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                id="btn-all-projects-dashboard"
              >
                Ver todas las obras <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="p-6 divide-y divide-slate-100 space-y-4" id="dashboard-projects-list">
              {projects.slice(0, 3).map((project) => {
                const progress = getProjectProgress(project.id);
                const projTasks = tasks.filter(t => t.projectId === project.id);
                const activeLoansCount = activeLoans.filter(l => l.projectId === project.id).length;
                return (
                  <div key={project.id} className="pt-3 first:pt-0" id={`project-row-${project.id}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                            {project.code}
                          </span>
                          <button 
                            onClick={() => {
                              onSelectProject(project.id);
                              onNavigate('projects');
                            }}
                            className="font-bold text-sm text-slate-900 hover:text-orange-600 text-left transition"
                          >
                            {project.name}
                          </button>
                        </div>
                        <span className="text-xs text-slate-500 block mt-1">{project.location}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-slate-950">{progress}%</span>
                        <span className="text-[10px] text-slate-400 block font-semibold">Tareas Completadas</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress === 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-orange-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2">
                      <div className="flex gap-3">
                        <span>{projTasks.length} Tareas registradas</span>
                        <span>•</span>
                        <span>{activeLoansCount} Equipos prestados</span>
                      </div>
                      <span className={`capitalize px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        project.status === 'en_progreso' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        project.status === 'planificacion' ? 'bg-slate-100 text-slate-600' :
                        project.status === 'detenido' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {project.status === 'en_progreso' ? 'En Progreso' : 
                         project.status === 'planificacion' ? 'Planificación' : 
                         project.status === 'detenido' ? 'Detenido' : 'Completado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Las obras activas se están ejecutando con normalidad.</span>
            <span className="font-mono text-[10px] text-slate-400">Constructora Vanguardia S.A.</span>
          </div>
        </div>

        {/* CAJA 6: HISTORIAL DE ACTIVIDADES RECIENTES */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col" id="bento-activity-card">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-950 text-xs">Actividades Recientes</h2>
            <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">Hoy</span>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[420px] scrollbar-thin" id="dashboard-logs-list">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="relative pl-5 pb-3 border-l border-slate-200 last:pb-0" id={`log-item-${log.id}`}>
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border border-white bg-orange-605 bg-orange-655"></div>
                
                <div className="flex flex-col space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-450 font-semibold">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {log.action === 'Préstamo de Custodia' ? 'Préstamo de Herramienta' : 
                     log.action === 'Herramienta Reincorporada' ? 'Herramienta Devuelta' : log.action}
                  </span>
                  <span className="text-xs font-mono text-orange-600 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                    {log.entityName}
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    {log.details.replace(/custodia/gi, 'préstamo').replace(/frente/gi, 'obra')}
                  </p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No hay actividades registradas aún.
              </div>
            )}
          </div>
        </div>

        {/* CAJA 7: AVISOS DE PRÉSTAMOS VENCIDOS */}
        {overdueLoans.length > 0 && (
          <div className="lg:col-span-8 bg-rose-50/50 border border-rose-200 rounded-2xl p-5" id="bento-overdue-alerts">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-3">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <h3>PRÉSTAMOS VENCIDOS (DEVOLUCIÓN PENDIENTE): {overdueLoans.length}</h3>
            </div>
            <div className="space-y-3" id="overdue-loans-list">
              {overdueLoans.map(loan => {
                const tool = tools.find(t => t.id === loan.toolId);
                const worker = workers.find(w => w.id === loan.workerId);
                const project = projects.find(p => p.id === loan.projectId);
                return (
                  <div key={loan.id} className="bg-white p-4 rounded-xl border border-rose-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-2xs hover:border-rose-250 transition" id={`overdue-alert-${loan.id}`}>
                    <div>
                      <p className="font-bold text-slate-900">{tool?.name} ({tool?.code})</p>
                      <p className="text-slate-550 text-[11px] mt-0.5">
                        Lo tiene <span className="font-semibold text-slate-800">{worker?.name}</span> en la obra <span className="font-semibold text-slate-800">{project?.name}</span>
                      </p>
                    </div>
                    <div className="text-right sm:text-right shrink-0 flex flex-col items-end">
                      <div className="text-rose-700 font-mono font-bold flex items-center justify-end gap-1 text-[11.5px]">
                        <Clock className="h-3.5 w-3.5" />
                        Venció el: {loan.expectedReturnDate}
                      </div>
                      <button 
                        onClick={() => onNavigate('inventory')}
                        className="text-[10px] text-rose-600 underline font-bold hover:text-rose-800 mt-1 cursor-pointer"
                      >
                        Recibir Devolución
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CAJA 8: ACCESOS RÁPIDOS */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4" id="bento-shortcut-cards">
          <div 
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-500 hover:shadow-xs transition duration-200 cursor-pointer flex flex-col justify-between group" 
            onClick={() => onNavigate('inventory')}
          >
            <div>
              <div className="bg-orange-600 text-white p-2.5 rounded-xl w-max mb-3.5 group-hover:scale-105 transition">
                <Wrench className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-slate-950 text-sm mb-1 group-hover:text-orange-655 transition">Prestar una Herramienta</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Selecciona una herramienta disponible de la bodega, asígnasela a un trabajador y elige en qué obra se usará.
              </p>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold text-orange-600 gap-1 uppercase tracking-wider">
              Ir a Bodega <ChevronRight className="h-3 w-3" />
            </div>
          </div>
          
          <div 
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-500 hover:shadow-xs transition duration-200 cursor-pointer flex flex-col justify-between group" 
            onClick={() => onNavigate('tasks')}
          >
            <div>
              <div className="bg-slate-900 text-white p-2.5 rounded-xl w-max mb-3.5 group-hover:scale-105 transition">
                <CheckSquare className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-slate-950 text-sm mb-1 group-hover:text-orange-655 transition">Crear Nueva Tarea</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Asigna actividades pendientes al personal de tus obras, define fechas límite y marca la urgencia de cada una.
              </p>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold text-slate-900 gap-1 uppercase tracking-wider">
              Abrir Tablero <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* CAJA 9: RESUMEN DE EQUIPOS MÁS RECIENTES */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col" id="bento-custody-summary">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-bold text-slate-950 text-sm">Estado de las Herramientas y Bodega</h3>
              <p className="text-xs text-slate-500">Muestra un vistazo rápido del estado y la ubicación de las herramientas principales.</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 flex items-center gap-1 px-2.5 py-1 rounded-md font-bold uppercase shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" /> Inventario Actualizado
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {tools.slice(0, 4).map((tool) => {
              const activeLoan = activeLoans.find(l => l.toolId === tool.id);
              const custodian = activeLoan ? workers.find(w => w.id === activeLoan.workerId) : null;
              const place = activeLoan ? projects.find(p => p.id === activeLoan.projectId) : null;
              
              return (
                <div key={tool.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between" id={`bento-sub-tool-${tool.id}`}>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold mb-1">{tool.code}</div>
                    <div className="text-xs font-bold text-slate-900 truncate">{tool.name}</div>
                  </div>
                  <div className="mt-3.5 pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-semibold text-slate-700">
                      Estado: {tool.status === 'en_uso' ? (
                        <span className="text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded text-[9.5px]">Prestado</span>
                      ) : tool.status === 'mantenimiento' ? (
                        <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded text-[9.5px]">Taller</span>
                      ) : (
                        <span className="text-emerald-650 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[9.5px]">Disponible</span>
                      )}
                    </div>
                    {custodian ? (
                      <div className="text-[10px] text-slate-500 mt-1.5 truncate">
                        Por: <span className="font-semibold text-slate-700">{custodian.name}</span>
                        <span className="block text-[9.5px] text-slate-450 mt-0.5 font-mono truncate">{place?.name}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 mt-2 font-mono">
                        Ubicación: Bodega
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
