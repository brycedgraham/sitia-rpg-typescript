import { useSyncExternalStore } from 'react';
import {
  cloneCombatant,
  ENCOUNTERS,
  PARTY_COMBATANT_TEMPLATES,
} from '../data/encounters';
import { POISONS } from '../data/poisons';
import type { CombatantData, EncounterData } from '../types';
import { eventBus } from './EventBus';
import { gameState } from './GameState';
import { soundFx } from './SoundFx';

export type BattlePhase = 'player_turn' | 'enemy_turn' | 'victory' | 'defeat';

export type BattleVisualEffectType =
  | 'attack'
  | 'poison_crippler'
  | 'poison_my_love'
  | 'absorb_redirect'
  | 'healing_hands'
  | 'feral_surge'
  | 'barrier_deflect'
  | 'enemy_magic'
  | 'absorb_reflect';

export interface BattleVisualAction {
  id: number;
  actorId: string;
  targetId: string;
  effectType: BattleVisualEffectType;
  label: string;
  shatteredBarrier?: boolean;
}

export interface CombatLogEntry {
  id: number;
  text: string;
  tone: 'neutral' | 'damage' | 'poison' | 'magic' | 'victory' | 'warning';
}

export interface BattleSnapshot {
  active: boolean;
  encounter: EncounterData | null;
  party: CombatantData[];
  enemies: CombatantData[];
  turnOrderIds: string[];
  activeCombatantId: string | null;
  selectedEnemyIndex: number;
  feralSurgeUnlocked: boolean;
  absorbStanceActive: boolean;
  phase: BattlePhase;
  combatLog: CombatLogEntry[];
  lastHitId: string | null;
  lastAction: BattleVisualAction | null;
  roundNumber: number;
}

const INITIAL_BATTLE_STATE: BattleSnapshot = {
  active: false,
  encounter: null,
  party: [],
  enemies: [],
  turnOrderIds: [],
  activeCombatantId: null,
  selectedEnemyIndex: 0,
  feralSurgeUnlocked: false,
  absorbStanceActive: false,
  phase: 'player_turn',
  combatLog: [],
  lastHitId: null,
  lastAction: null,
  roundNumber: 1,
};

type Listener = () => void;

let logSequence = 1;
let actionSequence = 1;

function getEffectiveAgility(combatant: CombatantData): number {
  const hasParalysis = combatant.activeStatuses.some(
    (s) => s.statusId === 'paralysis'
  );
  return hasParalysis ? Math.max(1, Math.floor(combatant.agility * 0.5)) : combatant.agility;
}

function isAlive(c: CombatantData): boolean {
  return c.currentHp > 0;
}

function isIncapacitated(c: CombatantData): boolean {
  return c.activeStatuses.some(
    (s) => s.statusId === 'coma' || s.statusId === 'sleep'
  );
}

