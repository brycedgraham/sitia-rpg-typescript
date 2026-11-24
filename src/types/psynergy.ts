export type PsynergyInteractionTag =
  | 'MindReadable'
  | 'HiddenMagic'
  | 'HealTarget'
  | 'WindPush';

export interface FieldPsynergyData {
  abilityId: string;
  displayName: string;
  description: string;
  sourceCost: number;
  effectRadiusPixels: number;
  targetInteractionTag: PsynergyInteractionTag;
  pulseColorHex: string;
}

export interface PsynergyPulseVfx {
  id: number;
  originX: number;
  originY: number;
  maxRadius: number;
  colorHex: string;
  elapsedSeconds: number;
  durationSeconds: number;
}
