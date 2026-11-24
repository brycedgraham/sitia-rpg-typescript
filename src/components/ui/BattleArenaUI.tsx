import {
  Crosshair,
  Flame,
  FlaskConical,
  HeartPulse,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Swords,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  type BattleVisualAction,
  battleController,
  useBattleState,
} from '../../core/BattleController';
import { eventBus } from '../../core/EventBus';
import { useGameState } from '../../core/GameState';
import {
  loadTransparentBattleSprite,
  resolveBattleBackdropUrl,
  resolveBattleSprite,
} from '../../engine/PortraitAndBattleAtlas';
import type { CombatantData } from '../../types';

function HealthBarSvg({
  current,
  max,
  tone,
}: {
  current: number;
  max: number;
  tone: 'party' | 'enemy' | 'critical';
}) {
  const pct = Math.max(0, Math.min(1, current / Math.max(1, max)));
  const fillColor =
    tone === 'critical'
      ? '#f59e0b'
      : tone === 'party'
        ? '#10b981'
        : '#ef4444';

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 6"
      className="h-1.5 w-full overflow-hidden rounded-sm"
    >
      <rect width="120" height="6" fill="#1e293b" />
      <rect width={Math.round(pct * 120)} height="6" fill={fillColor} />
    </svg>
  );
}

function formatStatusLabel(statusId: string, remainingTurns: number): string {
  const names: Record<string, string> = {
    paralysis: 'Paralyzed',
    coma: 'Coma',
    sleep: 'Asleep',
    withdrawal: 'Withdrawal',
  };
  return `${names[statusId] ?? statusId} (${remainingTurns}t)`;
}

function getEffectiveAgilityDisplay(c: CombatantData): number {
  const paralyzed = c.activeStatuses.some((s) => s.statusId === 'paralysis');
  return paralyzed ? Math.max(1, Math.floor(c.agility * 0.5)) : c.agility;
}

/**
 * Loads the generated full-body battle sprite with outer background chroma-keyed out
 * to transparent PNG, falling back seamlessly to the procedural 32x32 sprite.
 */
function StageCombatantSprite({
  combatantId,
  displayName,
  isHit,
}: {
  combatantId: string;
  displayName: string;
  isHit: boolean;
}) {
  const meta = resolveBattleSprite(combatantId);
  const [srcUrl, setSrcUrl] = useState<string>(meta.fallbackDataUrl);

  useEffect(() => {
    let active = true;
    loadTransparentBattleSprite(meta.imageUrl, meta.fallbackDataUrl).then(
      (transparentUrl) => {
        if (active) {
          setSrcUrl(transparentUrl);
        }
      }
    );
    return () => {
      active = false;
    };
  }, [meta.imageUrl, meta.fallbackDataUrl]);

  return (
    <img
      src={srcUrl}
      alt={displayName}
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (
          meta.fallbackDataUrl &&
          e.currentTarget.src !== meta.fallbackDataUrl
        ) {
          e.currentTarget.src = meta.fallbackDataUrl;
        }
      }}
      className={`relative z-10 h-28 w-28 select-none object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)] [image-rendering:pixelated] sm:h-32 sm:w-32 ${
        isHit ? 'brightness-150 contrast-125' : ''
      }`}
    />
  );
}

/**
 * Location-matched SVG fallback + Generated 32-bit RPG Battle Stage Backdrop
 */
