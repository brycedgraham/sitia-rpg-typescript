import type { CombatantData, EncounterData } from '../types';

export const PARTY_COMBATANT_TEMPLATES: Record<string, CombatantData> = {
  yelena: {
    combatantId: 'yelena',
    displayName: 'Yelena',
    maxHp: 64,
    currentHp: 64,
    baseAttack: 14,
    baseDefense: 5,
    agility: 14,
    isPlayerParty: true,
    hasMagicBarrier: false,
    activeStatuses: [],
  },
  ari: {
    combatantId: 'ari',
    displayName: 'Ari',
    maxHp: 78,
    currentHp: 78,
    baseAttack: 16,
    baseDefense: 8,
    agility: 10,
    isPlayerParty: true,
    hasMagicBarrier: false,
    activeStatuses: [],
  },
  janco: {
    combatantId: 'janco',
    displayName: 'Janco',
    maxHp: 66,
    currentHp: 66,
    baseAttack: 15,
    baseDefense: 6,
    agility: 15,
    isPlayerParty: true,
    hasMagicBarrier: false,
    activeStatuses: [],
  },
  irys: {
    combatantId: 'irys',
    displayName: 'Fourth Magician Irys',
    maxHp: 62,
    currentHp: 62,
    baseAttack: 16,
    baseDefense: 6,
    agility: 13,
    isPlayerParty: true,
    hasMagicBarrier: false,
    activeStatuses: [],
  },
};

export const ENCOUNTERS: Record<string, EncounterData> = {
  act0_dungeon_guard: {
    encounterId: 'act0_dungeon_guard',
    title: "Brazell's Dungeon Skirmish",
    isBoss: false,
    onVictoryFlag: 'dungeon_guard_defeated',
    enemies: [
      {
        combatantId: 'brazell_guard',
        displayName: 'Brazell Dungeon Guard',
        maxHp: 56,
        currentHp: 56,
        baseAttack: 12,
        baseDefense: 4,
        agility: 9,
        isPlayerParty: false,
        hasMagicBarrier: false,
        activeStatuses: [],
      },
    ],
  },
  act0_mogkan_boss: {
    encounterId: 'act0_mogkan_boss',
    title: 'Courtyard Reckoning — Mogkan',
    isBoss: true,
    onVictoryFlag: 'mogkan_defeated',
    enemies: [
      {
        combatantId: 'mogkan',
        displayName: 'Mogkan (Rogue Magician)',
        maxHp: 90,
        currentHp: 90,
        baseAttack: 22,
        baseDefense: 6,
        agility: 11,
        isPlayerParty: false,
        hasMagicBarrier: true,
        activeStatuses: [],
      },
    ],
  },
  act1_sitia_ambush: {
    encounterId: 'act1_sitia_ambush',
    title: 'Greenblade Outskirts — Sitia Ambush',
    isBoss: false,
    onVictoryFlag: 'sitia_ambush_cleared',
    enemies: [
      {
        combatantId: 'blood_thief_scout',
        displayName: 'Blood Thief Scout',
        maxHp: 46,
        currentHp: 46,
        baseAttack: 13,
        baseDefense: 4,
        agility: 15,
        isPlayerParty: false,
        hasMagicBarrier: false,
        activeStatuses: [],
      },
      {
        combatantId: 'rogue_sitian_mage',
        displayName: 'Rogue Sitian Acolyte',
        maxHp: 54,
        currentHp: 54,
        baseAttack: 15,
        baseDefense: 5,
        agility: 11,
        isPlayerParty: false,
        hasMagicBarrier: false,
        activeStatuses: [],
      },
    ],
  },
};

export function cloneCombatant(template: CombatantData): CombatantData {
  return {
    ...template,
    activeStatuses: template.activeStatuses.map((s) => ({ ...s })),
  };
}
