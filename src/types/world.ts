export type TileType = 'floor' | 'wall' | 'clutter' | 'water';

export type FacingDirection = 'down' | 'up' | 'left' | 'right';

export interface Vec2 {
  x: number;
  y: number;
}

export type MapActorKind =
  | 'npc'
  | 'quest_item'
  | 'revealable_switch'
  | 'ambush_zone';

export type SpriteVariant =
  | 'yelena'
  | 'ambrose'
  | 'valek'
  | 'irys'
  | 'ari'
  | 'janco'
  | 'brazell_guard'
  | 'mogkan'
  | 'sitian_cognac'
  | 'nightshade_vial'
  | 'hidden_switch'
  | 'zaltana_elder'
  | 'blood_thief_trace'
  | 'wilted_flora';

export interface MapActor {
  id: string;
  displayName: string;
  kind: MapActorKind;
  sprite: SpriteVariant;
  x: number; // Pixel coords inside walled interior
  y: number;
  colorHex: string; // e.g., '#34d399' (NPC), '#fbbf24' (Quest Item), '#c084fc' (Switch)
  solid?: boolean;
  dialogueId?: string;
  postFlagDialogue?: {
    flag: string;
    dialogueId: string;
  };
  hideWhenFlag?: string;
  previewText?: string;
  tastingPoisonId?: string;
  mindSpeak?: {
    dialogueId: string;
    isLying: boolean;
    thoughtPreview?: string;
  };
  revealable?: {
    revealableId: string;
    startsHidden: boolean;
  };
  healable?: {
    healableId: string;
    healedName: string;
    healedMessage: string;
  };
}

export interface MapTransition {
  id: string;
  label: string; // e.g., "-> TUNNELS"
  x: number;
  y: number;
  targetMapId: string;
  targetSpawnId: string;
  requiredFlag?: string;
  lockedMessage?: string;
}

export interface MapPalette {
  floor: string;
  wall: string;
  accent: string;
}

export interface CarpetRect {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
}

export interface MapData {
  mapId: string;
  displayName: string;
  act: 'Act0_Ixia' | 'Act1_Sitia';
  palette: MapPalette;
  cols: number;
  rows: number;
  tiles: TileType[][]; // Outer ring (row 0, row max, col 0, col max) MUST be 'wall'
  carpets?: CarpetRect[];
  spawns: Record<string, Vec2>;
  actors: MapActor[];
  transitions: MapTransition[];
}

export type InteractTarget =
  | {
      type: 'actor';
      id: string;
      label: string;
      accentColor: string;
      x: number;
      y: number;
      actor: MapActor;
    }
  | {
      type: 'transition';
      id: string;
      label: string;
      accentColor: string;
      x: number;
      y: number;
      transition: MapTransition;
    };
