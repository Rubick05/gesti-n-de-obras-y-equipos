import React, { useState } from 'react';
import {
  Building2, Users, CheckSquare, Wrench, LayoutDashboard,
  HardHat, Menu, X, LogOut, Wallet, Shield, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AdminView = 'dashboard' | 'projects' | 'tasks' | 'team' | 'inventory' | 'budget' | 'users';

interface LayoutProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  children: React.ReactNode;
}

const ADMIN_MENU_ITEMS = [
  { id: 'dashboard' as AdminView, label: 'Inicio / Resumen',     icon: LayoutDashboard },
  { id: 'projects'  as AdminView, label: 'Obras y Proyectos',    icon: Building2 },
  { id: 'tasks'     as AdminView, label: 'Tareas Pendientes',    icon: CheckSquare },
  { id: 'team'      as AdminView, label: 'Personal / Empleados', icon: Users },
  { id: 'inventory' as AdminView, label: 'Inventario de Bodega', icon: Wrench },
  { id: 'budget'    as AdminView, label: 'Presupuesto y Gastos', icon: Wallet },
  { id: 'users'     as AdminView, label: 'Gestión de Usuarios',  icon: Shield },
] as const;

function getInitials(name: string): string {
  const parts = name.split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

export default function Layout({ activeView, onNavigate, children }: LayoutProps) {
  const { profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const handleMobileNav = (view: AdminView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans" id="app-layout">

      {/* ── CABECERA MÓVIL ─────────────────────────────────────── */}
      <header
        className="md:hidden bg-white text-slate-900 p-4 flex justify-between items-center border-b border-slate-200 sticky top-0 z-40 shadow-xs"
        id="mobile-header"
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-orange-600 p-2 rounded-xl text-white shadow-sm shadow-orange-600/30">
            <HardHat className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black tracking-tight text-slate-900 text-sm uppercase leading-none block">Vanguardia</span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Constructora</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-500 hover:text-slate-900 transition rounded-lg hover:bg-slate-100"
          id="btn-toggle-mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* ── MENÚ MÓVIL DESPLEGABLE ─────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white/98 z-30 pt-16 flex flex-col p-5 animate-fadeIn" id="mobile-navigation-drawer">
          <div className="space-y-1.5 mt-4 flex-1">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-widest block pl-2 mb-3">Menú Principal</span>
            {ADMIN_MENU_ITEMS.map(item => {
              const Icon = item.icon;
              const isSelected = activeView === item.id;
              const isBudget = item.id === 'budget';
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-sm'
                      : isBudget
                      ? 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  id={`btn-nav-mobile-${item.id}`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {isBudget && !isSelected && (
                    <span className="ml-auto text-[9px] font-mono bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User + logout en móvil */}
          <div className="border-t border-slate-100 pt-4 mt-4">
            {profile && (
              <div className="flex items-center gap-3 mb-3 px-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0"
                  style={{ backgroundColor: profile.avatar_color }}
                >
                  {getInitials(profile.name)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{profile.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{profile.role === 'admin' ? 'Administrador' : 'Trabajador'}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <LogOut className="h-4.5 w-4.5" />
              {loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      )}

      {/* ── MENÚ LATERAL ESCRITORIO ────────────────────────────── */}
      <aside
        className="hidden md:flex md:w-64 bg-white text-slate-900 p-5 flex-col border-r border-slate-200 shrink-0 sticky top-0 h-screen"
        id="desktop-sidebar-navigation"
      >
        <div className="space-y-6 flex-1 min-h-0">

          {/* Cabecera marca */}
          <div className="flex items-center gap-3 p-1.5 mb-1" id="sidebar-brand-block">
            <div className="bg-orange-600 p-2.5 rounded-xl text-white shadow-sm shadow-orange-600/20 flex items-center justify-center">
              <HardHat className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black tracking-tight text-slate-900 text-xs leading-snug uppercase block">Constructora</span>
              <span className="font-mono text-[11px] font-bold text-orange-600 block leading-none tracking-wider">VANGUARDIA</span>
            </div>
          </div>

          {/* Navegación */}
          <nav className="space-y-1" id="sidebar-nav-list">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-widest block pl-2 mb-2">Menú Principal</span>
            {ADMIN_MENU_ITEMS.map(item => {
              const Icon = item.icon;
              const isSelected = activeView === item.id;
              const isBudget = item.id === 'budget';
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition relative group cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50 text-orange-600 font-bold border-l-4 border-orange-600 pl-2'
                      : isBudget
                      ? 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  id={`btn-nav-desktop-${item.id}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-orange-600' : isBudget ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isBudget && !isSelected && (
                    <span className="text-[8px] font-mono bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                  )}
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Rol badge */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500 shrink-0" />
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Perfil de Acceso</div>
              <div className="text-[11px] font-bold text-slate-700">
                {profile?.role === 'admin' ? 'Administrador' : 'Trabajador'}
              </div>
            </div>
          </div>
        </div>

        {/* Usuario + logout */}
        <div className="border-t border-slate-100 pt-4 mt-4 space-y-3" id="sidebar-user-section">
          {profile && (
            <div className="flex items-center gap-3 px-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-sm"
                style={{ backgroundColor: profile.avatar_color }}
              >
                {getInitials(profile.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate">{profile.name}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{profile.role === 'admin' ? 'Administrador' : 'Trabajador'}</p>
              </div>
              <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
            id="btn-logout"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────────── */}
      <main
        className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full"
        id="contents-primary-canvas"
      >
        {children}
      </main>
    </div>
  );
}
