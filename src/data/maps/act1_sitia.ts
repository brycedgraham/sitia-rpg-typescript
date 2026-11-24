import type { MapData, TileType } from '../../types';

function buildWalledGrid(
  cols: number,
  rows: number,
  obstacles: Array<{ col: number; row: number; type: TileType }> = []
): TileType[][] {
  const grid: TileType[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c): TileType => {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        return 'wall';
      }
      return 'floor';
    })
  );

  for (const obs of obstacles) {
    if (
      obs.row > 0 &&
      obs.row < rows - 1 &&
      obs.col > 0 &&
      obs.col < cols - 1
    ) {
      grid[obs.row][obs.col] = obs.type;
    }
  }

  return grid;
}

// ============================================================================
// ACT I — SOUTHERN BORDER CHECKPOINT
// ============================================================================
export const SOUTHERN_BORDER_CHECKPOINT: MapData = {
  mapId: 'southern_border_checkpoint',
  displayName: 'Southern Border Checkpoint',
  act: 'Act1_Sitia',
  palette: {
    floor: '#c2a679',
    wall: '#14532d',
    accent: '#059669',
  },
  cols: 26,
  rows: 16,
  tiles: buildWalledGrid(26, 16, [
    { col: 5, row: 4, type: 'wall' },
    { col: 6, row: 4, type: 'wall' },
    { col: 19, row: 4, type: 'wall' },
    { col: 20, row: 4, type: 'wall' },
    { col: 4, row: 11, type: 'clutter' },
    { col: 5, row: 11, type: 'clutter' },
    { col: 20, row: 11, type: 'clutter' },
    { col: 21, row: 11, type: 'clutter' },
  ]),
  carpets: [{ colStart: 11, colEnd: 14, rowStart: 1, rowEnd: 14 }],
  spawns: {
    default: { x: 208, y: 56 },
    from_outskirts: { x: 208, y: 196 },
  },
  actors: [
    {
      id: 'irys_border',
      displayName: 'Fourth Magician Irys',
      kind: 'npc',
      sprite: 'irys',
      x: 208,
      y: 116,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act1_border_irys',
      mindSpeak: {
        dialogueId: 'act1_border_irys_mind',
        isLying: false,
      },
    },
  ],
  transitions: [
    {
      id: 'border_to_outskirts',
      label: '-> OUTSKIRTS',
      x: 208,
      y: 232,
      targetMapId: 'greenblade_outskirts',
      targetSpawnId: 'from_border',
    },
  ],
};

// ============================================================================
// ACT I — GREENBLADE OUTSKIRTS (JUNGLE TRAIL & WILTED MOONBLOOM)
// ============================================================================
export const GREENBLADE_OUTSKIRTS: MapData = {
  mapId: 'greenblade_outskirts',
  displayName: 'Greenblade Outskirts',
  act: 'Act1_Sitia',
  palette: {
    floor: '#bea072',
    wall: '#14532d',
    accent: '#0d9488',
  },
  cols: 26,
  rows: 16,
  tiles: buildWalledGrid(26, 16, [
    { col: 4, row: 4, type: 'wall' },
    { col: 5, row: 4, type: 'wall' },
    { col: 20, row: 5, type: 'wall' },
    { col: 21, row: 5, type: 'wall' },
    { col: 4, row: 11, type: 'wall' },
    { col: 20, row: 11, type: 'wall' },
    { col: 7, row: 8, type: 'clutter' },
    { col: 18, row: 9, type: 'clutter' },
  ]),
  carpets: [{ colStart: 11, colEnd: 14, rowStart: 1, rowEnd: 14 }],
  spawns: {
    default: { x: 208, y: 56 },
    from_border: { x: 208, y: 56 },
    from_greenblade: { x: 208, y: 200 },
  },
  actors: [
    {
      id: 'outskirts_scout',
      displayName: 'Sitian Road Scout',
      kind: 'npc',
      sprite: 'zaltana_elder',
      x: 152,
      y: 112,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act1_outskirts_scout',
      mindSpeak: {
        dialogueId: 'act1_outskirts_scout_mind',
        isLying: false,
      },
    },
    {
      id: 'outskirts_moonbloom',
      displayName: 'Wilted Moonbloom',
      kind: 'quest_item',
      sprite: 'wilted_flora',
      x: 280,
      y: 128,
      colorHex: '#34d399',
      solid: false,
      dialogueId: 'act1_outskirts_moonbloom',
      healable: {
        healableId: 'outskirts_moonbloom',
        healedName: 'Radiant Moonbloom',
        healedMessage:
          'Golden emerald petals unfurl in a burst of pure Sitian Source! Your reserve resonates with +8 SP.',
      },
    },
  ],
  transitions: [
    {
      id: 'outskirts_to_border',
      label: '<- BORDER',
      x: 208,
      y: 24,
      targetMapId: 'southern_border_checkpoint',
      targetSpawnId: 'from_outskirts',
    },
    {
      id: 'outskirts_to_greenblade',
      label: '-> GREENBLADE',
      x: 208,
      y: 232,
      targetMapId: 'greenblade_town',
      targetSpawnId: 'from_outskirts',
    },
  ],
};

