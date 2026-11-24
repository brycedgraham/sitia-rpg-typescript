import { ArrowRight, Swords } from 'lucide-react';
import { useEffect, useState } from 'react';
import { eventBus } from '../../core/EventBus';
import { gameState, type LaunchPreset } from '../../core/GameState';
import { soundFx } from '../../core/SoundFx';

interface LaunchOption {
  preset: LaunchPreset;
  label: string;
  location: string;
  actMeta: string;
  primary?: boolean;
}

const LAUNCH_OPTIONS: LaunchOption[] = [
  {
    preset: 'act0_prologue',
    label: 'Start Act 0: Prologue',
    location: "Commander's Dining Hall",
    actMeta: 'Castle Ixia · Poison Study Climax',
    primary: true,
  },
  {
    preset: 'act1_sitia',
    label: 'Jump to Act I: Sitia',
    location: 'Southern Border Checkpoint',
    actMeta: 'Sitia · Magic Study Opening',
  },
  {
    preset: 'act1_greenblade',
    label: 'Jump to Greenblade Town',
    location: 'Zaltana Clan Square',
    actMeta: 'Sitia · Blood Thief Investigation',
  },
];

export function TitleScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleLaunch = (preset: LaunchPreset) => {
    soundFx.playQuestInspect();
    gameState.launchPreset(preset);
  };

  const handleLaunchEncounter = (
    preset: LaunchPreset,
    encounterId: string
  ) => {
    soundFx.playQuestInspect();
    gameState.launchPreset(preset);
    // Defer one tick so BattleArenaUI mounts inside the Overworld shell before receiving the event
    window.setTimeout(() => {
      eventBus.emit('combatInitiated', { encounterId });
    }, 20);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        event.preventDefault();
        soundFx.playCyclePsynergy();
        setSelectedIndex((prev) => (prev + 1) % LAUNCH_OPTIONS.length);
      } else if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault();
        soundFx.playCyclePsynergy();
        setSelectedIndex(
          (prev) => (prev - 1 + LAUNCH_OPTIONS.length) % LAUNCH_OPTIONS.length
        );
      } else if (
        event.code === 'Enter' ||
        event.code === 'Space' ||
        event.code === 'KeyE'
      ) {
        event.preventDefault();
        handleLaunch(LAUNCH_OPTIONS[selectedIndex].preset);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIndex]);

  return (
    <div className="relative flex h-screen w-screen flex-col justify-between overflow-hidden bg-[#0b0d11] text-slate-200">
      {/* Subtle dual-realm atmospheric twilight wash (Ixian crimson-slate left, Sitian emerald right) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_18%_35%,rgba(127,29,29,0.22),transparent_70%),radial-gradient(ellipse_55%_55%_at_84%_72%,rgba(16,185,129,0.14),transparent_70%)]"
      />

      {/* Subtle architectural hairline frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-5 border border-slate-800/60"
      />

      {/* Top quiet chapter line */}
      <header className="relative z-10 flex items-center justify-between px-10 pt-9 text-xs text-slate-500">
        <span className="tracking-wide text-slate-400">
          Act 0: Castle Ixia · Act I: Sitia
        </span>
        <span className="font-mono tabular-nums text-slate-500">
          384×216 Pixel RPG Engine
        </span>
      </header>

      {/* Main Title Centerpiece */}
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-8 text-center">
        <p className="text-xs font-medium tracking-[0.22em] text-amber-400/90 uppercase">
          A Top-Down Narrative RPG
        </p>

        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[0.06em] text-slate-50 sm:text-5xl text-balance">
          Chronicles of Ixia
        </h1>

        <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold tracking-[0.14em] text-slate-400">
          Study of Magic
        </p>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-400">
          Step into the stone halls of Castle Ixia as Commander Ambrose&apos;s
          food taster. Unmask assassins by scent and taste, awaken Sitian Field
          Psynergy, and cross the southern border into Greenblade.
        </p>

        {/* Launch Actions */}
        <div className="mt-8 flex w-full max-w-md flex-col gap-3">
          {LAUNCH_OPTIONS.map((option, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                key={option.preset}
                type="button"
                onMouseEnter={() => setSelectedIndex(index)}
                onFocus={() => setSelectedIndex(index)}
                onClick={() => handleLaunch(option.preset)}
                className={`group flex w-full items-center justify-between gap-4 rounded-lg px-5 py-3.5 text-left transition-[background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 cursor-pointer ${
                  option.primary
                    ? isSelected
                      ? 'border border-amber-300/80 bg-slate-100 text-slate-950 shadow-[0_10px_28px_rgba(0,0,0,0.45)]'
                      : 'border border-slate-300/60 bg-slate-200 text-slate-950 hover:bg-slate-100'
                    : isSelected
                      ? 'border border-slate-500 bg-slate-800/90 text-slate-50'
                      : 'border border-slate-800 bg-slate-900/75 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-tight whitespace-nowrap">
                    {option.label}
                  </div>
                  <div
                    className={`mt-0.5 text-xs truncate ${
                      option.primary ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {option.location} · {option.actMeta}
                  </div>
                </div>

                <ArrowRight
                  className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
                    isSelected ? 'translate-x-0.5' : ''
                  } ${option.primary ? 'text-slate-900' : 'text-slate-400'}`}
                />
              </button>
            );
          })}
        </div>

        {/* Direct Tactical Combat Encounters */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Swords className="h-3.5 w-3.5" />
            <span>Tactical Battles:</span>
          </span>
          <button
            type="button"
            onClick={() =>
              handleLaunchEncounter('act0_prologue', 'act0_mogkan_boss')
            }
            className="text-slate-300 underline decoration-slate-600 underline-offset-4 transition-colors duration-150 hover:text-amber-300 hover:decoration-amber-400 whitespace-nowrap cursor-pointer"
          >
            Mogkan Boss Battle
          </button>
          <span aria-hidden="true" className="text-slate-700">
            ·
          </span>
          <button
            type="button"
            onClick={() =>
              handleLaunchEncounter('act1_greenblade', 'act1_sitia_ambush')
            }
            className="text-slate-300 underline decoration-slate-600 underline-offset-4 transition-colors duration-150 hover:text-emerald-300 hover:decoration-emerald-400 whitespace-nowrap cursor-pointer"
          >
            Sitia 2-Enemy Ambush
          </button>
        </div>
      </main>

      {/* Bottom Controls Strip */}
      <footer className="relative z-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-10 pb-8 font-mono text-[11px] text-slate-500">
        <span>
          <strong className="font-medium text-slate-300">WASD / Arrows</strong>{' '}
          Move
        </span>
        <span aria-hidden="true">·</span>
        <span>
          <strong className="font-medium text-slate-300">E / Space</strong>{' '}
          Interact
        </span>
        <span aria-hidden="true">·</span>
        <span>
          <strong className="font-medium text-slate-300">Tab</strong> Cycle
          Psynergy
        </span>
        <span aria-hidden="true">·</span>
        <span>
          <strong className="font-medium text-slate-300">Q</strong> Cast
          Psynergy
        </span>
      </footer>
    </div>
  );
}
