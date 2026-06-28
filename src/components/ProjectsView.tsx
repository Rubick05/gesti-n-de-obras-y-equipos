import React, { useState } from 'react';
import { Project, Task, Tool, Loan, Worker, ProjectStatus, WorkerGroup } from '../types';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Briefcase, 
  Wrench, 
  CheckCircle2, 
  Building,
  BookOpen,
  Users,
  Trash2,
  UserCheck
} from 'lucide-react';
import { useWorkerGroups } from '../hooks/useWorkerGroups';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  tools: Tool[];
  loans: Loan[];
  workers: Worker[];
  onAddProject: (project: Omit<Project, 'id'>) => void | Promise<void>;
  onUpdateProject: (project: Project) => void | Promise<void>;
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
}

export default function ProjectsView({
  projects,
  tasks,
  tools,
  loans,
  workers,
  onAddProject,
  onUpdateProject,
  selectedProjectId,
  onSelectProject
}: ProjectsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Hook de grupos
  const { groups, createGroup, updateGroup, deleteGroup } = useWorkerGroups();

  // Estado de formulario de grupos
  const [editingGroup, setEditingGroup] = useState<WorkerGroup | null>(null);
  const [showGroupFormId, setShowGroupFormId] = useState<string | null>(null); // projectId
  const [groupName, setGroupName] = useState('');
  const [groupLeaderId, setGroupLeaderId] = useState('');
  const [groupMemberIds, setGroupMemberIds] = useState<string[]>([]);

  // Campos del formulario
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planificacion');

  // Abrir formulario para agregar
  const handleOpenAddForm = () => {
    setName('');
    setCode('');
    setLocation('');
    setStartDate(new Date().toISOString().substring(0, 10));
    setEndDate('');
    setBudget(0);
    setDescription('');
    setStatus('planificacion');
    setEditingProject(null);
    setShowAddForm(true);
  };

  // Abrir formulario para editar
  const handleOpenEditForm = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setName(proj.name);
    setCode(proj.code);
    setLocation(proj.location);
    setStartDate(proj.startDate);
    setEndDate(proj.endDate);
    setBudget(proj.budget);
    setDescription(proj.description || '');
    setStatus(proj.status);
    setShowAddForm(true);
  };

  // Enviar formulario (Crear o Editar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    if (editingProject) {
      onUpdateProject({
        ...editingProject,
        name,
        code,
        location,
        startDate,
        endDate,
        budget: Number(budget),
        description,
        status
      });
    } else {
      onAddProject({
        name,
        code,
        location,
        startDate,
        endDate,
        budget: Number(budget),
        description,
        status
      });
    }
    setShowAddForm(false);
    setEditingProject(null);
  };

  const statusBadges: Record<ProjectStatus, { bg: string, text: string, label: string }> = {
    planificacion: { bg: 'bg-stone-100 border-stone-200', text: 'text-stone-650', label: 'Planificación' },
    en_progreso: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700 font-semibold', label: 'En Progreso' },
    detenido: { bg: 'bg-rose-50 border-rose-250', text: 'text-rose-700', label: 'Detenido' },
    completado: { bg: 'bg-emerald-50 border-emerald-250', text: 'text-emerald-700', label: 'Completado' }
  };

  // Cálculos de progreso y recursos del proyecto
  const getProjectStats = (projId: string) => {
    const projTasks = tasks.filter(t => t.projectId === projId);
    const completedTasks = projTasks.filter(t => t.status === 'completada').length;
    const projectProgress = projTasks.length > 0 ? Math.round((completedTasks / projTasks.length) * 100) : 0;
    
    const activeProjectLoans = loans.filter(l => l.projectId === projId && l.status === 'activo');
    const activeProjectTools = activeProjectLoans.map(l => tools.find(t => t.id === l.toolId)).filter(Boolean) as Tool[];

    return {
      progress: projectProgress,
      totalTasks: projTasks.length,
      completedTasks,
      activeTools: activeProjectTools
    };
  };

  const handleToggleExpand = (id: string) => {
    if (selectedProjectId === id) {
      onSelectProject('');
    } else {
      onSelectProject(id);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="space-y-6" id="projects-view-main">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-4" id="projects-view-header">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-sans tracking-tight">Obras y Proyectos</h1>
          <p className="text-stone-500 text-xs mt-1">Registra tus obras, define presupuestos, ubicaciones geográficas y haz seguimiento de las tareas y herramientas de cada proyecto.</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          id="btn-new-project"
        >
          <Plus className="h-4 w-4" /> Agregar Obra / Proyecto
        </button>
      </div>

      {/* TARJETA DIDÁCTICA */}
      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex gap-3 text-xs text-orange-900" id="projects-didactic-card">
        <div className="bg-orange-100 p-2 rounded-lg text-orange-700 h-max">
          <BookOpen className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="font-semibold text-orange-950">¿Cómo funciona esta sección?</p>
          <p className="text-orange-850 mt-0.5">
            Aquí puedes ver todas tus obras activas. Haz clic en cualquiera de ellas para desplegarla; esto te mostrará qué <strong>Herramientas</strong> han sido prestadas a esta obra y cuáles son las <strong>Tareas</strong> asignadas al personal de campo. El progreso se calcula automáticamente de acuerdo a las tareas completadas.
          </p>
        </div>
      </div>

      {/* RESUMEN DE PROYECTOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="projects-metrics-bar">
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-slate-900 text-white rounded-lg">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Total de Proyectos</span>
            <span className="text-lg font-bold font-mono text-stone-950">{projects.length} obras</span>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-amber-500 text-stone-950 rounded-lg">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Presupuesto Asignado</span>
            <span className="text-lg font-bold font-mono text-stone-950">
              {formatCurrency(projects.reduce((acc, curr) => acc + curr.budget, 0))}
            </span>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-emerald-500 text-white rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Proyectos Completados</span>
            <span className="text-lg font-bold font-mono text-stone-950">
              {projects.filter(p => p.status === 'completado').length} obras
            </span>
          </div>
        </div>
      </div>

      {/* FORMULARIO PARA AGREGAR / EDITAR PROYECTO */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-stone-300 p-6 space-y-4 shadow-2xs animate-fadeIn" id="project-form-container">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-stone-100">
            <h3 className="font-bold text-stone-950 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-600" />
              {editingProject ? 'Editar Información del Proyecto u Obra' : 'Registrar Nuevo Proyecto de Construcción'}
            </h3>
            <button 
              onClick={() => { setShowAddForm(false); setEditingProject(null); }}
              className="text-stone-500 hover:text-stone-900 text-xs font-semibold border border-stone-250 px-2.5 py-1 rounded-md"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4" id="project-form">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nombre de la Obra o Proyecto *</label>
              <input
                required
                type="text"
                placeholder="Ej. Bulevar Comercial Los Olivos"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-project-name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Código del Proyecto (Corto) *</label>
              <input
                required
                type="text"
                placeholder="Ej. BCL-12"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-project-code"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">Ubicación / Dirección de la Obra</label>
              <input
                type="text"
                placeholder="Ej. Vía España, frente a Parque España"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-project-location"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Presupuesto Asignado (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 text-xs font-bold">$</span>
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="Ej. 1200000"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="w-full bg-white border border-stone-250 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                  id="input-project-budget"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-project-startdate"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Fecha Estimada de Finalización</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-project-enddate"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Estado de la Obra *</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="select-project-status"
              >
                <option value="planificacion">Planificación</option>
                <option value="en_progreso">En Progreso</option>
                <option value="detenido">Detenido</option>
                <option value="completado">Completado</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 mb-1">Descripción General de los Trabajos</label>
              <textarea
                rows={3}
                placeholder="Escribe aquí un resumen del alcance de la obra, fases de trabajo u observaciones del proyecto..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-project-desc"
              />
            </div>

            <div className="md:col-span-3 text-right">
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-xs cursor-pointer"
                id="btn-save-project"
              >
                {editingProject ? 'Guardar Cambios' : 'Registrar Proyecto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO DE PROYECTOS */}
      <div className="space-y-4" id="projects-accordion-list">
        {projects.map((project) => {
          const stats = getProjectStats(project.id);
          const isExpanded = selectedProjectId === project.id;
          const badge = statusBadges[project.status];

          return (
            <div 
              key={project.id} 
              className={`bg-white rounded-xl border transition-all ${
                isExpanded ? 'border-orange-500 shadow-2xs' : 'border-stone-200 hover:border-stone-300'
              }`}
              id={`project-card-${project.id}`}
            >
              {/* Bloque superior clickeable para abrir/cerrar */}
              <div 
                onClick={() => handleToggleExpand(project.id)}
                className="p-5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-semibold bg-stone-100 border border-stone-200 text-stone-700 px-2 py-0.5 rounded">
                      {project.code}
                    </span>
                    <h3 className="font-bold text-base text-stone-950 font-sans tracking-tight">{project.name}</h3>
                    <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{project.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end shrink-0 border-t border-stone-100 sm:border-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-stone-900 font-mono block">{stats.progress}%</span>
                    <span className="text-[10px] text-stone-400 block uppercase">Progreso</span>
                  </div>

                  <div className="text-left sm:text-right hidden md:block">
                    <span className="text-xs font-bold text-stone-900 font-mono block">{formatCurrency(project.budget)}</span>
                    <span className="text-[10px] text-stone-400 block uppercase">Presupuesto</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleOpenEditForm(project, e)}
                      className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                      title="Editar proyecto"
                      id={`btn-edit-project-${project.id}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <div>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-stone-500" /> : <ChevronDown className="h-5 w-5 text-stone-500" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-stone-100 h-1">
                <div 
                  className={`h-full transition-all duration-500 ${
                    stats.progress === 100 ? 'bg-emerald-500' : 'bg-orange-600'
                  }`}
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>

              {/* Detalles expandibles */}
              {isExpanded && (
                <div className="p-6 border-t border-stone-200 bg-stone-50/50 rounded-b-xl space-y-6" id={`expanded-project-${project.id}`}>
                  
                  {/* Detalles rápidos */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id={`project-metadata-grid-${project.id}`}>
                    <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs">
                      <span className="text-stone-400 font-medium block">Fecha de Inicio</span>
                      <span className="font-semibold text-slate-850 mt-1 block flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-stone-400" /> {project.startDate}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs">
                      <span className="text-stone-400 font-medium block">Fecha Estimada de Fin</span>
                      <span className="font-semibold text-slate-850 mt-1 block flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-stone-400" /> {project.endDate || 'No definida'}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs">
                      <span className="text-stone-400 font-medium block">Presupuesto</span>
                      <span className="font-semibold text-slate-850 mt-1 block flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-stone-400" /> {formatCurrency(project.budget)}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs">
                      <span className="text-stone-400 font-medium block">Tareas Realizadas</span>
                      <span className="font-semibold text-slate-850 mt-1 block">
                        {stats.completedTasks} de {stats.totalTasks} tareas completadas ({stats.progress}% total)
                      </span>
                    </div>
                  </div>

                  {/* Descripción general */}
                  {project.description && (
                    <div className="bg-white p-4 rounded-lg border border-stone-200 text-xs leading-relaxed" id={`project-description-${project.id}`}>
                      <span className="text-stone-500 font-bold block mb-1 uppercase tracking-wider text-[9px]">Descripción del Proyecto</span>
                      <p className="text-stone-700">{project.description}</p>
                    </div>
                  )}

                  {/* Listado de herramientas, tareas y grupos en esta obra */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id={`project-resources-${project.id}`}>
                    
                    {/* Herramientas asignadas */}
                    <div className="space-y-3" id={`project-tools-${project.id}`}>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                        <Wrench className="h-4 w-4" /> Herramientas en esta Obra ({stats.activeTools.length})
                      </h4>
                      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-150 shadow-2xs">
                        {stats.activeTools.map(tool => {
                          const currentLoan = loans.find(l => l.toolId === tool.id && l.projectId === project.id && l.status === 'activo');
                          const worker = workers.find(w => w.id === currentLoan?.workerId);
                          return (
                            <div key={tool.id} className="p-3 text-xs flex justify-between items-center bg-white" id={`project-tool-row-${tool.id}`}>
                              <div>
                                <p className="font-semibold text-stone-900">{tool.name}</p>
                                <p className="text-stone-550 text-[10px] mt-0.5">
                                  Código: {tool.code} • Marca: {tool.brand}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="bg-orange-50 text-orange-850 font-bold text-[9.5px] px-2 py-0.5 rounded border border-orange-100 block mb-1">
                                  En obra
                                </span>
                                {worker && (
                                  <span className="text-[10px] text-slate-500 block">
                                    Responsable: {worker.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {stats.activeTools.length === 0 && (
                          <div className="p-4 text-center text-xs text-stone-400 bg-white">
                            No hay herramientas prestadas a esta obra actualmente.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tareas asociadas */}
                    <div className="space-y-3" id={`project-tasks-${project.id}`}>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Tareas de esta Obra ({stats.totalTasks})
                      </h4>
                      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-150 shadow-2xs">
                        {tasks.filter(t => t.projectId === project.id).map(task => {
                          const w = workers.find(worker => worker.id === task.assignedWorkerId);
                          return (
                            <div key={task.id} className="p-3 text-xs flex justify-between items-center bg-white" id={`project-task-row-${task.id}`}>
                              <div className="pr-4">
                                <p className="font-semibold text-stone-900">{task.title}</p>
                                <div className="flex gap-2 items-center text-[10.5px] mt-1 flex-wrap">
                                  <span className={`text-[9px] font-mono px-1.5 rounded uppercase ${
                                    task.priority === 'critica' ? 'bg-red-100 text-red-700 font-bold' :
                                    task.priority === 'alta' ? 'bg-orange-150 text-orange-700 font-semibold' :
                                    task.priority === 'media' ? 'bg-stone-150 text-stone-700' : 'bg-stone-100 text-stone-500'
                                  }`}>
                                    {task.priority === 'critica' ? 'Urgente' : 
                                     task.priority === 'alta' ? 'Alta' :
                                     task.priority === 'media' ? 'Media' : 'Baja'}
                                  </span>
                                  <span className="text-stone-400">•</span>
                                  <span className="text-stone-600 font-medium">Límite: {task.dueDate}</span>
                                </div>
                                <span className="text-[10px] text-stone-500 mt-1 block">Responsable: {w?.name || 'No asignado'}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                task.status === 'completada' ? 'bg-emerald-100 text-emerald-800' :
                                task.status === 'en_progreso' ? 'bg-sky-100 text-sky-800' :
                                'bg-stone-100 text-stone-600'
                              }`}>
                                {task.status === 'completada' ? 'Completada' :
                                 task.status === 'en_progreso' ? 'En Progreso' : 'Pendiente'}
                              </span>
                            </div>
                          );
                        })}
                        {stats.totalTasks === 0 && (
                          <div className="p-4 text-center text-xs text-stone-400 bg-white">
                            No hay tareas creadas para esta obra.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Grupos de Trabajo / Cuadrillas */}
                    <div className="space-y-3" id={`project-groups-${project.id}`}>
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-stone-500" /> Grupos de Trabajo
                        </h4>
                        <button
                          onClick={() => {
                            setGroupName('');
                            setGroupLeaderId('');
                            setGroupMemberIds([]);
                            setEditingGroup(null);
                            setShowGroupFormId(showGroupFormId === project.id ? null : project.id);
                          }}
                          className="text-[10px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-0.5 border border-orange-100 hover:border-orange-200 px-1.5 py-0.5 rounded-md transition shadow-2xs"
                        >
                          <Plus className="h-3 w-3" /> Agregar
                        </button>
                      </div>

                      {/* Formulario de grupo inline */}
                      {showGroupFormId === project.id && (
                        <div className="bg-stone-100/80 p-3.5 rounded-lg border border-stone-250 space-y-3 animate-fadeIn text-xs">
                          <p className="font-bold text-stone-850">
                            {editingGroup ? 'Editar Grupo' : 'Nuevo Grupo de Trabajo'}
                          </p>
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Nombre del Grupo</label>
                              <input
                                type="text"
                                placeholder="Ej. Cuadrilla de Concreto"
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-orange-500 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Responsable / Líder</label>
                              <select
                                value={groupLeaderId}
                                onChange={e => setGroupLeaderId(e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-orange-500 text-stone-900"
                              >
                                <option value="">-- Seleccionar líder --</option>
                                {workers.map(w => (
                                  <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-500 mb-1">Miembros del Grupo</label>
                              <div className="max-h-24 overflow-y-auto border border-stone-300 rounded bg-white p-1.5 space-y-1">
                                {workers.map(w => {
                                  const isChecked = groupMemberIds.includes(w.id);
                                  return (
                                    <label key={w.id} className="flex items-center gap-1.5 py-0.5 cursor-pointer hover:bg-stone-50 rounded px-1">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          if (isChecked) {
                                            setGroupMemberIds(prev => prev.filter(id => id !== w.id));
                                          } else {
                                            setGroupMemberIds(prev => [...prev, w.id]);
                                          }
                                        }}
                                        className="rounded text-orange-600 focus:ring-orange-500/20"
                                      />
                                      <span className="text-[10px] text-stone-700">{w.name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              onClick={() => {
                                setShowGroupFormId(null);
                                setEditingGroup(null);
                              }}
                              className="px-2 py-1 border border-stone-300 rounded text-stone-600 hover:bg-white text-[10px]"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={async () => {
                                if (!groupName) return;
                                if (editingGroup) {
                                  await updateGroup(editingGroup.id, groupName, groupLeaderId || null, groupMemberIds);
                                } else {
                                  await createGroup(groupName, project.id, groupLeaderId || null, groupMemberIds);
                                }
                                setShowGroupFormId(null);
                                setEditingGroup(null);
                              }}
                              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold text-[10px] transition cursor-pointer"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Lista de Grupos */}
                      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-150 shadow-2xs">
                        {groups.filter(g => g.projectId === project.id).map(g => {
                          const leader = workers.find(w => w.id === g.leaderId);
                          return (
                            <div key={g.id} className="p-3 text-xs space-y-2 bg-white" id={`project-group-row-${g.id}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-stone-900 text-xs">{g.name}</p>
                                  {leader && (
                                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                      <UserCheck className="h-3 w-3 text-orange-500" />
                                      Líder: <span className="font-bold text-stone-700">{leader.name}</span>
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingGroup(g);
                                      setGroupName(g.name);
                                      setGroupLeaderId(g.leaderId);
                                      setGroupMemberIds(g.memberIds);
                                      setShowGroupFormId(project.id);
                                    }}
                                    className="p-1 text-stone-400 hover:text-stone-750 rounded hover:bg-stone-50 transition cursor-pointer"
                                    title="Editar grupo"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm('¿Eliminar este grupo de trabajo?')) {
                                        await deleteGroup(g.id);
                                      }
                                    }}
                                    className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                                    title="Eliminar grupo"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Integrantes */}
                              <div className="bg-stone-50 p-2 rounded border border-stone-100 space-y-1">
                                <span className="text-[9px] text-stone-400 block font-bold uppercase tracking-wider">Integrantes ({g.memberIds.length})</span>
                                {g.memberIds.length === 0 ? (
                                  <span className="text-[10px] text-stone-400 italic block">Sin miembros</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {g.memberIds.map(mId => {
                                      const w = workers.find(x => x.id === mId);
                                      if (!w) return null;
                                      return (
                                        <span key={mId} className="bg-white border border-stone-200 text-stone-700 text-[9.5px] px-1.5 py-0.5 rounded font-mono">
                                          {w.name.split(' ')[0]} {w.name.split(' ')[1] ? w.name.split(' ')[1][0] + '.' : ''}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {groups.filter(g => g.projectId === project.id).length === 0 && (
                          <div className="p-4 text-center text-xs text-stone-400 bg-white">
                            No hay grupos de trabajo creados en esta obra.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
