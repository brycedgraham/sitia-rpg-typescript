export type PortraitKey =
  | 'yelena'
  | 'ambrose'
  | 'valek'
  | 'irys'
  | 'ari'
  | 'janco'
  | 'brazell_guard'
  | 'mogkan'
  | 'sitian_scout'
  | 'zaltana_elder'
  | 'bain';

export type BattleSpriteKey =
  | 'yelena'
  | 'ari'
  | 'janco'
  | 'irys'
  | 'brazell_guard'
  | 'mogkan'
  | 'blood_thief_scout'
  | 'rogue_sitian_mage';

export interface PortraitMeta {
  key: PortraitKey;
  title: string;
  allegiance: string;
  bgGradient: [string, string];
  accentHex: string;
  imageUrl: string;
  fallbackDataUrl: string;
}

const GENERATED_PORTRAIT_URLS: Record<PortraitKey, string> = {
  yelena: '/src/assets/images/portrait_yelena_1795492424779.jpg',
  valek: '/src/assets/images/portrait_valek_1795492428061.jpg',
  ambrose: '/src/assets/images/portrait_ambrose_1795492427808.jpg',
  irys: '/src/assets/images/portrait_irys_1795492430032.jpg',
  ari: '/src/assets/images/portrait_ari_1795492430839.jpg',
  janco: '/src/assets/images/portrait_janco_1795492432936.jpg',
  brazell_guard: '/src/assets/images/portrait_brazell_guard_1795492433918.jpg',
  mogkan: '/src/assets/images/portrait_mogkan_1795492434948.jpg',
  sitian_scout: '/src/assets/images/portrait_sitian_scout_1795492437096.jpg',
  zaltana_elder: '/src/assets/images/portrait_zaltana_elder_1795492437554.jpg',
  bain: '/src/assets/images/portrait_bain_1795492438483.jpg',
};

const PIXEL_PALETTE: Record<string, string> = {
  // Outlines & Neutrals
  k: '#0b0e14', // deep ink outline
  n: '#151922', // obsidian shadow
  u: '#232a38', // dark slate cloth/armor
  v: '#364156', // mid slate armor
  p: '#526079', // steel midtone
  m: '#8fa0ba', // bright steel highlight
  w: '#d5deec', // silver / white hair highlight
  x: '#f1f5f9', // pure white glint

  // Skin Tones
  s: '#f3c8a6', // warm light skin
  e: '#d9a37c', // skin mid shadow
  c: '#b57c56', // skin deep shadow

  // Hair & Leather
  h: '#1f181b', // raven dark hair
  b: '#3b2b28', // chestnut brown hair/leather
  l: '#634636', // warm brown highlight

  // Crimson / Ixian Uniforms
  r: '#991b1b', // deep Ixian crimson
  a: '#dc2626', // bright scarlet trim
  f: '#f87171', // light coral highlight

  // Gold / Amber / Brass
  g: '#b45309', // dark antique gold
  o: '#d97706', // rich gold
  y: '#facc15', // bright gold highlight

  // Sitia Emerald / Jade
  q: '#064e3b', // deep forest green
  j: '#047857', // rich emerald robe
  z: '#10b981', // bright jade highlight
  t: '#6ee7b7', // pale mint magic glow

  // Soulfinder / Arcane Violet & Cyan
  d: '#581c87', // deep violet cloak
  i: '#9333ea', // arcane purple
  V: '#d8b4fe', // lavender magic highlight
  C: '#0284c7', // deep source cyan
  S: '#38bdf8', // bright source cyan
};

