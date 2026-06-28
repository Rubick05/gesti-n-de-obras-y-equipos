import React, { useState } from 'react';
import { Worker, Task, WorkerStatus } from '../types';
import { 
  Plus, 
  Mail, 
  Phone, 
  Trash2, 
  Edit3, 
  UserPlus, 
  Clock, 
  UserCheck, 
  Search,
  CheckCircle,
  AlertOctagon,
  Award,
  BookOpen
} from 'lucide-react';

interface TeamViewProps {
  workers: Worker[];
  tasks: Task[];
  onAddWorker: (worker: Omit<Worker, 'id'>) => void | Promise<void>;
  onUpdateWorker: (worker: Worker) => void | Promise<void>;
  onDeleteWorker: (workerId: string) => void | Promise<void>;
}

export default function TeamView({
  workers,
  tasks,
  onAddWorker,
  onUpdateWorker,
  onDeleteWorker
}: TeamViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Campos del formulario
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [status, setStatus] = useState<WorkerStatus>('activo');

  // Filtros de búsqueda
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Abrir formulario para agregar
  const handleOpenAddForm = () => {
    setName('');
    setRole('');
    setEmail('');
    setPhone('');
    setSpecialty('');
    setStatus('activo');
    setEditingWorker(null);
    setShowForm(true);
  };

  // Abrir formulario para editar
  const handleOpenEditForm = (worker: Worker) => {
    setEditingWorker(worker);
    setName(worker.name);
    setRole(worker.role);
    setEmail(worker.email);
    setPhone(worker.phone);
    setSpecialty(worker.specialty);
    setStatus(worker.status);
    setShowForm(true);
  };

  // Enviar formulario (Crear o Editar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    if (editingWorker) {
      onUpdateWorker({
        ...editingWorker,
        name,
        role,
        email,
        phone,
        specialty,
        status
      });
    } else {
      onAddWorker({
        name,
        role,
        email,
        phone,
        specialty,
        status
      });
    }
    setShowForm(false);
    setEditingWorker(null);
  };

  // Calcular cantidad de tareas asignadas
  const getWorkload = (workerId: string) => {
    const workerTasks = tasks.filter(t => t.assignedWorkerId === workerId);
    const activeTasks = workerTasks.filter(t => t.status !== 'completada').length;
    return {
      active: activeTasks,
      total: workerTasks.length
    };
  };

  // Filtrado de trabajadores
  const filteredWorkers = workers.filter(w => {
    if (filterStatus !== 'todos' && w.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.role.toLowerCase().includes(q) ||
        w.specialty.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getInitials = (nameStr: string) => {
    const parts = nameStr.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  const statusConfigs: Record<WorkerStatus, { bg: string, text: string, label: string, dot: string }> = {
    activo: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-700', label: 'Activo', dot: 'bg-emerald-500' },
    vacaciones: { bg: 'bg-amber-50 text-amber-850 border-amber-200', text: 'text-amber-850', label: 'En Vacaciones', dot: 'bg-amber-500' },
    baja: { bg: 'bg-stone-100 text-stone-500 border-stone-200', text: 'text-stone-500', label: 'Inactivo', dot: 'bg-stone-400' }
  };

  const avatarColors = [
    'bg-stone-900 border-stone-850 text-stone-100',
    'bg-amber-500 border-amber-600 text-stone-950',
    'bg-zinc-800 border-zinc-900 text-zinc-100',
    'bg-orange-600 border-orange-700 text-white',
    'bg-stone-700 border-stone-800 text-stone-50'
  ];

  return (
    <div className="space-y-6" id="team-view-main">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-4" id="team-view-header">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-sans tracking-tight">Personal y Empleados</h1>
          <p className="text-stone-500 text-xs mt-1">Registra a tus trabajadores, edita sus datos de contacto y revisa cuántas tareas tienen asignadas actualmente.</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          id="btn-new-worker"
        >
          <UserPlus className="h-4 w-4" /> Registrar Trabajador
        </button>
      </div>

      {/* TARJETA DIDÁCTICA */}
      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex gap-3 text-xs text-orange-900" id="team-didactic-card">
        <div className="bg-orange-100 p-2 rounded-lg text-orange-700 h-max">
          <BookOpen className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="font-semibold text-orange-950">¿Cómo funciona esta sección?</p>
          <p className="text-orange-850 mt-0.5">
            Aquí puedes ver las fichas de todos tus trabajadores. Puedes ver rápidamente sus datos de contacto y su <strong>Carga de Trabajo</strong>. Esto te ayuda a saber qué empleados están más ocupados con tareas pendientes y quiénes están disponibles para recibir nuevas actividades en las obras.
          </p>
        </div>
      </div>

      {/* RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="team-metrics-bar">
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-slate-900 text-white rounded-lg">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-stone-400 block font-semibold">Personal Activo</span>
            <span className="text-lg font-bold font-mono text-stone-950">
              {workers.filter(w => w.status === 'activo').length} trabajadores
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-amber-500 text-stone-950 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-stone-400 block font-semibold">En Vacaciones / Licencia</span>
            <span className="text-lg font-bold font-mono text-stone-950">
              {workers.filter(w => w.status === 'vacaciones').length} empleados
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-emerald-500 text-white rounded-lg">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-stone-400 block font-semibold">Tareas en Ejecución</span>
            <span className="text-lg font-bold font-mono text-stone-950">
              {tasks.filter(t => t.assignedWorkerId && t.status !== 'completada').length} pendientes
            </span>
          </div>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-2xs" id="team-filters">
        <div className="w-full md:w-96 relative" id="team-search">
          <span className="absolute left-3 top-2.5 text-stone-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, puesto o especialidad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-orange-500"
          />
        </div>

        <div className="w-full md:auto flex items-center gap-2 justify-end" id="team-status-filter">
          <span className="text-xs font-semibold text-stone-500">Filtrar por Estado:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-md px-2 py-1.5 text-xs font-semibold text-stone-700 focus:outline-hidden"
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="vacaciones">En Descanso / Vacaciones</option>
            <option value="baja">Inactivos / Dados de Baja</option>
          </select>
        </div>
      </div>

      {/* FORMULARIO DE REGISTRO / EDICIÓN */}
      {showForm && (
        <div className="bg-white border border-stone-300 rounded-xl p-5 shadow-2xs animate-fadeIn" id="worker-form-container">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
            <h3 className="font-bold text-stone-950 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-orange-600" />
              {editingWorker ? 'Editar Datos del Trabajador' : 'Registrar Nuevo Trabajador'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditingWorker(null); }}
              className="text-stone-500 hover:text-stone-900 text-xs font-semibold border border-stone-200 px-2.5 py-1 rounded"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4" id="worker-form">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nombre Completo *</label>
              <input
                required
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-worker-name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Puesto de Trabajo *</label>
              <input
                required
                type="text"
                placeholder="Ej. Electricista, Maestro de Obra, Operario..."
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-worker-role"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Especialidad o Habilidad Especial</label>
              <input
                type="text"
                placeholder="Ej. Soldador de Alturas, Concreto Estructural..."
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-worker-spec"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                placeholder="Ej. juan.perez@constructora.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-worker-email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Número de Teléfono</label>
              <input
                type="text"
                placeholder="Ej. +507 6001-2233"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-worker-phone"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Disponibilidad *</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as WorkerStatus)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="select-worker-status"
              >
                <option value="activo">Activo (Listo para trabajar)</option>
                <option value="vacaciones">En Descanso / Vacaciones</option>
                <option value="baja">Dado de Baja / Inactivo</option>
              </select>
            </div>

            <div className="md:col-span-3 text-right">
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-xs cursor-pointer"
                id="btn-save-worker"
              >
                {editingWorker ? 'Guardar Datos' : 'Registrar Trabajador'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENDERIZADO DE TARJETA DE TRABAJADOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="team-members-grid">
        {filteredWorkers.map((worker) => {
          const wl = getWorkload(worker.id);
          const st = statusConfigs[worker.status];
          const colorClass = avatarColors[worker.id.charCodeAt(worker.id.length - 1) % avatarColors.length];

          return (
            <div 
              key={worker.id}
              className="bg-white rounded-xl border border-stone-200 hover:border-stone-300 transition p-5 flex flex-col justify-between shadow-2xs relative"
              id={`worker-card-${worker.id}`}
            >
              <div>
                {/* Cabecera de perfil */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold font-sans text-base border ${colorClass} shrink-0`}>
                      {getInitials(worker.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-950 font-sans tracking-tight">{worker.name}</h3>
                      <p className="text-xs text-stone-500 leading-tight">{worker.role}</p>
                    </div>
                  </div>
                  
                  <span className={`text-[10px] font-bold flex items-center gap-1.5 border px-2.5 py-0.5 rounded-full ${st.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                    {st.label}
                  </span>
                </div>

                {/* Especialidad */}
                {worker.specialty && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-stone-200 flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-amber-500 shrink-0" />
                    <div className="text-xs">
                      <span className="text-[9px] text-stone-400 block font-bold uppercase leading-none">ESPECIALIDAD</span>
                      <span className="font-bold text-stone-850 mt-0.5 block">{worker.specialty}</span>
                    </div>
                  </div>
                )}

                {/* Contacto */}
                <div className="space-y-1.5 text-xs text-stone-600 mb-4 font-mono" id={`worker-contacts-${worker.id}`}>
                  {worker.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-stone-400" />
                      <span className="truncate">{worker.email}</span>
                    </div>
                  )}
                  {worker.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-stone-400" />
                      <span>{worker.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Carga de tareas y botones */}
              <div className="border-t border-stone-100 pt-3 flex items-center justify-between mt-auto">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Tareas Pendientes</span>
                  <p className="text-xs font-bold text-stone-950 mt-0.5">
                    {wl.active === 0 ? (
                      <span className="text-stone-400 font-medium">Libre • 0 tareas</span>
                    ) : wl.active >= 3 ? (
                      <span className="text-red-650 font-bold">{wl.active} pendientes (Sobrecargado)</span>
                    ) : (
                      <span className="text-stone-900 font-medium">{wl.active} tareas asignadas</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditForm(worker)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                    title="Editar Datos del Trabajador"
                    id={`btn-edit-worker-${worker.id}`}
                  >
                    <Edit3 className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Seguro que deseas eliminar a "${worker.name}" de la lista? Sus tareas quedarán sin asignar.`)) {
                        onDeleteWorker(worker.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar de la lista"
                    id={`btn-delete-worker-${worker.id}`}
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filteredWorkers.length === 0 && (
          <div className="md:col-span-3 bg-stone-50 border border-stone-200 rounded-xl p-8 text-center" id="team-empty-state">
            <AlertOctagon className="h-8 w-8 text-stone-400 mx-auto mb-2" />
            <h4 className="font-semibold text-stone-800 text-sm">No se encontraron trabajadores</h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
              Prueba buscando otro nombre o registra un nuevo empleado desde el botón de arriba.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
