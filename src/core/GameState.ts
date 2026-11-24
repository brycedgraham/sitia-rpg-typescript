import { useSyncExternalStore } from 'react';
import { FIELD_PSYNERGY_ORDER } from '../data/psynergy';
import { eventBus } from './EventBus';

export type GameAct = 'Act0_Ixia' | 'Act1_Sitia';
export type ScreenMode = 'title' | 'overworld';
export type LaunchPreset = 'act0_prologue' | 'act1_sitia' | 'act1_greenblade';

export interface ReputationState {
  ixiaCodeCompliance: number;
  valekTrust: number;
  citadelStanding: number;
}

export interface NearbyTargetSummary {
  id: string;
  label: string;
  kind: 'npc' | 'quest_item' | 'revealable_switch' | 'ambush_zone' | 'transition';
  accentColor: string;
}

export interface GameStateSnapshot {
  screenMode: ScreenMode;
  currentAct: GameAct;
  currentMapId: string;
  currentSpawnId: string;
  mapLoadNonce: number;
  storyFlags: Record<string, boolean | string | number>;
  activeParty: string[];
  currentSourcePoints: number;
  maxSourcePoints: number;
  reputation: ReputationState;
  unlockedPsynergies: string[];
  activePsynergyId: string;
  revealedIds: string[];
  healedIds: string[];
  inputLocked: boolean;
  nearbyTarget: NearbyTargetSummary | null;
}

type Listener = () => void;

class GameStateStore {
  private state: GameStateSnapshot = {
    screenMode: 'title',
    currentAct: 'Act0_Ixia',
    currentMapId: 'commander_dining_hall',
    currentSpawnId: 'default',
    mapLoadNonce: 1,
    storyFlags: {},
    activeParty: ['yelena'],
    currentSourcePoints: 20,
    maxSourcePoints: 20,
    reputation: {
      ixiaCodeCompliance: 50,
      valekTrust: 50,
      citadelStanding: 0,
    },
    unlockedPsynergies: [...FIELD_PSYNERGY_ORDER],
    activePsynergyId: 'mind_speak',
    revealedIds: [],
    healedIds: [],
    inputLocked: false,
    nearbyTarget: null,
  };

