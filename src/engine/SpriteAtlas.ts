import type { FacingDirection, SpriteVariant } from '../types';

export type TileSpriteKey =
  | 'floor_a'
  | 'floor_b'
  | 'carpet_mid'
  | 'carpet_edge'
  | 'wall_top'
  | 'wall_face'
  | 'wall_torch'
  | 'wall_pillar'
  | 'table_top_left'
  | 'table_top_mid'
  | 'table_top_right'
  | 'table_bot_left'
  | 'table_bot_mid'
  | 'table_bot_right'
  | 'exit_locked'
  | 'exit_open'
  // Sitia Biome Tiles (Act I emerald jungle & warm sandstone)
  | 'sitia_floor_a'
  | 'sitia_floor_b'
  | 'sitia_plaza_mid'
  | 'sitia_plaza_edge'
  | 'sitia_hedge_wall'
  | 'sitia_stone_well'
  | 'sitia_stall';

export interface SpriteAtlas {
  tiles: Record<TileSpriteKey, HTMLCanvasElement>;
  yelena: Record<FacingDirection, [HTMLCanvasElement, HTMLCanvasElement]>;
  actors: Record<Exclude<SpriteVariant, 'yelena'>, HTMLCanvasElement>;
  healedMoonbloom: HTMLCanvasElement;
}

function renderPixelGrid(
  rows: string[],
  palette: Record<string, string>
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < rows.length; y += 1) {
    const row = rows[y];
    for (let x = 0; x < row.length; x += 1) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
}