// ============================================================================
// ACT I — GREENBLADE TOWN (ZALTANA CLAN REUNION & BLOOD THIEF AMBUSH)
// ============================================================================
export const GREENBLADE_TOWN: MapData = {
  mapId: 'greenblade_town',
  displayName: 'Greenblade Town',
  act: 'Act1_Sitia',
  palette: {
    floor: '#c8ad82',
    wall: '#166534',
    accent: '#0d9488',
  },
  cols: 28,
  rows: 18,
  tiles: buildWalledGrid(28, 18, [
    { col: 5, row: 5, type: 'clutter' },
    { col: 6, row: 5, type: 'clutter' },
    { col: 7, row: 5, type: 'clutter' },
    { col: 5, row: 11, type: 'clutter' },
    { col: 6, row: 11, type: 'clutter' },
    { col: 20, row: 5, type: 'clutter' },
    { col: 21, row: 5, type: 'clutter' },
    { col: 22, row: 5, type: 'clutter' },
    { col: 13, row: 8, type: 'wall' },
    { col: 14, row: 8, type: 'wall' },
  ]),
  carpets: [{ colStart: 10, colEnd: 17, rowStart: 4, rowEnd: 13 }],
  spawns: {
    default: { x: 224, y: 212 },
    from_outskirts: { x: 224, y: 56 },
    from_fulgor: { x: 224, y: 232 },
  },
  actors: [
    {
      id: 'zaltana_elder',
      displayName: 'Zaltana Elder',
      kind: 'npc',
      sprite: 'zaltana_elder',
      x: 224,
      y: 96,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act1_greenblade_elder',
      postFlagDialogue: {
        flag: 'sitia_ambush_cleared',
        dialogueId: 'act1_greenblade_elder_post',
      },
      mindSpeak: {
        dialogueId: 'act1_greenblade_elder_mind',
        isLying: false,
      },
    },
    {
      id: 'irys_greenblade',
      displayName: 'Fourth Magician Irys',
      kind: 'npc',
      sprite: 'irys',
      x: 152,
      y: 176,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act1_greenblade_irys',
      mindSpeak: {
        dialogueId: 'act1_greenblade_irys_mind',
        isLying: false,
      },
    },
    {
      id: 'greenblade_blood_thief_trace',
      displayName: 'Blood Thief Trace',
      kind: 'revealable_switch',
      sprite: 'blood_thief_trace',
      x: 344,
      y: 176,
      colorHex: '#c084fc',
      solid: false,
      dialogueId: 'act1_blood_thief_trace_examined',
      hideWhenFlag: 'sitia_ambush_cleared',
      revealable: {
        revealableId: 'greenblade_blood_thief_trace',
        startsHidden: true,
      },
    },
  ],
  transitions: [
    {
      id: 'greenblade_to_outskirts',
      label: '<- OUTSKIRTS',
      x: 224,
      y: 24,
      targetMapId: 'greenblade_outskirts',
      targetSpawnId: 'from_greenblade',
    },
    {
      id: 'greenblade_to_fulgor',
      label: '-> FULGOR GATE',
      x: 224,
      y: 264,
      targetMapId: 'fulgor_citadel_gate',
      targetSpawnId: 'from_greenblade',
      requiredFlag: 'sitia_ambush_cleared',
      lockedMessage:
        'Cast Source-Sense [Tab → Q] in the eastern square to uncover the Blood Thief trace and repel the Sitia ambush first.',
    },
  ],
};

// ============================================================================
// ACT I — FULGOR CITADEL GATE (MAGICIAN'S KEEP ENTRANCE)
// ============================================================================
export const FULGOR_CITADEL_GATE: MapData = {
  mapId: 'fulgor_citadel_gate',
  displayName: 'Fulgor Citadel Gate',
  act: 'Act1_Sitia',
  palette: {
    floor: '#cbb186',
    wall: '#14532d',
    accent: '#0284c7',
  },
  cols: 26,
  rows: 16,
  tiles: buildWalledGrid(26, 16, [
    { col: 6, row: 5, type: 'wall' },
    { col: 19, row: 5, type: 'wall' },
    { col: 6, row: 10, type: 'wall' },
    { col: 19, row: 10, type: 'wall' },
  ]),
  carpets: [{ colStart: 10, colEnd: 15, rowStart: 2, rowEnd: 14 }],
  spawns: {
    default: { x: 208, y: 196 },
    from_greenblade: { x: 208, y: 196 },
  },
  actors: [
    {
      id: 'first_magician_bain',
      displayName: 'First Magician Bain',
      kind: 'npc',
      sprite: 'zaltana_elder',
      x: 208,
      y: 84,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act1_fulgor_bain',
      mindSpeak: {
        dialogueId: 'act1_fulgor_bain_mind',
        isLying: false,
      },
    },
    {
      id: 'irys_fulgor',
      displayName: 'Fourth Magician Irys',
      kind: 'npc',
      sprite: 'irys',
      x: 148,
      y: 120,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act1_fulgor_irys',
      mindSpeak: {
        dialogueId: 'act1_fulgor_irys_mind',
        isLying: false,
      },
    },
  ],
  transitions: [
    {
      id: 'fulgor_to_greenblade',
      label: '<- GREENBLADE',
      x: 208,
      y: 232,
      targetMapId: 'greenblade_town',
      targetSpawnId: 'from_fulgor',
    },
  ],
};