  private listeners = new Set<Listener>();

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): GameStateSnapshot => {
    return this.state;
  };

  private update(patch: Partial<GameStateSnapshot>): void {
    this.state = {
      ...this.state,
      ...patch,
    };
    for (const listener of this.listeners) {
      listener();
    }
  }

  launchPreset(preset: LaunchPreset): void {
    const nextNonce = this.state.mapLoadNonce + 1;

    if (preset === 'act0_prologue') {
      this.update({
        screenMode: 'overworld',
        currentAct: 'Act0_Ixia',
        currentMapId: 'commander_dining_hall',
        currentSpawnId: 'default',
        mapLoadNonce: nextNonce,
        storyFlags: {},
        activeParty: ['yelena'],
        currentSourcePoints: 20,
        maxSourcePoints: 20,
        reputation: {
          ixiaCodeCompliance: 50,
          valekTrust: 50,
          citadelStanding: 0,
        },
        unlockedPsynergies: [...FIELD_PSYNERGY_ORDER],
        activePsynergyId: 'mind_speak',
        revealedIds: [],
        healedIds: [],
        inputLocked: false,
        nearbyTarget: null,
      });
      return;
    }

    if (preset === 'act1_sitia') {
      this.update({
        screenMode: 'overworld',
        currentAct: 'Act1_Sitia',
        currentMapId: 'southern_border_checkpoint',
        currentSpawnId: 'default',
        mapLoadNonce: nextNonce,
        storyFlags: {
          banquet_poison_resolved: true,
          secret_tunnel_unlocked: true,
          ari_recruited: true,
          janco_recruited: true,
          tunnels_vanguard_ready: true,
          butterfly_dust_truth_revealed: true,
          dungeon_guard_defeated: true,
          feral_surge_unlocked: true,
          mogkan_defeated: true,
          prologue_completed: true,
        },
        activeParty: ['yelena', 'irys'],
        currentSourcePoints: 24,
        maxSourcePoints: 24,
        reputation: {
          ixiaCodeCompliance: 35,
          valekTrust: 80,
          citadelStanding: 25,
        },
        unlockedPsynergies: [...FIELD_PSYNERGY_ORDER],
        activePsynergyId: 'mind_speak',
        revealedIds: [],
        healedIds: [],
        inputLocked: false,
        nearbyTarget: null,
      });
      return;
    }

    // act1_greenblade
    this.update({
      screenMode: 'overworld',
      currentAct: 'Act1_Sitia',
      currentMapId: 'greenblade_town',
      currentSpawnId: 'default',
      mapLoadNonce: nextNonce,
      storyFlags: {
        banquet_poison_resolved: true,
        secret_tunnel_unlocked: true,
        ari_recruited: true,
        janco_recruited: true,
        tunnels_vanguard_ready: true,
        butterfly_dust_truth_revealed: true,
        dungeon_guard_defeated: true,
        feral_surge_unlocked: true,
        mogkan_defeated: true,
        prologue_completed: true,
        border_crossed: true,
      },
      activeParty: ['yelena', 'irys'],
      currentSourcePoints: 24,
      maxSourcePoints: 24,
      reputation: {
        ixiaCodeCompliance: 35,
        valekTrust: 80,
        citadelStanding: 40,
      },
      unlockedPsynergies: [...FIELD_PSYNERGY_ORDER],
      activePsynergyId: 'source_sense',
      revealedIds: [],
      healedIds: [],
      inputLocked: false,
      nearbyTarget: null,
    });
  }

  beginAct1FromPrologue(): void {
    this.update({
      screenMode: 'overworld',
      currentAct: 'Act1_Sitia',
      currentMapId: 'southern_border_checkpoint',
      currentSpawnId: 'default',
      mapLoadNonce: this.state.mapLoadNonce + 1,
      storyFlags: {
        ...this.state.storyFlags,
        prologue_completed: true,
      },
      activeParty: ['yelena', 'irys'],
      currentSourcePoints: 24,
      maxSourcePoints: 24,
      reputation: {
        ...this.state.reputation,
        valekTrust: Math.min(100, this.state.reputation.valekTrust + 25),
        citadelStanding: Math.max(25, this.state.reputation.citadelStanding),
      },
      inputLocked: false,
      nearbyTarget: null,
    });
  }

  returnToTitle(): void {
    this.update({
      screenMode: 'title',
      inputLocked: false,
      nearbyTarget: null,
    });
  }

  addPartyMember(memberId: string): void {
    if (this.state.activeParty.includes(memberId)) return;
    this.update({
      activeParty: [...this.state.activeParty, memberId],
    });
  }

  setStoryFlag(flagName: string, value: boolean | string | number): void {
    if (this.state.storyFlags[flagName] === value) return;

    const nextFlags: Record<string, boolean | string | number> = {
      ...this.state.storyFlags,
      [flagName]: value,
    };

    // Automatically unlock dungeon passage once both Ari & Janco join in the tunnels
    if (nextFlags.ari_recruited && nextFlags.janco_recruited) {
      nextFlags.tunnels_vanguard_ready = true;
    }

    this.update({ storyFlags: nextFlags });
    eventBus.emit('storyFlagChanged', { flagName, value });
  }

  getStoryFlag(flagName: string): boolean | string | number | undefined {
    return this.state.storyFlags[flagName];
  }

  setInputLocked(locked: boolean): void {
    if (this.state.inputLocked === locked) return;
    this.update({ inputLocked: locked });
  }

  transitionToMap(mapId: string, spawnId: string, act?: GameAct): void {
    const nextParty =
      mapId === 'brazell_estate_dungeon' || mapId === 'brazell_courtyard_boss'
        ? ['yelena']
        : this.state.activeParty;

    this.update({
      currentMapId: mapId,
      currentSpawnId: spawnId,
      currentAct: act ?? this.state.currentAct,
      activeParty: nextParty,
      mapLoadNonce: this.state.mapLoadNonce + 1,
      nearbyTarget: null,
    });
  }

  setNearbyTarget(target: NearbyTargetSummary | null): void {
    const prev = this.state.nearbyTarget;
    if (
      prev?.id === target?.id &&
      prev?.label === target?.label &&
      prev?.kind === target?.kind
    ) {
      return;
    }
    this.update({ nearbyTarget: target });
  }

  cycleActivePsynergy(): string {
    const unlocked = this.state.unlockedPsynergies;
    if (unlocked.length === 0) return this.state.activePsynergyId;
    const currentIndex = unlocked.indexOf(this.state.activePsynergyId);
    const nextId = unlocked[(currentIndex + 1) % unlocked.length];
    this.update({ activePsynergyId: nextId });
    eventBus.emit('activePsynergyChanged', { abilityId: nextId });
    return nextId;
  }

  spendSourcePoints(cost: number): boolean {
    if (this.state.currentSourcePoints < cost) return false;
    this.update({
      currentSourcePoints: Math.max(0, this.state.currentSourcePoints - cost),
    });
    return true;
  }

  restoreSourcePoints(amount: number): void {
    if (this.state.currentSourcePoints >= this.state.maxSourcePoints) return;
    this.update({
      currentSourcePoints: Math.min(
        this.state.maxSourcePoints,
        this.state.currentSourcePoints + amount
      ),
    });
  }

  revealObject(revealableId: string): boolean {
    if (this.state.revealedIds.includes(revealableId)) return false;
    this.update({
      revealedIds: [...this.state.revealedIds, revealableId],
    });
    return true;
  }

  isRevealed(revealableId: string): boolean {
    return this.state.revealedIds.includes(revealableId);
  }

  markHealed(healableId: string): boolean {
    if (this.state.healedIds.includes(healableId)) return false;
    this.update({
      healedIds: [...this.state.healedIds, healableId],
      reputation: {
        ...this.state.reputation,
        citadelStanding: Math.min(100, this.state.reputation.citadelStanding + 10),
      },
    });
    return true;
  }

  isHealed(healableId: string): boolean {
    return this.state.healedIds.includes(healableId);
  }

  isInWithdrawal(): boolean {
    return (
      this.state.currentMapId === 'brazell_estate_dungeon' &&
      !this.state.storyFlags.butterfly_dust_truth_revealed
    );
  }

  getCurrentObjectiveHint(): string {
    const { currentMapId, storyFlags, revealedIds } = this.state;

    if (currentMapId === 'commander_dining_hall') {
      if (!storyFlags.banquet_poison_resolved) {
        return 'Speak [E] or Mind-Speak [Q] with the court, then inspect the Sitian Cognac [E]';
      }
      if (!revealedIds.includes('dining_hall_secret_switch')) {
        return 'My Love identified! Cast Source-Sense [Tab → Q] near the north-west wall to reveal the hidden switch';
      }
      if (!storyFlags.secret_tunnel_unlocked) {
        return 'Interact [E] with the revealed Hidden Wall Switch along the north-west wall';
      }
      return 'Enter the secret passage [-> TUNNELS] in the north-west corner';
    }

    if (currentMapId === 'castle_secret_tunnels') {
      if (!storyFlags.ari_recruited || !storyFlags.janco_recruited) {
        return 'Navigate the spy tunnels and recruit both Ari and Janco [E]';
      }
      return 'Vanguard assembled — advance east through [-> BRAZELL DUNGEON]';
    }

    if (currentMapId === 'brazell_estate_dungeon') {
      if (!storyFlags.butterfly_dust_truth_revealed) {
        return 'Withdrawal shakes set in — speak with Valek [E] at the northern cell bars';
      }
      if (!storyFlags.dungeon_guard_defeated) {
        return 'Use the Illiais Nightshade [E] in the cell to feign death and lure Brazell’s Guard';
      }
      return 'Escape east through [-> COURTYARD] to rescue Commander Ambrose';
    }

    if (currentMapId === 'brazell_courtyard_boss') {
      if (!storyFlags.mogkan_defeated) {
        return 'Confront Mogkan [E] in the night courtyard to save Commander Ambrose';
      }
      return 'Speak with Commander Ambrose [E] to seal your exile into Sitia';
    }

    if (currentMapId === 'southern_border_checkpoint') {
      return 'Speak with Fourth Magician Irys [E] and head south through [-> OUTSKIRTS]';
    }

    if (currentMapId === 'greenblade_outskirts') {
      return 'Follow the jungle trail south [-> GREENBLADE] (try Healing Hands [Tab → Q] on the Wilted Moonbloom)';
    }

    if (currentMapId === 'greenblade_town') {
      if (!revealedIds.includes('greenblade_blood_thief_trace')) {
        return 'Speak with Zaltana Elder [E], then cast Source-Sense [Q] near the eastern square';
      }
      if (!storyFlags.sitia_ambush_cleared) {
        return 'Examine the glowing Blood Thief Trace [E] in the eastern square';
      }
      return 'Ambush repelled — travel south through [-> FULGOR GATE] to the Magician’s Keep';
    }

    if (currentMapId === 'fulgor_citadel_gate') {
      return 'Speak with First Magician Bain [E] at the gates of the Magician’s Keep';
    }

    return 'Explore the area [WASD / E]';
  }
}

export const gameState = new GameStateStore();

export function useGameState(): GameStateSnapshot {
  return useSyncExternalStore(gameState.subscribe, gameState.getSnapshot);
}
