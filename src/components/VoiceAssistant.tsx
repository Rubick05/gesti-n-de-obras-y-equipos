import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Mic, MicOff, X, Send, Volume2, VolumeX, MessageCircle,
  Loader2, AlertCircle, Waves
} from 'lucide-react';
import { VoiceAssistantState } from '../hooks/useVoiceAssistant';

interface VoiceAssistantProps {
  state: VoiceAssistantState;
  onClose: () => void;
  onToggleListening: () => void;
  onSubmitText: (text: string) => void;
  onOpen: () => void;
}

// ── Wave Animation ────────────────────────────────────────────────────────
function AudioWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-6">
      {[1, 2, 3, 4, 5, 6, 7].map(i => (
        <div
          key={i}
          className="w-0.5 rounded-full bg-orange-500 transition-all duration-150"
          style={{
            height: active
              ? `${Math.random() * 100}%`
              : '20%',
            animation: active
              ? `audioBar ${0.4 + i * 0.08}s ease-in-out infinite alternate`
              : 'none',
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────
function MessageBubble({ role, text }: { role: 'assistant' | 'user'; text: string; key?: React.Key }) {
  const isAssistant = role === 'assistant';
  return (
    <div className={`flex gap-2 ${isAssistant ? 'flex-row' : 'flex-row-reverse'} animate-slideUp`}>
      {isAssistant && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <span className="text-white text-xs">🎙️</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isAssistant
            ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-xs'
            : 'bg-orange-600 text-white rounded-tr-sm'
        }`}
      >
        {text}
      </div>
    </div>
  );
}

// ── Current field progress ─────────────────────────────────────────────
function FlowProgress({ flowType, fieldIndex, totalFields }: { flowType: string; fieldIndex: number; totalFields: number }) {
  if (flowType === 'idle' || flowType === 'menu') return null;
  const progress = totalFields > 0 ? Math.round((fieldIndex / totalFields) * 100) : 0;
  const flowLabel: Record<string, string> = {
    'new-project': '🏗️ Nueva Obra',
    'new-project-confirm': '🏗️ Nueva Obra — Confirmar',
    'new-worker': '👤 Nuevo Trabajador',
    'new-worker-confirm': '👤 Nuevo Trabajador — Confirmar',
    'new-task': '📋 Nueva Tarea',
    'new-task-confirm': '📋 Nueva Tarea — Confirmar',
    'new-tool': '🔧 Nueva Herramienta',
    'new-tool-confirm': '🔧 Nueva Herramienta — Confirmar',
    'new-expense': '💰 Nuevo Gasto',
    'new-expense-confirm': '💰 Nuevo Gasto — Confirmar',
  };

  return (
    <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-orange-700">{flowLabel[flowType] || flowType}</span>
        {totalFields > 0 && (
          <span className="text-[10px] font-mono text-orange-500">
            {Math.min(fieldIndex + 1, totalFields)}/{totalFields} campos
          </span>
        )}
      </div>
      {totalFields > 0 && (
        <div className="h-1 bg-orange-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Voice quick command chips ─────────────────────────────────────────────
const QUICK_COMMANDS = [
  { label: '🏗️ Nueva Obra', value: 'nueva obra' },
  { label: '👤 Trabajador', value: 'nuevo trabajador' },
  { label: '📋 Tarea', value: 'nueva tarea' },
  { label: '🔧 Herramienta', value: 'nueva herramienta' },
  { label: '💰 Gasto', value: 'registrar gasto' },
];

export default function VoiceAssistant({
  state, onClose, onToggleListening, onSubmitText, onOpen
}: VoiceAssistantProps) {
  const [textInput, setTextInput] = useState('');
  const [muted, setMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const handleSendText = () => {
    if (!textInput.trim()) return;
    onSubmitText(textInput.trim());
    setTextInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const toggleMute = () => {
    setMuted(m => {
      if (!m) window.speechSynthesis?.cancel();
      return !m;
    });
  };

  const isMenu = state.flowType === 'idle' || state.flowType === 'menu';

  if (!state.isOpen) {
    // Floating mic button
    return createPortal(
      <button
        onClick={onOpen}
        id="btn-voice-assistant"
        className="fixed bottom-6 right-6 z-[9990] w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg shadow-orange-600/40 flex items-center justify-center transition hover:scale-110 active:scale-95"
        title="Abrir asistente de voz"
      >
        <Mic className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
      </button>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[9985] flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      {/* Backdrop for mobile */}
      <div className="absolute inset-0 pointer-events-auto sm:hidden bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative pointer-events-auto w-full sm:w-96 bg-white rounded-2xl shadow-2xl shadow-black/25 border border-slate-200 flex flex-col overflow-hidden animate-slideUp"
        style={{ maxHeight: 'calc(100vh - 3rem)', minHeight: '420px' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-3.5 flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className={`w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center shadow-sm transition-all ${state.isListening ? 'ring-2 ring-orange-400 ring-offset-1 ring-offset-slate-900' : ''}`}>
              <Mic className="h-4 w-4 text-white" />
            </div>
            {(state.isListening || state.isSpeaking) && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 animate-pulse" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">Asistente de Voz</p>
            <p className="text-slate-400 text-[10px] font-mono truncate">
              {state.isListening ? '🔴 Escuchando...'
                : state.isSpeaking ? '🔊 Hablando...'
                : state.isProcessing ? '⏳ Procesando...'
                : state.isSupported ? '✅ Listo — di algo o escribe'
                : '⚠️ Voz no disponible en este navegador'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/10"
              title={muted ? 'Activar audio' : 'Silenciar'}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Flow progress */}
        <FlowProgress
          flowType={state.flowType}
          fieldIndex={state.currentFieldIndex}
          totalFields={state.currentFlow.length}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {state.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-3">
                <MessageCircle className="h-7 w-7 text-orange-500" />
              </div>
              <p className="text-slate-600 font-semibold text-sm">Asistente de Voz</p>
              <p className="text-slate-400 text-xs mt-1 max-w-[200px]">
                Habla o escribe para registrar datos sin usar las manos
              </p>
            </div>
          )}

          {state.messages.map(msg => (
            <MessageBubble key={msg.id} role={msg.role} text={msg.text} />
          ))}

          {state.isListening && (
            <div className="flex gap-2 items-center animate-slideUp">
              <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shrink-0 animate-pulse">
                <Mic className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="bg-white border border-red-200 rounded-2xl rounded-tl-sm px-3 py-2 shadow-xs">
                <AudioWave active={true} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {state.error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <p className="text-red-600 text-xs">{state.error}</p>
          </div>
        )}

        {/* Quick commands (only in menu) */}
        {isMenu && state.messages.length > 0 && (
          <div className="px-3 py-2 border-t border-slate-100 bg-white">
            <p className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-widest mb-2">Accesos rápidos</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_COMMANDS.map(cmd => (
                <button
                  key={cmd.value}
                  onClick={() => onSubmitText(cmd.value)}
                  className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 rounded-full transition border border-transparent hover:border-orange-200"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-3 py-3 border-t border-slate-200 bg-white shrink-0">
          {!state.isSupported && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-700">Tu navegador no soporta reconocimiento de voz. Usa texto.</p>
            </div>
          )}
          <div className="flex gap-2 items-center">
            {/* Mic button */}
            {state.isSupported && (
              <button
                onClick={onToggleListening}
                disabled={state.isSpeaking}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0 ${
                  state.isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/30 animate-pulse'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-600/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={state.isListening ? 'Dejar de escuchar' : 'Hablar'}
              >
                {state.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu respuesta..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />

            {/* Send button */}
            <button
              onClick={handleSendText}
              disabled={!textInput.trim()}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
