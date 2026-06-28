import React, { useState } from 'react';
import { useUserManagement, UserAccount } from '../hooks/useUserManagement';
import { Worker } from '../types';
import {
  Shield, Users, Mail, Key, Eye, EyeOff, UserCheck, Plus, Search,
  Trash2, Edit3, AlertTriangle, AlertCircle, Sparkles, HelpCircle, Check
} from 'lucide-react';

interface UsersViewProps {
  workers: Worker[];
}

export default function UsersView({ workers }: UsersViewProps) {
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    isMock
  } = useUserManagement();

  // Filtros y búsquedas
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'worker'>('all');

  // Control de formulario
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Campos de formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'worker'>('worker');
  const [workerId, setWorkerId] = useState<string>('');

  // UI state
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('worker');
    setWorkerId('');
    setEditingUser(null);
    setActionError(null);
    setShowForm(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password || '');
    setRole(user.role);
    setWorkerId(user.workerId || '');
    setActionError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (!name || !email) {
      setActionError('Nombre y correo/usuario son obligatorios.');
      return;
    }

    let finalEmail = email.trim().toLowerCase();

    const payload = {
      name,
      email: finalEmail,
      password: password || undefined,
      role,
      workerId: role === 'worker' && workerId ? workerId : null
    };

    if (editingUser) {
      const ok = await updateUser(editingUser.id, payload);
      if (ok) {
        setShowForm(false);
        setEditingUser(null);
      } else {
        setActionError('Error al actualizar el usuario. Verifica los campos.');
      }
    } else {
      if (!password) {
        setActionError('La contraseña es obligatoria para nuevos usuarios.');
        return;
      }
      try {
        const created = await createUser({
          name,
          email: finalEmail,
          password,
          role,
          workerId: role === 'worker' && workerId ? workerId : null
        });
        if (created) {
          setShowForm(false);
        } else {
          setActionError('Error al registrar el usuario. El correo/usuario podría estar duplicado.');
        }
      } catch (err: any) {
        if (err.status === 429 || (err.message && err.message.toLowerCase().includes('rate limit')) || (err.message && err.message.toLowerCase().includes('limit exceeded'))) {
          setActionError('Límite de registros de Supabase superado (Error 429). Por favor, ve a Supabase Dashboard -> Settings -> Auth y aumenta el "Signup Rate Limit" o espera unos minutos.');
        } else {
          setActionError(err.message || 'Error al registrar el usuario. Verifica los campos.');
        }
      }
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la cuenta de ${userName}?`)) {
      setActionError(null);
      const ok = await deleteUser(id);
      if (!ok) {
        setActionError('Error al eliminar la cuenta de usuario.');
      }
    }
  };

  // Filtrado final
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6" id="users-view-main">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-4" id="users-view-header">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-sans tracking-tight">Gestión de Usuarios y Accesos</h1>
          <p className="text-stone-500 text-xs mt-1">
            Administra las cuentas de login, asigna roles de sistema y gestiona las contraseñas de los trabajadores y administradores.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          id="btn-new-user"
        >
          <Plus className="h-4 w-4" /> Registrar Usuario
        </button>
      </div>

      {/* ALERTA INFORMATIVA MODO REAL VS MOCK */}
      <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${
        isMock 
          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
          : 'bg-orange-50 border-orange-200 text-orange-950'
      }`} id="users-view-mode-banner">
        <div className={`p-2 rounded-lg h-max ${isMock ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'}`}>
          {isMock ? <Sparkles className="h-4.5 w-4.5" /> : <HelpCircle className="h-4.5 w-4.5" />}
        </div>
        <div>
          <p className="font-bold">
            {isMock ? 'Entorno Demo / Offline Activo' : 'Conexión Supabase Cloud Activa'}
          </p>
          <p className="mt-0.5 opacity-90">
            {isMock 
              ? 'Estás ejecutando la aplicación localmente. Puedes modificar libremente correos, nombres, asignar personal y configurar contraseñas. Los cambios tendrán efecto inmediato para probar el login.'
              : 'Por motivos de seguridad, Supabase encripta las contraseñas en auth.users. Puedes ver los usuarios y reasignar sus perfiles locales de trabajador, pero los cambios de contraseña deben ser gestionados directamente desde tu Supabase Dashboard.'}
          </p>
        </div>
      </div>

      {/* FORMULARIO AGREGAR / EDITAR */}
      {showForm && (
        <div className="bg-white rounded-xl border border-stone-300 p-6 space-y-4 shadow-2xs animate-fadeIn" id="user-form-container">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-stone-100">
            <h3 className="font-bold text-stone-950 flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              {editingUser ? 'Editar Cuenta de Usuario' : 'Registrar Nuevo Usuario'}
            </h3>
            <button 
              onClick={() => { setShowForm(false); setEditingUser(null); }}
              className="text-stone-550 hover:text-stone-800 text-xs font-semibold border border-stone-250 px-2.5 py-1 rounded-md"
            >
              Cancelar
            </button>
          </div>

          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3.5 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4" id="user-form">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nombre Completo *</label>
              <input
                required
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="input-user-name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Correo Electrónico o Usuario *</label>
              <input
                required
                type="text"
                placeholder="correo@ejemplo.com o usuario"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={!!editingUser && !isMock}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 disabled:bg-stone-50 disabled:text-stone-400 text-stone-900"
                id="input-user-email"
              />
            </div>

            {/* Contraseña - Solo editable en mock o si es creación mock */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Contraseña {editingUser ? '(Opcional para cambiar)' : '*'}
              </label>
              <div className="relative">
                <input
                  required={!editingUser}
                  type={showFormPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={!isMock && !!editingUser}
                  className="w-full bg-white border border-stone-250 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-hidden focus:border-orange-500 disabled:bg-stone-50 disabled:text-stone-400 text-stone-900"
                  id="input-user-password"
                />
                <button
                  type="button"
                  onClick={() => setShowFormPassword(v => !v)}
                  disabled={!isMock && !!editingUser}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 disabled:opacity-40"
                >
                  {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Rol en el Sistema *</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'admin' | 'worker')}
                className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                id="select-user-role"
              >
                <option value="worker">Trabajador (Acceso Restringido)</option>
                <option value="admin">Administrador (Acceso Completo)</option>
              </select>
            </div>

            {/* Selector de Trabajador - Solo si rol es worker */}
            {role === 'worker' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Vincular al Perfil de Personal</label>
                <select
                  value={workerId}
                  onChange={e => setWorkerId(e.target.value)}
                  className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-stone-900"
                  id="select-user-worker"
                >
                  <option value="">-- No vincular a ningún empleado --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.role} - {w.specialty})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={`text-right ${role === 'worker' ? 'md:col-span-3' : 'md:col-span-2'}`}>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-xs cursor-pointer mt-2"
                id="btn-submit-user"
              >
                {editingUser ? 'Guardar Cambios' : 'Registrar Cuenta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs" id="users-filters-bar">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar usuario por nombre o correo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 text-stone-850 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:border-orange-500"
            id="input-users-search"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-hidden focus:border-orange-500"
            id="select-users-filter-role"
          >
            <option value="all">Todos los Roles</option>
            <option value="admin">Administradores</option>
            <option value="worker">Trabajadores</option>
          </select>
        </div>
      </div>

      {/* LISTADO DE USUARIOS EN BENTO GRID */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-stone-500 text-xs animate-pulse">Cargando cuentas de usuario...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center" id="users-list-empty">
          <Users className="h-10 w-10 text-stone-200 mx-auto mb-3" />
          <h3 className="font-bold text-stone-700">No se encontraron usuarios</h3>
          <p className="text-stone-400 text-xs mt-1">Intenta ajustando los filtros o el término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn" id="users-list-grid">
          {filteredUsers.map(user => {
            const linkedWorker = workers.find(w => w.id === user.workerId);
            const isPasswordVisible = !!showPasswordMap[user.id];

            return (
              <div
                key={user.id}
                className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition relative group flex flex-col justify-between"
                id={`user-card-${user.id}`}
              >
                <div>
                  {/* Badge de Rol */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded border ${
                      user.role === 'admin'
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Trabajador'}
                    </span>
                    
                    {/* Botones de acción */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded transition hover:bg-stone-100"
                        title="Editar cuenta"
                        id={`btn-edit-user-card-${user.id}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      {user.email !== 'admin@vanguardia.com' && (
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded transition hover:bg-red-50"
                          title="Eliminar usuario"
                          id={`btn-delete-user-card-${user.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nombre */}
                  <h3 className="font-bold text-stone-900 text-sm leading-tight truncate">{user.name}</h3>
                  
                  {/* Info list */}
                  <div className="space-y-2 mt-3.5">
                    {/* Email */}
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span className="truncate font-mono" title={user.email}>{user.email}</span>
                    </div>

                    {/* Contraseña */}
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <Key className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      {isMock ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded font-bold">
                            {isPasswordVisible ? user.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="text-stone-400 hover:text-stone-700 transition"
                          >
                            {isPasswordVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">Protegida por Supabase</span>
                      )}
                    </div>

                    {/* Perfil vinculado */}
                    {user.role === 'worker' && (
                      <div className="flex items-center gap-2 text-xs text-stone-600 border-t border-stone-100 pt-2.5 mt-2.5">
                        <UserCheck className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                        {linkedWorker ? (
                          <div className="truncate">
                            <span className="text-[10px] text-stone-400 block font-mono leading-none">EMPLEADO VINCULADO</span>
                            <span className="font-semibold text-stone-850 text-[11px] block mt-0.5 truncate">{linkedWorker.name}</span>
                          </div>
                        ) : (
                          <span className="text-red-500 font-bold text-[10.5px] italic">Sin empleado vinculado</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-stone-450 mt-4 border-t border-stone-100/50 pt-2 flex justify-between items-center">
                  <span>Acceso local</span>
                  <span className="flex items-center gap-0.5"><Check className="h-3 w-3 text-emerald-500" /> Activo</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
