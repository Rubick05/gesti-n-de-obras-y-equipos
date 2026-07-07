import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, BookOpen, Clock, Play } from 'lucide-react';
import { TutorialState, TutorialActions } from '../hooks/useTutorial';
import { TutorialDefinition, getTutorialsForRole } from '../data/tutorialSteps';

// ── Helpers ─────────────────────────────────────────────────────────────────
interface Rect { top: number; left: number; width: number; height: number }
const PADDING = 12; // px around the spotlight element

function getTargetRect(target: string): Rect | null {
  const selectors = target.split(',').map(s => s.trim());
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el) {
        const r = el.getBoundingClientRect();
        // getBoundingClientRect() already returns viewport-relative coords.
        // Do NOT add scrollY here — the SVG overlay is position:fixed.
        return {
          top: r.top - PADDING,
          left: r.left - PADDING,
          width: r.width + PADDING * 2,
          height: r.height + PADDING * 2,
        };
      }
    } catch { /* skip bad selector */ }
  }
  return null;
}

// ── Spotlight SVG mask ────────────────────────────────────────────────────
function SpotlightMask({ rect }: { rect: Rect }) {
  const vw = window.innerWidth;
  // SVG is position:fixed — use only innerHeight, never add scrollY
  const vh = window.innerHeight;

  return (
    <svg
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="tutorial-spotlight-mask">
          <rect x="0" y="0" width={vw} height={vh} fill="white" />
          {/* rect coords are already viewport-relative (no scrollY offset needed) */}
          <rect
            x={rect.left}
            y={rect.top}
            width={rect.width}
            height={rect.height}
            rx="12"
            fill="black"
          />
        </mask>
      </defs>
      <rect
        x="0" y="0"
        width={vw} height={vh}
        fill="rgba(0,0,0,0.72)"
        mask="url(#tutorial-spotlight-mask)"
      />
      {/* Spotlight ring */}
      <rect
        x={rect.left - 2}
        y={rect.top - 2}
        width={rect.width + 4}
        height={rect.height + 4}
        rx="14"
        fill="none"
        stroke="rgba(249,115,22,0.8)"
        strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))' }}
      />
    </svg>
  );
}