function BattleStageBackdrop({ encounterId }: { encounterId: string }) {
  const backdropUrl = resolveBattleBackdropUrl(encounterId);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
    >
      {/* Underlying SVG fallback architecture */}
      {encounterId === 'act0_dungeon_guard' ? (
        <svg
          viewBox="0 0 640 200"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <rect width="640" height="200" fill="#121620" />
          <line x1="0" y1="126" x2="640" y2="126" stroke="#334155" strokeWidth="2" />
        </svg>
      ) : encounterId === 'act0_mogkan_boss' ? (
        <svg
          viewBox="0 0 640 200"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <rect width="640" height="200" fill="#161124" />
          <line x1="0" y1="124" x2="640" y2="124" stroke="#475569" strokeWidth="2" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 640 200"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <rect width="640" height="200" fill="#0f2922" />
          <line x1="0" y1="118" x2="640" y2="118" stroke="#14b8a6" strokeWidth="2" />
        </svg>
      )}

      {/* Generated 32-Bit Pixel Art Stage Backdrop */}
      {!imageFailed && backdropUrl && (
        <img
          src={backdropUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
      )}

      {/* Subtle grounding vignette scrim so sprites & floating numbers pop cleanly */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090c12]/80 via-[#090c12]/20 to-[#090c12]/45" />
    </div>
  );
}

/**
 * Center / Target Spell & Strike Visual Effect Overlay
 */
function StageActionEffectOverlay({
  action,
}: {
  action: BattleVisualAction | null;
}) {
  if (!action) return null;

  if (action.effectType === 'feral_surge') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
      >
        {/* Blinding Golden-Violet Soulfinder Scream Beam */}
        <div className="h-24 w-full bg-gradient-to-r from-amber-300/30 via-violet-400/55 to-amber-300/40 blur-sm" />
        <div className="h-10 w-full bg-gradient-to-r from-amber-200/80 via-fuchsia-200/90 to-violet-300/85 shadow-[0_0_40px_rgba(192,132,252,0.9)]" />
        {action.shatteredBarrier && (
          <div className="absolute right-[18%] flex items-center justify-center">
            <span className="rounded border border-amber-300 bg-violet-950/90 px-3 py-1 font-[family-name:var(--font-display)] text-xs font-semibold tracking-wider text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.8)]">
              BARRIER SHATTERED!
            </span>
          </div>
        )}
      </div>
    );
  }

  if (
    action.effectType === 'enemy_magic' ||
    action.effectType === 'absorb_reflect'
  ) {
    const isReflect = action.effectType === 'absorb_reflect';
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[22%] top-1/2 z-20 -translate-y-1/2"
      >
        <div
          className={`h-4 w-full rounded-full ${
            isReflect
              ? 'bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-400 shadow-[0_0_24px_rgba(56,189,248,0.85)]'
              : 'bg-gradient-to-l from-fuchsia-400 via-violet-500 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.75)]'
          }`}
        />
      </div>
    );
  }

  return null;
}

