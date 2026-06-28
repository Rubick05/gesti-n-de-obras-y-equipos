import React, { useState } from 'react';
import { Task, Project, Worker, TaskStatus, TaskPriority } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Circle, 
  Calendar, 
  User, 
  Flag, 
  Filter, 
  Briefcase,
  AlertCircle,
  BookOpen,
  Users
} from 'lucide-react';
import { useWorkerGroups } from '../hooks/useWorkerGroups';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  workers: Worker[];
  onAddTask: (task: Omit<Task, 'id'>) => void | Promise<void>;
  onUpdateTask: (task: Task) => void | Promise<void>;
  onDeleteTask: (taskId: string) => void | Promise<void>;
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
}

export default function TasksView({
  tasks,
  projects,
  workers,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  selectedProjectId,
  onSelectProject
}: TasksViewProps) {
  // Hook de grupos
  const { groups } = useWorkerGroups();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filtros de búsqueda
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPriority, setFilterPriority] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Campos del formulario
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [assignedWorkerId, setAssignedWorkerId] = useState('');
  const [assignedGroupId, setAssignedGroupId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [status, setStatus] = useState<TaskStatus>('pendiente');
  const [dueDate, setDueDate] = useState('');

  const handleOpenAddForm = () => {
    setTitle('');
    setProjectId(selectedProjectId || (projects[0]?.id || ''));
    setDescription('');
    setAssignedWorkerId('');
    setAssignedGroupId('');
    setPriority('media');
    setStatus('pendiente');
    setDueDate(new Date().toISOString().substring(0, 10)); // Hoy por defecto
    setEditingTask(null);
    setShowForm(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setProjectId(task.projectId);
    setDescription(task.description || '');
    setAssignedWorkerId(task.assignedWorkerId || '');
    setAssignedGroupId(task.assignedGroupId || '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate || '');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) return;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title,
        projectId,
        description,
        assignedWorkerId,
        assignedGroupId: assignedGroupId || undefined,
        priority,
        status,
        dueDate
      });
    } else {
      onAddTask({
        title,
        projectId,
        description,
        assignedWorkerId,
        assignedGroupId: assignedGroupId || undefined,
        priority,
        status,
        dueDate
      });
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const quickChangeStatus = (task: Task, nextStatus: TaskStatus) => {
    onUpdateTask({
      ...task,
      status: nextStatus
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedProjectId && task.projectId !== selectedProjectId) return false;
    if (filterStatus !== 'todos' && task.status !== filterStatus) return false;
    if (filterPriority !== 'todos' && task.priority !== filterPriority) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        (task.description || '').toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const priorityConfigs: Record<TaskPriority, { bg: string, text: string, flagColor: string, label: string }> = {
    baja: { bg: 'bg-stone-100 text-stone-600', text: 'text-stone-500', flagColor: 'text-stone-400', label: 'Baja' },
    media: { bg: 'bg-stone-200 text-stone-850', text: 'text-stone-800', flagColor: 'text-stone-500', label: 'Media' },
    alta: { bg: 'bg-orange-100 text-orange-700 font-semibold', text: 'text-orange-700 font-semibold', flagColor: 'text-orange-500', label: 'Alta' },
    critica: { bg: 'bg-red-100 text-red-700 font-bold', text: 'text-red-700 font-semibold', flagColor: 'text-red-650', label: 'Muy Urgente' }
  };

  return (
    <div className="space-y-6" id="tasks-view-main">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-4" id="tasks-view-header">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-sans tracking-tight">Tareas de las Obras</h1>
          <p className="text-stone-500 text-xs mt-1">Crea tareas para las obras activas, asígnaselas a un trabajador y define la prioridad y fecha límite de entrega.</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          id="btn-new-task"
        >
          <Plus className="h-4 w-4" /> Crear Nueva Tarea
        </button>
      </div>

      {/* TARJETA DIDÁCTICA */}
      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex gap-3 text-xs text-orange-900" id="tasks-didactic-card">
        <div className="bg-orange-100 p-2 rounded-lg text-orange-700 h-max">
          <BookOpen className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="font-semibold text-orange-950">¿Cómo funciona esta sección?</p>
          <p className="text-orange-850 mt-0.5">
            Aquí puedes organizar las actividades diarias de cada obra. Puedes hacer clic en el círculo a la izquierda de cada tarea para cambiar su estado rápidamente entre <strong>Pendiente</strong>, <strong>En Progreso</strong> y <strong>Completada</strong>. También puedes filtrar la lista por obra para centrarte en un solo proyecto.
          </p>
        </div>
      </div>

      {/* PANEL DE FILTROS */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-4 shadow-2xs" id="tasks-filter-panel">
        
        {/* Selector de Obras */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0" id="project-toggle-tabs">
            <span className="text-xs font-bold text-stone-400 uppercase font-mono mr-2 shrink-0">Obras:</span>
            <button
              onClick={() => onSelectProject('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                !selectedProjectId 
                  ? 'bg-stone-900 text-white shadow-xs' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Todas las obras
            </button>
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedProjectId === proj.id 
                    ? 'bg-orange-50 text-orange-655 font-bold border border-orange-200 shadow-xs' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span className="font-mono text-[9px] opacity-70 bg-black/5 px-1 py-0.5 rounded">{proj.code}</span>
                {proj.name.split(' ')[0]} {proj.name.split(' ')[1] || ''}
              </button>
            ))}
          </div>

          <div className="w-full md:w-64" id="task-search-input">
            <input
              type="text"
              placeholder="Buscar por título o palabras clave..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-orange-500"
            />
          </div>
        </div>

        {/* Filtros secundarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-stone-100 pt-3" id="secondary-tasks-filters">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-4.5 w-4.5 text-stone-400 shrink-0" />
            <span className="text-stone-500 font-medium">Estado:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 focus:outline-hidden font-semibold text-stone-700"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completadas</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Flag className="h-4.5 w-4.5 text-stone-400 shrink-0" />
            <span className="text-stone-500 font-medium">Prioridad:</span>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 focus:outline-hidden font-semibold text-stone-700"
            >
              <option value="todos">Todas</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Muy Urgente / Crítica</option>
            </select>
          </div>

          <div className="text-right text-xs text-stone-400 font-mono self-center justify-self-end hidden lg:block">
            Mostrando {filteredTasks.length} de {tasks.length} tareas
          </div>
        </div>
      </div>

      {/* FORMULARIO DE CREAR / EDITAR TAREA */}
      {showForm && (
        <div className="bg-white border border-stone-300 rounded-xl p-5 shadow-2xs animate-fadeIn" id="task-form-panel">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
            <h3 className="font-bold text-stone-950 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-655" />
              {editingTask ? 'Editar Detalles de la Tarea' : 'Asignar Nueva Tarea en Obra'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditingTask(null); }}
              className="text-stone-500 hover:text-stone-900 text-xs font-semibold border border-stone-200 px-2.5 py-1 rounded"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" id="task-form">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nombre o Título de la Tarea *</label>
              <input
                required
                type="text"
                placeholder="Ej. Instalar las tuberías principales o vaciado de cemento en losa 4..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Obra a la que pertenece *</label>
              <select
                required
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
              >
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.code} - {proj.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Trabajador Responsable</label>
              <select
                value={assignedWorkerId}
                onChange={e => setAssignedWorkerId(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
              >
                <option value="">Nadie asignado todavía</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Grupo / Cuadrilla Asignada</label>
              <select
                value={assignedGroupId}
                onChange={e => setAssignedGroupId(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
              >
                <option value="">Ningún grupo asignado</option>
                {groups.filter(g => g.projectId === projectId).map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Prioridad / Urgencia</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Muy Urgente / Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Fecha Límite</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">Estado de la Tarea</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">Descripción o Indicaciones adicionales</label>
              <textarea
                rows={3}
                placeholder="Escribe instrucciones detalladas, herramientas necesarias o equipo de protección requerido..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
              />
            </div>

            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                className="bg-orange-655 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-xs cursor-pointer"
              >
                {editingTask ? 'Guardar Cambios' : 'Registrar Tarea'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENDERIZADO DE TAREAS */}
      <div className="space-y-3" id="tasks-records-list">
        {filteredTasks.map((task) => {
          const project = projects.find(p => p.id === task.projectId);
          const worker = workers.find(w => w.id === task.assignedWorkerId);
          const prStyle = priorityConfigs[task.priority];

          return (
            <div 
              key={task.id} 
              className={`bg-white rounded-xl border p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:shadow-2xs border-stone-200`}
              id={`task-item-card-${task.id}`}
            >
              {/* Check de estado rápido y título */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => {
                    const nextSt: TaskStatus = task.status === 'completada' ? 'pendiente' : task.status === 'pendiente' ? 'en_progreso' : 'completada';
                    quickChangeStatus(task, nextSt);
                  }}
                  className="mt-0.5 text-stone-400 hover:text-orange-500 transition shrink-0 cursor-pointer"
                  title="Cambiar estado de la tarea"
                  id={`btn-fast-status-task-${task.id}`}
                >
                  {task.status === 'completada' ? (
                    <CheckCircle className="h-5.5 w-5.5 text-emerald-500 fill-emerald-500/15" />
                  ) : task.status === 'en_progreso' ? (
                    <Circle className="h-5.5 w-5.5 text-sky-500 fill-sky-500/10 stroke-[2.5]" />
                  ) : (
                    <Circle className="h-5.5 w-5.5 text-stone-350 stroke-[1.5]" />
                  )}
                </button>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-stone-900 font-sans tracking-tight break-words">
                      {task.title}
                    </span>
                    <span className={`text-[9.5px] px-2.5 py-0.5 font-sans rounded-md select-none border font-semibold ${prStyle.bg}`}>
                      {prStyle.label}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-stone-500 line-clamp-2 pr-4">{task.description}</p>
                  )}

                  {/* Obra y plazos */}
                  <div className="flex items-center gap-3.5 text-[10.5px] text-stone-400 font-mono pt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-stone-600 font-medium">
                      <Briefcase className="h-3 w-3" /> {project?.name || 'Obra no asignada'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Límite: {task.dueDate || 'Sin fecha'}
                    </span>
                    {task.assignedGroupId && (() => {
                      const group = groups.find(g => g.id === task.assignedGroupId);
                      return group ? (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-orange-600 font-medium">
                            <Users className="h-3 w-3" /> Grupo: {group.name}
                          </span>
                        </>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>

              {/* Responsable y botones de control */}
              <div className="flex flex-row md:flex-col sm:items-center md:items-end justify-between md:justify-center gap-2 border-t border-stone-100 md:border-0 pt-3 md:pt-0 shrink-0">
                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <div className="bg-stone-100 p-1.5 rounded-full text-stone-500 shrink-0">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 block font-bold uppercase leading-none">TRABAJADOR</span>
                    <select
                      value={task.assignedWorkerId}
                      onChange={e => onUpdateTask({ ...task, assignedWorkerId: e.target.value })}
                      className="bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 text-xs focus:outline-hidden font-semibold text-stone-700"
                      id={`select-task-worker-${task.id}`}
                    >
                      <option value="">Sin Asignar</option>
                      {workers.map(w => (
                        <option key={w.id} value={w.id}>{w.name.split(' ')[0]} ({w.role.split(' ')[0]})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-700">
                  <div className="bg-stone-100 p-1.5 rounded-full text-stone-500 shrink-0">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 block font-bold uppercase leading-none">GRUPO</span>
                    <select
                      value={task.assignedGroupId || ''}
                      onChange={e => onUpdateTask({ ...task, assignedGroupId: e.target.value || undefined })}
                      className="bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 text-xs focus:outline-hidden font-semibold text-stone-700"
                      id={`select-task-group-${task.id}`}
                    >
                      <option value="">Sin Asignar</option>
                      {groups.filter(g => g.projectId === task.projectId).map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end md:self-auto">
                  <button
                    onClick={() => handleOpenEditForm(task)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                    title="Editar Tarea"
                    id={`btn-edit-task-${task.id}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Seguro que deseas eliminar esta tarea?')) {
                        onDeleteTask(task.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar Tarea"
                    id={`btn-delete-task-${task.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 text-center" id="tasks-empty-state">
            <AlertCircle className="h-8 w-8 text-stone-400 mx-auto mb-2" />
            <h4 className="font-semibold text-stone-800 text-sm">No se encontraron tareas</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Prueba seleccionando otra obra o modificando los filtros de estado o prioridad en el panel de arriba.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
