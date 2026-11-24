import { FIELD_PSYNERGIES } from '../data/psynergy';
import type { MapActor, MapData, Vec2 } from '../types';
import { eventBus } from './EventBus';
import { gameState } from './GameState';
import { soundFx } from './SoundFx';

let pulseSequence = 1;
let feedbackSequence = 1000;

class FieldMagicController {
  cycleActiveAbility(): string {
    const nextId = gameState.cycleActivePsynergy();
    soundFx.playCyclePsynergy();
    return nextId;
  }

  tryCastActivePsynergy(playerPos: Vec2, map: MapData): boolean {
    const snapshot = gameState.getSnapshot();
    if (snapshot.inputLocked) return false;

    const ability = FIELD_PSYNERGIES[snapshot.activePsynergyId];
    if (!ability) return false;

    if (!gameState.spendSourcePoints(ability.sourceCost)) {
      soundFx.playLocked();
      eventBus.emit('interactionFeedback', {
        id: (feedbackSequence += 1),
        title: 'Insufficient Source Points',
        subtitle: `${ability.displayName} requires ${ability.sourceCost} SP`,
        message:
          'Your Source reserve is depleted. Walk or pause briefly to let your Sitian aura recover.',
        accentColor: '#f87171',
        eventTag: 'Low SP',
      });
      return false;
    }

    // Spawn expanding circular wave VFX on OverworldCanvas
    eventBus.emit('psynergyPulseSpawned', {
      id: (pulseSequence += 1),
      originX: playerPos.x,
      originY: playerPos.y,
      maxRadius: ability.effectRadiusPixels,
      colorHex: ability.pulseColorHex,
      elapsedSeconds: 0,
      durationSeconds: 0.65,
    });

    const radius = ability.effectRadiusPixels;

    if (ability.targetInteractionTag === 'MindReadable') {
      const candidates: Array<{ actor: MapActor; dist: number }> = [];

      for (const actor of map.actors) {
        if (!actor.mindSpeak) continue;
        if (
          actor.revealable?.startsHidden &&
          !snapshot.revealedIds.includes(actor.revealable.revealableId)
        ) {
          continue;
        }
        const dist = Math.hypot(actor.x - playerPos.x, actor.y - playerPos.y);
        if (dist <= radius) {
          candidates.push({ actor, dist });
        }
      }

      candidates.sort((a, b) => a.dist - b.dist);

      if (candidates.length > 0) {
        const chosen = candidates[0].actor;
        const mind = chosen.mindSpeak!;
        soundFx.playMindSpeak();
        eventBus.emit('mindSpeakTriggered', {
          dialogueId: mind.dialogueId,
          isLying: mind.isLying,
          actorName: chosen.displayName,
        });
        return true;
      }

      soundFx.playPsynergyPulse();
      eventBus.emit('interactionFeedback', {
        id: (feedbackSequence += 1),
        title: 'Mind-Speak',
        subtitle: `-${ability.sourceCost} SP · ${radius}px Pulse`,
        message:
          'Your awareness ripples outward, but no mind is close enough to read. Step closer to an NPC and cast again.',
        accentColor: ability.pulseColorHex,
        eventTag: 'Field Psynergy',
      });
      return true;
    }

    if (ability.targetInteractionTag === 'HiddenMagic') {
      const newlyRevealed: MapActor[] = [];
      let alreadyVisibleInRange = false;

      for (const actor of map.actors) {
        if (!actor.revealable) continue;
        const dist = Math.hypot(actor.x - playerPos.x, actor.y - playerPos.y);
        if (dist > radius) continue;

        const didReveal = gameState.revealObject(actor.revealable.revealableId);
        if (didReveal) {
          newlyRevealed.push(actor);
        } else {
          alreadyVisibleInRange = true;
        }
      }

      if (newlyRevealed.length > 0) {
        soundFx.playSecretReveal();
        const names = newlyRevealed.map((a) => a.displayName).join(', ');
        eventBus.emit('interactionFeedback', {
          id: (feedbackSequence += 1),
          title: 'Hidden Magic Revealed',
          subtitle: `${names} · -${ability.sourceCost} SP`,
          message:
            'A violet resonance outlines what the naked eye missed. Approach the revealed sigil and press [E] to interact.',
          accentColor: ability.pulseColorHex,
          eventTag: 'Source-Sense Discovery',
        });
        return true;
      }

      soundFx.playPsynergyPulse();
      eventBus.emit('interactionFeedback', {
        id: (feedbackSequence += 1),
        title: 'Source-Sense',
        subtitle: `-${ability.sourceCost} SP · ${radius}px Pulse`,
        message: alreadyVisibleInRange
          ? 'The concealed resonance here is already laid bare. Press [E] on the glowing sigil.'
          : 'No hidden magic answers nearby. Probe near suspicious stone panels or lingering trails.',
        accentColor: ability.pulseColorHex,
        eventTag: 'Field Psynergy',
      });
      return true;
    }

    if (ability.targetInteractionTag === 'HealTarget') {
      const healedActors: MapActor[] = [];
      for (const actor of map.actors) {
        if (!actor.healable) continue;
        const dist = Math.hypot(actor.x - playerPos.x, actor.y - playerPos.y);
        if (dist > radius) continue;
        if (gameState.markHealed(actor.healable.healableId)) {
          healedActors.push(actor);
        }
      }

      if (healedActors.length > 0) {
        soundFx.playSecretReveal();
        gameState.restoreSourcePoints(8);
        const first = healedActors[0].healable!;
        eventBus.emit('interactionFeedback', {
          id: (feedbackSequence += 1),
          title: `${first.healedName} Restored`,
          subtitle: 'Healing Hands · +8 SP Resonance',
          message: first.healedMessage,
          accentColor: ability.pulseColorHex,
          eventTag: 'Healing Hands',
        });
        return true;
      }

      soundFx.playHeal();
      eventBus.emit('interactionFeedback', {
        id: (feedbackSequence += 1),
        title: 'Healing Hands',
        subtitle: `-${ability.sourceCost} SP · ${radius}px Pulse`,
        message:
          'Warm emerald Source light steadies Yelena’s pulse and clears residual toxins.',
        accentColor: ability.pulseColorHex,
        eventTag: 'Field Psynergy',
      });
      return true;
    }

    soundFx.playPsynergyPulse();
    return true;
  }
}

export const fieldMagicController = new FieldMagicController();
