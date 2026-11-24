export interface CombatStatusInstance {
  statusId: string;
  remainingTurns: number;
}

export interface CombatantData {
  combatantId: string;
  displayName: string;
  maxHp: number;
  currentHp: number;
  baseAttack: number;
  baseDefense: number;
  agility: number;
  isPlayerParty: boolean;
  hasMagicBarrier: boolean;
  activeStatuses: CombatStatusInstance[];
}

export type BattleActionType =
  | 'attack'
  | 'use_poison'
  | 'feral_surge'
  | 'absorb_redirect'
  | 'healing_hands';

export interface EncounterData {
  encounterId: string;
  title: string;
  enemies: CombatantData[];
  isBoss: boolean;
  onVictoryFlag?: string;
}
