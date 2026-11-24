import { Check, Eye, FlaskConical, Hand, RotateCcw, Wind, X } from 'lucide-react';
import { useEffect } from 'react';
import { eventBus } from '../../core/EventBus';
import {
  tastingController,
  useTastingState,
} from '../../core/TastingController';
import { POISON_LIST } from '../../data/poisons';
import type { PoisonData, TastingAction } from '../../types';

interface ActionOption {
  action: TastingAction;
  label: string;
  clueLabel: string;
  description: string;
  getClue: (poison: PoisonData) => string;
  icon: typeof Wind;
}

const INVESTIGATION_ACTIONS: ActionOption[] = [
  {
    action: 'smell',
    label: 'Smell',
    clueLabel: 'Aroma',
    description: 'Assess volatile scent rising from the rim.',
    getClue: (p) => p.aromaClue,
    icon: Wind,
  },
  {
    action: 'inspect',
    label: 'Inspect',
    clueLabel: 'Visual',
    description: 'Check viscosity, sediment, and silver reaction.',
    getClue: (p) => p.visualClue,
    icon: Eye,
  },
  {
    action: 'dab',
    label: 'Dab',
    clueLabel: 'Lip Touch',
    description: 'Test a drop against the lower lip for numbness or burn.',
    getClue: (p) => p.lipTouchClue,
    icon: Hand,
  },
  {
    action: 'taste',
    label: 'Taste',
    clueLabel: 'Palate',
    description: 'Risk a micro-sip to isolate the unmistakable palate profile.',
    getClue: (p) => p.tasteClue,
    icon: FlaskConical,
  },
];

