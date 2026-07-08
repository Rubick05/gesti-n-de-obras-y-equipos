import { useState, useCallback, useRef, useEffect } from 'react';
import { TutorialDefinition, TutorialStep, TUTORIALS } from '../data/tutorialSteps';

export interface TutorialState {
  isActive: boolean;
  currentTutorial: TutorialDefinition | null;
  currentStepIndex: number;
  currentStep: TutorialStep | null;
  totalSteps: number;
  progress: number; // 0–100
  showPicker: boolean;
}

export interface TutorialActions {
  startTutorial: (tutorialId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  openPicker: () => void;
  closePicker: () => void;
  onNavigate?: (view: string) => void;
}

const INITIAL_STATE: TutorialState = {
  isActive: false,
  currentTutorial: null,
  currentStepIndex: 0,
  currentStep: null,
  totalSteps: 0,
  progress: 0,
  showPicker: false,
};

export function useTutorial(onNavigate?: (view: string) => void) {
  const [state, setState] = useState<TutorialState>(INITIAL_STATE);
  const navigateRef = useRef(onNavigate);
  navigateRef.current = onNavigate;

  // Scroll target element into view when step changes
  useEffect(() => {
    if (!state.isActive || !state.currentStep) return;
    const step = state.currentStep;

    // Navigate to view if needed
    if (step.navigateTo && navigateRef.current) {
      navigateRef.current(step.navigateTo as any);
    }

    // After navigation, scroll to target
    if (!step.noSpotlight) {
      const timer = setTimeout(() => {
        // Try multiple selectors (comma-separated)
        const isMobile = window.innerWidth < 768;
        const selectors = step.target.split(',').map(s => s.trim());
        for (let sel of selectors) {
          try {
            if (isMobile && sel.includes('btn-nav-desktop')) {
              sel = '#btn-toggle-mobile-menu';
            }
            const el = document.querySelector(sel);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              break;
            }
          } catch {
            // invalid selector, skip
          }
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [state.isActive, state.currentStepIndex, state.currentStep]);

  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = TUTORIALS.find(t => t.id === tutorialId);
    if (!tutorial) return;

    const step = tutorial.steps[0];
    setState({
      isActive: true,
      currentTutorial: tutorial,
      currentStepIndex: 0,
      currentStep: step,
      totalSteps: tutorial.steps.length,
      progress: 0,
      showPicker: false,
    });
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (!prev.currentTutorial) return prev;
      const nextIndex = prev.currentStepIndex + 1;
      if (nextIndex >= prev.totalSteps) {
        // Tutorial finished
        return { ...INITIAL_STATE };
      }
      return {
        ...prev,
        currentStepIndex: nextIndex,
        currentStep: prev.currentTutorial!.steps[nextIndex],
        progress: Math.round((nextIndex / (prev.totalSteps - 1)) * 100),
      };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => {
      if (!prev.currentTutorial || prev.currentStepIndex === 0) return prev;
      const prevIndex = prev.currentStepIndex - 1;
      return {
        ...prev,
        currentStepIndex: prevIndex,
        currentStep: prev.currentTutorial!.steps[prevIndex],
        progress: Math.round((prevIndex / (prev.totalSteps - 1)) * 100),
      };
    });
  }, []);

  const skipTutorial = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const openPicker = useCallback(() => {
    setState(prev => ({ ...prev, showPicker: true }));
  }, []);

  const closePicker = useCallback(() => {
    setState(prev => ({ ...prev, showPicker: false }));
  }, []);

  return { state, startTutorial, nextStep, prevStep, skipTutorial, openPicker, closePicker };
}
