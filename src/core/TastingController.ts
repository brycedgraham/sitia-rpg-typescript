import { useSyncExternalStore } from 'react';
import { POISONS } from '../data/poisons';
import type { PoisonData, TastingAction, TastingState } from '../types';
import { eventBus } from './EventBus';
import { gameState } from './GameState';
import { soundFx } from './SoundFx';

export interface TastingSnapshot extends TastingState {
  targetPoison: PoisonData | null;
  feedbackMessage: string | null;
}

const INITIAL_STATE: TastingSnapshot = {
  active: false,
  targetPoisonId: null,
  targetPoison: null,
  remainingAp: 3,
  maxAp: 3,
  revealedActions: [],
  selectedGuessId: null,
  result: 'pending',
  feedbackMessage: null,
};

type Listener = () => void;

class TastingController {
  private state: TastingSnapshot = { ...INITIAL_STATE };
  private listeners = new Set<Listener>();

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): TastingSnapshot => this.state;

  private update(patch: Partial<TastingSnapshot>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) {
      listener();
    }
  }

  startTasting(poisonId: string): void {
    const targetPoison = POISONS[poisonId] ?? POISONS.my_love;
    if (!targetPoison) return;

    gameState.setInputLocked(true);
    this.update({
      active: true,
      targetPoisonId: targetPoison.poisonId,
      targetPoison,
      remainingAp: 3,
      maxAp: 3,
      revealedActions: [],
      selectedGuessId: null,
      result: 'pending',
      feedbackMessage:
        'Spend up to 3 Action Points to gather sensory clues, then cross-reference the Taster’s Compendium to identify the toxin.',
    });
  }

  performAction(action: TastingAction): void {
    if (!this.state.active || this.state.result !== 'pending') return;
    if (this.state.revealedActions.includes(action)) return;
    if (this.state.remainingAp <= 0) {
      soundFx.playLocked();
      return;
    }

    const nextRevealed = [...this.state.revealedActions, action];
    const nextAp = Math.max(0, this.state.remainingAp - 1);

    soundFx.playQuestInspect();

    const actionLabels: Record<TastingAction, string> = {
      smell: 'Aroma recorded from the rim of the glass.',
      inspect: 'Visual consistency and sediment noted.',
      dab: 'Skin and lip-touch reaction logged.',
      taste: 'Palate test complete — sharp sensation catalogued.',
    };

    this.update({
      remainingAp: nextAp,
      revealedActions: nextRevealed,
      feedbackMessage: actionLabels[action],
    });
  }

  selectGuess(poisonId: string): void {
    if (!this.state.active || this.state.result === 'success') return;
    soundFx.playDialogueAdvance();
    this.update({
      selectedGuessId: poisonId,
      result: this.state.result === 'failure' ? 'pending' : this.state.result,
    });
  }

  submitIdentification(): boolean {
    if (!this.state.active || !this.state.targetPoisonId) return false;
    if (!this.state.selectedGuessId) {
      soundFx.playLocked();
      this.update({
        feedbackMessage:
          'Select a toxin from the Taster’s Compendium before confirming your deduction.',
      });
      return false;
    }

    const isCorrect = this.state.selectedGuessId === this.state.targetPoisonId;

    if (isCorrect) {
      soundFx.playSecretReveal();
      const target = this.state.targetPoison;
      if (this.state.targetPoisonId === 'my_love') {
        gameState.setStoryFlag('banquet_poison_resolved', true);
      }
      eventBus.emit('poisonDeductionCompleted', {
        poisonId: this.state.targetPoisonId,
        success: true,
      });
      this.update({
        result: 'success',
        feedbackMessage: `Deduction confirmed: ${target?.displayName ?? 'Unknown Toxin'}. You intercept the glass before Commander Ambrose drinks!`,
      });
      return true;
    }

    soundFx.playLocked();
    const guessed = POISONS[this.state.selectedGuessId];
    eventBus.emit('poisonDeductionCompleted', {
      poisonId: this.state.targetPoisonId,
      success: false,
    });
    this.update({
      result: 'failure',
      feedbackMessage: `${guessed?.displayName ?? 'That toxin'} does not match the observed sensory profile. Review the clues or restart your tasting.`,
    });
    return false;
  }

  retry(): void {
    if (!this.state.targetPoisonId) return;
    soundFx.playCyclePsynergy();
    this.startTasting(this.state.targetPoisonId);
  }

  close(): void {
    const resolvedMyLove =
      this.state.result === 'success' &&
      this.state.targetPoisonId === 'my_love';

    this.update({ ...INITIAL_STATE });
    gameState.setInputLocked(false);

    if (resolvedMyLove) {
      eventBus.emit('dialogueStarted', {
        dialogueId: 'act0_banquet_poison_solved',
        speakerName: 'Commander Ambrose',
      });
    }
  }
}

export const tastingController = new TastingController();

export function useTastingState(): TastingSnapshot {
  return useSyncExternalStore(
    tastingController.subscribe,
    tastingController.getSnapshot
  );
}
