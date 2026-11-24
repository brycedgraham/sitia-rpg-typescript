import type { PoisonData } from '../types';

export const POISONS: Record<string, PoisonData> = {
  my_love: {
    poisonId: 'my_love',
    displayName: 'My Love',
    loreDescription:
      'A fast-acting Sitian knockout and coma toxin disguised inside the gifted Sitian cognac intended for Commander Ambrose.',
    aromaClue: 'Sweet cognac mask with a faint undertone of nutmeg.',
    visualClue: 'Slight amber thickening along the rim of the glass.',
    lipTouchClue: 'Warm, pleasant tingle across the lower lip.',
    tasteClue: 'Warm sweetness followed by sudden, creeping tongue numbness.',
    antidoteItemId: 'antidote_my_love',
    onsetTurns: 1,
    statusEffectId: 'coma',
    canCoatWeapon: true,
  },
  butterfly_dust: {
    poisonId: 'butterfly_dust',
    displayName: "Butterfly's Dust (False)",
    loreDescription:
      "Valek's psychological tether—allegedly lethal without a daily antidote, yet the antidote itself is an addictive stimulant.",
    aromaClue: 'Completely odorless.',
    visualClue: 'Fine iridescent violet powder that clings to glass.',
    lipTouchClue: 'Dry, faintly powdery sensation with no burn.',
    tasteClue: 'Bitter, chalky aftertaste that lingers on the palate.',
    antidoteItemId: 'butterfly_dust_antidote',
    onsetTurns: 3,
    statusEffectId: 'withdrawal',
    canCoatWeapon: false,
  },
  crippler: {
    poisonId: 'crippler',
    displayName: "Crippler's Root",
    loreDescription:
      'An Ixian assassin blade-coating toxin that stiffens muscle fibers, halving target Agility and halting counterattacks.',
    aromaClue: 'Earthy, damp moss crushed after rain.',
    visualClue: 'Tarnishes a polished silver spoon a dull slate grey.',
    lipTouchClue: 'Immediate prickly astringency.',
    tasteClue: 'Sharp, acrid burn across the tongue.',
    antidoteItemId: 'antidote_crippler',
    onsetTurns: 1,
    statusEffectId: 'paralysis',
    canCoatWeapon: true,
  },
  sitian_slumber: {
    poisonId: 'sitian_slumber',
    displayName: 'Illiais Nightshade',
    loreDescription:
      'A Sitian soporific brewed from jungle nightshade; induces deathlike sleep useful for stealth takedowns and feigned death.',
    aromaClue: 'Crushed dark jungle berries.',
    visualClue: 'Deep indigo sediment settling at the bottom of the vessel.',
    lipTouchClue: 'Cool, soothing balm against the skin.',
    tasteClue: 'Distinct cooling mint sensation that slows the pulse.',
    antidoteItemId: 'antidote_sitian_slumber',
    onsetTurns: 1,
    statusEffectId: 'sleep',
    canCoatWeapon: true,
  },
};

export const POISON_LIST: PoisonData[] = Object.values(POISONS);
