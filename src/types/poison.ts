export type PoisonStatusEffect =
  | 'paralysis'
  | 'blind'
  | 'sleep'
  | 'coma'
  | 'withdrawal'
  | 'lethal_dot';

export interface PoisonData {
  poisonId: string;
  displayName: string;
  loreDescription: string;

  // Sensory Clues unlocked by Investigation Actions (3-AP Loop)
  aromaClue: string;      // Action: Smell
  visualClue: string;     // Action: Inspect
  lipTouchClue: string;   // Action: Dab
  tasteClue: string;      // Action: Taste

  // Gameplay Effects (Combat & Field)
  antidoteItemId: string;
  onsetTurns: number;
  statusEffectId: PoisonStatusEffect;
  canCoatWeapon: boolean;
}

export type TastingAction = 'smell' | 'inspect' | 'dab' | 'taste';

export interface TastingState {
  active: boolean;
  targetPoisonId: string | null;
  remainingAp: number;
  maxAp: number;
  revealedActions: TastingAction[];
  selectedGuessId: string | null;
  result: 'pending' | 'success' | 'failure';
}
