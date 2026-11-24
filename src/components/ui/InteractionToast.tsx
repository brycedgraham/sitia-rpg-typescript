import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  eventBus,
  type InteractionFeedbackPayload,
} from '../../core/EventBus';
import { useGameState } from '../../core/GameState';

const TOAST_AUTO_DISMISS_MS = 4800;

export function InteractionToast() {
  const [toast, setToast] = useState<InteractionFeedbackPayload | null>(null);
  const [visible, setVisible] = useState(false);
  const snapshot = useGameState();

  useEffect(() => {
    let dismissTimer: number | undefined;
    let clearTimer: number | undefined;

    const clearToastNow = () => {
      window.clearTimeout(dismissTimer);
      window.clearTimeout(clearTimer);
      setVisible(false);
      setToast(null);
    };

    const unsubFeedback = eventBus.on('interactionFeedback', (payload) => {
      window.clearTimeout(dismissTimer);
      window.clearTimeout(clearTimer);

      setToast(payload);
      requestAnimationFrame(() => setVisible(true));

      dismissTimer = window.setTimeout(() => {
        setVisible(false);
        clearTimer = window.setTimeout(() => setToast(null), 180);
      }, TOAST_AUTO_DISMISS_MS);
    });

    const unsubDialogue = eventBus.on('dialogueStarted', clearToastNow);
    const unsubMind = eventBus.on('mindSpeakTriggered', clearToastNow);
    const unsubPoison = eventBus.on('poisonDeductionStarted', clearToastNow);
    const unsubCombat = eventBus.on('combatInitiated', clearToastNow);

    return () => {
      unsubFeedback();
      unsubDialogue();
      unsubMind();
      unsubPoison();
      unsubCombat();
      window.clearTimeout(dismissTimer);
      window.clearTimeout(clearTimer);
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    window.setTimeout(() => setToast(null), 160);
  };

  // Suppress nearby prompt whenever DialogueBox or modal locks input
  if (snapshot.inputLocked) {
    return null;
  }

  if (!toast && snapshot.nearbyTarget) {
    const verb =
      snapshot.nearbyTarget.kind === 'npc'
        ? 'Speak with'
        : snapshot.nearbyTarget.kind === 'quest_item'
          ? 'Inspect'
          : 'Examine';

    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
        <div className="flex items-center gap-2.5 rounded-md border border-slate-700/80 bg-slate-950/90 px-3.5 py-1.5 text-xs text-slate-200 shadow-lg backdrop-blur-sm">
          <span className="font-mono font-semibold text-amber-300">[E]</span>
          <span className="text-slate-400">{verb}</span>
          <span className="font-medium text-slate-100">
            {snapshot.nearbyTarget.label}
          </span>
        </div>
      </div>
    );
  }

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4"
    >
      <div
        className={`pointer-events-auto w-full max-w-xl rounded-lg border border-slate-700/85 bg-[#0f141d]/95 px-4 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.65)] backdrop-blur-md transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-slate-100">
                {toast.title}
              </h2>
              {toast.subtitle && (
                <>
                  <span aria-hidden="true" className="text-xs text-slate-600">
                    ·
                  </span>
                  <span className="text-xs text-slate-400">
                    {toast.subtitle}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-300">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors duration-150 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
