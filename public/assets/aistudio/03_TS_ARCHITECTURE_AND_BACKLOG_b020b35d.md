# 03 — TypeScript Architecture & Phased Task Backlog

## 1. Core Global Modules (`src/core/`)
Four decoupled TypeScript modules manage global state and cross-system communication:

1. **`EventBus.ts`:** Typed pub/sub hub for decoupled UI and engine notifications:
   * `poisonDeductionStarted(poisonId: string)`
   * `poisonDeductionCompleted(poisonId: string, success: boolean)`
   * `mindSpeakTriggered(dialogueId: string, isLying: boolean)`
   * `dialogueStarted(dialogueId: string)` / `dialogueEnded(dialogueId: string)`
   * `combatInitiated(encounterId: string)` / `combatCompleted(encounterId: string, victory: boolean)`
   * `storyFlagChanged(flagName: string, value: boolean | string | number)`
   * `activePsynergyChanged(abilityId: string)`
   * `mapTransitionRequested(targetMapId: string, spawnId: string)`
2. **`GameState.ts`:** Reactive store (can be a lightweight store class with subscriber hooks or Zustand) tracking:
   * `currentAct: 'Act0_Ixia' | 'Act1_Sitia'`
   * `currentMapId: string`
   * `storyFlags: Record<string, boolean | string | number>`
   * `activeParty: string[]` (starts as `['yelena']`)
   * `currentSourcePoints: number` (`20`) / `maxSourcePoints: number` (`20`)
   * `reputation: { ixiaCodeCompliance: number; valekTrust: number; citadelStanding: number }`
3. **`FieldMagicController.ts`:**
   * Tracks `activeAbilityId` (default `'mind_speak'`).
   * `cycleActiveAbility()` cycles through unlocked abilities (`mind_speak` → `source_sense` → `healing_hands`).
   * `tryCastActivePsynergy(playerPos)` checks SP, deducts cost, spawns a canvas pulse ring, and triggers all `MindReadable` or `HiddenMagic` entities within `effectRadiusPixels`.
4. **`BattleController.ts` & `TastingController.ts`:**
   * Pure TypeScript state machines driving turn-based combat and the 3-AP sensory deduction minigame, emitting state snapshots to React UI components.

---

## 2. Overworld Map Schema (`src/types/world.ts`)
Maps are defined declaratively so every room guarantees closed perimeter walls and interior spawns:

```typescript
export type TileType = 'floor' | 'wall' | 'clutter' | 'water';

export interface MapActor {
  id: string;
  displayName: string;
  kind: 'npc' | 'quest_item' | 'revealable_switch' | 'ambush_zone';
  x: number; // Pixel coords inside walled interior
  y: number;
  colorHex: string; // e.g., '#34d399' (NPC), '#fbbf24' (Quest Item), '#c084fc' (Switch)
  dialogueId?: string;
  tastingPoisonId?: string;
  mindSpeak?: { dialogueId: string; isLying: boolean };
  revealable?: { revealableId: string; startsHidden: boolean };
}

export interface MapTransition {
  id: string;
  label: string; // e.g., "-> TUNNELS"
  x: number;
  y: number;
  targetMapId: string;
  targetSpawnId: string;
  requiredFlag?: string;
  lockedMessage?: string;
}

export interface MapData {
  mapId: string;
  displayName: string;
  act: 'Act0_Ixia' | 'Act1_Sitia';
  palette: { floor: string; wall: string; accent: string };
  cols: number;
  rows: number;
  tiles: TileType[][]; // Outer ring (row 0, row max, col 0, col max) MUST be 'wall'
  spawns: Record<string, { x: number; y: number }>;
  actors: MapActor[];
  transitions: MapTransition[];
}
```

---

## 3. Phased Implementation Backlog (For Google AI Studio)

### Phase 1: Foundation, Types & Data
* **[TS-01] Core Types, Seed Data & Global Store:**
  * Implement `src/types/*`, `src/data/poisons.ts`, `src/data/psynergy.ts`, `src/core/EventBus.ts`, and `src/core/GameState.ts`.
* **[TS-02] Overworld Canvas Engine & Input:**
  * Build `OverworldCanvas.tsx`, `GameLoop.ts`, `InputManager.ts`, and `Collision.ts` at `384×216` internal resolution (`16×16` tiles, `imageSmoothingEnabled = false`).
  * Implement 8-directional movement, solid wall AABB collision, forward + `24px` proximity interaction (`E`/`Space`/`Enter`), and universal color-coded signifiers + centered nameplates.

### Phase 2: Field Psynergy & Core UI Overlays
* **[TS-03] Field Psynergy (`MindSpeak` & `SourceSense`):**
  * Implement `FieldMagicController.ts` with `Tab` cycling, `Q` casting, expanding canvas pulse ring VFX, `MindReadable` blue thought-bubble dialogue, and `HiddenMagic` switch revealing.
* **[TS-04] Title Screen, Overworld HUD & Dialogue Box:**
  * Build `TitleScreen.tsx` (with **Start Act 0: Prologue**, **Jump to Act I: Sitia**, and **Jump to Greenblade Town**), `OverworldHud.tsx` (area, dynamic objective hint, SP/Psynergy bar, floating `[E]` prompt), and `DialogueBox.tsx`.

### Phase 3: Poison Tasting & Turn-Based Combat
* **[TS-05] Sensory Tasting Minigame (`TastingDeductionUI.tsx`):**
  * Implement `TastingController.ts` and the 3-AP investigation UI (`Smell`, `Inspect`, `Dab`, `Taste`) + Taster's Compendium identification selector.
* **[TS-06] Turn-Based Combat (`BattleArenaUI.tsx`):**
  * Implement `BattleController.ts` with Agility turn order, enemy target cycling (`Next Target`), `Attack`, `Use Poison` (`crippler` / `my_love`), and Mogkan's `hasMagicBarrier` + sub-25% HP `Feral Surge` unlock.

### Phase 4: Act 0 & Act I Vertical Slice Assembly
* **[TS-07] Act 0 Maps (`src/data/maps/act0_ixia.ts`):**
  * Wire `commander_dining_hall` (Ambrose, Valek, Irys, Sitian Cognac → Tasting UI, Source-Sense hidden switch) → `castle_secret_tunnels` (recruit Ari & Janco) → `brazell_estate_dungeon` (Withdrawal vignette, Valek truth, Sitian Slumber feigned death, guard skirmish) → `brazell_courtyard_boss` (Mogkan boss + Prologue Finale).
* **[TS-08] Act I Maps (`src/data/maps/act1_sitia.ts`):**
  * Wire `southern_border_checkpoint` → `greenblade_outskirts` → `greenblade_town` (Zaltana Elder reunion, Source-Sense Blood Thief trace, 2-enemy Sitia ambush).