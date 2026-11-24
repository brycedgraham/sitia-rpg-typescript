import { AlertTriangle, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { eventBus } from '../../core/EventBus';
import { fieldMagicController } from '../../core/FieldMagicController';
import { gameState, useGameState } from '../../core/GameState';
import { soundFx } from '../../core/SoundFx';
import { MAPS_BY_ID } from '../../data/maps';
import { FIELD_PSYNERGIES } from '../../data/psynergy';

export function OverworldHud() {
  const snapshot = useGameState();
  const [muted, setMuted] = useState(() => soundFx.isMuted());

  const currentMap =
    MAPS_BY_ID[snapshot.currentMapId] ?? MAPS_BY_ID.commander_dining_hall;
  const activePsynergy = FIELD_PSYNERGIES[snapshot.activePsynergyId];
  const objectiveHint = gameState.getCurrentObjectiveHint();
  const inWithdrawal = gameState.isInWithdrawal();

  const spPercent = Math.round(
    (snapshot.currentSourcePoints / Math.max(1, snapshot.maxSourcePoints)) * 100
  );

  const handleCyclePsynergy = () => {
    if (snapshot.inputLocked) return;
    fieldMagicController.cycleActiveAbility();
  };

  const handleCastPsynergy = () => {
    if (snapshot.inputLocked) return;
    eventBus.emit('castPsynergyRequested', {});
  };

  const handleReturnTitle = () => {
    soundFx.playDialogueAdvance();
    gameState.returnToTitle();
  };

  const handleToggleMute = () => {
    const nextMuted = soundFx.toggleMute();
    setMuted(nextMuted);
  };

  return (
    <header className="z-20 flex w-full shrink-0 items-center justify-between gap-6 border-b border-slate-800/80 bg-[#0f131a] px-5 py-2.5 text-slate-200">
      {/* Left: Title Return + Area Title + Dynamic Objective Trail */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={handleReturnTitle}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition-colors duration-150 hover:bg-slate-800/80 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Title</span>
        </button>

        <span aria-hidden="true" className="text-slate-700 shrink-0">
          ·
        </span>

        <h1 className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-slate-100 whitespace-nowrap shrink-0">
          {currentMap.displayName}
        </h1>

        <span aria-hidden="true" className="text-slate-600 shrink-0">
          ·
        </span>

        <p className="truncate text-xs text-slate-400 tracking-[0.01em]">
          {objectiveHint}
        </p>
      </div>

      {/* Right: Withdrawal Warning (Dungeon), Source Points Meter, Active Psynergy Controls & Mute */}
      <div className="flex shrink-0 items-center gap-3 text-xs">
        {inWithdrawal && (
          <>
            <span className="flex items-center gap-1.5 font-medium text-violet-300 whitespace-nowrap shrink-0">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              <span>Withdrawal</span>
            </span>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
          </>
        )}

        <div
          className="flex items-center gap-2 whitespace-nowrap shrink-0"
          aria-label={`Source Points ${snapshot.currentSourcePoints} of ${snapshot.maxSourcePoints}`}
        >
          <span className="font-mono text-[11px] text-slate-400">SP</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 64 6"
            className="h-1.5 w-16 overflow-hidden rounded-sm"
          >
            <rect width="64" height="6" fill="#1e293b" />
            <rect
              width={Math.round((spPercent / 100) * 64)}
              height="6"
              fill="#38bdf8"
            />
          </svg>
          <span className="font-mono tabular-nums font-medium text-sky-300">
            {snapshot.currentSourcePoints}/{snapshot.maxSourcePoints}
          </span>
        </div>

        <span aria-hidden="true" className="text-slate-700">
          ·
        </span>

        {activePsynergy && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCyclePsynergy}
              disabled={snapshot.inputLocked}
              title="Cycle Field Psynergy (Tab)"
              className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/85 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors duration-150 hover:border-slate-700 hover:bg-slate-800/90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 10 10"
                className="h-2.5 w-2.5 shrink-0"
                fill={activePsynergy.pulseColorHex}
              >
                <polygon points="5,0 10,5 5,10 0,5" />
              </svg>
              <span>{activePsynergy.displayName}</span>
              <span className="font-mono tabular-nums text-slate-400">
                {activePsynergy.sourceCost} SP
              </span>
            </button>

            <button
              type="button"
              onClick={handleCastPsynergy}
              disabled={snapshot.inputLocked}
              title={`Cast ${activePsynergy.displayName} (Q)`}
              className="rounded-md border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 font-mono text-[11px] font-medium text-slate-200 transition-colors duration-150 hover:border-slate-600 hover:bg-slate-700/90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cast [Q]
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 bg-slate-900/70 text-slate-400 transition-colors duration-150 hover:border-slate-700 hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 shrink-0 cursor-pointer"
        >
          {muted ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </header>
  );
}