// ── Tooltip ──────────────────────────────────────────────────────────────
interface TooltipProps {
  title: string;
  description: string;
  actionHint?: string;
  stepIndex: number;
  totalSteps: number;
  progress: number;
  position: string;
  rect: Rect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

function TutorialTooltip({
  title, description, actionHint, stepIndex, totalSteps, progress, position, rect,
  onNext, onPrev, onSkip,
}: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  // Tooltip width: 320px on desktop, but capped to (vw - 32px) on mobile
  const tooltipWidth = Math.min(320, window.innerWidth - 32);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    width: tooltipWidth,
  });

  useEffect(() => {
    if (!tooltipRef.current) return;
    const th = tooltipRef.current.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const tw = tooltipWidth;

    if (!rect || position === 'center') {
      setStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: tw,
      });
      return;
    }

    const GAP = 12;
    let top = 0, left = 0;
    // rect coords are already viewport-relative (no scrollY offset needed)
    const spotTop = rect.top;
    const spotBottom = spotTop + rect.height;
    const spotLeft = rect.left;
    const spotRight = rect.left + rect.width;
    const spotCenterX = spotLeft + rect.width / 2;
    const spotCenterY = spotTop + rect.height / 2;

    // On mobile/tablet (vw < 768), avoid left/right positions entirely.
    // Place tooltip top or bottom of the spotlight depending on where the spotlight is located.
    const isMobile = vw < 768;
    let effectivePosition = position;
    if (isMobile && (position === 'right' || position === 'left')) {
      effectivePosition = spotCenterY > vh / 2 ? 'top' : 'bottom';
    }

    switch (effectivePosition) {
      case 'bottom':
        top = spotBottom + GAP;
        left = Math.min(Math.max(spotCenterX - tw / 2, 8), vw - tw - 8);
        break;
      case 'top':
        top = spotTop - th - GAP;
        left = Math.min(Math.max(spotCenterX - tw / 2, 8), vw - tw - 8);
        break;
      case 'right':
        top = Math.min(Math.max(spotCenterY - th / 2, 8), vh - th - 8);
        left = Math.min(spotRight + GAP, vw - tw - 8);
        break;
      case 'left':
        top = Math.min(Math.max(spotCenterY - th / 2, 8), vh - th - 8);
        left = Math.max(spotLeft - tw - GAP, 8);
        break;
      default:
        top = vh / 2 - th / 2;
        left = vw / 2 - tw / 2;
    }

    // Keep in viewport with safe margin
    top = Math.max(8, Math.min(top, vh - th - 8));
    left = Math.max(8, Math.min(left, vw - tw - 8));

    setStyle({
      position: 'fixed',
      top,
      left,
      zIndex: 9999,
      transform: 'none',
      width: tw,
    });
  }, [rect, position, stepIndex]);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div
      ref={tooltipRef}
      style={style}
      className="bg-white rounded-2xl shadow-2xl shadow-black/25 border border-slate-100 animate-slideUp overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 to-orange-500 px-4 py-3 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-orange-200 text-[10px] font-mono font-semibold uppercase tracking-wider">
              Paso {stepIndex + 1} de {totalSteps}
            </span>
          </div>
          <h3 className="text-white font-bold text-sm leading-snug">{title}</h3>
        </div>
        <button
          onClick={onSkip}
          className="text-orange-200 hover:text-white transition shrink-0 p-0.5 rounded-lg hover:bg-white/10"
          title="Saltar tutorial"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-orange-100">
        <div
          className="h-full bg-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
        {actionHint && (
          <div className="mt-2 flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1.5">
            <Play className="h-3 w-3 text-orange-500 shrink-0" />
            <span className="text-orange-700 text-xs font-semibold">{actionHint}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2">
        <button
          onClick={onSkip}
          className="text-xs text-slate-400 hover:text-slate-600 transition font-medium px-2 py-1 rounded-lg hover:bg-slate-50"
        >
          Saltar
        </button>
        <div className="flex items-center gap-1.5">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
          )}
          <button
            onClick={onNext}
            className="flex items-center gap-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-xl transition shadow-sm shadow-orange-600/30"
          >
            {isLast ? 'Finalizar' : 'Siguiente'}
            {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tutorial Picker Modal ──────────────────────────────────────────────────
interface PickerProps {
  role: 'admin' | 'worker';
  onSelect: (id: string) => void;
  onClose: () => void;
}

function TutorialPicker({ role, onSelect, onClose }: PickerProps) {
  const tutorials = getTutorialsForRole(role);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp overflow-hidden" style={{ maxHeight: 'calc(100dvh - 24px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-xl shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Centro de Ayuda</h2>
              <p className="text-slate-400 text-xs mt-0.5">Tutoriales interactivos paso a paso</p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tutorial list */}
        <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 180px)' }}>
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-widest px-1 mb-3">
            Selecciona un tutorial
          </p>
          {tutorials.map(t => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition group"
            >
              <span className="text-2xl shrink-0">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 group-hover:text-orange-700 transition leading-tight">{t.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-slate-400 group-hover:text-orange-500 transition">
                <Clock className="h-3 w-3" />
                <span className="text-[10px] font-mono font-semibold">~{t.estimatedMinutes}min</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            💡 También puedes activar el asistente de voz presionando el botón 🎙️
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main TutorialOverlay ──────────────────────────────────────────────────
interface TutorialOverlayProps {
  tutorialState: TutorialState;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onStartTutorial: (id: string) => void;
  role: 'admin' | 'worker';
}

export default function TutorialOverlay({
  tutorialState,
  onNext, onPrev, onSkip,
  onOpenPicker, onClosePicker, onStartTutorial,
  role,
}: TutorialOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  // Update rect on step change or resize
  useEffect(() => {
    if (!tutorialState.isActive || !tutorialState.currentStep) {
      setRect(null);
      return;
    }
    const step = tutorialState.currentStep;
    if (step.noSpotlight) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const r = getTargetRect(step.target);
      setRect(r);
    };

    // Delay to allow navigation / DOM to settle
    const t = setTimeout(updateRect, 500);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [tutorialState.isActive, tutorialState.currentStepIndex, tutorialState.currentStep]);

  const { isActive, currentStep, currentStepIndex, totalSteps, progress, showPicker } = tutorialState;

  return createPortal(
    <>
      {/* Picker modal */}
      {showPicker && (
        <TutorialPicker
          role={role}
          onSelect={(id) => {
            onClosePicker();
            onStartTutorial(id);
          }}
          onClose={onClosePicker}
        />
      )}

      {/* Active tutorial */}
      {isActive && currentStep && (
        <>
          {/* Full overlay (dark bg for center steps, transparent otherwise) */}
          {(currentStep.noSpotlight || !rect) && (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9997] animate-fadeIn"
              onClick={onSkip}
            />
          )}

          {/* SVG Spotlight mask */}
          {!currentStep.noSpotlight && rect && (
            <SpotlightMask rect={rect} />
          )}

          {/* Tooltip */}
          <TutorialTooltip
            title={currentStep.title}
            description={currentStep.description}
            actionHint={currentStep.actionHint}
            stepIndex={currentStepIndex}
            totalSteps={totalSteps}
            progress={progress}
            position={currentStep.position}
            rect={rect}
            onNext={onNext}
            onPrev={onPrev}
            onSkip={onSkip}
          />
        </>
      )}

      {/* Floating "?" button — always visible when not in tutorial */}
      {!isActive && !showPicker && (
        <button
          onClick={onOpenPicker}
          id="btn-tutorial-help"
          className="fixed bottom-6 right-24 z-[9990] w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg shadow-black/30 flex items-center justify-center transition hover:scale-110 active:scale-95 border border-slate-700"
          title="Centro de ayuda y tutoriales"
        >
          <BookOpen className="h-5 w-5" />
        </button>
      )}
    </>,
    document.body
  );
}
