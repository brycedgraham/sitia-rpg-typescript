import type { FieldPsynergyData } from '../types';

export const FIELD_PSYNERGIES: Record<string, FieldPsynergyData> = {
  mind_speak: {
    abilityId: 'mind_speak',
    displayName: 'Mind-Speak',
    description:
      "Brush an NPC's surface thoughts to uncover unspoken intentions or detect deception.",
    sourceCost: 4,
    effectRadiusPixels: 64,
    targetInteractionTag: 'MindReadable',
    pulseColorHex: '#60a5fa',
  },
  source_sense: {
    abilityId: 'source_sense',
    displayName: 'Source-Sense',
    description:
      'Emit a resonant pulse of Source energy to reveal hidden wall switches, magical traps, and lingering trails.',
    sourceCost: 3,
    effectRadiusPixels: 64,
    targetInteractionTag: 'HiddenMagic',
    pulseColorHex: '#c084fc',
  },
  healing_hands: {
    abilityId: 'healing_hands',
    displayName: 'Healing Hands',
    description:
      'Channel warm Source vitality to mend wounds, purge toxins, or revive weakened allies.',
    sourceCost: 5,
    effectRadiusPixels: 48,
    targetInteractionTag: 'HealTarget',
    pulseColorHex: '#34d399',
  },
};

export const FIELD_PSYNERGY_ORDER: string[] = [
  'mind_speak',
  'source_sense',
  'healing_hands',
];
