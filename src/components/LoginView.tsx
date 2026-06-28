import React, { useState } from 'react';
import { HardHat, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Building2, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginView() {
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa tu correo, usuario y contraseña.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    let loginEmail = email.trim().toLowerCase();
    let loginPassword = password;

    let { error: loginError } = await login(loginEmail, loginPassword);

    // Fallback para admin/admin123 si falla
    if (loginError && loginEmail === 'admin@vanguardia.com' && loginPassword === 'admin') {
      const retryResult = await login(loginEmail, 'admin123');
      loginError = retryResult.error;
    } else if (loginError && loginEmail === 'admin' && loginPassword === 'admin') {
      const retryResult = await login(loginEmail, 'admin123');
      loginError = retryResult.error;
    }

    setIsSubmitting(false);
    if (loginError) setError(loginError);
  };



  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden" id="login-page">
      
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-slate-800/50 rounded-full blur-3xl" />
        {/* Grid decorativo */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        
        {/* Logo y marca */}
        <div className="text-center mb-8" id="login-brand">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/30 mb-4">
            <HardHat className="h-8 w-8 text-white stroke-[2]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight font-sans">
            Constructora Vanguardia
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-mono">
            Sistema de Gestión de Obras y Equipos
          </p>
        </div>

        {/* Panel de login */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8" id="login-card">
          
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Iniciar Sesión</h2>
            <p className="text-slate-400 text-xs mt-1">Ingresa con tus credenciales de acceso asignadas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico o Usuario
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  id="input-login-email"
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu.correo@constructora.com o usuario"
                  autoComplete="username"
                  className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
                  id="btn-toggle-password"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-800 text-red-300 rounded-xl p-3.5 text-xs animate-fadeIn" id="login-error-message">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 mt-2"
              id="btn-login-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
          </form>
        </div>

        {/* Features abajo */}
        <div className="grid grid-cols-3 gap-3 mt-6" id="login-feature-badges">
          {[
            { icon: Building2, label: 'Gestión de Obras' },
            { icon: Shield, label: 'Roles Seguros' },
            { icon: Users, label: 'Portal Propio' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
              <Icon className="h-4 w-4 text-orange-500 mx-auto mb-1.5" />
              <span className="text-[10px] font-mono text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-slate-700 font-mono mt-6">
          CONSTRUCTORA VANGUARDIA S.A. © 2026 — Sistema Interno
        </p>
      </div>
    </div>
  );
}
