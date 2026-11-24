# 01 — Narrative & Prologue Blueprint (Option 1: The Suikoden/FF6 Opening)

## 1. High-Level Structural Vision
*Poison Study* (Book 1) is a claustrophobic palace detective thriller, while *Magic Study* (Book 2) and *Fire Study* (Book 3) are expansive, party-based adventure RPGs with overworld exploration and elemental/magical progression.

To capture the best of both without building two incompatible game loops, the game uses **Option 1: The Playable Climax Prologue**:
* **Act 0 (Prologue — ~45–60 Minutes):** Opens *in media res* during the final third of *Poison Study*. Plays like a tense *Final Fantasy VI* Narshe / *Suikoden* castle escape tutorial. Introduces Yelena's food-tasting mechanics, Valek's stealth tunnels, Ari & Janco's martial camaraderie, and the wild awakening of Yelena's Sitian magic against Mogkan and General Brazell.
* **Title Drop & Exile Transition:** Commander Ambrose discovers the truth of Yelena's survival and her illegal magical nature. Bound by the Ixian Code of Behavior yet indebted to her for saving his life, Ambrose and Valek orchestrate her "exile/escape" across the southern border into Sitia.
* **Act I (*Magic Study* Main Campaign):** The palette shifts from muted Ixian charcoal-and-crimson uniforms to vibrant Sitian emerald jungles and citadel towers. Fourth Magician Irys meets Yelena at the border, kicking off the *Golden Sun*-style overworld journey toward the Magician's Keep in Fulgor.

---

## 2. Visual & Tonality Contrast (Art Direction)
| Attribute | Act 0: Military District 1 (Ixia) | Act I+: Sitia (Greenblade, Fulgor, Avibian Plains) |
| :--- | :--- | :--- |
| **Color Palette** | Cold slate, iron grey, uniform black, deep crimson accents | Lush jungle greens, warm sandstone, vibrant clan colors, glass blues |
| **Architecture** | Symmetrical stone corridors, austere barracks, hidden wall panels | Organic towers, open-air markets, crystal/glass workshops, ruins |
| **Audio/Mood** | Ticking clock tension, low strings, boots on stone | Melodic woodwinds, *Golden Sun*-style energetic overworld brass |
| **Core Mechanics** | Poison Tasting, Stealth Tunnels, Lockpicking, Feral Magic Surge | Field Psynergy (Mind-Speak, Sense, Heal), Party Combat, Alchemy |

---

## 3. Act 0: Scene-by-Scene Prologue Walkthrough

### Scene 0.1 — The Commander's Banquet (`commander_dining_hall`)
* **Narrative Setup:** The Sitian delegation (led by Fourth Magician Irys) is visiting Castle Ixia. Tension is high; someone is targeting Commander Ambrose. Yelena is performing her daily duties under the shadow of her daily "Butterfly's Dust" antidote dependence.
* **Gameplay Beat:**
  1. Speak with **Commander Ambrose**, **Valek**, and **Irys** (all support `MindSpeak` surface thoughts).
  2. Inspect the gifted **Sitian Cognac** on the banquet table (highlighted with a gold quest marker).
  3. Trigger the **Sensory Tasting Minigame** (`TastingDeductionUI`):
     * **Action 1 (Smell / Aroma):** Detect sweet cognac mask / faint nutmeg.
     * **Action 2 (Inspect / Visual):** Observe slight amber thickening.
     * **Action 3 (Dab / Taste):** Detect warm tingle → sudden tongue numbness → Cross-reference Compendium → Identify **"My Love"** (`my_love`).
  4. Solving `my_love` sets `banquet_poison_resolved = true`.
  5. Cast **Source-Sense** (`Tab` → `Q`) to reveal the hidden wall switch and unlock the secret passage to the tunnels.

### Scene 0.2 — Shadows in the Walls (`castle_secret_tunnels`)
* **Narrative Setup:** After the banquet attempt, Yelena traverses Valek's spy network tunnels to investigate General Brazell's estate. She crosses paths with **Ari** and **Janco**, who join `GameState.activeParty` as vanguard companions.
* **Gameplay Beat:**
  1. Navigate the stealth corridors and recruit Ari and Janco.
  2. Unlock the passage leading to Brazell's Estate Dungeon.

### Scene 0.3 — Brazell's Estate & The Dungeon Truth (`brazell_estate_dungeon`)
* **Narrative Setup:** Commander Ambrose is drugged into a stupor by the rogue magician **Mogkan** (working with Brazell). Yelena is captured and denied her daily Butterfly's Dust antidote.
* **Gameplay Beat:**
  1. **Status Effect Narrative Integration:** Yelena suffers the *Withdrawal* debuff (screen vignette overlay).
  2. **The Reveal with Valek:** Valek arrives at the cell bars and reveals the truth—*Butterfly's Dust* was never a fatal poison; the "antidote" was simply an addictive stimulant (`butterfly_dust_truth_revealed = true`).
  3. **The Feigned Death:** Yelena uses *Illiais Nightshade* (`sitian_slumber`) to fake death, tricking Brazell's guard into opening the cell and triggering a turn-based skirmish (`dungeon_guard_defeated = true`).

### Scene 0.4 — The Feral Surge (`brazell_courtyard_boss`)
* **Narrative Setup:** Yelena rescues the incapacitated Commander Ambrose in the night courtyard and confronts **Mogkan**.
* **Gameplay Beat:**
  1. **Boss Battle (Mogkan):** Standard physical attacks are deflected by Mogkan's magical barrier for `0` damage.
  2. **Awakening the Source:** When Yelena's HP drops below `25%`, `feral_surge_unlocked` is set, unlocking **Feral Surge** ("Soulfinder Scream"), which shatters Mogkan's barrier and defeats him (`mogkan_defeated = true`).
  3. **Resolution & Exile:** Concluding dialogue establishes Yelena's illegal magical nature and exile to Sitia (`prologue_completed = true`).
  4. **TITLE CARD DROP:** *CHRONICLES OF IXIA*.

---

## 4. Act I Opening: Crossing into Sitia (*Magic Study* Kickoff)
* **Maps:** `southern_border_checkpoint` → `greenblade_outskirts` → `greenblade_town` → `fulgor_citadel_gate`
* **Party Roster Transition:** Valek, Ari, and Janco depart. **Irys** (Fourth Magician) joins to guide Yelena and teach controlled **Field Psynergy** (`mind_speak`, `source_sense`, `healing_hands`).
* **Greenblade Arc:** Yelena reunites with her estranged Zaltana clan (`ZaltanaElder`), uses **Source-Sense** to uncover a residual **Blood Thief** magic trail, and survives a 2-enemy Sitia ambush (introducing enemy target cycling in combat).
* **Next Arc (Citadel in Fulgor):** Travel to the Magician's Keep in Fulgor to confront the **Blood Thief (Fisk)** and exiled rebel prince **Cahil**, unlocking Yelena's **Absorb & Redirect** combat stance and **Healing Hands**.