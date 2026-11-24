import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { eventBus } from '../../core/EventBus';
import { gameState } from '../../core/GameState';
import { soundFx } from '../../core/SoundFx';

export function TitleCardOverlay() {
  const [subtitle, setSubtitle] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = eventBus.on('titleCardTriggered', (payload) => {
      gameState.setInputLocked(true);
      soundFx.playVictory();
      setSubtitle(payload.subtitle);
    });
    return unsubscribe;
  }, []);

  const handleBeginAct1 = () => {
    soundFx.playQuestInspect();
    setSubtitle(null);
    gameState.beginAct1FromPrologue();
  };

  useEffect(() => {
    if (!subtitle) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (
        event.code === 'Enter' ||
        event.code === 'Space' ||
        event.code === 'KeyE'
      ) {
        event.preventDefault();
        event.stopPropagation();
        handleBeginAct1();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [subtitle]);

  if (!subtitle) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chronicles of Ixia Title Card"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080c] px-6 text-center text-slate-100"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,rgba(16,185,129,0.16),transparent_70%),radial-gradient(ellipse_50%_40%_at_50%_80%,rgba(127,29,29,0.18),transparent_75%)]"
      />

      <div className="relative z-10 flex max-w-2xl flex-col items-center">
        <p className="text-xs font-medium tracking-[0.26em] text-amber-400/90 uppercase">
          Prologue Complete · Exile to the South
        </p>

        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[0.12em] text-slate-50 sm:text-6xl text-balance">
          CHRONICLES OF IXIA
        </h1>

        <p className="mt-3 font-[family-name:var(--font-display)] text-base font-semibold tracking-[0.14em] text-emerald-300 sm:text-lg">
          {subtitle}
        </p>

        <p className="mt-6 max-w-lg text-sm leading-relaxed text-slate-400">
          Valek, Ari, and Janco remain behind Castle Ixia&apos;s iron gates.
          Across the southern border, Fourth Magician Irys joins your party to
          guide your Source magic through Sitia.
        </p>

        <button
          type="button"
          onClick={handleBeginAct1}
          className="mt-9 flex items-center gap-2.5 rounded-lg border border-emerald-400/70 bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_rgba(16,185,129,0.28)] transition-colors duration-150 hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 whitespace-nowrap cursor-pointer"
        >
          <span>Begin Act I: Sitia</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>

        <span className="mt-4 font-mono text-[11px] text-slate-500">
          Press Enter or Space to continue
        </span>
      </div>
    </div>
  );
}
