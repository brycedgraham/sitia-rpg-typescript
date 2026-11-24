import type { DialogueScript } from '../types';

export const DIALOGUES: Record<string, DialogueScript> = {
  // =========================================================================
  // ACT 0 — SCENE 0.1: COMMANDER'S DINING HALL
  // =========================================================================
  act0_banquet_ambrose: {
    dialogueId: 'act0_banquet_ambrose',
    lines: [
      {
        speaker: 'Commander Ambrose',
        text: 'The Sitian delegation brought a rare vintage from the south, Yelena. Before I drink in front of Fourth Magician Irys, do your duty.',
      },
      {
        speaker: 'Commander Ambrose',
        text: 'Inspect the Sitian Cognac on the banquet table. If treachery hides inside that crystal, I expect you to name the toxin.',
      },
    ],
  },
  act0_banquet_ambrose_post: {
    dialogueId: 'act0_banquet_ambrose_post',
    lines: [
      {
        speaker: 'Commander Ambrose',
        text: 'My Love inside a diplomatic gift... Someone inside Castle Ixia means to topple the Code tonight. Follow Valek’s lead through the wall network.',
      },
    ],
  },
  act0_banquet_ambrose_mind: {
    dialogueId: 'act0_banquet_ambrose_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Commander Ambrose',
        isThoughtBubble: true,
        isLying: false,
        text: 'Brazell’s generals grow restless every time a Sitian envoy crosses our walls. If anyone poisoned that bottle, it was one of my own.',
      },
      {
        speaker: 'Commander Ambrose',
        isThoughtBubble: true,
        isLying: false,
        text: 'Yelena has sharp instincts—sharper than a condemned prisoner has any right to possess. I hope Valek’s tether holds.',
      },
    ],
  },

  act0_banquet_valek: {
    dialogueId: 'act0_banquet_valek',
    lines: [
      {
        speaker: 'Valek',
        text: 'Keep your eyes on the decanter, Yelena. Sweet Sitian spirits mask bitter intentions—and remember not to miss your Butterfly’s Dust dose tonight.',
      },
      {
        speaker: 'Valek',
        text: 'If you uncover proof of an attempt on the Commander, we move through the wall network. You know where the stone panel lies to the north-west.',
      },
    ],
  },
  act0_banquet_valek_post: {
    dialogueId: 'act0_banquet_valek_post',
    lines: [
      {
        speaker: 'Valek',
        text: 'Good work naming My Love. Cast Source-Sense [Tab → Q] along the north-west wall to locate the hidden catch—Ari and Janco are waiting inside the tunnels.',
      },
    ],
  },
  act0_banquet_valek_mind: {
    dialogueId: 'act0_banquet_valek_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Valek',
        isThoughtBubble: true,
        isLying: true,
        text: 'She still believes Butterfly’s Dust will kill her if she skips a single morning dose. Good. If she ever learned the "antidote" is only a stimulant, I would lose my hold over her.',
      },
      {
        speaker: 'Valek',
        isThoughtBubble: true,
        isLying: true,
        text: 'Yet part of me hopes she survives whatever General Brazell is plotting tonight...',
      },
    ],
  },

  act0_banquet_irys: {
    dialogueId: 'act0_banquet_irys',
    lines: [
      {
        speaker: 'Fourth Magician Irys',
        text: 'Fascinating. The Commander’s food taster carries herself like an assassin, yet the air around you hums with untrained Source.',
      },
      {
        speaker: 'Fourth Magician Irys',
        text: 'Tread lightly, child. In Ixia, magic warrants execution—but in Sitia, a gift like yours could open doors no iron key can budge.',
      },
    ],
  },
  act0_banquet_irys_mind: {
    dialogueId: 'act0_banquet_irys_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Fourth Magician Irys',
        isThoughtBubble: true,
        isLying: false,
        text: 'She just brushed my mind without a single lesson! A raw Sitian Soulfinder surviving right under Valek’s nose—I must get her across the southern border alive.',
      },
    ],
  },

  act0_banquet_poison_solved: {
    dialogueId: 'act0_banquet_poison_solved',
    lines: [
      {
        speaker: 'Yelena',
        text: 'Stop, Commander! The cognac is laced with My Love—a fast Sitian coma toxin hidden beneath nutmeg sweetness.',
      },
      {
        speaker: 'Valek',
        text: 'Well caught, Yelena. Whoever planted this decanter is already moving inside Castle Ixia. Cast Source-Sense [Tab → Q] along the north-west wall to expose my secret tunnel catch.',
      },
    ],
  },

  act0_dining_switch_activated: {
    dialogueId: 'act0_dining_switch_activated',
    lines: [
      {
        speaker: 'Yelena',
        text: 'There it is—an obsidian catch recessed inside the mortar. Valek’s spy network always hides its doors in plain sight.',
        setFlag: { key: 'secret_tunnel_unlocked', value: true },
      },
      {
        speaker: 'Yelena',
        text: 'A low counterweight clicks behind the masonry. The north-west stone panel (-> TUNNELS) is now unlatched.',
      },
    ],
  },

  // =========================================================================
  // ACT 0 — SCENE 0.2: CASTLE SECRET TUNNELS
  // =========================================================================
  act0_tunnels_ari: {
    dialogueId: 'act0_tunnels_ari',
    lines: [
      {
        speaker: 'Ari',
        text: 'Easy with that dagger, Yelena—it’s just me. Valek sent word that someone tried to drug the Commander with Sitian cognac.',
      },
      {
        speaker: 'Ari',
        text: 'Brazell’s men have been moving crates beneath his estate all evening. Count my steel in—Ari joins your party!',
        setFlag: { key: 'ari_recruited', value: true },
        addPartyMember: 'ari',
      },
    ],
  },
  act0_tunnels_ari_post: {
    dialogueId: 'act0_tunnels_ari_post',
    lines: [
      {
        speaker: 'Ari',
        text: 'I have your flank, Yelena. Grab Janco further down the corridor and let’s see what General Brazell is hiding.',
      },
    ],
  },
  act0_tunnels_ari_mind: {
    dialogueId: 'act0_tunnels_ari_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Ari',
        isThoughtBubble: true,
        isLying: false,
        text: 'She saved my hide back in the barracks, and she’s tougher than half the garrison. I’m not letting Brazell’s thugs touch her.',
      },
    ],
  },

  act0_tunnels_janco: {
    dialogueId: 'act0_tunnels_janco',
    lines: [
      {
        speaker: 'Janco',
        text: 'Well, well—if it isn’t Castle Ixia’s favorite food taster sneaking through the stonework! Did you save me any poisoned cognac?',
      },
      {
        speaker: 'Janco',
        text: 'Kidding, kidding. Brazell’s dungeon grate lies just east of here. Let’s go ruin a general’s evening—Janco joins your party!',
        setFlag: { key: 'janco_recruited', value: true },
        addPartyMember: 'janco',
      },
    ],
  },
  act0_tunnels_janco_post: {
    dialogueId: 'act0_tunnels_janco_post',
    lines: [
      {
        speaker: 'Janco',
        text: 'All set, Yelena! Head to the eastern grate (-> BRAZELL DUNGEON) whenever you’re ready.',
      },
    ],
  },
  act0_tunnels_janco_mind: {
    dialogueId: 'act0_tunnels_janco_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Janco',
        isThoughtBubble: true,
        isLying: false,
        text: 'Joke all you want, Janco, just keep your eyes peeled—there’s a Sitian magician working for Brazell, and steel won’t stop spells.',
      },
    ],
  },

  // =========================================================================
  // ACT 0 — SCENE 0.3: BRAZELL'S ESTATE DUNGEON
  // =========================================================================
  act0_dungeon_valek: {
    dialogueId: 'act0_dungeon_valek',
    lines: [
      {
        speaker: 'Yelena',
        text: 'Valek! Brazell’s rogue magician—Mogkan—drugged the Commander and threw me down here without my Butterfly’s Dust antidote. My hands won’t stop shaking...',
      },
      {
        speaker: 'Valek',
        text: 'Listen carefully, Yelena. Stop fighting the shakes and hear the truth: Butterfly’s Dust was never a fatal poison.',
        setFlag: { key: 'butterfly_dust_truth_revealed', value: true },
      },
      {
        speaker: 'Valek',
        text: 'The daily "antidote" was only an addictive stimulant. You aren’t dying—you are free of my leash. Now use the Illiais Nightshade hidden in the south-west corner of your cell to feign death and lure the guard!',
      },
    ],
  },
  act0_dungeon_valek_post: {
    dialogueId: 'act0_dungeon_valek_post',
    lines: [
      {
        speaker: 'Valek',
        text: 'Grab the Illiais Nightshade vial in the south-west corner of the cell. Feign death, drop the guard, and get to the courtyard before Mogkan finishes Commander Ambrose.',
      },
    ],
  },
  act0_dungeon_valek_mind: {
    dialogueId: 'act0_dungeon_valek_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Valek',
        isThoughtBubble: true,
        isLying: false,
        text: 'I hated lying to her about Butterfly’s Dust... but she needs to know she can survive on her own now.',
      },
    ],
  },

  act0_dungeon_nightshade_early: {
    dialogueId: 'act0_dungeon_nightshade_early',
    lines: [
      {
        speaker: 'Yelena',
        text: 'A small phial of Illiais Nightshade tucked beneath the straw... My vision is swimming from withdrawal. I need to speak with Valek at the north bars first.',
      },
    ],
  },

  act0_dungeon_feigned_death: {
    dialogueId: 'act0_dungeon_feigned_death',
    onCompleteEncounterId: 'act0_dungeon_guard',
    lines: [
      {
        speaker: 'Yelena',
        text: 'A measured drop of Illiais Nightshade slows my pulse to a whisper. Cooling mint spreads across my tongue as I collapse onto the flagstones...',
        setFlag: { key: 'feigned_death_staged', value: true },
      },
      {
        speaker: 'Brazell Dungeon Guard',
        text: 'Hah! The Butterfly’s Dust finally took the taster! Let me unbolt this gate and haul her out before Brazell—wait, her eyes just snapped open!',
      },
    ],
  },

  act0_dungeon_guard_locked: {
    dialogueId: 'act0_dungeon_guard_locked',
    lines: [
      {
        speaker: 'Brazell Dungeon Guard',
        text: 'Stay back from the gate, prisoner! No Butterfly’s Dust antidote for you tonight—General Brazell’s orders.',
      },
    ],
  },
  act0_dungeon_guard_post: {
    dialogueId: 'act0_dungeon_guard_post',
    lines: [
      {
        speaker: 'Brazell Dungeon Guard',
        text: 'Ugh... how did she move that fast without her antidote...',
      },
    ],
  },

  // =========================================================================
  // ACT 0 — SCENE 0.4: BRAZELL COURTYARD BOSS (MOGKAN) & PROLOGUE FINALE
  // =========================================================================
  act0_courtyard_ambrose_drugged: {
    dialogueId: 'act0_courtyard_ambrose_drugged',
    lines: [
      {
        speaker: 'Commander Ambrose',
        text: 'Yelena... Mogkan’s magic clouds my mind... stay back—his barrier deflects ordinary steel!',
      },
    ],
  },

  act0_mogkan_confrontation: {
    dialogueId: 'act0_mogkan_confrontation',
    onCompleteEncounterId: 'act0_mogkan_boss',
    lines: [
      {
        speaker: 'Mogkan',
        text: 'General Brazell’s troublesome little food taster escapes her cage! And just in time to watch Commander Ambrose fall.',
      },
      {
        speaker: 'Mogkan',
        text: 'Try your Ixian daggers if you wish—my Sitian Source barrier will turn every mundane blade aside!',
      },
    ],
  },
  act0_mogkan_mind: {
    dialogueId: 'act0_mogkan_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Mogkan',
        isThoughtBubble: true,
        isLying: false,
        text: 'Wait—why does the air around this Ixian girl burn like raw lightning? No matter, I will crush her before she realizes what she is!',
      },
    ],
  },

  act0_prologue_finale: {
    dialogueId: 'act0_prologue_finale',
    onCompleteTitleCard: true,
    lines: [
      {
        speaker: 'Commander Ambrose',
        text: 'By the Code... Mogkan is defeated, yet I saw the storm of Source that tore through his barrier, Yelena. You possess Sitian magic.',
        setFlag: { key: 'prologue_completed', value: true },
      },
      {
        speaker: 'Commander Ambrose',
        text: 'Ixian law demands execution for any magician within my borders. Yet you saved my life twice tonight—first from My Love, and now from Mogkan.',
      },
      {
        speaker: 'Valek',
        text: 'Then let the official record state that Yelena escaped south into exile. Fourth Magician Irys is waiting at the Southern Border Checkpoint to guide you to Sitia.',
      },
      {
        speaker: 'Yelena',
        text: 'Ari, Janco, Valek... I won’t forget what you risked. If Sitia is where I must learn to master this magic, then I ride south tonight.',
      },
    ],
  },

  // =========================================================================
  // ACT I — SITIA: BORDER, OUTSKIRTS, GREENBLADE & FULGOR CITADEL GATE
  // =========================================================================
  act1_border_irys: {
    dialogueId: 'act1_border_irys',
    lines: [
      {
        speaker: 'Fourth Magician Irys',
        text: 'Breathe it in, Yelena—warm southern wind, cedar resin, and not a single Ixian uniform in sight. You are in Sitia now.',
      },
      {
        speaker: 'Fourth Magician Irys',
        text: 'From here we follow the emerald road south through Greenblade Outskirts toward your Zaltana clan’s town, then onward to the Magician’s Keep in Fulgor.',
      },
    ],
  },
  act1_border_irys_mind: {
    dialogueId: 'act1_border_irys_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Fourth Magician Irys',
        isThoughtBubble: true,
        isLying: false,
        text: 'The Council will debate her Ixian loyalty for months, but her magic is already stabilizing. Returning her to the Zaltana clan first is the right step.',
      },
    ],
  },

  act1_outskirts_scout: {
    dialogueId: 'act1_outskirts_scout',
    lines: [
      {
        speaker: 'Sitian Road Scout',
        text: 'Hail, Fourth Magician! Watch the sandstone turns ahead—strange hooded riders slipped into Greenblade before dawn, and the jungle flora along this ridge has been drained dry.',
      },
      {
        speaker: 'Sitian Road Scout',
        text: 'If your companion knows Healing Hands [Tab → Q], channeling Source near that Wilted Moonbloom east of the path might restore its glow.',
      },
    ],
  },
  act1_outskirts_scout_mind: {
    dialogueId: 'act1_outskirts_scout_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Sitian Road Scout',
        isThoughtBubble: true,
        isLying: false,
        text: 'Blood magic leaves plants withered like winter ash... Pray the Citadel catches the Blood Thief before another clan suffers.',
      },
    ],
  },

  act1_outskirts_moonbloom: {
    dialogueId: 'act1_outskirts_moonbloom',
    lines: [
      {
        speaker: 'Yelena',
        text: 'A Sitian Moonbloom drained of color by residual dark magic. Equip Healing Hands [Tab] and cast [Q] beside it to channel warm Source vitality.',
      },
    ],
  },

  act1_greenblade_elder: {
    dialogueId: 'act1_greenblade_elder',
    lines: [
      {
        speaker: 'Zaltana Elder',
        text: 'Fifteen winters since you were stolen north, Yelena Zaltana. Many in Greenblade feared you had become Ixian stone through and through.',
      },
      {
        speaker: 'Zaltana Elder',
        text: 'Yet dark whispers stalk our eastern courtyard at dusk. Use your Source-Sense [Tab → Q] near the eastern stones—someone has been hunting Sitia’s magicians.',
      },
    ],
  },
  act1_greenblade_elder_post: {
    dialogueId: 'act1_greenblade_elder_post',
    lines: [
      {
        speaker: 'Zaltana Elder',
        text: 'You drove back the Blood Thief’s scouts without hesitation! Travel south through -> FULGOR GATE—the Magician’s Keep awaits you, daughter of Zaltana.',
      },
    ],
  },
  act1_greenblade_elder_mind: {
    dialogueId: 'act1_greenblade_elder_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Zaltana Elder',
        isThoughtBubble: true,
        isLying: false,
        text: 'She has her mother’s eyes and an assassin’s quiet balance. Pray the Blood Thief has not already marked our town.',
      },
    ],
  },

  act1_greenblade_irys: {
    dialogueId: 'act1_greenblade_irys',
    lines: [
      {
        speaker: 'Fourth Magician Irys',
        text: 'Notice how differently the Source flows in Greenblade? Cast Source-Sense [Q] near the eastern square if you feel a cold, jagged tug in the air.',
      },
    ],
  },
  act1_greenblade_irys_mind: {
    dialogueId: 'act1_greenblade_irys_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Fourth Magician Irys',
        isThoughtBubble: true,
        isLying: false,
        text: 'That faint metallic chill near the eastern stones... it feels like stolen blood magic. Let Yelena uncover it herself so she trusts her senses.',
      },
    ],
  },

  act1_blood_thief_trace_examined: {
    dialogueId: 'act1_blood_thief_trace_examined',
    onCompleteEncounterId: 'act1_sitia_ambush',
    lines: [
      {
        speaker: 'Yelena',
        text: 'A ragged violet scorch lingers in the sandstone—residual stolen magic, sharp as iron filings.',
        setFlag: { key: 'blood_thief_trace_found', value: true },
      },
      {
        speaker: 'Fourth Magician Irys',
        text: 'Look out, Yelena! Blood Thief scouts were lying in wait behind the glassmaker stalls—draw your blades!',
      },
    ],
  },

  act1_fulgor_bain: {
    dialogueId: 'act1_fulgor_bain',
    lines: [
      {
        speaker: 'First Magician Bain',
        text: 'Welcome to the Magician’s Keep in Fulgor, Yelena Zaltana. Word of your stand in Greenblade—and your Soulfinder awakening in Ixia—reached the Council before your boots touched sandstone.',
        setFlag: { key: 'vertical_slice_completed', value: true },
      },
      {
        speaker: 'First Magician Bain',
        text: 'The Blood Thief Fisk and the exiled prince Cahil still threaten both Sitia and Ixia. Your study of magic has only just begun.',
      },
    ],
  },
  act1_fulgor_bain_mind: {
    dialogueId: 'act1_fulgor_bain_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'First Magician Bain',
        isThoughtBubble: true,
        isLying: false,
        text: 'Assassin’s discipline paired with a Soulfinder’s power... Sitia has not seen a magician like Yelena in three centuries.',
      },
    ],
  },

  act1_fulgor_irys: {
    dialogueId: 'act1_fulgor_irys',
    lines: [
      {
        speaker: 'Fourth Magician Irys',
        text: 'You made it from Castle Ixia’s banquet hall all the way to Fulgor’s gates, Yelena. Speak with First Magician Bain whenever you are ready to enter the Keep.',
      },
    ],
  },
  act1_fulgor_irys_mind: {
    dialogueId: 'act1_fulgor_irys_mind',
    isMindSpeak: true,
    lines: [
      {
        speaker: 'Fourth Magician Irys',
        isThoughtBubble: true,
        isLying: false,
        text: 'I knew she belonged here the instant she read my thoughts across Commander Ambrose’s banquet table.',
      },
    ],
  },
};