function renderGrid32ToDataUrl(
  rows: string[],
  palette: Record<string, string>,
  bgTop?: string,
  bgBottom?: string
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;

  if (bgTop && bgBottom) {
    const grad = ctx.createLinearGradient(0, 0, 0, 32);
    grad.addColorStop(0, bgTop);
    grad.addColorStop(1, bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
  }

  for (let y = 0; y < Math.min(32, rows.length); y += 1) {
    const row = rows[y];
    for (let x = 0; x < Math.min(32, row.length); x += 1) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return canvas.toDataURL('image/png');
}

// ============================================================================
// 32x32 GBA-STYLE CHARACTER BUST PORTRAITS
// ============================================================================

const PORTRAIT_GRIDS: Record<
  PortraitKey,
  {
    title: string;
    allegiance: string;
    bgGradient: [string, string];
    accentHex: string;
    rows: string[];
  }
> = {
  yelena: {
    title: 'Soulfinder & Taster',
    allegiance: 'Zaltana / Ixia',
    bgGradient: ['#131c2e', '#1e1633'],
    accentHex: '#38bdf8',
    rows: [
      '................................',
      '..........kkkkkkkkkkkk..........',
      '........kkhhhhbbbbhhhhkk........',
      '.......khhhbbbbbbbbbbhhhk.......',
      '......khhbbbbhhhhhhbbbbhhk......',
      '.....khhbbhhhhhhhhhhhhbbhhk.....',
      '.....khbbhhhsssssssshhhbbhk.....',
      '....khbbhhsssssssssssshhbbhk....',
      '....khbhhsssssssssssssshhbhk....',
      '....khbhsssskkkksskkkkssshbhk...',
      '....khbhssskxjkssskxjkssshbhk...',
      '....khbhsssssssessssssssshbhk...',
      '....khbhhsssssseessssssshhbhk...',
      '.....khbhhsssssrrsssssshhbhk....',
      '.....khbbhhsssssessssshhbbhk....',
      '......khbbhhheeeeeeeehhbbhk.....',
      '......khhbbhhhhsssshhhhbbhk.....',
      '.......khhbbkkuuuuuukkbhhk......',
      '.......kkhbkkuvrrrrvukkbhkk.....',
      '......kuuvvkuvrrrrrrvukvvuuk....',
      '.....kuvvvvuurrroorrrruuvvvuk...',
      '....kuvvuuuurrrroorrrrruuuuvuk..',
      '...kuvuuuuuurrrrrrrrrruuuuuuvuk.',
      '...kuuuuuuuuvrrrrrrrrvuuuuuuuuk.',
      '..kuuuuuukkuuvrrrrrrvuuukkuuuuuk',
      '..kuuuuukmmkuuvrrrrvuuukmmkuuuuk',
      '..kuuuukmxmkkuuvrrvuuukmxmkuuuuk',
      '..kuuuukmmk..kuuvvuuk..kmmkuuuuk',
      '..kkkkkkkk....kkkkkk....kkkkkkkk',
      '................................',
      '................................',
      '................................',
    ],
  },
  valek: {
    title: 'Chief of Intelligence',
    allegiance: 'Castle Ixia',
    bgGradient: ['#0f172a', '#172033'],
    accentHex: '#60a5fa',
    rows: [
      '................................',
      '.........kkkkkkkkkkkkkk.........',
      '.......kkunnnnnnnnnnnnukk.......',
      '......kunnnuuuuuuuuuunnnuk......',
      '.....kunnuuuuuuuuuuuuuunnuk.....',
      '....kunnuuuuuuvvvvuuuuuunnuk....',
      '....kunuuuuuvvvvvvvvuuuuunuk....',
      '...kunuuuuvvvnnnnnnvvvuuuunuk...',
      '...kunuuuvvnnssssssnnvvuuunuk...',
      '...kunuuvnnssssssssssnnvuunuk...',
      '...kunuuvnsssskkkkskkkssnvnuk...',
      '...kunuuvnssskxCksskxCkssnvnuk..',
      '...kunuuvnssssssessssssssnvnuk..',
      '....kunuuvnssssseessssssnvnuk...',
      '....kunuuvnnssssccsssssnnvnuk...',
      '.....kunuuvnneeeeeeeennvunuk....',
      '.....kunuuuvnnkksskkHnvuuunuk...',
      '......kunuuukkuuuuuukkuuunuk....',
      '.....kuuuuuuuvppuuppuuuuuuuuk...',
      '....kuuuuuuuvppuuuuuppuuuuuuuk..',
      '...kuuuuuuuvppuuCCuuuppuuuuuuuk.',
      '..kuuuuuuuuvpuuCSSCuuupuuuuuuuuk',
      '..kuuuuuuuvppuuuCCuuuuppuuuuuuuk',
      '.kuuuuuuuuvpuuuuuuuuuuupuuuuuuuk',
      '.kuuuuuukmmkuuuuuuuuuukmmkuuuuuk',
      '.kuuuuukmxmkuuuuuuuuuukmxmkuuuuk',
      '.kuuuuukmmk.kuuuuuuuuk.kmmkuuuuk',
      '.kkkkkkkkk..kkkkkkkkkk..kkkkkkkk',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
  },
  ambrose: {
    title: 'Commander of Ixia',
    allegiance: 'Ixia High Command',
    bgGradient: ['#1c141d', '#2b1216'],
    accentHex: '#f59e0b',
    rows: [
      '................................',
      '..........kkkkkkkkkkkk..........',
      '........kkwwwwhhhhwwwwkk........',
      '.......kwwwhhhhhhhhhhwwwk.......',
      '......kwwhhhhhwwwwhhhhhwwk......',
      '.....kwwhhhsssssssssshhhwwk.....',
      '.....kwhhsssssssssssssshhwk.....',
      '....kwhhsssssssssssssssshhwk....',
      '....kwhssskkkksssskkkkssshwk....',
      '....kwhssskxpksssskxpkssshwk....',
      '....kwhssssssssessssssssshwk....',
      '....kwhsssssssseesssssssshwk....',
      '.....kwhssssssseeesssssshwk.....',
      '.....kwhhssssskkkkssssshhwk.....',
      '......kwhhssseeeeeeeesshhwk.....',
      '.......kwwhhheeeeeeeehhwwk......',
      '.......kkookkssssssskkookk......',
      '.....kkooyyooknnnnnnkooyyook....',
      '....kooyyyyyyknnnnnnkyyyyyook...',
      '...koyyyoooyyknnrrnnkyyoooyyok..',
      '..kknnnnnnnnngrrrrrrgnnnnnnnnkk.',
      '..knnnnnnnnnngrrorrrgnnnnnnnnnk.',
      '.knnnnnnnnnnngrrrrrrgnnnnnnnnnnk',
      '.knnnnnnooyyngrrrrrrgnyyoonnnnnk',
      '.knnnnnnooooogrrrrrrgooooonnnnnk',
      '.knnnnnnnnnnngrrrrrrgnnnnnnnnnnk',
      '.knnnnnnnnnnnkkkkkkkkknnnnnnnnnk',
      '..kkkkkkkkkkk........kkkkkkkkkk.',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
  },
  irys: {
    title: 'Fourth Magician',
    allegiance: 'Sitian Council',
    bgGradient: ['#09221e', '#10362c'],
    accentHex: '#10b981',
    rows: [
      '................................',
      '..........kkkkkkkkkkkk..........',
      '........kkbllllllllllbkk........',
      '.......kbbllllllllllllbbk.......',
      '......kbblllooyyyyoolllbbk......',
      '.....kbblllhsssssssslllhbbk.....',
      '.....kbllhhsssssssssshhllbk.....',
      '....kbllhsssssssssssssshllbk....',
      '....kblhsssskkkksskkkksshlbk....',
      '....kblhssskxzkssskxzksshlbk....',
      '....kblhsssssssesssssssshlbk....',
      '....kblhssssssseessssssshlbk....',
      '.....kblhssssssrrsssssshlbk.....',
      '.....kbllhsssssesssssshllbk.....',
      '......kbllhhheeeeeeeehhllbk.....',
      '......kbbllhhhhsssshhhllbbk.....',
      '.......kbbllkkjjjjjjkkllbbk.....',
      '......kkjzzzjjqqqqqqjjzzzjk.....',
      '.....kjzzzzzjjqqyyqqjjzzzzzjk...',
      '....kjzzjjjjjjqyyyyqjjjjjjzzjk..',
      '...kjzjjqqqqjjqqyyqqjjqqqqjjzjk.',
      '..kjzjjqqqqqqjjqqqqjjqqqqqqjjzjk',
      '..kjzjqqqztzqqjjoojjqqztzqqqjzjk',
      '.kjzjjqqztxtzqqjoojqqztxtzqqjjzj',
      '.kjzjjqqqztzqqqjjjjqqqztzqqqjjzj',
      '.kjzjjqqqqqqqqqjjjjqqqqqqqqqjjzj',
      '.kjzjjqqqqqqqqqkkkkqqqqqqqqqjjzj',
      '..kkkkkkkkkkkkk....kkkkkkkkkkkk.',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
  },
  ari: {
    title: 'Elite Vanguard Guard',
    allegiance: 'Castle Ixia',
    bgGradient: ['#161e2e', '#1e293b'],
    accentHex: '#94a3b8',
    rows: [
      '................................',
      '..........kkkkkkkkkkkk..........',
      '........kkbbbbbbbbbbbbkk........',
      '.......kbbbbllllllllbbbbk.......',
      '......kbbbllhhhhhhhhllbbbk......',
      '.....kbbhhsssssssssssshhbbk.....',
      '.....kbhsssssssssssssssshhk.....',
      '....kbhsssssssssssssssssshbk....',
      '....kbhssskkkksssskkkkssshbk....',
      '....kbhssskxuksssskxukssshbk....',
      '....kbhssssssssessssssssshbk....',
      '....kbhsssssssseesssssssshbk....',
      '.....kbhssssssseeesssssshbk.....',
      '.....kbhhssssskkkkssssshhbk.....',
      '......kbhhssseeeeeeeesshbk......',
      '.......kkkhheeeeeeeehhkkk.......',
      '.....kkppmmppksssssskppmmppkk...',
      '....kppmmmmmmkuuuuuukmmmmmmppk..',
      '...kpmmmxxxxmkuuuuuukmxxxxmmmpk.',
      '..kppmmmppppmkurrrrukpmppppmmppk',
      '..kppppppppppkurrrrukppppppppppk',
      '.kpppuuuuuuuukurrrrukuuuuuuuuppk',
      '.kppuuuuuuuuukurrrrukuuuuuuuuupk',
      '.kppuuuuuppmmpmmmmmmpMMppuuuuupk',
      '.kppuuuuuppmxxxxxxxxxxmppuuuuupk',
      '.kppuuuuuppppppppppppppppuuuuupk',
      '..kkkkkkkkkkkkk....kkkkkkkkkkkk.',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
  },
  janco: {
    title: 'Scout & Duelist',
    allegiance: 'Castle Ixia',
    bgGradient: ['#1a1829', '#271c26'],
    accentHex: '#fbbf24',
    rows: [
      '................................',
      '..........kkkkkkkkkkkk..........',
      '........kklllbbbbbblllkk........',
      '.......kllllbbbbbbbbllllk.......',
      '......klllbbbbhhhhbbbblllk......',
      '.....kllbbhhsssssssshhbbllk.....',
      '.....klbbhsssssssssssshhblk.....',
      '....klbhsssssssssssssssshlbk....',
      '....klbhsskkkksssskkkksshlbk....',
      '....klbhsskxoksssskxoksshlbk....',
      '....klbhsssssssesssssssshlbk....',
      '....klbhssssssseessssssshlbk....',
      '.....klbhssssskxxkssssshlbk.....',
      '.....klbhhssssskkssssshhblk.....',
      '......klbhhssseeeeeesshblk......',
      '.......kklhhheeeeeeeehhlkk......',
      '......kkppvvkksssssskkvvppkk....',
      '.....kppvvvvvkuuuuuukvvvvvppk...',
      '....kpvvvppvvkuarraukvvppvvvpk..',
      '...kuuvvvvvvvkuarraukvvvvvvvuuk.',
      '..kuuvvuuuuuukuarraukuuuuuuvvuuk',
      '..kuuvuuuuuuukuarraukuuuuuuuvuuk',
      '.kuuvuuuuuookyuarrauykoouuuuuvuk',
      '.kuuvuuuuuoyyyuarrauyyyouuuuuvuk',
      '.kuuvuuuuuookyuuuuuuykoouuuuuvuk',
      '.kuuvuuuuuuuuukkkkkkuuuuuuuuuvuk',
      '..kkkkkkkkkkkk......kkkkkkkkkkk.',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
  },
  brazell_guard: {
    title: 'Estate Enforcer',
    allegiance: 'House Brazell',
    bgGradient: ['#231215', '#171821'],
    accentHex: '#ef4444',
    rows: [
      '................................',
      '.............kkkkkk.............',
      '...........kkrrrrrrkk...........',
      '..........krrraaaarrrk..........',
      '.........kdkkmmmmmmkkdk.........',
      '........kkmmmmmmmmmmmmkk........',
      '.......kmmmxxxxxxxxxxmmmk.......',
      '......kmmxxpppppppppxxmmmk......',
      '.....kmmxpppppppppppppxmmk......',
      '.....kmxppkkkkkkkkkkkkppxmk.....',
      '.....kmxpkknnrrkknnrrkkpxmk.....',
      '.....kmxpkknfaakknfaakkpxmk.....',
      '.....kmxppkkkkkkkkkkkkppxmk.....',
      '.....kmmxppppmmxxmmppppxmmk.....',
      '......kmmxpppmmxxmmpppxmmk......',
      '......kmmmppppmmmmppppmmmk......',
      '......kkppppkkkkkkkkppppkk......',
      '....kkpppppppknnnnnnkpppppppkk..',
      '...kpppmmmmppknrrrrnkppmmmmpppk.',
      '..kpppmmxxmmpknrarrnkpmmxxmmpppk',
      '..kppppppppppknrarrnkppppppppppk',
      '.kppnnnnnnnnnknrarrnknnnnnnnnnpk',
      '.kppnnnnnnnnnknrrrrnknnnnnnnnnpk',
      '.kppnnnnnppmmpmmmmmmpMMppnnnnnpk',
      '.kppnnnnnppmxxxxxxxxxxmppnnnnnpk',
      '.kppnnnnnppppppppppppppppnnnnnpk',
      '..kkkkkkkkkkkkk....kkkkkkkkkkkk.',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
  },
  mogkan: {
    title: 'Rogue Sitian Magician',
    allegiance: 'Brazell Conspiracy',
    bgGradient: ['#1d102b', '#2e1042'],
    accentHex: '#c084fc',
    rows: [
      '................................',
      '.........kkkkkkkkkkkkkk.........',
      '.......kkddddddddddddddkk.......',
      '......kdddiiiiiiiiiiiidddk......',
      '.....kddiiiiVVVVVVVViiiiddk.....',
      '....kddiiiVVddddddddVViiiddk....',
      '....kdiiVVddnnnnnnnnnddVViidk...',
      '...kdiiVddnnsssssssssnnddViidk..',
      '...kdiiVdnsssssssssssssndViidk..',
      '...kdiivdnssskkkkskkkkssndviidk.',
      '...kdiivdnsskxVikskxVikssndviidk',
      '...kdiivdnssssssessssssssndviidk',
      '....kdiivdnssssseessssssndviidk.',
      '....kdiivdnnssssddsssssnndviidk.',
      '.....kdiivdnneeeeeeeeenndviidk..',
      '.....kddiivdnnkksskkhnndviiddk..',
      '......kddiikkddddddddkkiiddk....',
      '.....kddiiidddiiiiiiidddiiiddk..',
      '....kddiiViiiddVVVVddiiiViiiddk.',
      '...kddiiVVViiidVxxVdiiiVVViiiddk',
      '..kddiiiVVViiidVxxVdiiiVVViiiidd',
      '..kddiiidddiiiddVVddiiidddiiiidd',
      '.kddddddddddiiiddddiiidddddddddk'.replace('', 'd'),
      '.kdddddddddddiiVxxViiidddddddddk',
      '.kdddddddddddiVxxxxViddddddddddk',
      '.kdddddddddddiiVxxViiidddddddddk',
      '..kkkkkkkkkkkkkddddkkkkkkkkkkkk.',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
  },
  sitian_scout: {
    title: 'Jungle Outrider',
    allegiance: 'Greenblade Patrol',
    bgGradient: ['#132419', '#1e2f23'],
    accentHex: '#34d399',
    rows: [
      '................................',
      '..........kkkkkkkkkkkk..........',
      '........kkqqqqjjjjqqqqkk........',
      '.......kqqqjjjjzzzzjjjqqqk......',
      '......kqqjjjzzzzzzzzjjjqqk......',
      '.....kqqjjhhsssssssshhjjqqk.....',
      '.....kqjhhsssssssssssshhjqk.....',
      '....kqjhsssssssssssssssshlqk....',
      '....kqjhsskkkksssskkkksshlqk....',
      '....kqjhsskxjksssskxjksshlqk....',
      '....kqjhsssssssesssssssshlqk....',
      '....kqjhssssssseessssssshlqk....',
      '.....kqjhsssssseeesssssshlqk....',
      '.....kqjhhssssskkkssssshhjqk....',
      '......kqjhhssseeeeeesshhjqk.....',
      '.......kkjhhheeeeeeeehhjkk......',
      '......kkbbookksssssskkoobbkk....',
      '.....kbboooookjjjjjjkooooobbk...',
      '....kbbooyyookjzzzzjkooyyoobbk..',
      '...kqqjjjjjjjkjzzzzjkjjjjjjjqqk.',
      '..kqqjjjjjjjjkjzzzzjkjjjjjjjjqqk',
      '..kqqjjjjjjjjkjooyojkjjjjjjjjqqk',
      '.kqqjjjjjbbllblooyolbllbbjjjjjqq',
      '.kqqjjjjjbbllllllllllllbbjjjjjqq',
      '.kqqjjjjjbbbbbbbbbbbbbbbbjjjjjqq',
      '.kqqjjjjjjjjjjkkkkkkjjjjjjjjjjqq',
      '..kkkkkkkkkkkk......kkkkkkkkkkk.',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
  },
  zaltana_elder: {
    title: 'Clan Matriarch',
    allegiance: 'Zaltana Clan (Greenblade)',
    bgGradient: ['#1d2218', '#2a2417'],
    accentHex: '#facc15',
    rows: [
      '................................',
      '..........kkkkkkkkkkkk..........',
      '........kkwwwwxxxxxxxxkk........',
      '.......kwwwxxxxxxxxxxxxwwwk.....',
      '......kwwxxxxwwwwwwxxxxwwk......',
      '.....kwwxxwsssssssssswxxwwk.....',
      '.....kwxwwsssssssssssswwxwk.....',
      '....kwxwsssssssssssssssswxwk....',
      '....kwxwsskkkksssskkkksswxwk....',
      '....kwxwsskxoksssskxoksswxwk....',
      '....kwxwsssssssesssssssswxwk....',
      '....kwxwssssssseessssssswxwk....',
      '.....kwxwsssssseeesssssswxwk....',
      '.....kwxwwssssskkkssssswwxwk....',
      '......kwxwwssseeeeeesswwxwk.....',
      '.......kkwwhheeeeeeeehhwwkk.....',
      '......kkooyykksssssskkyyookk....',
      '.....kooyyyyykjjjjjjkyyyyyook...',
      '....kooyyoooykjzzzzjkyoooyyook..',
      '...kggjjjjjjjkjzzzzjkjjjjjjjggk.',
      '..kggjjjjzzjjkjzzzzjkjjzzjjjjggk',
      '..kggjjjzzzzjkjooyojkjzzzzjjjggk',
      '.kggjjjjjzzjjkoyxxyokjjzzjjjjjgg',
      '.kggjjjjjjjjjkooyyyokjjjjjjjjjgg',
      '.kggjjjjjjjjjjkkoookjjjjjjjjjjgg',
      '.kggjjjjjjjjjjkkkkkkjjjjjjjjjjgg',
      '..kkkkkkkkkkkk......kkkkkkkkkkk.',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
  },
  bain: {
    title: 'First Magician of Sitia',
    allegiance: 'Fulgor Citadel Council',
    bgGradient: ['#0c1e2e', '#17283b'],
    accentHex: '#38bdf8',
    rows: [
      '................................',
      '..........kkkkkkkkkkkk..........',
      '........kkwwwwxxxxxxxxkk........',
      '.......kwwwxxxxoooooxxxwwwk.....',
      '......kwwxxxooyyyyyyooxxxwwk....',
      '.....kwwxxwsssssssssssswxxwwk...',
      '.....kwxwwsssssssssssssswwxwk...',
      '....kwxwsssssssssssssssssswxwk..',
      '....kwxwssskkkksssskkkkssswxwk..',
      '....kwxwssskxSksssskxSkssswxwk..',
      '....kwxwssssssssessssssssswxwk..',
      '....kwxwsssssssseesssssssswxwk..',
      '.....kwxwssssssseeesssssswxwk...',
      '.....kwxwwsssswwwwwwsssswwxwk...',
      '......kwxwwsswwwwwwwwsswwxwk....',
      '.......kkwwwwwwwwwwwwwwwwkk.....',
      '......kkooyykkwwwwwwkkyyookk....',
      '.....kooyyyyykCCCCCCkyyyyyook...',
      '....kooyyoooykCSSSSCkyoooyyook..',
      '...kCCjjjjjjjkCSSSSCkjjjjjjjCCk.',
      '..kCCjjjjSSjjkCSSSSCkjjSSjjjjCCk',
      '..kCCjjjSSSSjkCooyoCkjjSSSSjjCCk',
      '.kCCjjjjjSSjjkoyxxyokjjSSjjjjjCC',
      '.kCCjjjjjjjjjkooyyyokjjjjjjjjjCC',
      '.kCCjjjjjjjjjjkkoookjjjjjjjjjjCC',
      '.kCCjjjjjjjjjjkkkkkkjjjjjjjjjjCC',
      '..kkkkkkkkkkkk......kkkkkkkkkkk.',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ],
  },
};

// ============================================================================
// 32x32 DETAILED SIDE-VIEW BATTLE STAGE SPRITES
// Party sprites face RIGHT; Enemy sprites face LEFT
// ============================================================================

const BATTLE_SPRITE_GRIDS: Record<BattleSpriteKey, string[]> = {
  // Yelena: Crouched assassin-mage stance with twin curved daggers & crimson scarf trailing left
  yelena: [
    '................................',
    '............kkkkkkkk............',
    '..........kkhhhhbbbbkk..........',
    '.........khhhhhhhhbbbbk.........',
    '.........khhhhhssssssbhk........',
    '........khhhhhsssskxkshk........',
    '........khhhhhsssssssshk........',
    '.........khhhhhsssssehk.........',
    '.....rrrrkkhhhhheeeehkk.........',
    '...rrraaarrkkuuuuuuuukk.........',
    '..rraaaaaarkuvvrrrrvvuk....kk...',
    '..rrrrrraarkuvrrrrrrvuk...kmmk..',
    '.......rrrrkuuvrrrrvuuk..kmxxmk.',
    '...........kuskuuuuuksk.kmxxmk..',
    '..........ksskkuuuuuuksskmxmk...',
    '..........ksskuuuuuuuksskmk.....',
    '...........kkuuuuuuuuukkkk......',
    '...........kuuvvuuuuvvuk........',
    '..........kuuvvuuuuuuvvuk.......',
    '..........kuuuukkkkkuuuuk.......',
    '.........kuuuuk....kuuuuk.......',
    '.........kuuuk......kuuuk.......',
    '........ktttk........ktttk......',
    '........ktttk........ktttk......',
    '.......kttttk........kttttk.....',
    '.......kkkkkk........kkkkkk.....',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  // Ari: Heavy Ixian vanguard knight with steel pauldrons, broadsword raised, and heater shield
  ari: [
    '.........................kk.....',
    '........................kmmk....',
    '...........kkkkkkkk....kmxxmk...',
    '.........kkbbbbbbbbkk..kmxxmk...',
    '........kbbbbllllbbbbk.kmxxmk...',
    '........kbbhhssssssbbk.kmxxmk...',
    '.......kbbhhsssskxkshk.kmxxmk...',
    '.......kbbhhsssssssshk.kmxxmk...',
    '........kbbhhsssssehk..kmxxmk...',
    '......kkkppmmppkkkkk...kmxxmk...',
    '....kkppmmmmmmmmpppmk..kmxxmk...',
    '...kppmmmxxxxxxmmmpppk.kmxxmk...',
    '...kpppmpppppppppmppppkkmxxmk...',
    '...kpppuuuurrrruuuupppkkooyook..',
    '...kppuuuuurrrruuuuuppkskmmmks..',
    '...kppuuuuurrrruuuuuppkskkmkks..',
    '...kpppuuuurrrruuuupppk..kkk....',
    '....kppppmmmmmmmmppppk..........',
    '.....kkkkuuuuuuuukkkk...........',
    '........kuuvvvvvuuk.............',
    '.......kuuvvuuuuvvuk............',
    '.......kuuuk...kuuuk............',
    '......kpppk.....kpppk...........',
    '......ktttk.....ktttk...........',
    '.....kttttk.....kttttk..........',
    '.....kkkkkk.....kkkkkk..........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  // Janco: Agile dual-rapier fencer poised in an en-garde lunge
  janco: [
    '................................',
    '...........kkkkkkkk.............',
    '.........kklllbbbbllkk..........',
    '........kllllbbbbbblllk.........',
    '........kllbbssssssbllk.........',
    '.......kllbbsssskxkshlk.........',
    '.......kllbbsssssssshlk.........',
    '........kllbbsssssehlk..........',
    '........kkkppvvvvppkkk..........',
    '.......kppvvvvvvvvvvppk.........',
    '......kpvvvppaarraappvvpk..kkkkk',
    '......kuuvvvvaarraavvvvukkkmmmmx',
    '.....kuuvvuuuaarraauuuvvsskooykk',
    '.....kssvuuuuuuuuuuuuuvssk.kkk..',
    '......kkkuuuuooyyoouuukkk.......',
    '........kuuuuooyyoouuuk.........',
    '........kuuuuuuuuuuuuuk.........',
    '........kuuvvuuuuuuvvuk.........',
    '.......kuuvvuuuuuuuuvvuk........',
    '.......kuuuk.......kuuuk........',
    '......kuuuk.........kuuuk.......',
    '.....ktttk...........ktttk......',
    '.....ktttk...........ktttk......',
    '....kttttk...........kttttk.....',
    '....kkkkkk...........kkkkkk.....',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  // Fourth Magician Irys: Emerald Sitian Master weaving a glowing jade Source orb
  irys: [
    '................................',
    '...........kkkkkkkk.............',
    '.........kkbbllllllbbkk.........',
    '........kbblllooyyoollbk........',
    '........kbllhsssssshlbbk........',
    '.......kbllhsssskxzkshlbk.......',
    '.......kbllhssssssssshlbk.......',
    '........kbllhssssssehlbk..kztzk.',
    '........kkkjjzzzzzzjjkkk.kztxtzk',
    '.......kjjzzzzzzzzzzzzjjkkztxtzk',
    '......kjzzjjqqyyyyqqjjzzjk.kztzk',
    '.....kjzjjqqqyyyyyyqqqjjzjk.....',
    '.....kjzjqqqqqqyyqqqqqqjzjssk...',
    '.....kssjqqqqqqooqqqqqqjssk.....',
    '......kkjjqqqqqooqqqqqjjkk......',
    '.......kjjzzzzoooozzzzjjk.......',
    '.......kjzjjqqqqqqqqjjzjk.......',
    '......kjzjjqqqqqqqqqqjjzjk......',
    '......kjzjjqqqztzqqqqjjzjk......',
    '.....kjzjjqqqztxtzqqqqjjzjk.....',
    '.....kjzjjqqqqztzqqqqqjjzjk.....',
    '....kjzjjqqqqqqqqqqqqqqjjzjk....',
    '....kjzjjqqqqqqqqqqqqqqjjzjk....',
    '....kkkkkkkkkkkkkkkkkkkkkkkk....',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  // Brazell Dungeon Guard (faces LEFT): Heavy iron helmet & crimson-trimmed halberd
  brazell_guard: [
    '.....kk.........................',
    '....kmmk........kkkk............',
    '...kmxxmk......krrrrk...........',
    '..kmxxxxmk....kkmmmmkk..........',
    '..kmxxmmmk...kmmmxxxmmk.........',
    '...kmxmk....kmmxpppppxmk........',
    '....kmk.....kmxpkkkkkpxmk.......',
    '....kok.....kmxpkfrrkpxmk.......',
    '....kok.....kmxpkkkkkpxmk.......',
    '....kok.....kmmxpppppxmmk.......',
    '....kok....kkpppppppppppkk......',
    '....kok..kkpppmmmnnnnmmmppkk....',
    '....kok.kpppmmxxnrarrnxxmmppk...',
    '...kssk.kpppppppnrarrnppppppk...',
    '...kssk..kppnnnnnrarrnnnnnppk...',
    '....kok..kppnnnnnrrrrnnnnnppk...',
    '....kok...kpppmmmmmmmmmmpppk....',
    '....kok....kkkknnnnnnnnkkkk.....',
    '....kok.......knnvnnvnnk........',
    '....kok......knnvnnnnvnnk.......',
    '....kok......knnk....knnk.......',
    '....kok.....kpppk....kpppk......',
    '....kok.....ktttk....ktttk......',
    '....kok....kttttk....kttttk.....',
    '....kkk....kkkkkk....kkkkkk.....',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  // Mogkan (faces LEFT): Hooded dark Sitian magician wielding an arcane blood-violet staff
  mogkan: [
    '.....kVVk.......................',
    '....kVxxVk.....kkkkkkkkkk.......',
    '...kVxiixVk..kkddddddddddkk.....',
    '...kVxiixVk.kdddiiiiiiiiiddk....',
    '....kVxxVk.kddiiVVVVVViiiiddk...',
    '.....koook.kdiiVddnnnnndiiiddk..',
    '......kok..kdiiVdnsssssndiiidk..',
    '......kok..kdiiVdkxVkssndiiidk..',
    '......kok..kdiiVdnsssssndiiidk..',
    '......kok...kdiiVdneeeendiiidk..',
    '......kok..kkddiikkddddkkiiddkk.',
    '.....kssk.kddiiidddiiiiidddiiidk',
    '.....kssk.kdiiVViiidVVVdiiiVViid',
    '......kok.kdiiVVViiidVdiiiVVViid',
    '......kok..kddiiidddiiidddiiiddk',
    '......kok...kdddddddddddddddddk.',
    '......kok...kddiiidddddddiiiddk.',
    '......kok..kddiiViiidddiiiViiddk',
    '......kok..kddiiVVViiiiiVVViiddk',
    '......kok.kddiiiVVViiiiiVVViiidd',
    '......kok.kddddiiidddddddiiidddd',
    '......kok.kddddddddddddddddddddk',
    '......kok.kddddddddddddddddddddk',
    '......kkk.kkkkkkkkkkkkkkkkkkkkkk',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  // Blood Thief Scout (faces LEFT): Masked crimson-violet infiltrator with curved scimitar
  blood_thief_scout: [
    '................................',
    '..............kkkkkkkk..........',
    '............kkddddddddkk........',
    '...........kddddrrrrddddk.......',
    '..........kdddrrrrrrrrdddk......',
    '....kk....kddrrssssssrrddk......',
    '...kmmk...kddrrskxakssrddk......',
    '..kmxxmk..kddrrddddddrrddk......',
    '..kmxmk....kddrrrrrrrrddk.......',
    '..kmxmk...kkddduuuuuudddkk......',
    '...kmxmk.kddduuurrrrruuudddk....',
    '....kmxmkkdduuurraarruuudddk....',
    '....ksskkdduuuurraarruuuuddk....',
    '.....kk..kkduuuurrrrruuuudkk....',
    '...........kuuuooooooouuuk......',
    '...........kuuuuuuuuuuuuuk......',
    '..........kuuvvuuuuuuuvvuk......',
    '..........kuuvvuuuuuuuvvuk......',
    '.........kuuuk........kuuuk.....',
    '.........kuuuk........kuuuk.....',
    '........ktttk..........ktttk....',
    '........ktttk..........ktttk....',
    '.......kttttk..........kttttk...',
    '.......kkkkkk..........kkkkkk...',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],

  // Rogue Sitian Acolyte (faces LEFT): Corrupted emerald-and-violet spellcaster
  rogue_sitian_mage: [
    '................................',
    '..............kkkkkkkk..........',
    '............kkqqqqqqqqkk........',
    '...........kqqqddddddqqqk.......',
    '..........kqqdddiiiidddqqk......',
    '....kVik..kqqdiisssssiidqk......',
    '...kVxxVk.kqqdiskxViksidqk......',
    '...kVxxVk.kqqdiisssssiidqk......',
    '....kVik...kqqddieeeeiddqk......',
    '............kkqqddddddqqkk......',
    '..........kkqqqddiiiiddqqqkk....',
    '.........kqqqqddiiVViiidqqqqk...',
    '........ksskqqddiVxxViidqqkssk..',
    '........kssk.kqqddVVddqqk.kssk..',
    '.............kqqqooyooqqqk......',
    '.............kqqqddddqqqqk......',
    '............kqqqddddddqqqqk.....',
    '............kqqddiiiiiddqqk.....',
    '...........kqqddiiVViiiddqqk....',
    '...........kqqddiVVVViiidqqk....',
    '..........kqqqqddiiiiiddqqqqk...',
    '..........kqqqqqqddddddqqqqqk...',
    '..........kkkkkkkkkkkkkkkkkkk...',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
};

let cachedPortraits: Record<PortraitKey, PortraitMeta> | null = null;
let cachedBattleSprites: Record<BattleSpriteKey, string> | null = null;

export function getPortraitAtlas(): Record<PortraitKey, PortraitMeta> {
  if (!cachedPortraits) {
    const entries = Object.entries(PORTRAIT_GRIDS) as Array<
      [PortraitKey, (typeof PORTRAIT_GRIDS)[PortraitKey]]
    >;
    const built = {} as Record<PortraitKey, PortraitMeta>;
    for (const [key, cfg] of entries) {
      built[key] = {
        key,
        title: cfg.title,
        allegiance: cfg.allegiance,
        bgGradient: cfg.bgGradient,
        accentHex: cfg.accentHex,
        imageUrl: GENERATED_PORTRAIT_URLS[key],
        fallbackDataUrl: renderGrid32ToDataUrl(
          cfg.rows,
          PIXEL_PALETTE,
          cfg.bgGradient[0],
          cfg.bgGradient[1]
        ),
      };
    }
    cachedPortraits = built;
  }
  return cachedPortraits;
}

export function resolveSpeakerPortrait(speakerName: string): PortraitMeta {
  const atlas = getPortraitAtlas();
  const normalized = speakerName.toLowerCase();

  if (normalized.includes('yelena')) return atlas.yelena;
  if (normalized.includes('valek')) return atlas.valek;
  if (normalized.includes('ambrose')) return atlas.ambrose;
  if (normalized.includes('irys')) return atlas.irys;
  if (normalized.includes('ari')) return atlas.ari;
  if (normalized.includes('janco')) return atlas.janco;
  if (normalized.includes('guard')) return atlas.brazell_guard;
  if (normalized.includes('mogkan')) return atlas.mogkan;
  if (normalized.includes('scout')) return atlas.sitian_scout;
  if (normalized.includes('elder')) return atlas.zaltana_elder;
  if (normalized.includes('bain')) return atlas.bain;

  return atlas.yelena;
}

export const GENERATED_BATTLE_BACKDROP_URLS: Record<string, string> = {
  act0_dungeon_guard:
    '/src/assets/images/backdrop_brazell_dungeon_1795494553694.jpg',
  act0_mogkan_boss:
    '/src/assets/images/backdrop_brazell_courtyard_1795494555652.jpg',
  act1_sitia_ambush:
    '/src/assets/images/backdrop_sitia_outskirts_1795494556943.jpg',
};

export const GENERATED_BATTLE_SPRITE_URLS: Record<BattleSpriteKey, string> = {
  yelena: '/src/assets/images/battle_sprite_yelena_1795494557225.jpg',
  ari: '/src/assets/images/battle_sprite_ari_1795494558780.jpg',
  janco: '/src/assets/images/battle_sprite_janco_1795494560339.jpg',
  irys: '/src/assets/images/battle_sprite_irys_1795494560527.jpg',
  brazell_guard:
    '/src/assets/images/battle_sprite_brazell_guard_1795494563797.jpg',
  mogkan: '/src/assets/images/battle_sprite_mogkan_1795494564240.jpg',
  blood_thief_scout:
    '/src/assets/images/battle_sprite_blood_thief_scout_1795494565429.jpg',
  rogue_sitian_mage:
    '/src/assets/images/battle_sprite_rogue_sitian_mage_1795494565868.jpg',
};

export interface BattleSpriteMeta {
  key: BattleSpriteKey;
  imageUrl: string;
  fallbackDataUrl: string;
}

export function getBattleSpriteAtlas(): Record<BattleSpriteKey, string> {
  if (!cachedBattleSprites) {
    const entries = Object.entries(BATTLE_SPRITE_GRIDS) as Array<
      [BattleSpriteKey, string[]]
    >;
    const built = {} as Record<BattleSpriteKey, string>;
    for (const [key, rows] of entries) {
      built[key] = renderGrid32ToDataUrl(rows, PIXEL_PALETTE);
    }
    cachedBattleSprites = built;
  }
  return cachedBattleSprites;
}

export function resolveBattleSprite(combatantId: string): BattleSpriteMeta {
  const fallbackAtlas = getBattleSpriteAtlas();
  const key: BattleSpriteKey =
    combatantId in fallbackAtlas
      ? (combatantId as BattleSpriteKey)
      : 'yelena';

  return {
    key,
    imageUrl: GENERATED_BATTLE_SPRITE_URLS[key],
    fallbackDataUrl: fallbackAtlas[key],
  };
}

export function resolveBattleBackdropUrl(encounterId: string): string {
  return (
    GENERATED_BATTLE_BACKDROP_URLS[encounterId] ??
    GENERATED_BATTLE_BACKDROP_URLS.act0_dungeon_guard
  );
}

const processedSpriteCache = new Map<string, string>();
const inflightSpritePromises = new Map<string, Promise<string>>();

/**
 * Flood-fills from the outer border of a generated battle sprite JPEG to key out
 * its solid black or solid white background into a crisp transparent PNG data URL,
 * while preserving all interior character pixels and outlines.
 */
export function loadTransparentBattleSprite(
  imageUrl: string,
  fallbackDataUrl: string
): Promise<string> {
  const cached = processedSpriteCache.get(imageUrl);
  if (cached) return Promise.resolve(cached);

  const existing = inflightSpritePromises.get(imageUrl);
  if (existing) return existing;

  const promise = new Promise<string>((resolve) => {
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
      resolve(fallbackDataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || 256;
        const h = img.naturalHeight || 256;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Sample top-left corner pixel as the background key color
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];
        const isLightBg = bgR > 180 && bgG > 180 && bgB > 180;
        const tolerance = isLightBg ? 52 : 36;

        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const matchesBg = (idx: number): boolean => {
          const p = idx * 4;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];
          return (
            Math.abs(r - bgR) <= tolerance &&
            Math.abs(g - bgG) <= tolerance &&
            Math.abs(b - bgB) <= tolerance
          );
        };

        const enqueueIfBg = (x: number, y: number) => {
          if (x < 0 || x >= w || y < 0 || y >= h) return;
          const idx = y * w + x;
          if (visited[idx]) return;
          if (matchesBg(idx)) {
            visited[idx] = 1;
            queue[tail] = idx;
            tail += 1;
          }
        };

        // Seed flood-fill from all 4 outer edges
        for (let x = 0; x < w; x += 1) {
          enqueueIfBg(x, 0);
          enqueueIfBg(x, h - 1);
        }
        for (let y = 0; y < h; y += 1) {
          enqueueIfBg(0, y);
          enqueueIfBg(w - 1, y);
        }

        while (head < tail) {
          const idx = queue[head];
          head += 1;
          const p = idx * 4;
          data[p + 3] = 0; // Make background transparent

          const x = idx % w;
          const y = (idx - x) / w;
          enqueueIfBg(x - 1, y);
          enqueueIfBg(x + 1, y);
          enqueueIfBg(x, y - 1);
          enqueueIfBg(x, y + 1);
        }

        // Soften 1px fringe along keyed edges and trim residual white halo on dark sprites
        for (let y = 1; y < h - 1; y += 1) {
          for (let x = 1; x < w - 1; x += 1) {
            const idx = y * w + x;
            if (visited[idx]) continue;
            const hasTransparentNeighbor =
              visited[idx - 1] ||
              visited[idx + 1] ||
              visited[idx - w] ||
              visited[idx + w];
            if (hasTransparentNeighbor) {
              const p = idx * 4;
              const r = data[p];
              const g = data[p + 1];
              const b = data[p + 2];
              // If dark background sprite has a 1px white sticker outline or JPEG fringe, soften it
              if (!isLightBg && r > 210 && g > 210 && b > 210) {
                data[p + 3] = 0;
              } else {
                data[p + 3] = 215;
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const url = canvas.toDataURL('image/png');
        processedSpriteCache.set(imageUrl, url);
        resolve(url);
      } catch {
        resolve(imageUrl);
      }
    };

    img.onerror = () => {
      resolve(fallbackDataUrl);
    };

    img.src = imageUrl;
  });

  inflightSpritePromises.set(imageUrl, promise);
  return promise;
}

