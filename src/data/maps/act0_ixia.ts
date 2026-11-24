import type { MapData, TileType } from '../../types';

export const TILE_SIZE = 16;

function buildWalledGrid(
  cols: number,
  rows: number,
  obstacles: Array<{ col: number; row: number; type: TileType }> = []
): TileType[][] {
  const grid: TileType[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c): TileType => {
      // 100% solid outer perimeter wall ring
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

function buildDiningHallTiles(cols: number, rows: number): TileType[][] {
  const obstacles: Array<{ col: number; row: number; type: TileType }> = [
    { col: 4, row: 5, type: 'wall' },
    { col: 4, row: 12, type: 'wall' },
    { col: 23, row: 5, type: 'wall' },
    { col: 23, row: 12, type: 'wall' },
  ];

  // Central oak banquet table (cols 10..17, rows 7..8)
  for (let r = 7; r <= 8; r += 1) {
    for (let c = 10; c <= 17; c += 1) {
      obstacles.push({ col: c, row: r, type: 'clutter' });
    }
  }

  return buildWalledGrid(cols, rows, obstacles);
}

// ============================================================================
// SCENE 0.1 — COMMANDER'S DINING HALL
// ============================================================================
export const COMMANDER_DINING_HALL: MapData = {
  mapId: 'commander_dining_hall',
  displayName: "Commander's Dining Hall",
  act: 'Act0_Ixia',
  palette: {
    floor: '#252a34',
    wall: '#3b4252',
    accent: '#991b1b',
  },
  cols: 28,
  rows: 18,
  tiles: buildDiningHallTiles(28, 18),
  carpets: [
    { colStart: 12, colEnd: 15, rowStart: 2, rowEnd: 16 },
    { colStart: 8, colEnd: 19, rowStart: 5, rowEnd: 10 },
  ],
  spawns: {
    default: { x: 224, y: 228 },
    from_tunnels: { x: 40, y: 56 },
  },
  actors: [
    {
      id: 'ambrose',
      displayName: 'Commander Ambrose',
      kind: 'npc',
      sprite: 'ambrose',
      x: 224,
      y: 94,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act0_banquet_ambrose',
      postFlagDialogue: {
        flag: 'banquet_poison_resolved',
        dialogueId: 'act0_banquet_ambrose_post',
      },
      mindSpeak: {
        dialogueId: 'act0_banquet_ambrose_mind',
        isLying: false,
      },
    },
    {
      id: 'valek',
      displayName: 'Valek',
      kind: 'npc',
      sprite: 'valek',
      x: 104,
      y: 128,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act0_banquet_valek',
      postFlagDialogue: {
        flag: 'banquet_poison_resolved',
        dialogueId: 'act0_banquet_valek_post',
      },
      mindSpeak: {
        dialogueId: 'act0_banquet_valek_mind',
        isLying: true,
      },
    },
    {
      id: 'irys',
      displayName: 'Fourth Magician Irys',
      kind: 'npc',
      sprite: 'irys',
      x: 344,
      y: 128,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act0_banquet_irys',
      mindSpeak: {
        dialogueId: 'act0_banquet_irys_mind',
        isLying: false,
      },
    },
    {
      id: 'sitian_cognac',
      displayName: 'Sitian Cognac',
      kind: 'quest_item',
      sprite: 'sitian_cognac',
      x: 224,
      y: 136,
      colorHex: '#fbbf24',
      solid: false,
      tastingPoisonId: 'my_love',
    },
    {
      id: 'dining_hall_secret_switch',
      displayName: 'Hidden Wall Switch',
      kind: 'revealable_switch',
      sprite: 'hidden_switch',
      x: 72,
      y: 24,
      colorHex: '#c084fc',
      solid: false,
      dialogueId: 'act0_dining_switch_activated',
      revealable: {
        revealableId: 'dining_hall_secret_switch',
        startsHidden: true,
      },
    },
  ],
  transitions: [
    {
      id: 'exit_to_tunnels',
      label: '-> TUNNELS',
      x: 40,
      y: 24,
      targetMapId: 'castle_secret_tunnels',
      targetSpawnId: 'from_dining_hall',
      requiredFlag: 'secret_tunnel_unlocked',
      lockedMessage:
        'A seamless stone panel seals the secret passage. Identify the poisoned cognac and cast Source-Sense near the north-west wall to reveal the hidden switch.',
    },
  ],
};

// ============================================================================
// SCENE 0.2 — CASTLE SECRET TUNNELS (RECRUIT ARI & JANCO)
// ============================================================================
function buildSecretTunnelsTiles(): TileType[][] {
  const obstacles: Array<{ col: number; row: number; type: TileType }> = [];

  // West masonry partition (col 9, rows 1..9) — leaves south corridor (rows 10..14) open
  for (let r = 1; r <= 9; r += 1) {
    obstacles.push({ col: 9, row: r, type: 'wall' });
  }

  // East masonry partition (col 18, rows 6..14) — leaves north corridor (rows 1..5) open
  for (let r = 6; r <= 14; r += 1) {
    obstacles.push({ col: 18, row: r, type: 'wall' });
  }

  // Supply crates along alcoves
  obstacles.push({ col: 2, row: 2, type: 'clutter' });
  obstacles.push({ col: 3, row: 2, type: 'clutter' });
  obstacles.push({ col: 24, row: 13, type: 'clutter' });
  obstacles.push({ col: 25, row: 13, type: 'clutter' });

  return buildWalledGrid(28, 16, obstacles);
}

export const CASTLE_SECRET_TUNNELS: MapData = {
  mapId: 'castle_secret_tunnels',
  displayName: 'Castle Secret Tunnels',
  act: 'Act0_Ixia',
  palette: {
    floor: '#1f242d',
    wall: '#323846',
    accent: '#7f1d1d',
  },
  cols: 28,
  rows: 16,
  tiles: buildSecretTunnelsTiles(),
  spawns: {
    default: { x: 64, y: 200 },
    from_dining_hall: { x: 64, y: 200 },
    from_dungeon: { x: 384, y: 56 },
  },
  actors: [
    {
      id: 'ari_tunnels',
      displayName: 'Ari',
      kind: 'npc',
      sprite: 'ari',
      x: 112,
      y: 88,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act0_tunnels_ari',
      postFlagDialogue: {
        flag: 'ari_recruited',
        dialogueId: 'act0_tunnels_ari_post',
      },
      mindSpeak: {
        dialogueId: 'act0_tunnels_ari_mind',
        isLying: false,
      },
    },
    {
      id: 'janco_tunnels',
      displayName: 'Janco',
      kind: 'npc',
      sprite: 'janco',
      x: 232,
      y: 120,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act0_tunnels_janco',
      postFlagDialogue: {
        flag: 'janco_recruited',
        dialogueId: 'act0_tunnels_janco_post',
      },
      mindSpeak: {
        dialogueId: 'act0_tunnels_janco_mind',
        isLying: false,
      },
    },
  ],
  transitions: [
    {
      id: 'tunnels_to_dining_hall',
      label: '<- DINING HALL',
      x: 24,
      y: 200,
      targetMapId: 'commander_dining_hall',
      targetSpawnId: 'from_tunnels',
    },
    {
      id: 'tunnels_to_dungeon',
      label: '-> BRAZELL DUNGEON',
      x: 424,
      y: 56,
      targetMapId: 'brazell_estate_dungeon',
      targetSpawnId: 'from_tunnels',
      requiredFlag: 'tunnels_vanguard_ready',
      lockedMessage:
        'Recruit both Ari and Janco in the spy tunnels before breaching General Brazell’s estate dungeon.',
    },
  ],
};

// ============================================================================
// SCENE 0.3 — BRAZELL'S ESTATE DUNGEON (WITHDRAWAL, VALEK TRUTH, FEIGNED DEATH)
// ============================================================================
function buildDungeonTiles(): TileType[][] {
  const obstacles: Array<{ col: number; row: number; type: TileType }> = [];

  // Holding cell stone-bar divider at col 12 (rows 1..4 and 11..14) with central archway
  for (let r = 1; r <= 4; r += 1) {
    obstacles.push({ col: 12, row: r, type: 'wall' });
  }
  for (let r = 11; r <= 14; r += 1) {
    obstacles.push({ col: 12, row: r, type: 'wall' });
  }

  // Cell bunk & corridor supply bench
  obstacles.push({ col: 2, row: 2, type: 'clutter' });
  obstacles.push({ col: 3, row: 2, type: 'clutter' });
  obstacles.push({ col: 18, row: 3, type: 'clutter' });
  obstacles.push({ col: 19, row: 3, type: 'clutter' });

  return buildWalledGrid(26, 16, obstacles);
}

export const BRAZELL_ESTATE_DUNGEON: MapData = {
  mapId: 'brazell_estate_dungeon',
  displayName: "Brazell's Estate Dungeon",
  act: 'Act0_Ixia',
  palette: {
    floor: '#1e222b',
    wall: '#323846',
    accent: '#6b21a8',
  },
  cols: 26,
  rows: 16,
  tiles: buildDungeonTiles(),
  spawns: {
    default: { x: 104, y: 128 },
    from_tunnels: { x: 104, y: 128 },
    from_courtyard: { x: 352, y: 128 },
  },
  actors: [
    {
      id: 'valek_dungeon',
      displayName: 'Valek',
      kind: 'npc',
      sprite: 'valek',
      x: 152,
      y: 72,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act0_dungeon_valek',
      postFlagDialogue: {
        flag: 'butterfly_dust_truth_revealed',
        dialogueId: 'act0_dungeon_valek_post',
      },
      mindSpeak: {
        dialogueId: 'act0_dungeon_valek_mind',
        isLying: false,
      },
    },
    {
      id: 'dungeon_nightshade',
      displayName: 'Illiais Nightshade',
      kind: 'quest_item',
      sprite: 'nightshade_vial',
      x: 64,
      y: 176,
      colorHex: '#fbbf24',
      solid: false,
      dialogueId: 'act0_dungeon_nightshade_early',
      postFlagDialogue: {
        flag: 'butterfly_dust_truth_revealed',
        dialogueId: 'act0_dungeon_feigned_death',
      },
      hideWhenFlag: 'dungeon_guard_defeated',
    },
    {
      id: 'brazell_guard_npc',
      displayName: 'Brazell Guard',
      kind: 'npc',
      sprite: 'brazell_guard',
      x: 256,
      y: 104,
      colorHex: '#f87171',
      solid: true,
      dialogueId: 'act0_dungeon_guard_locked',
      postFlagDialogue: {
        flag: 'dungeon_guard_defeated',
        dialogueId: 'act0_dungeon_guard_post',
      },
    },
  ],
  transitions: [
    {
      id: 'dungeon_to_courtyard',
      label: '-> COURTYARD',
      x: 392,
      y: 128,
      targetMapId: 'brazell_courtyard_boss',
      targetSpawnId: 'from_dungeon',
      requiredFlag: 'dungeon_guard_defeated',
      lockedMessage:
        'Speak with Valek at the bars, then use the Illiais Nightshade vial to feign death and defeat Brazell’s Guard.',
    },
  ],
};

// ============================================================================
// SCENE 0.4 — BRAZELL COURTYARD BOSS (MOGKAN & FERAL SURGE)
// ============================================================================
export const BRAZELL_COURTYARD_BOSS: MapData = {
  mapId: 'brazell_courtyard_boss',
  displayName: 'Brazell Estate Courtyard',
  act: 'Act0_Ixia',
  palette: {
    floor: '#202632',
    wall: '#343c4d',
    accent: '#7f1d1d',
  },
  cols: 26,
  rows: 16,
  tiles: buildWalledGrid(26, 16, [
    { col: 5, row: 4, type: 'wall' },
    { col: 5, row: 11, type: 'wall' },
    { col: 20, row: 4, type: 'wall' },
    { col: 20, row: 11, type: 'wall' },
  ]),
  carpets: [{ colStart: 10, colEnd: 15, rowStart: 3, rowEnd: 13 }],
  spawns: {
    default: { x: 208, y: 196 },
    from_dungeon: { x: 208, y: 196 },
  },
  actors: [
    {
      id: 'ambrose_courtyard',
      displayName: 'Commander Ambrose',
      kind: 'npc',
      sprite: 'ambrose',
      x: 168,
      y: 84,
      colorHex: '#34d399',
      solid: true,
      dialogueId: 'act0_courtyard_ambrose_drugged',
      postFlagDialogue: {
        flag: 'mogkan_defeated',
        dialogueId: 'act0_prologue_finale',
      },
    },
    {
      id: 'mogkan_boss_npc',
      displayName: 'Mogkan',
      kind: 'npc',
      sprite: 'mogkan',
      x: 228,
      y: 112,
      colorHex: '#c084fc',
      solid: true,
      dialogueId: 'act0_mogkan_confrontation',
      hideWhenFlag: 'mogkan_defeated',
      mindSpeak: {
        dialogueId: 'act0_mogkan_mind',
        isLying: false,
      },
    },
  ],
  transitions: [
    {
      id: 'courtyard_to_dungeon',
      label: '<- DUNGEON',
      x: 208,
      y: 232,
      targetMapId: 'brazell_estate_dungeon',
      targetSpawnId: 'from_courtyard',
    },
  ],
};

export interface MapIntegrityReport {
  valid: boolean;
  errors: string[];
}

/**
 * Verifies AGENTS_TS.md Map Integrity Laws:
 * 1. 100% solid perimeter wall ring
 * 2. Every spawn sits strictly on walkable floor with >= 12px clearance from transitions
 */
export function validateMapIntegrity(map: MapData): MapIntegrityReport {
  const errors: string[] = [];

  if (map.tiles.length !== map.rows) {
    errors.push(`Map "${map.mapId}" row count mismatch.`);
  }

  for (let r = 0; r < map.rows; r += 1) {
    const row = map.tiles[r];
    if (!row || row.length !== map.cols) {
      errors.push(`Map "${map.mapId}" col count mismatch at row ${r}.`);
      continue;
    }
    for (let c = 0; c < map.cols; c += 1) {
      const isPerimeter =
        r === 0 || r === map.rows - 1 || c === 0 || c === map.cols - 1;
      if (isPerimeter && row[c] !== 'wall') {
        errors.push(
          `Map "${map.mapId}" perimeter breach at (${c}, ${r}): found "${row[c]}".`
        );
      }
    }
  }

  for (const [spawnId, pos] of Object.entries(map.spawns)) {
    const col = Math.floor(pos.x / TILE_SIZE);
    const row = Math.floor(pos.y / TILE_SIZE);
    const tile = map.tiles[row]?.[col];
    if (tile !== 'floor') {
      errors.push(
        `Map "${map.mapId}" spawn "${spawnId}" at (${pos.x}, ${pos.y}) is not on floor (tile="${tile}").`
      );
    }
    for (const transition of map.transitions) {
      const dist = Math.hypot(pos.x - transition.x, pos.y - transition.y);
      if (dist < 12) {
        errors.push(
          `Map "${map.mapId}" spawn "${spawnId}" is within 12px (${dist.toFixed(1)}px) of transition "${transition.id}".`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