export function TastingDeductionUI() {
  const state = useTastingState();

  useEffect(() => {
    const unsubscribe = eventBus.on('poisonDeductionStarted', (payload) => {
      tastingController.startTasting(payload.poisonId);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!state.active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        tastingController.close();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [state.active]);

  if (!state.active || !state.targetPoison) return null;

  const target = state.targetPoison;
  const isSolved = state.result === 'success';
  const isFailed = state.result === 'failure';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sensory Poison Deduction"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-700/90 bg-[#0d121b] text-slate-200 shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-800 bg-[#111723] px-6 py-4">
          <div className="min-w-0">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-wide text-slate-50">
              Sensory Poison Deduction
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Specimen: Gifted Sitian Cognac · Cross-reference observed clues
              against the Taster&apos;s Compendium
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
              <span className="text-slate-400">Action Points</span>
              <span
                className={`font-semibold ${
                  state.remainingAp > 0 ? 'text-amber-300' : 'text-slate-500'
                }`}
              >
                {state.remainingAp}/{state.maxAp} AP
              </span>
            </div>

            <button
              type="button"
              onClick={() => tastingController.close()}
              aria-label="Close tasting deduction"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 text-slate-400 transition-colors duration-150 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Main 2-Column Workspace */}
        <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-slate-800 overflow-y-auto lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* Left Column: 3-AP Investigation Controls + Observed Clues */}
          <section className="flex flex-col gap-5 p-6 lg:col-span-5">
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-300">
                1. Sensory Checks (Choose up to 3)
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {INVESTIGATION_ACTIONS.map((item) => {
                  const Icon = item.icon;
                  const done = state.revealedActions.includes(item.action);
                  const disabled =
                    done || state.remainingAp <= 0 || isSolved;

                  return (
                    <button
                      key={item.action}
                      type="button"
                      disabled={disabled}
                      onClick={() => tastingController.performAction(item.action)}
                      className={`flex flex-col items-start rounded-lg border px-3.5 py-3 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                        done
                          ? 'border-amber-500/50 bg-amber-950/25 text-amber-100 cursor-default'
                          : disabled
                            ? 'border-slate-800/80 bg-slate-900/40 text-slate-500 cursor-not-allowed'
                            : 'border-slate-700/80 bg-slate-900/80 text-slate-100 hover:border-amber-400/70 hover:bg-slate-800/90 cursor-pointer'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap">
                          <Icon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                          <span>{item.label}</span>
                        </span>
                        {done ? (
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <span className="font-mono text-[11px] tabular-nums text-slate-400">
                            1 AP
                          </span>
                        )}
                      </div>
                      <span className="mt-1 text-[11px] leading-snug text-slate-400">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observed Clues Ledger */}
            <div className="flex flex-1 flex-col rounded-lg border border-slate-800/90 bg-[#0a0e15] p-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-semibold tracking-wide text-slate-300">
                  Observed Specimen Clues
                </h3>
                <span className="font-mono text-[11px] tabular-nums text-slate-500">
                  {state.revealedActions.length} logged
                </span>
              </div>

              {state.revealedActions.length === 0 ? (
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  No sensory readings taken yet. Select Smell, Inspect, Dab, or
                  Taste to gather evidence from the Sitian cognac.
                </p>
              ) : (
                <dl className="mt-3 space-y-3 text-xs">
                  {INVESTIGATION_ACTIONS.filter((a) =>
                    state.revealedActions.includes(a.action)
                  ).map((item) => (
                    <div key={item.action}>
                      <dt className="font-medium text-amber-300">
                        {item.clueLabel} ({item.label})
                      </dt>
                      <dd className="mt-0.5 leading-relaxed text-slate-200">
                        {item.getClue(target)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </section>

          {/* Right Column: Taster's Compendium */}
          <section className="flex flex-col p-6 lg:col-span-7">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-semibold tracking-wide text-slate-300">
                2. Taster&apos;s Compendium — Identify the Toxin
              </h3>
              <span className="text-xs text-slate-500">
                Select one compound to confirm
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {POISON_LIST.map((poison) => {
                const isSelected = state.selectedGuessId === poison.poisonId;
                const isConfirmedMatch =
                  isSolved && poison.poisonId === state.targetPoisonId;

                return (
                  <button
                    key={poison.poisonId}
                    type="button"
                    disabled={isSolved}
                    onClick={() => tastingController.selectGuess(poison.poisonId)}
                    className={`flex flex-col items-start rounded-lg border p-3.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                      isConfirmedMatch
                        ? 'border-emerald-400/80 bg-emerald-950/30 text-slate-100'
                        : isSelected
                          ? 'border-amber-400/80 bg-slate-800/90 text-slate-50'
                          : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                    } ${isSolved ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-slate-100">
                        {poison.displayName}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 capitalize">
                        {poison.statusEffectId.replace('_', ' ')}
                      </span>
                    </div>

                    <dl className="mt-2.5 space-y-1.5 text-[11px] leading-snug text-slate-400">
                      <div>
                        <span className="text-slate-300 font-medium">Aroma: </span>
                        {poison.aromaClue}
                      </div>
                      <div>
                        <span className="text-slate-300 font-medium">Visual: </span>
                        {poison.visualClue}
                      </div>
                      <div>
                        <span className="text-slate-300 font-medium">Lip: </span>
                        {poison.lipTouchClue}
                      </div>
                      <div>
                        <span className="text-slate-300 font-medium">Taste: </span>
                        {poison.tasteClue}
                      </div>
                    </dl>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer Feedback & Primary Actions */}
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-slate-800 bg-[#111723] px-6 py-3.5">
          <p
            className={`min-w-0 flex-1 text-xs leading-relaxed ${
              isSolved
                ? 'font-medium text-emerald-300'
                : isFailed
                  ? 'font-medium text-rose-300'
                  : 'text-slate-300'
            }`}
          >
            {state.feedbackMessage}
          </p>

          <div className="flex shrink-0 items-center gap-2.5">
            {isFailed && (
              <button
                type="button"
                onClick={() => tastingController.retry()}
                className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors duration-150 hover:bg-slate-700 whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry Tasting</span>
              </button>
            )}

            {isSolved ? (
              <button
                type="button"
                onClick={() => tastingController.close()}
                className="rounded-md bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition-colors duration-150 hover:bg-emerald-400 whitespace-nowrap cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={!state.selectedGuessId}
                onClick={() => tastingController.submitIdentification()}
                className="rounded-md bg-amber-400 px-5 py-2 text-xs font-semibold text-slate-950 transition-colors duration-150 hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 whitespace-nowrap cursor-pointer"
              >
                Confirm Identification
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
