# 02 — Core Gameplay Systems & TypeScript Schemas

## 1. Dual-Identity Class System ("Ixian Assassin" + "Sitian Magician")
Yelena's toolkit combines **mundane Ixian lethality** (poisons, stealth, blade coatings) with **Sitian Source magic** (*Golden Sun*-style field utility and Soulfinder counter-magic).
* Enemy magicians shield themselves against magical attacks (`hasMagicBarrier`), but are vulnerable to mundane Ixian poisons and physical ambushes.
* Environmental obstacles, liars, and hidden magical trails require Sitian Field Psynergy.

---

## 2. System A: Poison Tasting & Sensory Deduction (`src/types/poison.ts`)
During tasting encounters (e.g., the Banquet Sitian Cognac), the player receives **3 Action Points (AP)** to perform sensory checks (`smell`, `inspect`, `dab`, `taste`) that progressively reveal clues from the target `PoisonData`. The player then cross-references the **Taster's Compendium** to identify the toxin.

```typescript
export type PoisonStatusEffect = 'paralysis' | 'blind' | 'sleep' | 'coma' | 'withdrawal' | 'lethal_dot';

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
```

### Canonical Seed Poisons (`src/data/poisons.ts`)
| `poisonId` | `displayName` | Aroma Clue | Visual Clue | Lip / Taste Clue | Effect & Lore |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `my_love` | **My Love** | Sweet cognac mask / faint nutmeg | Slight amber thickening | Warm tingle → sudden tongue numbness | Fast knockout/coma toxin used in the Sitian cognac assassination attempt. |
| `butterfly_dust` | **Butterfly's Dust (False)** | Odorless | Fine iridescent violet powder | Bitter chalky aftertaste | Valek's psychological tether; causes withdrawal shakes if skipped. |
| `crippler` | **Crippler's Root** | Earthy damp moss | Tarnishes silver spoon grey | Sharp acrid burn | Weapon-coating toxin; reduces target Agility by 50% and blocks counterattacks. |
| `sitian_slumber` | **Illiais Nightshade** | Crushed jungle berries | Deep indigo sediment at bottom | Cooling mint sensation | Induces deep sleep; used in stealth takedowns and Act 0 feigned death. |

---

## 3. System B: Sitian Field "Psynergy" (`src/types/psynergy.ts`)
Inspired by *Golden Sun*, Yelena equips Field Psynergy abilities (cycled with `Tab`, cast with `Q`). Casting deducts `sourceCost` from `GameState.currentSourcePoints`, renders an expanding circular pulse VFX (`effectRadiusPixels`) around Yelena, and triggers any interactables within range matching `targetInteractionTag`.

```typescript
export type PsynergyInteractionTag = 'MindReadable' | 'HiddenMagic' | 'HealTarget' | 'WindPush';

export interface FieldPsynergyData {
  abilityId: string;
  displayName: string;
  description: string;
  sourceCost: number;
  effectRadiusPixels: number;
  targetInteractionTag: PsynergyInteractionTag;
  pulseColorHex: string; // e.g., '#60a5fa' for Mind-Speak, '#c084fc' for Source-Sense
}
```

### Seed Field Abilities (`src/data/psynergy.ts`)
1. **`mind_speak` (Mind-Speak):** Cost `4 SP`, Radius `64px`, Tag `MindReadable`. Opens an NPC's surface thoughts in a translucent blue thought-bubble dialogue box; flags if `isLying === true`.
2. **`source_sense` (Source-Sense):** Cost `3 SP`, Radius `64px`, Tag `HiddenMagic`. Pulses a purple/gold wave revealing hidden wall switches, invisible magical traps, and Blood Thief trails.
3. **`healing_hands` (Healing Hands):** Cost `5 SP`, Radius `48px`, Tag `HealTarget`. Restores HP/purges poison in combat, and heals injured overworld NPCs or wilted flora.

---

## 4. System C: Turn-Based Tactical Combat (`src/types/combat.ts`)
Turn order is governed by `agility`. Multi-enemy encounters support cycling the active target (`selectedEnemyIndex`) with auto-retargeting when a foe is defeated or falls comatose.

```typescript
export interface CombatantData {
  combatantId: string;
  displayName: string;
  maxHp: number;
  currentHp: number;
  baseAttack: number;
  baseDefense: number;
  agility: number;
  isPlayerParty: boolean;
  hasMagicBarrier: boolean; // Mogkan's barrier deflects standard attacks for 0 dmg
  activeStatuses: {
    statusId: string;
    remainingTurns: number;
  }[];
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
```

### Signature Combat Mechanics
* **Mogkan's Barrier & Feral Surge (Act 0 Boss):** Normal attacks deal `0` damage while `hasMagicBarrier` is `true`. Once Yelena drops below `25%` HP, `feral_surge_unlocked` triggers, enabling `feral_surge` ("Soulfinder Scream") to shatter the barrier and finish the fight.
* **Poison Coatings:** Yelena can coat her blade with `crippler` (halves enemy Agility) or `my_love` (inflicts coma/stun).
* **Act I Expansion (Soulfinder & Party):** Yelena's `absorb_redirect` stance absorbs an enemy magician's spell and reflects it at double potency; `healing_hands` restores party HP and purges toxins.