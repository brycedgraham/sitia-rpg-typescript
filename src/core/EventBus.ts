import type { PsynergyPulseVfx } from '../types';

export interface InteractionFeedbackPayload {
  id: number;
  title: string;
  subtitle?: string;
  message: string;
  accentColor: string;
  eventTag: string;
}

export interface GameEventMap {
  poisonDeductionStarted: { poisonId: string; actorId?: string };
  poisonDeductionCompleted: { poisonId: string; success: boolean };
  mindSpeakTriggered: {
    dialogueId: string;
    isLying: boolean;
    actorName?: string;
  };
  dialogueStarted: {
    dialogueId: string;
    actorId?: string;
    speakerName?: string;
    hasMindSpeak?: boolean;
  };
  dialogueEnded: { dialogueId: string };
  combatInitiated: { encounterId: string };
  combatCompleted: { encounterId: string; victory: boolean };
  storyFlagChanged: {
    flagName: string;
    value: boolean | string | number;
  };
  activePsynergyChanged: { abilityId: string };
  psynergyPulseSpawned: PsynergyPulseVfx;
  castPsynergyRequested: Record<string, never>;
  mapTransitionRequested: {
    targetMapId: string;
    spawnId: string;
    transitionId: string;
  };
  titleCardTriggered: {
    subtitle: string;
  };
  interactionFeedback: InteractionFeedbackPayload;
}

type EventKey = keyof GameEventMap;
type EventHandler<K extends EventKey> = (payload: GameEventMap[K]) => void;

class TypedEventBus {
  private listeners = new Map<EventKey, Set<EventHandler<EventKey>>>();

  on<K extends EventKey>(event: K, handler: EventHandler<K>): () => void {
    let bucket = this.listeners.get(event);
    if (!bucket) {
      bucket = new Set();
      this.listeners.set(event, bucket);
    }
    bucket.add(handler as EventHandler<EventKey>);
    return () => this.off(event, handler);
  }

  off<K extends EventKey>(event: K, handler: EventHandler<K>): void {
    const bucket = this.listeners.get(event);
    if (!bucket) return;
    bucket.delete(handler as EventHandler<EventKey>);
    if (bucket.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit<K extends EventKey>(event: K, payload: GameEventMap[K]): void {
    const bucket = this.listeners.get(event);
    if (!bucket) return;
    for (const handler of Array.from(bucket)) {
      (handler as EventHandler<K>)(payload);
    }
  }
}

export const eventBus = new TypedEventBus();