class BattleController {
  private state: BattleSnapshot = { ...INITIAL_BATTLE_STATE };
  private listeners = new Set<Listener>();
  private enemyTurnTimer: number | null = null;
  private hitClearTimer: number | null = null;
  private actionClearTimer: number | null = null;
  private roundQueue: string[] = [];

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): BattleSnapshot => this.state;

  private clearTimers(): void {
    if (this.enemyTurnTimer !== null) {
      window.clearTimeout(this.enemyTurnTimer);
      this.enemyTurnTimer = null;
    }
    if (this.hitClearTimer !== null) {
      window.clearTimeout(this.hitClearTimer);
      this.hitClearTimer = null;
    }
    if (this.actionClearTimer !== null) {
      window.clearTimeout(this.actionClearTimer);
      this.actionClearTimer = null;
    }
  }

  private update(patch: Partial<BattleSnapshot>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) {
      listener();
    }
  }

  private appendLog(
    text: string,
    tone: CombatLogEntry['tone'] = 'neutral'
  ): CombatLogEntry[] {
    const entry: CombatLogEntry = { id: (logSequence += 1), text, tone };
    return [...this.state.combatLog, entry].slice(-8);
  }

  private flashHit(combatantId: string): void {
    if (this.hitClearTimer !== null) {
      window.clearTimeout(this.hitClearTimer);
    }
    this.update({ lastHitId: combatantId });
    this.hitClearTimer = window.setTimeout(() => {
      this.update({ lastHitId: null });
    }, 340);
  }

  private triggerVisualAction(
    actorId: string,
    targetId: string,
    effectType: BattleVisualEffectType,
    label: string,
    shatteredBarrier = false
  ): void {
    if (this.actionClearTimer !== null) {
      window.clearTimeout(this.actionClearTimer);
    }
    const action: BattleVisualAction = {
      id: (actionSequence += 1),
      actorId,
      targetId,
      effectType,
      label,
      shatteredBarrier,
    };
    this.update({ lastAction: action });
    this.actionClearTimer = window.setTimeout(() => {
      this.update({ lastAction: null });
    }, 520);
  }

  private computeTurnOrder(
    party: CombatantData[],
    enemies: CombatantData[]
  ): string[] {
    const living = [...party, ...enemies].filter(isAlive);
    living.sort((a, b) => {
      const diff = getEffectiveAgility(b) - getEffectiveAgility(a);
      if (diff !== 0) return diff;
      // Player party breaks Agility ties first
      return a.isPlayerParty === b.isPlayerParty ? 0 : a.isPlayerParty ? -1 : 1;
    });
    return living.map((c) => c.combatantId);
  }

  private pickValidEnemyIndex(
    enemies: CombatantData[],
    preferredIndex: number
  ): number {
    if (
      enemies[preferredIndex] &&
      isAlive(enemies[preferredIndex]) &&
      !isIncapacitated(enemies[preferredIndex])
    ) {
      return preferredIndex;
    }
    const consciousAlive = enemies.findIndex(
      (e) => isAlive(e) && !isIncapacitated(e)
    );
    if (consciousAlive !== -1) return consciousAlive;

    const anyAlive = enemies.findIndex(isAlive);
    return anyAlive !== -1 ? anyAlive : 0;
  }

  startEncounter(encounterId: string): void {
    const encounter = ENCOUNTERS[encounterId];
    if (!encounter) return;

    this.clearTimers();
    gameState.setInputLocked(true);

    const snapshot = gameState.getSnapshot();
    // For Mogkan boss preview or Act 0 fights, ensure Yelena leads the party cleanly
    const partyIds =
      encounterId === 'act0_mogkan_boss' || encounterId === 'act0_dungeon_guard'
        ? ['yelena']
        : encounterId === 'act1_sitia_ambush'
          ? ['yelena', 'irys']
          : snapshot.activeParty.length > 0
            ? snapshot.activeParty
            : ['yelena'];

    const party = partyIds
      .map((id) => PARTY_COMBATANT_TEMPLATES[id])
      .filter((t): t is CombatantData => Boolean(t))
      .map(cloneCombatant);

    const enemies = encounter.enemies.map(cloneCombatant);
    const turnOrderIds = this.computeTurnOrder(party, enemies);
    this.roundQueue = [...turnOrderIds];

    const openingText = encounter.isBoss
      ? `${encounter.title} begins! A shimmering magical barrier surrounds ${enemies[0]?.displayName ?? 'the magician'}.`
      : `${encounter.title} — ${enemies.length > 1 ? `${enemies.length} enemies block the path!` : `${enemies[0]?.displayName ?? 'An enemy'} blocks the path!`}`;

    this.state = {
      active: true,
      encounter,
      party,
      enemies,
      turnOrderIds,
      activeCombatantId: null,
      selectedEnemyIndex: 0,
      feralSurgeUnlocked: Boolean(
        !encounter.isBoss && snapshot.storyFlags.feral_surge_unlocked
      ),
      absorbStanceActive: false,
      phase: 'player_turn',
      combatLog: [{ id: (logSequence += 1), text: openingText, tone: 'warning' }],
      lastHitId: null,
      lastAction: null,
      roundNumber: 1,
    };

    this.advanceTurn();
  }

  cycleTarget(): void {
    if (!this.state.active || this.state.phase !== 'player_turn') return;
    const livingIndices = this.state.enemies
      .map((e, i) => (isAlive(e) ? i : -1))
      .filter((i) => i !== -1);
    if (livingIndices.length <= 1) return;

    const currentPos = livingIndices.indexOf(this.state.selectedEnemyIndex);
    const nextIndex = livingIndices[(currentPos + 1) % livingIndices.length];
    soundFx.playCyclePsynergy();
    this.update({ selectedEnemyIndex: nextIndex });
  }

  selectEnemy(index: number): void {
    if (!this.state.active || this.state.phase !== 'player_turn') return;
    const target = this.state.enemies[index];
    if (!target || !isAlive(target)) return;
    soundFx.playDialogueAdvance();
    this.update({ selectedEnemyIndex: index });
  }

  private getActiveCombatant(): CombatantData | null {
    const id = this.state.activeCombatantId;
    if (!id) return null;
    return (
      this.state.party.find((c) => c.combatantId === id) ??
      this.state.enemies.find((c) => c.combatantId === id) ??
      null
    );
  }

  private checkBattleResolution(
    party: CombatantData[],
    enemies: CombatantData[],
    log: CombatLogEntry[]
  ): boolean {
    const allEnemiesDown = enemies.every((e) => !isAlive(e));
    if (allEnemiesDown) {
      this.clearTimers();
      soundFx.playVictory();
      const encounter = this.state.encounter;
      if (encounter?.onVictoryFlag) {
        gameState.setStoryFlag(encounter.onVictoryFlag, true);
      }
      if (encounter) {
        eventBus.emit('combatCompleted', {
          encounterId: encounter.encounterId,
          victory: true,
        });
      }
      this.update({
        party,
        enemies,
        phase: 'victory',
        activeCombatantId: null,
        combatLog: [
          ...log,
          {
            id: (logSequence += 1),
            text: `Victory! ${encounter?.title ?? 'Encounter'} cleared.`,
            tone: 'victory' as const,
          },
        ].slice(-8),
      });
      return true;
    }

    const allPartyDown = party.every((p) => !isAlive(p));
    if (allPartyDown) {
      this.clearTimers();
      soundFx.playDefeat();
      if (this.state.encounter) {
        eventBus.emit('combatCompleted', {
          encounterId: this.state.encounter.encounterId,
          victory: false,
        });
      }
      this.update({
        party,
        enemies,
        phase: 'defeat',
        activeCombatantId: null,
        combatLog: [
          ...log,
          {
            id: (logSequence += 1),
            text: 'Yelena falls! Regroup and retry the encounter.',
            tone: 'warning' as const,
          },
        ].slice(-8),
      });
      return true;
    }

    return false;
  }

  private advanceTurn(): void {
    if (!this.state.active) return;

    // Filter dead combatants out of remaining round queue
    const livingIds = new Set(
      [...this.state.party, ...this.state.enemies]
        .filter(isAlive)
        .map((c) => c.combatantId)
    );

    this.roundQueue = this.roundQueue.filter((id) => livingIds.has(id));

    let nextRound = this.state.roundNumber;
    let turnOrderIds = this.state.turnOrderIds;

    if (this.roundQueue.length === 0) {
      nextRound += 1;
      turnOrderIds = this.computeTurnOrder(this.state.party, this.state.enemies);
      this.roundQueue = [...turnOrderIds];
    }

    const nextId = this.roundQueue.shift() ?? null;
    if (!nextId) return;

    const actor =
      this.state.party.find((c) => c.combatantId === nextId) ??
      this.state.enemies.find((c) => c.combatantId === nextId);

    if (!actor || !isAlive(actor)) {
      this.advanceTurn();
      return;
    }

    const selectedEnemyIndex = this.pickValidEnemyIndex(
      this.state.enemies,
      this.state.selectedEnemyIndex
    );

    if (actor.isPlayerParty) {
      this.update({
        activeCombatantId: actor.combatantId,
        turnOrderIds,
        selectedEnemyIndex,
        phase: 'player_turn',
        roundNumber: nextRound,
      });
    } else {
      this.update({
        activeCombatantId: actor.combatantId,
        turnOrderIds,
        selectedEnemyIndex,
        phase: 'enemy_turn',
        roundNumber: nextRound,
      });
      this.enemyTurnTimer = window.setTimeout(() => {
        this.executeEnemyTurn(actor.combatantId);
      }, 650);
    }
  }

  private tickStatuses(
    combatant: CombatantData
  ): { updated: CombatantData; skippedReason: string | null } {
    let skippedReason: string | null = null;
    const nextStatuses = combatant.activeStatuses
      .map((s) => {
        if (s.statusId === 'coma') {
          skippedReason = `${combatant.displayName} lies comatose from My Love and cannot act!`;
        } else if (s.statusId === 'sleep') {
          skippedReason = `${combatant.displayName} is fast asleep!`;
        }
        return { ...s, remainingTurns: s.remainingTurns - 1 };
      })
      .filter((s) => s.remainingTurns > 0);

    return {
      updated: { ...combatant, activeStatuses: nextStatuses },
      skippedReason,
    };
  }

  performPlayerAttack(): void {
    if (!this.state.active || this.state.phase !== 'player_turn') return;
    const actor = this.getActiveCombatant();
    const target = this.state.enemies[this.state.selectedEnemyIndex];
    if (!actor || !target || !isAlive(target)) return;

    const enemies = this.state.enemies.map(cloneCombatant);
    const enemy = enemies[this.state.selectedEnemyIndex];

    if (enemy.hasMagicBarrier) {
      soundFx.playBarrierDeflect();
      this.flashHit(enemy.combatantId);
      this.triggerVisualAction(
        actor.combatantId,
        enemy.combatantId,
        'barrier_deflect',
        '0 · Deflected'
      );
      const log = this.appendLog(
        `${actor.displayName} strikes ${enemy.displayName}, but the magical barrier deflects the blow for 0 damage!`,
        'magic'
      );
      this.update({ enemies, combatLog: log });
      this.advanceTurn();
      return;
    }

    const damage = Math.max(
      5,
      actor.baseAttack - enemy.baseDefense + Math.floor(Math.random() * 4)
    );
    enemy.currentHp = Math.max(0, enemy.currentHp - damage);
    soundFx.playHit();
    this.flashHit(enemy.combatantId);
    this.triggerVisualAction(
      actor.combatantId,
      enemy.combatantId,
      'attack',
      `-${damage} HP`
    );

    const log = this.appendLog(
      `${actor.displayName} strikes ${enemy.displayName} for ${damage} damage!${enemy.currentHp === 0 ? ` ${enemy.displayName} is defeated!` : ''}`,
      'damage'
    );

    if (this.checkBattleResolution(this.state.party, enemies, log)) return;

    const nextTargetIdx = this.pickValidEnemyIndex(
      enemies,
      this.state.selectedEnemyIndex
    );
    this.update({
      enemies,
      selectedEnemyIndex: nextTargetIdx,
      combatLog: log,
    });
    this.advanceTurn();
  }

  performUsePoison(poisonId: 'crippler' | 'my_love'): void {
    if (!this.state.active || this.state.phase !== 'player_turn') return;
    const actor = this.getActiveCombatant();
    const target = this.state.enemies[this.state.selectedEnemyIndex];
    if (!actor || !target || !isAlive(target)) return;

    const poison = POISONS[poisonId];
    if (!poison) return;

    const enemies = this.state.enemies.map(cloneCombatant);
    const enemy = enemies[this.state.selectedEnemyIndex];

    soundFx.playPoisonApply();
    this.flashHit(enemy.combatantId);

    const duration = poisonId === 'crippler' ? 3 : 2;
    const filteredStatuses = enemy.activeStatuses.filter(
      (s) => s.statusId !== poison.statusEffectId
    );
    enemy.activeStatuses = [
      ...filteredStatuses,
      { statusId: poison.statusEffectId, remainingTurns: duration },
    ];

    let damage = 0;
    let message = '';

    if (enemy.hasMagicBarrier) {
      // Mundane poison mist still slows Mogkan, while barrier blocks lethal blade impact until Feral Surge
      message =
        poisonId === 'crippler'
          ? `${actor.displayName} coats her blade with ${poison.displayName}! The barrier blocks the steel, yet the toxin halves ${enemy.displayName}'s Agility.`
          : `${actor.displayName} flicks ${poison.displayName} through the barrier haze! ${enemy.displayName}'s focus staggers briefly.`;
      this.triggerVisualAction(
        actor.combatantId,
        enemy.combatantId,
        poisonId === 'crippler' ? 'poison_crippler' : 'poison_my_love',
        poisonId === 'crippler' ? 'Paralyzed (-50% AGI)' : 'Coma Mist'
      );
    } else {
      damage = Math.max(4, Math.floor(actor.baseAttack * 0.75) - enemy.baseDefense);
      enemy.currentHp = Math.max(0, enemy.currentHp - damage);
      const effectLabel =
        poisonId === 'crippler'
          ? 'Agility halved (Paralyzed)'
          : 'Coma inflicted (Stunned)';
      message = `${actor.displayName} coats her blade with ${poison.displayName} — ${damage} damage to ${enemy.displayName}! ${effectLabel}.`;
      this.triggerVisualAction(
        actor.combatantId,
        enemy.combatantId,
        poisonId === 'crippler' ? 'poison_crippler' : 'poison_my_love',
        `-${damage} HP · ${poisonId === 'crippler' ? 'Paralyzed' : 'Coma'}`
      );
    }

    const log = this.appendLog(message, 'poison');
    if (this.checkBattleResolution(this.state.party, enemies, log)) return;

    const turnOrderIds = this.computeTurnOrder(this.state.party, enemies);
    const nextTargetIdx = this.pickValidEnemyIndex(
      enemies,
      this.state.selectedEnemyIndex
    );

    this.update({
      enemies,
      turnOrderIds,
      selectedEnemyIndex: nextTargetIdx,
      combatLog: log,
    });
    this.advanceTurn();
  }

  performFeralSurge(): void {
    if (
      !this.state.active ||
      this.state.phase !== 'player_turn' ||
      !this.state.feralSurgeUnlocked
    ) {
      return;
    }

    const enemies = this.state.enemies.map(cloneCombatant);
    soundFx.playFeralSurge();

    let shatteredBarrier = false;
    let primaryTargetId = enemies[0]?.combatantId ?? 'mogkan';
    for (const enemy of enemies) {
      if (!isAlive(enemy)) continue;
      primaryTargetId = enemy.combatantId;
      if (enemy.hasMagicBarrier) {
        enemy.hasMagicBarrier = false;
        shatteredBarrier = true;
      }
      enemy.currentHp = Math.max(0, enemy.currentHp - 95);
      this.flashHit(enemy.combatantId);
    }

    this.triggerVisualAction(
      'yelena',
      primaryTargetId,
      'feral_surge',
      shatteredBarrier ? 'BARRIER SHATTERED · -95 HP' : 'FERAL SURGE · -95 HP',
      shatteredBarrier
    );

    const log = this.appendLog(
      shatteredBarrier
        ? 'Yelena unleashes FERAL SURGE (Soulfinder Scream)! A blinding wave of raw Source shatters Mogkan’s barrier and blasts through his defenses for 95 damage!'
        : 'Yelena unleashes FERAL SURGE (Soulfinder Scream), sweeping the battlefield with raw Source energy for 95 damage!',
      'magic'
    );

    if (this.checkBattleResolution(this.state.party, enemies, log)) return;

    this.update({ enemies, combatLog: log });
    this.advanceTurn();
  }

  performAbsorbRedirect(): void {
    if (!this.state.active || this.state.phase !== 'player_turn') return;
    const cost = 4;
    if (!gameState.spendSourcePoints(cost)) {
      soundFx.playLocked();
      this.update({
        combatLog: this.appendLog(
          'Not enough Source Points (requires 4 SP) to enter Absorb & Redirect stance.',
          'warning'
        ),
      });
      return;
    }

    soundFx.playPsynergyPulse();
    this.triggerVisualAction(
      'yelena',
      'yelena',
      'absorb_redirect',
      'Absorb Ward Ready'
    );
    const log = this.appendLog(
      'Yelena centers her Source into Absorb & Redirect stance — ready to catch and reflect the next magical strike at 2× potency!',
      'magic'
    );
    this.update({ absorbStanceActive: true, combatLog: log });
    this.advanceTurn();
  }

  performHealingHands(): void {
    if (!this.state.active || this.state.phase !== 'player_turn') return;
    const cost = 5;
    if (!gameState.spendSourcePoints(cost)) {
      soundFx.playLocked();
      this.update({
        combatLog: this.appendLog(
          'Not enough Source Points (requires 5 SP) to cast Healing Hands.',
          'warning'
        ),
      });
      return;
    }

    const actor = this.getActiveCombatant();
    const party = this.state.party.map(cloneCombatant);
    // Heal the most injured living ally
    const living = party.filter(isAlive);
    living.sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp);
    const patient = living[0];

    if (patient) {
      const healAmount = 34;
      patient.currentHp = Math.min(patient.maxHp, patient.currentHp + healAmount);
      patient.activeStatuses = [];
      soundFx.playHeal();
      this.triggerVisualAction(
        actor?.combatantId ?? 'yelena',
        patient.combatantId,
        'healing_hands',
        `+${healAmount} HP · Purged`
      );
      const log = this.appendLog(
        `Healing Hands bathes ${patient.displayName} in warm Source light, restoring ${healAmount} HP and purging toxins!`,
        'magic'
      );
      this.update({ party, combatLog: log });
    }
    this.advanceTurn();
  }

  private executeEnemyTurn(enemyId: string): void {
    if (!this.state.active || this.state.phase !== 'enemy_turn') return;

    const enemies = this.state.enemies.map(cloneCombatant);
    const enemyIdx = enemies.findIndex((e) => e.combatantId === enemyId);
    if (enemyIdx === -1 || !isAlive(enemies[enemyIdx])) {
      this.advanceTurn();
      return;
    }

    const { updated: tickedEnemy, skippedReason } = this.tickStatuses(
      enemies[enemyIdx]
    );
    enemies[enemyIdx] = tickedEnemy;

    if (skippedReason) {
      const log = this.appendLog(skippedReason, 'poison');
      const turnOrderIds = this.computeTurnOrder(this.state.party, enemies);
      this.update({ enemies, turnOrderIds, combatLog: log });
      this.advanceTurn();
      return;
    }

    const party = this.state.party.map(cloneCombatant);
    const livingParty = party.filter(isAlive);
    if (livingParty.length === 0) {
      this.checkBattleResolution(party, enemies, this.state.combatLog);
      return;
    }

    // Target Yelena primarily in Mogkan boss fight, otherwise pick random living ally
    const target =
      this.state.encounter?.isBoss
        ? livingParty.find((p) => p.combatantId === 'yelena') ?? livingParty[0]
        : livingParty[Math.floor(Math.random() * livingParty.length)];

    const isMagicalAttack =
      tickedEnemy.hasMagicBarrier ||
      tickedEnemy.combatantId.includes('mage') ||
      tickedEnemy.combatantId === 'mogkan';

    // Check Absorb & Redirect counter-stance against magical attacks
    if (
      isMagicalAttack &&
      this.state.absorbStanceActive &&
      target.combatantId === 'yelena'
    ) {
      const reflected = Math.max(18, tickedEnemy.baseAttack * 2);
      tickedEnemy.currentHp = Math.max(0, tickedEnemy.currentHp - reflected);
      soundFx.playFeralSurge();
      this.flashHit(tickedEnemy.combatantId);
      this.triggerVisualAction(
        'yelena',
        tickedEnemy.combatantId,
        'absorb_reflect',
        `2× Reflected · -${reflected} HP`
      );
      const log = this.appendLog(
        `Yelena absorbs ${tickedEnemy.displayName}’s spell and redirects it at double potency for ${reflected} damage!`,
        'magic'
      );
      if (this.checkBattleResolution(party, enemies, log)) return;
      this.update({
        party,
        enemies,
        absorbStanceActive: false,
        combatLog: log,
      });
      this.advanceTurn();
      return;
    }

    let damage = Math.max(
      6,
      tickedEnemy.baseAttack - target.baseDefense + Math.floor(Math.random() * 4)
    );

    let feralUnlocked = this.state.feralSurgeUnlocked;
    let newlyAwakened = false;

    // Narrative survival guard for Mogkan boss climax: ensure Yelena triggers sub-25% Feral Surge cleanly
    if (
      this.state.encounter?.isBoss &&
      target.combatantId === 'yelena' &&
      !feralUnlocked
    ) {
      const projectedHp = target.currentHp - damage;
      const thresholdHp = Math.floor(target.maxHp * 0.25);
      if (projectedHp <= 0) {
        // Cling to life at ~18% HP to trigger the iconic awakening
        damage = Math.max(1, target.currentHp - Math.max(8, thresholdHp - 4));
      }
    }

    target.currentHp = Math.max(0, target.currentHp - damage);
    soundFx.playHit();
    this.flashHit(target.combatantId);
    this.triggerVisualAction(
      tickedEnemy.combatantId,
      target.combatantId,
      isMagicalAttack ? 'enemy_magic' : 'attack',
      `-${damage} HP`
    );

    let log = this.appendLog(
      isMagicalAttack
        ? `${tickedEnemy.displayName} hurls an arcane bolt at ${target.displayName} for ${damage} damage!`
        : `${tickedEnemy.displayName} attacks ${target.displayName} for ${damage} damage!`,
      'damage'
    );

    // Check sub-25% HP Feral Surge awakening
    const yelena = party.find((p) => p.combatantId === 'yelena');
    if (
      yelena &&
      isAlive(yelena) &&
      yelena.currentHp <= Math.ceil(yelena.maxHp * 0.25) &&
      !feralUnlocked &&
      this.state.encounter?.isBoss
    ) {
      feralUnlocked = true;
      newlyAwakened = true;
      gameState.setStoryFlag('feral_surge_unlocked', true);
      soundFx.playSecretReveal();
      log = [
        ...log,
        {
          id: (logSequence += 1),
          text: 'THE SOURCE AWAKENS! Pushing past the brink, Yelena unlocks FERAL SURGE ("Soulfinder Scream")!',
          tone: 'magic' as const,
        },
      ].slice(-8);
    }

    if (this.checkBattleResolution(party, enemies, log)) return;

    const turnOrderIds = this.computeTurnOrder(party, enemies);
    this.update({
      party,
      enemies,
      turnOrderIds,
      feralSurgeUnlocked: feralUnlocked,
      absorbStanceActive: newlyAwakened ? false : this.state.absorbStanceActive,
      combatLog: log,
    });
    this.advanceTurn();
  }

  retryEncounter(): void {
    if (!this.state.encounter) return;
    soundFx.playCyclePsynergy();
    this.startEncounter(this.state.encounter.encounterId);
  }

  closeBattle(): void {
    const wonMogkanInCourtyard =
      this.state.phase === 'victory' &&
      this.state.encounter?.encounterId === 'act0_mogkan_boss' &&
      gameState.getSnapshot().currentMapId === 'brazell_courtyard_boss';

    this.clearTimers();
    this.update({ ...INITIAL_BATTLE_STATE });
    gameState.setInputLocked(false);

    if (wonMogkanInCourtyard) {
      eventBus.emit('dialogueStarted', {
        dialogueId: 'act0_prologue_finale',
        speakerName: 'Commander Ambrose',
      });
    }
  }
}

export const battleController = new BattleController();

export function useBattleState(): BattleSnapshot {
  return useSyncExternalStore(
    battleController.subscribe,
    battleController.getSnapshot
  );
}