export function BattleArenaUI() {
  const battle = useBattleState();
  const gameSnap = useGameState();

  useEffect(() => {
    const unsubscribe = eventBus.on('combatInitiated', (payload) => {
      battleController.startEncounter(payload.encounterId);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!battle.active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === 'Tab' && battle.phase === 'player_turn') {
        event.preventDefault();
        event.stopPropagation();
        battleController.cycleTarget();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [battle.active, battle.phase]);

  if (!battle.active || !battle.encounter) return null;

  const isPlayerTurn = battle.phase === 'player_turn';
  const isVictory = battle.phase === 'victory';
  const isDefeat = battle.phase === 'defeat';

  const allCombatants = [...battle.party, ...battle.enemies];
  const combatantById = new Map(
    allCombatants.map((c) => [c.combatantId, c])
  );
  const activeActor = battle.activeCombatantId
    ? combatantById.get(battle.activeCombatantId)
    : null;
  const livingEnemies = battle.enemies.filter((e) => e.currentHp > 0);
  const canCycleTarget = livingEnemies.length > 1;
  const isYelenaTurn = activeActor?.combatantId === 'yelena';
  const lastAction = battle.lastAction;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={battle.encounter.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080c]/90 p-3 backdrop-blur-md sm:p-4"
    >
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-700/90 bg-[#0c1018] text-slate-200 shadow-[0_28px_72px_rgba(0,0,0,0.88)]">
        {/* Top Encounter Header & Agility Turn Order */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-[#101622] px-5 py-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold tracking-wide text-slate-50">
              {battle.encounter.title}
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-mono tabular-nums text-slate-300">
                Round {battle.roundNumber}
              </span>
              <span aria-hidden="true">·</span>
              <span>Turn Order (Agility):</span>
              <span className="font-mono text-[11px] text-slate-300">
                {battle.turnOrderIds
                  .map((id) => {
                    const c = combatantById.get(id);
                    if (!c || c.currentHp <= 0) return null;
                    return id === battle.activeCombatantId
                      ? `[${c.displayName.split(' ')[0]}]`
                      : c.displayName.split(' ')[0];
                  })
                  .filter(Boolean)
                  .join(' → ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
            <span className="text-slate-400">Source</span>
            <span className="font-semibold text-sky-300">
              {gameSnap.currentSourcePoints}/{gameSnap.maxSourcePoints} SP
            </span>
          </div>
        </header>

        {/* Scrollable Middle Area: Illustrated Side-View Battle Stage + Compact Tactical HP Cards */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* 1. ILLUSTRATED SIDE-VIEW BATTLE STAGE */}
          <section
            aria-label="Battlefield Stage"
            className="relative flex h-56 shrink-0 items-end justify-between overflow-hidden border-b border-slate-800 px-6 pb-3.5 pt-6 sm:h-60 sm:px-12"
          >
            <BattleStageBackdrop encounterId={battle.encounter.encounterId} />
            <StageActionEffectOverlay action={lastAction} />

            {/* Left Flank: Party Vanguard Sprites */}
            <div className="relative z-10 flex items-end gap-5 sm:gap-8">
              {battle.party.map((member) => {
                const alive = member.currentHp > 0;
                const isActing =
                  isPlayerTurn &&
                  member.combatantId === battle.activeCombatantId;
                const isLunging =
                  lastAction?.actorId === member.combatantId &&
                  lastAction.effectType !== 'healing_hands' &&
                  lastAction.effectType !== 'absorb_redirect';
                const isHit = battle.lastHitId === member.combatantId;
                const isHealedTarget =
                  lastAction?.targetId === member.combatantId &&
                  lastAction.effectType === 'healing_hands';
                const hasFeralAura =
                  member.combatantId === 'yelena' && battle.feralSurgeUnlocked;
                const hasAbsorbWard =
                  member.combatantId === 'yelena' && battle.absorbStanceActive;
                const actionPopup =
                  lastAction?.targetId === member.combatantId
                    ? lastAction
                    : null;

                return (
                  <div
                    key={member.combatantId}
                    className={`relative flex flex-col items-center transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      !alive
                        ? 'opacity-35 grayscale'
                        : isLunging
                          ? 'translate-x-7 -translate-y-1 scale-105'
                          : isHit
                            ? '-translate-x-2.5'
                            : ''
                    }`}
                  >
                    {/* Floating Damage / Heal / Ward Label */}
                    {actionPopup && (
                      <div
                        className={`pointer-events-none absolute -top-7 z-30 whitespace-nowrap rounded px-2 py-0.5 font-mono text-[11px] font-semibold shadow-md ${
                          actionPopup.effectType === 'healing_hands'
                            ? 'border border-emerald-400/80 bg-emerald-950/95 text-emerald-200'
                            : actionPopup.effectType === 'absorb_redirect'
                              ? 'border border-sky-400/80 bg-sky-950/95 text-sky-200'
                              : 'border border-rose-400/80 bg-rose-950/95 text-rose-200'
                        }`}
                      >
                        {actionPopup.label}
                      </div>
                    )}

                    {/* Active Turn Indicator Tag */}
                    {isActing && alive && (
                      <span className="mb-1 rounded bg-sky-950/85 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-200 ring-1 ring-sky-400/75">
                        ACTING
                      </span>
                    )}

                    {/* Sprite Frame + Auras */}
                    <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
                      {/* Feral Surge Soulfinder Golden-Violet Aura */}
                      {hasFeralAura && alive && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-1 rounded-full bg-gradient-to-t from-violet-600/55 via-amber-400/40 to-transparent blur-md"
                        />
                      )}

                      {/* Absorb & Redirect Cyan Runic Ward */}
                      {hasAbsorbWard && alive && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-1 rounded-full border-2 border-dashed border-sky-300/85 bg-sky-400/15 shadow-[0_0_22px_rgba(56,189,248,0.5)]"
                        />
                      )}

                      {/* Healing Hands Radiance */}
                      {isHealedTarget && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-1 rounded-full border-2 border-emerald-300 bg-emerald-400/25 shadow-[0_0_24px_rgba(16,185,129,0.65)]"
                        />
                      )}

                      {/* Generated Full-Body Battle Sprite */}
                      <StageCombatantSprite
                        combatantId={member.combatantId}
                        displayName={member.displayName}
                        isHit={isHit}
                      />
                    </div>

                    {/* Underfoot Shadow & Turn Ring */}
                    <div
                      aria-hidden="true"
                      className={`-mt-3 h-3.5 w-20 rounded-full transition-colors ${
                        isActing
                          ? 'border border-sky-300 bg-sky-400/40 shadow-[0_0_14px_rgba(56,189,248,0.65)]'
                          : 'bg-black/65'
                      }`}
                    />
                    <span className="mt-1 font-[family-name:var(--font-display)] text-xs font-semibold text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                      {member.displayName.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right Flank: Hostile Combatant Sprites */}
            <div className="relative z-10 flex items-end gap-5 sm:gap-8">
              {battle.enemies.map((enemy, idx) => {
                const alive = enemy.currentHp > 0;
                const isTargeted = alive && idx === battle.selectedEnemyIndex;
                const isActing =
                  battle.phase === 'enemy_turn' &&
                  enemy.combatantId === battle.activeCombatantId;
                const isLunging = lastAction?.actorId === enemy.combatantId;
                const isHit = battle.lastHitId === enemy.combatantId;
                const actionPopup =
                  lastAction?.targetId === enemy.combatantId
                    ? lastAction
                    : null;

                return (
                  <button
                    key={enemy.combatantId}
                    type="button"
                    disabled={!alive || !isPlayerTurn}
                    onClick={() => battleController.selectEnemy(idx)}
                    aria-label={`Target ${enemy.displayName}`}
                    className={`group relative flex flex-col items-center transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${
                      !alive
                        ? 'cursor-default opacity-30 grayscale'
                        : isLunging
                          ? '-translate-x-7 -translate-y-1 scale-105 cursor-pointer'
                          : isHit
                            ? 'translate-x-2.5 cursor-pointer'
                            : 'cursor-pointer'
                    }`}
                  >
                    {/* Floating Damage / Poison / Deflect Popup */}
                    {actionPopup && (
                      <div
                        className={`pointer-events-none absolute -top-8 z-30 whitespace-nowrap rounded px-2 py-0.5 font-mono text-[11px] font-semibold shadow-md ${
                          actionPopup.effectType === 'barrier_deflect'
                            ? 'border border-violet-300 bg-violet-950/95 text-violet-200'
                            : actionPopup.effectType === 'poison_crippler' ||
                                actionPopup.effectType === 'poison_my_love'
                              ? 'border border-emerald-400 bg-emerald-950/95 text-emerald-200'
                              : 'border border-amber-300 bg-amber-950/95 text-amber-200'
                        }`}
                      >
                        {actionPopup.label}
                      </div>
                    )}

                    {/* Target Crosshair Badge */}
                    {isTargeted && (
                      <div className="mb-1 flex items-center gap-1 rounded bg-amber-950/85 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-200 ring-1 ring-amber-400/80">
                        <Crosshair className="h-3 w-3" />
                        <span>TARGET</span>
                      </div>
                    )}

                    {/* Sprite Frame + Magic Barrier Dome + Strike Burst */}
                    <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
                      {/* Mogkan's Active Magic Barrier Hexagonal Dome */}
                      {enemy.hasMagicBarrier && alive && (
                        <div
                          aria-hidden="true"
                          className={`pointer-events-none absolute -inset-1 z-20 rounded-2xl border-2 bg-violet-500/15 transition-transform duration-150 ${
                            actionPopup?.effectType === 'barrier_deflect'
                              ? 'scale-110 border-fuchsia-300 bg-violet-400/35 shadow-[0_0_28px_rgba(216,180,254,0.9)]'
                              : 'border-violet-400/85 shadow-[0_0_22px_rgba(168,85,247,0.55)]'
                          }`}
                        />
                      )}

                      {/* Poison Mist Burst */}
                      {actionPopup &&
                        (actionPopup.effectType === 'poison_crippler' ||
                          actionPopup.effectType === 'poison_my_love') && (
                          <div
                            aria-hidden="true"
                            className={`pointer-events-none absolute inset-0 z-20 rounded-full blur-sm ${
                              actionPopup.effectType === 'poison_crippler'
                                ? 'bg-emerald-500/45'
                                : 'bg-amber-500/45'
                            }`}
                          />
                        )}

                      {/* Physical Slash Flash */}
                      {actionPopup?.effectType === 'attack' && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-3 z-20 rotate-45 border-t-2 border-amber-200 shadow-[0_0_14px_rgba(254,240,138,0.9)]"
                        />
                      )}

                      {/* Generated Full-Body Enemy Combat Sprite */}
                      <StageCombatantSprite
                        combatantId={enemy.combatantId}
                        displayName={enemy.displayName}
                        isHit={isHit}
                      />
                    </div>

                    {/* Underfoot Target Ring */}
                    <div
                      aria-hidden="true"
                      className={`-mt-3 h-3.5 w-20 rounded-full transition-colors ${
                        isTargeted
                          ? 'border border-amber-300 bg-amber-400/40 shadow-[0_0_14px_rgba(251,191,36,0.7)]'
                          : isActing
                            ? 'border border-rose-400 bg-rose-500/40'
                            : 'bg-black/65 group-hover:bg-amber-400/25'
                      }`}
                    />
                    <span className="mt-1 font-[family-name:var(--font-display)] text-xs font-semibold text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                      {enemy.displayName.split(' (')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. COMPACT TACTICAL HP & STATUS CARDS BELOW STAGE */}
          <div className="grid grid-cols-1 gap-4 bg-[#0b0e15] px-5 py-3.5 md:grid-cols-2">
            {/* Player Party Cards */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold tracking-wide text-slate-300">
                  Party Vanguard
                </span>
                <span>
                  {isPlayerTurn && activeActor
                    ? `Active: ${activeActor.displayName}`
                    : isVictory
                      ? 'Encounter Won'
                      : isDefeat
                        ? 'Party Fallen'
                        : 'Enemy Acting...'}
                </span>
              </div>

              {battle.party.map((member) => {
                const isActing =
                  isPlayerTurn &&
                  member.combatantId === battle.activeCombatantId;
                const isHit = battle.lastHitId === member.combatantId;
                const isCritical =
                  member.currentHp > 0 &&
                  member.currentHp <= Math.ceil(member.maxHp * 0.25);

                return (
                  <div
                    key={member.combatantId}
                    className={`rounded-lg border px-3.5 py-2.5 transition-[border-color,transform] duration-150 ${
                      isHit
                        ? 'translate-x-1 border-rose-500/80 bg-rose-950/25'
                        : isActing
                          ? 'border-sky-400/80 bg-slate-900/90'
                          : 'border-slate-800 bg-slate-900/65'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-[family-name:var(--font-display)] text-xs font-semibold text-slate-100">
                        {member.displayName}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-slate-300">
                        HP {member.currentHp}/{member.maxHp} · AGI{' '}
                        {getEffectiveAgilityDisplay(member)}
                      </span>
                    </div>

                    <div className="mt-1.5">
                      <HealthBarSvg
                        current={member.currentHp}
                        max={member.maxHp}
                        tone={isCritical ? 'critical' : 'party'}
                      />
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                      {member.combatantId === 'yelena' &&
                        battle.feralSurgeUnlocked && (
                          <span className="flex items-center gap-1 font-semibold text-amber-300">
                            <Flame className="h-3 w-3 shrink-0" />
                            <span>Feral Surge Awakened</span>
                          </span>
                        )}
                      {member.combatantId === 'yelena' &&
                        battle.absorbStanceActive && (
                          <span className="flex items-center gap-1 font-medium text-sky-300">
                            <Shield className="h-3 w-3 shrink-0" />
                            <span>Absorb &amp; Redirect Ready</span>
                          </span>
                        )}
                      {isCritical && (
                        <span className="font-medium text-amber-400">
                          Low HP (&le;25%)
                        </span>
                      )}
                      {member.activeStatuses.map((st) => (
                        <span key={st.statusId} className="text-rose-300">
                          {formatStatusLabel(st.statusId, st.remainingTurns)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Enemy Roster Cards */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold tracking-wide text-slate-300">
                  Hostiles
                </span>
                {canCycleTarget && isPlayerTurn && (
                  <button
                    type="button"
                    onClick={() => battleController.cycleTarget()}
                    className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-200 transition-colors duration-150 hover:border-amber-400/70 hover:text-amber-200"
                  >
                    <Crosshair className="h-3 w-3" />
                    <span>Next Target [Tab]</span>
                  </button>
                )}
              </div>

              {battle.enemies.map((enemy, idx) => {
                const alive = enemy.currentHp > 0;
                const isTargeted = alive && idx === battle.selectedEnemyIndex;
                const isActing =
                  battle.phase === 'enemy_turn' &&
                  enemy.combatantId === battle.activeCombatantId;
                const isHit = battle.lastHitId === enemy.combatantId;
                const effectiveAgi = getEffectiveAgilityDisplay(enemy);

                return (
                  <button
                    key={enemy.combatantId}
                    type="button"
                    disabled={!alive || !isPlayerTurn}
                    onClick={() => battleController.selectEnemy(idx)}
                    className={`flex w-full flex-col rounded-lg border px-3.5 py-2.5 text-left transition-[border-color,transform,opacity] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                      !alive
                        ? 'cursor-default border-slate-800/60 bg-slate-950/50 opacity-45'
                        : isHit
                          ? '-translate-x-1 border-amber-400 bg-amber-950/25'
                          : isTargeted
                            ? 'cursor-pointer border-amber-400/85 bg-slate-900/95 shadow-[0_0_20px_rgba(251,191,36,0.12)]'
                            : isActing
                              ? 'border-rose-400/80 bg-slate-900/90'
                              : 'cursor-pointer border-slate-800 bg-slate-900/65 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex w-full items-baseline justify-between gap-2">
                      <span className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xs font-semibold text-slate-100">
                        {isTargeted && (
                          <Crosshair className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                        )}
                        <span>{enemy.displayName}</span>
                      </span>
                      <span className="font-mono text-xs tabular-nums text-slate-300">
                        {alive
                          ? `HP ${enemy.currentHp}/${enemy.maxHp} · AGI ${effectiveAgi}`
                          : 'Defeated'}
                      </span>
                    </div>

                    <div className="mt-1.5 w-full">
                      <HealthBarSvg
                        current={enemy.currentHp}
                        max={enemy.maxHp}
                        tone="enemy"
                      />
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                      {enemy.hasMagicBarrier && alive && (
                        <span className="flex items-center gap-1 font-medium text-violet-300">
                          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                          <span>Magic Barrier Active (Deflects Normal Hits)</span>
                        </span>
                      )}
                      {enemy.activeStatuses.map((st) => (
                        <span
                          key={st.statusId}
                          className="font-medium text-emerald-300"
                        >
                          {formatStatusLabel(st.statusId, st.remainingTurns)}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </section>
          </div>
        </div>

        {/* Bottom Command Deck & Tactical Log */}
        <footer className="grid shrink-0 grid-cols-1 divide-y divide-slate-800 border-t border-slate-800 bg-[#101622] lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* Command Buttons */}
          <div className="p-4 lg:col-span-7">
            {isVictory ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-emerald-300">
                    Victory Achieved
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    The threat is neutralized. Return to the overworld to
                    continue your chronicle.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => battleController.closeBattle()}
                  className="cursor-pointer whitespace-nowrap rounded-md bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition-colors duration-150 hover:bg-emerald-400"
                >
                  Continue
                </button>
              </div>
            ) : isDefeat ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-rose-300">
                    Overwhelmed
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Regroup and refine your poison coatings or Source timing.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => battleController.closeBattle()}
                    className="cursor-pointer whitespace-nowrap rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                  >
                    Retreat
                  </button>
                  <button
                    type="button"
                    onClick={() => battleController.retryEncounter()}
                    className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retry Battle</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!isPlayerTurn}
                  onClick={() => battleController.performPlayerAttack()}
                  className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-100 transition-colors duration-150 hover:border-slate-500 hover:bg-slate-700 disabled:opacity-45"
                >
                  <Swords className="h-3.5 w-3.5 text-slate-300" />
                  <span>Attack</span>
                </button>

                <button
                  type="button"
                  disabled={!isPlayerTurn}
                  onClick={() => battleController.performUsePoison('crippler')}
                  className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-emerald-800/80 bg-emerald-950/40 px-3.5 py-2 text-xs font-medium text-emerald-200 transition-colors duration-150 hover:border-emerald-600 hover:bg-emerald-900/50 disabled:opacity-45"
                >
                  <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Poison: Crippler&apos;s Root</span>
                </button>

                <button
                  type="button"
                  disabled={!isPlayerTurn}
                  onClick={() => battleController.performUsePoison('my_love')}
                  className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-amber-800/80 bg-amber-950/35 px-3.5 py-2 text-xs font-medium text-amber-200 transition-colors duration-150 hover:border-amber-600 hover:bg-amber-900/45 disabled:opacity-45"
                >
                  <FlaskConical className="h-3.5 w-3.5 text-amber-400" />
                  <span>Poison: My Love</span>
                </button>

                {isYelenaTurn && (
                  <button
                    type="button"
                    disabled={
                      !isPlayerTurn || gameSnap.currentSourcePoints < 4
                    }
                    onClick={() => battleController.performAbsorbRedirect()}
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-sky-800/80 bg-sky-950/40 px-3.5 py-2 text-xs font-medium text-sky-200 transition-colors duration-150 hover:border-sky-600 hover:bg-sky-900/50 disabled:opacity-45"
                  >
                    <Shield className="h-3.5 w-3.5 text-sky-400" />
                    <span>Absorb &amp; Redirect (4 SP)</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={!isPlayerTurn || gameSnap.currentSourcePoints < 5}
                  onClick={() => battleController.performHealingHands()}
                  className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-teal-800/80 bg-teal-950/40 px-3.5 py-2 text-xs font-medium text-teal-200 transition-colors duration-150 hover:border-teal-600 hover:bg-teal-900/50 disabled:opacity-45"
                >
                  <HeartPulse className="h-3.5 w-3.5 text-teal-400" />
                  <span>Healing Hands (5 SP)</span>
                </button>

                {battle.feralSurgeUnlocked && (
                  <button
                    type="button"
                    disabled={!isPlayerTurn}
                    onClick={() => battleController.performFeralSurge()}
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-violet-400 bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.45)] transition-colors duration-150 hover:bg-violet-500 disabled:opacity-45"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                    <span>Feral Surge (Soulfinder Scream)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tactical Combat Log */}
          <div className="flex max-h-32 flex-col overflow-y-auto bg-[#0a0e15] px-5 py-3 lg:col-span-5">
            <span className="text-[11px] font-semibold tracking-wide text-slate-500">
              Combat Log
            </span>
            <ul className="mt-1.5 space-y-1 text-xs leading-snug">
              {battle.combatLog.slice(-5).map((entry) => {
                const colorClass =
                  entry.tone === 'magic'
                    ? 'text-violet-300'
                    : entry.tone === 'poison'
                      ? 'text-emerald-300'
                      : entry.tone === 'damage'
                        ? 'text-slate-200'
                        : entry.tone === 'victory'
                          ? 'font-semibold text-emerald-300'
                          : entry.tone === 'warning'
                            ? 'text-amber-300'
                            : 'text-slate-400';

                return (
                  <li key={entry.id} className={colorClass}>
                    {entry.text}
                  </li>
                );
              })}
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
}