function mirrorHorizontal(src: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = src.width;
  canvas.height = src.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(src.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return canvas;
}

const STONE_PALETTE: Record<string, string> = {
  a: '#252a34',
  b: '#2b313d',
  c: '#1f242d',
  m: '#181c24',
  h: '#353c4a',
};

const CARPET_PALETTE: Record<string, string> = {
  r: '#7f1d1d',
  d: '#651616',
  l: '#991b1b',
  g: '#b45309',
  y: '#d97706',
};

const WALL_PALETTE: Record<string, string> = {
  t: '#4b5568',
  u: '#5a657b',
  s: '#3b4252',
  d: '#2f3543',
  m: '#1d222c',
  k: '#13161d',
  i: '#64748b',
  f: '#f59e0b',
  w: '#fef08a',
};

const TABLE_PALETTE: Record<string, string> = {
  o: '#5c3d2e',
  d: '#3e271d',
  l: '#78513c',
  c: '#d6cfc2',
  e: '#a89f91',
  s: '#94a3b8',
  g: '#f59e0b',
  f: '#fef08a',
  k: '#1c1917',
};

const EXIT_PALETTE: Record<string, string> = {
  b: '#1e242e',
  s: '#334155',
  h: '#475569',
  r: '#ef4444',
  p: '#991b1b',
  c: '#38bdf8',
  d: '#0369a1',
};

const SITIA_PALETTE: Record<string, string> = {
  a: '#b6986b', // warm sandstone
  b: '#c6aa7e', // sunlit sand
  c: '#a28559', // shaded sand
  m: '#826945', // stone seam
  h: '#d4bd95', // bright sandstone highlight
  t: '#0f766e', // Sitia teal tile inlay
  q: '#14b8a6', // bright glass-blue accent
  g: '#166534', // deep jungle foliage
  l: '#15803d', // mid emerald leaf
  y: '#22c55e', // bright leaf highlight
  d: '#0d3d20', // shadow canopy
  w: '#7c2d12', // terracotta canopy
  r: '#c2410c', // warm burnt orange cloth
  o: '#d97706', // golden trim
  k: '#1c1917', // crisp dark edge
  u: '#38bdf8', // clear spring water
  v: '#0284c7', // deep well water
  s: '#94a3b8', // cut stone rim
};

const CHAR_PALETTE: Record<string, string> = {
  k: '#0e1117',
  h: '#1f1a1c',
  b: '#352b2e',
  s: '#f1c7a4',
  e: '#d6a480',
  u: '#28303e',
  v: '#3c475a',
  r: '#b91c1c',
  a: '#ef4444',
  m: '#94a3b8',
  t: '#1b1f29',
  g: '#d97706',
  y: '#facc15',
  w: '#cbd5e1',
  n: '#1c212b',
  c: '#1f2633',
  p: '#475569',
  j: '#047857',
  z: '#10b981',
  q: '#065f46',
  o: '#f59e0b',
  l: '#fde68a',
  x: '#e2e8f0',
  i: '#c084fc',
  f: '#e9d5ff',
  d: '#7c3aed', // deep Blood Thief crimson-violet
};

function buildTiles(): Record<TileSpriteKey, HTMLCanvasElement> {
  const floor_a = renderPixelGrid(
    [
      'mmmmmmmmmmmmmmmm',
      'mhhhhhhhmhhhhhhm',
      'mbaaaaaamabaaaam',
      'maabaaaamaaaaaam',
      'maaaaaacmaabaaam',
      'maacaaaamaaaaaam',
      'maaaaaacmaaaacam',
      'mmmmmmmmmmmmmmmm',
      'mhhhmhhhhhhhmhhm',
      'maaamabaaaaamaam',
      'macamaaaaaabmaam',
      'maaamaaacaaamaam',
      'mabamaaaaaacmaam',
      'maaamaabaaaamcam',
      'maacmaaaaaacmaam',
      'mmmmmmmmmmmmmmmm',
    ],
    STONE_PALETTE
  );

  const floor_b = renderPixelGrid(
    [
      'mmmmmmmmmmmmmmmm',
      'mhhhhhmhhhhhhhhm',
      'maaaaamabaaaaaam',
      'maabcamcaaaaaabm',
      'maaaaamaaacaaaam',
      'maacaamaaaaaaaam',
      'maaaaamaaaaaacam',
      'mmmmmmmmmmmmmmmm',
      'mhhhhhhhhhmhhhhm',
      'mabaaaaaaamabaam',
      'maaaacaaaamaaaam',
      'maaaaaaabamacaam',
      'maabaaaaacmaaaam',
      'maaaaacaaamabaam',
      'maaaaaaaaamaacam',
      'mmmmmmmmmmmmmmmm',
    ],
    STONE_PALETTE
  );

  const carpet_mid = renderPixelGrid(
    [
      'rrrrrrrrrrrrrrrr',
      'rdrrlrrrrrrlrrdr',
      'rrrrrrrdrdrrrrrr',
      'rrlrrrrrrrrrrlrr',
      'rrrrrrlrrlrrrrrr',
      'rdrrrrrrrrrrrrdr',
      'rrrrrdrrrrdrrrrr',
      'rrlrrrrrrrrrrlrr',
      'rrrrrrrrrrrrrrrr',
      'rdrrlrrrrrrlrrdr',
      'rrrrrrrdrdrrrrrr',
      'rrlrrrrrrrrrrlrr',
      'rrrrrrlrrlrrrrrr',
      'rdrrrrrrrrrrrrdr',
      'rrrrrdrrrrdrrrrr',
      'rrrrrrrrrrrrrrrr',
    ],
    CARPET_PALETTE
  );

  const carpet_edge = renderPixelGrid(
    [
      'gggggggggggggggg',
      'gygygygygygygygy',
      'rrrrrrrrrrrrrrrr',
      'rdrrlrrrrrrlrrdr',
      'rrrrrrrdrdrrrrrr',
      'rrlrrrrrrrrrrlrr',
      'rrrrrrlrrlrrrrrr',
      'rdrrrrrrrrrrrrdr',
      'rrrrrdrrrrdrrrrr',
      'rrlrrrrrrrrrrlrr',
      'rrrrrrrrrrrrrrrr',
      'rdrrlrrrrrrlrrdr',
      'rrrrrrrdrdrrrrrr',
      'rrlrrrrrrrrrrlrr',
      'gygygygygygygygy',
      'gggggggggggggggg',
    ],
    CARPET_PALETTE
  );

  const wall_top = renderPixelGrid(
    [
      'kkkkkkkkkkkkkkkk',
      'uuuuuuuuuuuuuuuu',
      'tttttttttttttttt',
      'ttmtttttttmttttt',
      'ttmtttttttmttttt',
      'mmmmmmmmmmmmmmmm',
      'sssssmsssssssmss',
      'sssssmsssssssmss',
      'sssssmsssssssmss',
      'mmmmmmmmmmmmmmmm',
      'sssmsssssssmssss',
      'sssmsssssssmssss',
      'ddddmddddddmdddd',
      'ddddmddddddmdddd',
      'mmmmmmmmmmmmmmmm',
      'kkkkkkkkkkkkkkkk',
    ],
    WALL_PALETTE
  );

  const wall_face = renderPixelGrid(
    [
      'uuuuuuuuuuuuuuuu',
      'tttttttttttttttt',
      'mmmmmmmmmmmmmmmm',
      'sssssssmssssssss',
      'sssssssmssssssss',
      'sssssssmssssssss',
      'mmmmmmmmmmmmmmmm',
      'sssmsssssssmssss',
      'sssmsssssssmssss',
      'sssmsssssssmssss',
      'mmmmmmmmmmmmmmmm',
      'ddddmddddddmdddd',
      'ddddmddddddmdddd',
      'mmmmmmmmmmmmmmmm',
      'kkkkkkkkkkkkkkkk',
      'kkkkkkkkkkkkkkkk',
    ],
    WALL_PALETTE
  );

  const wall_torch = renderPixelGrid(
    [
      'uuuuuuuuuuuuuuuu',
      'tttttttttttttttt',
      'mmmmmmmmmmmmmmmm',
      'sssssssfssssssss',
      'ssssssfwfsssssss',
      'ssssssfwfsssssss',
      'mmmmmmifimmmmmmm',
      'sssmssiiissmssss',
      'sssmsssissmsssss',
      'sssmsssissmsssss',
      'mmmmmmmiimmmmmmm',
      'ddddmddddddmdddd',
      'ddddmddddddmdddd',
      'mmmmmmmmmmmmmmmm',
      'kkkkkkkkkkkkkkkk',
      'kkkkkkkkkkkkkkkk',
    ],
    WALL_PALETTE
  );

  const wall_pillar = renderPixelGrid(
    [
      'kkkkkkkkkkkkkkkk',
      'kuuuuuuuuuuuuuuk',
      'kuttttttttttttuk',
      'kutmttttttttmtuk',
      'kummmmmmmmmmmmuk',
      'kssssmssssmssssk',
      'kssssmssssmssssk',
      'kssssmssssmssssk',
      'kmmmmmmmmmmmmmmk',
      'ksssmssssssmsssk',
      'ksssmssssssmsssk',
      'kddddmddddmddddk',
      'kddddmddddmddddk',
      'kmmmmmmmmmmmmmmk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
    ],
    WALL_PALETTE
  );

  const table_top_left = renderPixelGrid(
    [
      '................',
      '..dddddddddddddd',
      '.dlooooooooooooo',
      '.dlooooooolooooo',
      '.doooooooooooooo',
      '.doooosssooooooo',
      '.doooossssoocccc',
      '.doooosssoooceee',
      '.doooooooooocccc',
      '.dloooooooooceee',
      '.doooooooooocccc',
      '.doooooooooooooo',
      '.doooooloooooooo',
      '.doooooooooooooo',
      '.doooooooooooooo',
      '.doooooooooooooo',
    ],
    TABLE_PALETTE
  );

  const table_top_mid = renderPixelGrid(
    [
      '................',
      'dddddddddddddddd',
      'oooooooooolooooo',
      'oooooooooooooooo',
      'ooooooofoooooooo',
      'ooooooogoooooooo',
      'cccccccccccccccc',
      'eeeeeeeeeeeeeeee',
      'cccccccccccccccc',
      'eeeeeeeeeeeeeeee',
      'cccccccccccccccc',
      'oooooooooooooooo',
      'oolooooooooooolo',
      'oooooooooooooooo',
      'oooooooooooooooo',
      'oooooooooooooooo',
    ],
    TABLE_PALETTE
  );

  const table_top_right = mirrorHorizontal(table_top_left);

  const table_bot_left = renderPixelGrid(
    [
      '.doooooooooooooo',
      '.doooooooooooooo',
      '.doooooooooooooo',
      '.doooosssooooooo',
      '.doooossssoooooo',
      '.doooosssooooooo',
      '.dlooooooooooooo',
      '.doooooooooooooo',
      '.doooooooooooooo',
      '.ddddddddddddddd',
      '.dkkdddddddddddk',
      '.dkkdddddddddddk',
      '.dkk............',
      '.dkk............',
      '..kk............',
      '................',
    ],
    TABLE_PALETTE
  );

  const table_bot_mid = renderPixelGrid(
    [
      'oooooooooooooooo',
      'oooooooooooooooo',
      'oolooooooooooolo',
      'oooooooooooooooo',
      'ooooooossssooooo',
      'ooooooossssooooo',
      'oooooooooooooooo',
      'oooooooooooooooo',
      'oooooooooooooooo',
      'dddddddddddddddd',
      'dddddddddddddddd',
      'kkkkkkkkkkkkkkkk',
      '................',
      '................',
      '................',
      '................',
    ],
    TABLE_PALETTE
  );

  const table_bot_right = mirrorHorizontal(table_bot_left);

  const exit_locked = renderPixelGrid(
    [
      'ssssssssssssssss',
      'shhhhhhhhhhhhhhs',
      'shbbbbbbbbbbbbhs',
      'shbppppppppppbhs',
      'shbpbbbbbbbbpbhs',
      'shbpbbbrrbbbpbhs',
      'shbpbbrbbrbbpbhs',
      'shbpbbbrrbbbpbhs',
      'shbpbbbbrbbbpbhs',
      'shbpbbbrrrbbpbhs',
      'shbpbbbbbbbbpbhs',
      'shbppppppppppbhs',
      'shbbbbbbbbbbbbhs',
      'shhhhhhhhhhhhhhs',
      'ssssssssssssssss',
      'bbbbbbbbbbbbbbbb',
    ],
    EXIT_PALETTE
  );

  const exit_open = renderPixelGrid(
    [
      'ssssssssssssssss',
      'shhhhhhhhhhhhhhs',
      'shbbbbbbbbbbbbhs',
      'shbddddddddddbhs',
      'shbdbbbbbbbbdbhs',
      'shbdbbbccbbbdbhs',
      'shbdbbccccbbdbhs',
      'shbdbccbbccbdbhs',
      'shbdbbbccbbbdbhs',
      'shbdbbccccbbdbhs',
      'shbdbbbbbbbbdbhs',
      'shbddddddddddbhs',
      'shbbbbbbbbbbbbhs',
      'shhhhhhhhhhhhhhs',
      'ssssssssssssssss',
      'bbbbbbbbbbbbbbbb',
    ],
    EXIT_PALETTE
  );

  // --- SITIA BIOME TILES ---
  const sitia_floor_a = renderPixelGrid(
    [
      'mmmmmmmmmmmmmmmm',
      'mhhhhhhhmhhhhhhm',
      'mbaaaaaamabaaaam',
      'maabaaaamaaaaaam',
      'maaaaaacmaabaaam',
      'maacaaaamaaaaaam',
      'maaaaaacmaaaacam',
      'mmmmmmmmmmmmmmmm',
      'mhhhmhhhhhhhmhhm',
      'maaamabaaaaamaam',
      'macamaaaaaabmaam',
      'maaamaaacaaamaam',
      'mabamaaaaaacmaam',
      'maaamaabaaaamcam',
      'maacmaaaaaacmaam',
      'mmmmmmmmmmmmmmmm',
    ],
    SITIA_PALETTE
  );

  const sitia_floor_b = renderPixelGrid(
    [
      'mmmmmmmmmmmmmmmm',
      'mhhhhhmhhhhhhhhm',
      'maaaaamabaaaaaam',
      'maabcamcaaaaaabm',
      'maaaaamaaacaaaam',
      'maacaamaaaaaaaam',
      'maaaaamaaaaaacam',
      'mmmmmmmmmmmmmmmm',
      'mhhhhhhhhhmhhhhm',
      'mabaaaaaaamabaam',
      'maaaacaaaamaaaam',
      'maaaaaaabamacaam',
      'maabaaaaacmaaaam',
      'maaaaacaaamabaam',
      'maaaaaaaaamaacam',
      'mmmmmmmmmmmmmmmm',
    ],
    SITIA_PALETTE
  );

  const sitia_plaza_mid = renderPixelGrid(
    [
      'hhhhhhhhhhhhhhhh',
      'hbbbbbbttbbbbbbh',
      'hbbaaatqqtbaaabh',
      'hbbaattbbttbaabh',
      'hbbatbbhhbbtabbh',
      'hbbatbhhhhbtabbh',
      'hbbattbhhbttabbh',
      'hbbaattbbttbaabh',
      'hbbaaatqqtbaaabh',
      'hbbbbbbttbbbbbbh',
      'hbbaaaaaaaaabbbh',
      'hbbabbbbbbbabbbh',
      'hbbaaaaaaaaabbbh',
      'hbbbbbbbbbbbbbbh',
      'hccccccccccccccm',
      'mmmmmmmmmmmmmmmm',
    ],
    SITIA_PALETTE
  );

  const sitia_plaza_edge = renderPixelGrid(
    [
      'tttttttttttttttt',
      'tqqqqqqqqqqqqqqt',
      'thhhhhhhhhhhhhht',
      'hbbbbbbbbbbbbbbh',
      'hbbaaaabbbbaaabh',
      'hbbbbbbbbbbbbbbh',
      'hbbaaaabbbbaaabh',
      'hbbbbbbbbbbbbbbh',
      'hbbaaaabbbbaaabh',
      'hbbbbbbbbbbbbbbh',
      'hbbaaaabbbbaaabh',
      'hbbbbbbbbbbbbbbh',
      'hccccccccccccccm',
      'thhhhhhhhhhhhhht',
      'tqqqqqqqqqqqqqqt',
      'tttttttttttttttt',
    ],
    SITIA_PALETTE
  );

  const sitia_hedge_wall = renderPixelGrid(
    [
      'dddddddddddddddd',
      'ddgglllyylllggdd',
      'dgglyyyllyyylggd',
      'dgllylllllyyllgd',
      'dgllgglllgglllgd',
      'dgglggllgglgglgd',
      'ddggggllggggggdd',
      'dggllyyyllyylggd',
      'dglllylllyylllgd',
      'dglllggggllllggd',
      'dgglggddgglgglgd',
      'ddggggddggggggdd',
      'dddggddddggddddd',
      'dddddddddddddddd',
      'kkkkkkkkkkkkkkkk',
      'kkkkkkkkkkkkkkkk',
    ],
    SITIA_PALETTE
  );

  const sitia_stone_well = renderPixelGrid(
    [
      'kkkkkkkkkkkkkkkk',
      'kssssssssssssssk',
      'kshhhhhhhhhhhhsk',
      'kshvvvvvvvvvvhsk',
      'kshvvuuuuuuvvhsk',
      'kshvuuqquuuuvhsk',
      'kshvuqqqquuuvhsk',
      'kshvuuuuuuuuvhsk',
      'kshvvuuuuuuvvhsk',
      'kshvvvvvvvvvvhsk',
      'kshhhhhhhhhhhhsk',
      'kssssssssssssssk',
      'kmmmmmmmmmmmmmmk',
      'kmmmmmmmmmmmmmmk',
      'kkkkkkkkkkkkkkkk',
      '................',
    ],
    SITIA_PALETTE
  );

  const sitia_stall = renderPixelGrid(
    [
      'kkkkkkkkkkkkkkkk',
      'krrrrrroorrrrrrk',
      'krrrrrroorrrrrrk',
      'kwwwwwwrrwwwwwwk',
      'krrrrrroorrrrrrk',
      'krrrrrroorrrrrrk',
      'kwwwwwwrrwwwwwwk',
      'kooooooooooooook',
      'kmmmmmmmmmmmmmmk',
      'kmhhaamhhmaahmmk',
      'kmaaqqmqqmqqammk',
      'kmmmmmmmmmmmmmmk',
      'kdkkkkkkkkkkkkdk',
      'kdk..........kdk',
      '.kk..........kk.',
      '................',
    ],
    SITIA_PALETTE
  );

  return {
    floor_a,
    floor_b,
    carpet_mid,
    carpet_edge,
    wall_top,
    wall_face,
    wall_torch,
    wall_pillar,
    table_top_left,
    table_top_mid,
    table_top_right,
    table_bot_left,
    table_bot_mid,
    table_bot_right,
    exit_locked,
    exit_open,
    sitia_floor_a,
    sitia_floor_b,
    sitia_plaza_mid,
    sitia_plaza_edge,
    sitia_hedge_wall,
    sitia_stone_well,
    sitia_stall,
  };
}

function buildYelenaSprites(): Record<
  FacingDirection,
  [HTMLCanvasElement, HTMLCanvasElement]
> {
  const down0 = renderPixelGrid(
    [
      '.....kkkkkk.....',
      '....khhbbhhk....',
      '...khhhhhhhhk...',
      '...khsssssshk...',
      '...khsksskshk...',
      '...khsssssshk...',
      '....khessehk....',
      '....kkuuuukk....',
      '...kuvrrrrvuk...',
      '...kuuurruuuk...',
      '...kskuumuksk...',
      '....kkuuuukk....',
      '....kuukkuuk....',
      '....kttkktkk....',
      '....kkkk.kkk....',
      '................',
    ],
    CHAR_PALETTE
  );

  const down1 = renderPixelGrid(
    [
      '.....kkkkkk.....',
      '....khhbbhhk....',
      '...khhhhhhhhk...',
      '...khsssssshk...',
      '...khsksskshk...',
      '...khsssssshk...',
      '....khessehk....',
      '....kkuuuukk....',
      '...kuvrrrrvuk...',
      '...kuuurruuuk...',
      '...kskuumuksk...',
      '....kkuuuukk....',
      '....kuukkuuk....',
      '...kttk..kttk...',
      '...kkkk..kkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  const up0 = renderPixelGrid(
    [
      '.....kkkkkk.....',
      '....khhbbhhk....',
      '...khhhhhhhhk...',
      '...khhbhhbhhk...',
      '...khhhhhhhhk...',
      '...khhhbbhhhk...',
      '....kkhhhhkk....',
      '....kkuuuukk....',
      '...kuvvrrvvuk...',
      '...kuuurruuuk...',
      '...kskuuuuusk...',
      '....kkuuuukk....',
      '....kuukkuuk....',
      '....kttkktkk....',
      '....kkkk.kkk....',
      '................',
    ],
    CHAR_PALETTE
  );

  const up1 = renderPixelGrid(
    [
      '.....kkkkkk.....',
      '....khhbbhhk....',
      '...khhhhhhhhk...',
      '...khhbhhbhhk...',
      '...khhhhhhhhk...',
      '...khhhbbhhhk...',
      '....kkhhhhkk....',
      '....kkuuuukk....',
      '...kuvvrrvvuk...',
      '...kuuurruuuk...',
      '...kskuuuuusk...',
      '....kkuuuukk....',
      '....kuukkuuk....',
      '...kttk..kttk...',
      '...kkkk..kkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  const right0 = renderPixelGrid(
    [
      '.....kkkkkk.....',
      '....khhbbhhk....',
      '...khhhhhhhk....',
      '...khhhssssk....',
      '...khhhssksk....',
      '...khhhssssk....',
      '....khhheek.....',
      '....kkuuuuk.....',
      '....kuvrrvuk....',
      '....kuurruuk....',
      '....kuuumsk.....',
      '....kkuuuuk.....',
      '.....kuukuk.....',
      '.....kttkttk....',
      '.....kkkkkkk....',
      '................',
    ],
    CHAR_PALETTE
  );

  const right1 = renderPixelGrid(
    [
      '.....kkkkkk.....',
      '....khhbbhhk....',
      '...khhhhhhhk....',
      '...khhhssssk....',
      '...khhhssksk....',
      '...khhhssssk....',
      '....khhheek.....',
      '....kkuuuuk.....',
      '....kuvrrvuk....',
      '....kuurruuk....',
      '....kuuumsk.....',
      '....kkuuuuk.....',
      '....kuuk.kuk....',
      '...kttk..kttk...',
      '...kkkk..kkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  return {
    down: [down0, down1],
    up: [up0, up1],
    right: [right0, right1],
    left: [mirrorHorizontal(right0), mirrorHorizontal(right1)],
  };
}

function buildActorSprites(): Record<
  Exclude<SpriteVariant, 'yelena'>,
  HTMLCanvasElement
> {
  const ambrose = renderPixelGrid(
    [
      '....kkkkkkkk....',
      '...kwwhhhhwwk...',
      '...khwhhhhwhk...',
      '...khsssssshk...',
      '...khsksskshk...',
      '...khsssssshk...',
      '....kkessekk....',
      '...kggnnnnggk...',
      '..kynnnrrnnnyk..',
      '..knnnnggnnnnk..',
      '..ksknnnnnnksk..',
      '...kknnnnnnkk...',
      '...knnnkknnnk...',
      '...ktttkktttk...',
      '...kkkkkkkkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  const valek = renderPixelGrid(
    [
      '....kkkkkkkk....',
      '...kcccccccck...',
      '...kcppccppck...',
      '...kcssssssck...',
      '...kcskssksck...',
      '...kcssssssck...',
      '....kcceeckk....',
      '...kcccccccck...',
      '..kccppccppcck..',
      '..kcccpccpccck..',
      '..kskccccccksk..',
      '...kcccccccck...',
      '...kccckkccck...',
      '...ktttkktttk...',
      '...kkkkkkkkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  const irys = renderPixelGrid(
    [
      '....kkkkkkkk....',
      '...kjjzzzzjjk...',
      '...kjzjjjjzjk...',
      '...kjssssssjk...',
      '...kjskssksjk...',
      '...kjssssssjk...',
      '....kjessejk....',
      '...kjgzzzzgjk...',
      '..kjjjgyygjjjk..',
      '..kjzjjggjjzjk..',
      '..kskjqjjqjksk..',
      '...kjjjjjjjjk...',
      '...kjqjjjjqjk...',
      '...kjjjjjjjjk...',
      '...kkkkkkkkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  const zaltana_elder = renderPixelGrid(
    [
      '....kkkkkkkk....',
      '...kwwwwwwwwk...',
      '...kwxwwwwxwk...',
      '...kwsssssswk...',
      '...kwsksskswk...',
      '...kwwsssswwk...',
      '....kwwwwwwk....',
      '...kggggggggk...',
      '..kgyyjjjjyygk..',
      '..kgjjjggjjjgk..',
      '..kskjjjjjjksk..',
      '...kggggggggk...',
      '...kjjjkkjjjk...',
      '...ktttkktttk...',
      '...kkkkkkkkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  const sitian_cognac = renderPixelGrid(
    [
      '................',
      '................',
      '.......kk.......',
      '......kxxk......',
      '......kxxk......',
      '.....kxllxk.....',
      '....kxlooolk....',
      '....kxoooolk....',
      '....kxoooolk....',
      '.....kxxxxk.kk..',
      '....kxxxxxxklok.',
      '...kxxxxxxxxkok.',
      '...ksssssssskkk.',
      '....kkkkkkkkkk..',
      '................',
      '................',
    ],
    CHAR_PALETTE
  );

  const hidden_switch = renderPixelGrid(
    [
      '................',
      '................',
      '.....kkkkkk.....',
      '....kiiiiiiK....'.toLowerCase(),
      '...kiiffffiik...',
      '...kiffffffik...',
      '...kiffiiffik...',
      '...kiffffffik...',
      '...kiiffffiik...',
      '....kiiiiiiK....'.toLowerCase(),
      '.....kkkkkk.....',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
    CHAR_PALETTE
  );

  const blood_thief_trace = renderPixelGrid(
    [
      '................',
      '......dk........',
      '.....diid.......',
      '....diiffd..d...',
      '...diifffidid...',
      '..diiifffiiid...',
      '..ddiffaffiid...',
      '...diiiffiidd...',
      '....ddiiiid.....',
      '.....diidid.....',
      '....dd..dd......',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
    CHAR_PALETTE
  );

  const ari = renderPixelGrid(
    [
      '....kkkkkkkk....',
      '...kbbbbbbbbk...',
      '...kbbhhhhbbk...',
      '...khsssssshk...',
      '...khsksskshk...',
      '...khsssssshk...',
      '....kkessekk....',
      '..kkppuuuuuppk..',
      '..kppuurruuppk..',
      '..kppuuuuuuppk..',
      '..kskppmmppksk..',
      '...kkuuuuuukk...',
      '...kuuuukkuuk...',
      '...ktttkktttk...',
      '...kkkkkkkkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  const janco = renderPixelGrid(
    [
      '.....kkkkkk.....',
      '....kbbbbbbk....',
      '...kbbhhhhbbk...',
      '...khsssssshk...',
      '...khsksskshk...',
      '...khsssssshk...',
      '....kkessekk....',
      '...kppvvvvppk...',
      '..kppvvaavvppk..',
      '..kskvvvvvvksk..',
      '...kmmvvvvmmk...',
      '....kkuuuukk....',
      '....kuukkuuk....',
      '...kttk..kttk...',
      '...kkkk..kkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  const brazell_guard = renderPixelGrid(
    [
      '.....kkrrkk.....',
      '....kmmrrmmk....',
      '...kmmmmmmmmk...',
      '...kmkkkkkkmk...',
      '...kmkskkskmk...',
      '...kmmmmmmmmk...',
      '....kkppppkk....',
      '...kppnnnnppk...',
      '..kppnrrrrnppk..',
      '..kppnnnnnnppk..',
      '..kskppmmppksk..',
      '...kknnnnnnkk...',
      '...knnnkknnnk...',
      '...ktttkktttk...',
      '...kkkkkkkkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  const mogkan = renderPixelGrid(
    [
      '....kkkkkkkk....',
      '...kddddddddk...',
      '...kddiiiiddk...',
      '...kdssssssdk...',
      '...kdskssksdk...',
      '...kdssssssdk...',
      '....kddeeddk....',
      '...kddiiiiddk...',
      '..kddiiffiiddk..',
      '..kddiiddiiddk..',
      '..kskddddddksk..',
      '...kddddddddk...',
      '...kdddkkdddk...',
      '...ktttkktttk...',
      '...kkkkkkkkkk...',
      '................',
    ],
    CHAR_PALETTE
  );

  const nightshade_vial = renderPixelGrid(
    [
      '................',
      '................',
      '......kkkk......',
      '......kggk......',
      '......kxxk......',
      '.....kxddxk.....',
      '....kxdiiidk....',
      '....kxdiiidk....',
      '....kxdddddk....',
      '....kxdddddk....',
      '.....kxxxxk.....',
      '......kkkk......',
      '................',
      '................',
      '................',
      '................',
    ],
    CHAR_PALETTE
  );

  const wilted_flora = renderPixelGrid(
    [
      '................',
      '................',
      '................',
      '......kkkk......',
      '.....kppppk.....',
      '....kppssppk....',
      '....kppkkppk....',
      '.....kkqkk......',
      '.......kqkk.....',
      '......kqqk......',
      '.....kqqk.......',
      '....kqqqqk......',
      '....kkkkkk......',
      '................',
      '................',
      '................',
    ],
    CHAR_PALETTE
  );

  return {
    ambrose,
    valek,
    irys,
    ari,
    janco,
    brazell_guard,
    mogkan,
    zaltana_elder,
    sitian_cognac,
    nightshade_vial,
    hidden_switch,
    blood_thief_trace,
    wilted_flora,
  };
}

function buildHealedMoonbloom(): HTMLCanvasElement {
  return renderPixelGrid(
    [
      '................',
      '......kkkk......',
      '....kkyyyyk.....',
      '...kyyllyyyk....',
      '...kyylllyyk....',
      '....kkyyyyk.....',
      '.....kkzkk......',
      '....kzzzzzk.....',
      '...kzzkzkzzk....',
      '....kkkzkzk.....',
      '......kjjk......',
      '....kkjjjjkk....',
      '....kkkkkkkk....',
      '................',
      '................',
      '................',
    ],
    CHAR_PALETTE
  );
}

let cachedAtlas: SpriteAtlas | null = null;

export function getSpriteAtlas(): SpriteAtlas {
  if (!cachedAtlas) {
    cachedAtlas = {
      tiles: buildTiles(),
      yelena: buildYelenaSprites(),
      actors: buildActorSprites(),
      healedMoonbloom: buildHealedMoonbloom(),
    };
  }
  return cachedAtlas;
}
