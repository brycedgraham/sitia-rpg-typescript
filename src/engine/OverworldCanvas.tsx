import { useEffect, useRef } from 'react';
import { eventBus } from '../core/EventBus';
import { fieldMagicController } from '../core/FieldMagicController';
import { gameState } from '../core/GameState';
import { soundFx } from '../core/SoundFx';
import { MAPS_BY_ID } from '../data/maps';
import type {
  FacingDirection,
  InteractTarget,
  PsynergyPulseVfx,
  Vec2,
} from '../types';
import {
  findInteractTarget,
  isActorVisible,
  moveWithCollision,
} from './Collision';
import { GameLoop } from './GameLoop';
import { InputManager } from './InputManager';
import {
  computeClampedCamera,
  renderOverworld,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
} from './Renderer';

const PLAYER_SPEED_PX_PER_SEC = 76;
const WALK_ANIM_INTERVAL = 0.16;
const CAMERA_SMOOTH_LERP = 0.14;
const SP_REGEN_INTERVAL_SEC = 5.5;

let toastSequence = 1;

function dispatchTargetInteraction(target: InteractTarget): void {
  const snapshot = gameState.getSnapshot();

  if (target.type === 'transition') {
    const { transition } = target;
    const isUnlocked =
      !transition.requiredFlag ||
      Boolean(snapshot.storyFlags[transition.requiredFlag]);

    if (!isUnlocked) {
      soundFx.playLocked();
      eventBus.emit('interactionFeedback', {
        id: (toastSequence += 1),
        title: transition.label,
        subtitle: 'Sealed Passage',
        message:
          transition.lockedMessage ??
          'The passage is locked. Investigate the chamber first.',
        accentColor: '#f87171',
        eventTag: 'Transition Locked',
      });
      return;
    }

    const destinationMap = MAPS_BY_ID[transition.targetMapId];
    if (!destinationMap) {
      soundFx.playInteract();
      eventBus.emit('mapTransitionRequested', {
        targetMapId: transition.targetMapId,
        spawnId: transition.targetSpawnId,
        transitionId: transition.id,
      });
      eventBus.emit('interactionFeedback', {
        id: (toastSequence += 1),
        title: transition.label,
        subtitle: 'Passage Unlatched',
        message:
          'The concealed masonry slides aside, opening the way toward Castle Secret Tunnels (arriving in Phase 4).',
        accentColor: '#38bdf8',
        eventTag: 'Map Transition Ready',
      });
      return;
    }

    soundFx.playInteract();
    eventBus.emit('mapTransitionRequested', {
      targetMapId: transition.targetMapId,
      spawnId: transition.targetSpawnId,
      transitionId: transition.id,
    });
    gameState.transitionToMap(
      destinationMap.mapId,
      transition.targetSpawnId,
      destinationMap.act
    );
    return;
  }

  const { actor } = target;

  if (actor.kind === 'quest_item' && actor.tastingPoisonId) {
    soundFx.playQuestInspect();
    if (
      actor.tastingPoisonId === 'my_love' &&
      snapshot.storyFlags.banquet_poison_resolved
    ) {
      eventBus.emit('interactionFeedback', {
        id: (toastSequence += 1),
        title: actor.displayName,
        subtitle: 'Already Identified · My Love',
        message:
          'You have already unmasked My Love in the Sitian Cognac. Cast Source-Sense [Tab → Q] near the north-west wall to reveal the tunnel switch.',
        accentColor: '#34d399',
        eventTag: 'Deduction Complete',
      });
      return;
    }

    eventBus.emit('poisonDeductionStarted', {
      poisonId: actor.tastingPoisonId,
      actorId: actor.id,
    });
    return;
  }

  if (actor.healable && snapshot.healedIds.includes(actor.healable.healableId)) {
    soundFx.playHeal();
    eventBus.emit('interactionFeedback', {
      id: (toastSequence += 1),
      title: actor.healable.healedName,
      subtitle: 'Restored by Healing Hands',
      message: actor.healable.healedMessage,
      accentColor: '#34d399',
      eventTag: 'Sitian Flora',
    });
    return;
  }

  const resolvedDialogueId =
    actor.postFlagDialogue && snapshot.storyFlags[actor.postFlagDialogue.flag]
      ? actor.postFlagDialogue.dialogueId
      : actor.dialogueId;

  if (resolvedDialogueId) {
    soundFx.playInteract();
    eventBus.emit('dialogueStarted', {
      dialogueId: resolvedDialogueId,
      actorId: actor.id,
      speakerName: actor.displayName,
      hasMindSpeak: Boolean(actor.mindSpeak),
    });
    return;
  }

  if (actor.kind === 'revealable_switch') {
    soundFx.playQuestInspect();
    gameState.setStoryFlag('secret_tunnel_unlocked', true);
    eventBus.emit('interactionFeedback', {
      id: (toastSequence += 1),
      title: actor.displayName,
      subtitle: 'Secret Mechanism Activated',
      message:
        actor.previewText ??
        'A muted click echoes through the masonry. The tunnel panel is unlocked.',
      accentColor: actor.colorHex,
      eventTag: 'Switch Triggered',
    });
  }
}

export function OverworldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getActiveMap = () =>
      MAPS_BY_ID[gameState.getSnapshot().currentMapId] ??
      MAPS_BY_ID.commander_dining_hall;

    const resolveSpawn = () => {
      const snap = gameState.getSnapshot();
      const map = getActiveMap();
      return (
        map.spawns[snap.currentSpawnId] ??
        map.spawns.default ?? { x: 224, y: 228 }
      );
    };

    let lastLoadedNonce = gameState.getSnapshot().mapLoadNonce;
    let spawn = resolveSpawn();
    let playerPos: Vec2 = { x: spawn.x, y: spawn.y };
    let playerFacing: FacingDirection = 'up';
    let walkTimer = 0;
    let spRegenTimer = 0;
    let playerAnimFrame: 0 | 1 = 0;
    let camera: Vec2 = computeClampedCamera(getActiveMap(), playerPos, null, 1);
    let activeTarget: InteractTarget | null = null;
    let activePulses: PsynergyPulseVfx[] = [];

    const unsubscribePulse = eventBus.on('psynergyPulseSpawned', (pulse) => {
      activePulses = [...activePulses, { ...pulse }];
    });

    const unsubscribeHudCast = eventBus.on('castPsynergyRequested', () => {
      fieldMagicController.tryCastActivePsynergy(playerPos, getActiveMap());
    });

    const input = new InputManager();
    input.attach();

    const loop = new GameLoop(
      (dt) => {
        const snapshot = gameState.getSnapshot();
        const map = getActiveMap();

        // Sync respawn whenever a new map or Title Screen preset loads
        if (snapshot.mapLoadNonce !== lastLoadedNonce) {
          lastLoadedNonce = snapshot.mapLoadNonce;
          spawn = resolveSpawn();
          playerPos = { x: spawn.x, y: spawn.y };
          playerFacing =
            snapshot.currentSpawnId === 'from_border' ||
            snapshot.currentSpawnId === 'from_outskirts' ||
            snapshot.currentSpawnId === 'from_tunnels'
              ? 'down'
              : snapshot.currentSpawnId === 'from_dining_hall'
                ? 'right'
                : 'up';
          camera = computeClampedCamera(map, playerPos, null, 1);
          activePulses = [];
          activeTarget = null;
          input.clearQueuedActions();
        }

        // Advance expanding Field Psynergy pulse animations even while dialogue opens
        if (activePulses.length > 0) {
          activePulses = activePulses
            .map((p) => ({ ...p, elapsedSeconds: p.elapsedSeconds + dt }))
            .filter((p) => p.elapsedSeconds < p.durationSeconds);
        }

        if (snapshot.inputLocked) {
          input.clearQueuedActions();
          return;
        }

        // Gentle Golden Sun-style overworld SP recovery so exploration never soft-locks
        if (snapshot.currentSourcePoints < snapshot.maxSourcePoints) {
          spRegenTimer += dt;
          if (spRegenTimer >= SP_REGEN_INTERVAL_SEC) {
            spRegenTimer -= SP_REGEN_INTERVAL_SEC;
            gameState.restoreSourcePoints(1);
          }
        } else {
          spRegenTimer = 0;
        }

        // Handle Psynergy cycling (Tab)
        if (input.consumeAction('cyclePsynergy')) {
          fieldMagicController.cycleActiveAbility();
        }

        // Handle Field Psynergy casting (Q)
        if (input.consumeAction('castPsynergy')) {
          fieldMagicController.tryCastActivePsynergy(playerPos, map);
        }

        // 8-Directional Movement + Axis-Separated AABB Collision
        const move = input.getMoveVector();
        const isMoving = move.x !== 0 || move.y !== 0;

        if (isMoving) {
          if (Math.abs(move.x) > Math.abs(move.y)) {
            playerFacing = move.x < 0 ? 'left' : 'right';
          } else {
            playerFacing = move.y < 0 ? 'up' : 'down';
          }

          const solidActors = map.actors.filter(
            (actor) =>
              actor.solid &&
              isActorVisible(actor, snapshot.revealedIds, snapshot.storyFlags)
          );

          playerPos = moveWithCollision(
            map,
            playerPos,
            move.x * PLAYER_SPEED_PX_PER_SEC * dt,
            move.y * PLAYER_SPEED_PX_PER_SEC * dt,
            solidActors
          );

          walkTimer += dt;
          if (walkTimer >= WALK_ANIM_INTERVAL) {
            walkTimer -= WALK_ANIM_INTERVAL;
            playerAnimFrame = playerAnimFrame === 0 ? 1 : 0;
          }
        } else {
          walkTimer = 0;
          playerAnimFrame = 0;
        }

        // Smooth Clamped Camera Follow
        camera = computeClampedCamera(
          map,
          playerPos,
          camera,
          CAMERA_SMOOTH_LERP
        );

        // Forgiving Interaction Check (20px Forward + 24px Proximity Fallback)
        activeTarget = findInteractTarget(
          map,
          playerPos,
          playerFacing,
          snapshot.revealedIds,
          snapshot.storyFlags
        );

        gameState.setNearbyTarget(
          activeTarget
            ? {
                id: activeTarget.id,
                label: activeTarget.label,
                kind:
                  activeTarget.type === 'transition'
                    ? 'transition'
                    : activeTarget.actor.kind,
                accentColor: activeTarget.accentColor,
              }
            : null
        );

        // Interact Action (E / Space / Enter)
        if (input.consumeAction('interact') && activeTarget) {
          dispatchTargetInteraction(activeTarget);
        }
      },
      (elapsedSeconds) => {
        const snapshot = gameState.getSnapshot();
        const map = getActiveMap();

        renderOverworld(ctx, {
          map,
          playerPos,
          playerFacing,
          playerAnimFrame,
          camera,
          revealedIds: snapshot.revealedIds,
          healedIds: snapshot.healedIds,
          storyFlags: snapshot.storyFlags,
          activeTarget,
          activePulses,
          inWithdrawal: gameState.isInWithdrawal(),
          elapsedSeconds,
        });
      }
    );

    loop.start();

    return () => {
      loop.stop();
      input.detach();
      unsubscribePulse();
      unsubscribeHudCast();
      gameState.setNearbyTarget(null);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#0b0d11] overflow-hidden [container-type:size]">
      {/* Crisp 16:9 Letterboxed Viewport */}
      <div className="relative w-[min(100cqw,calc(100cqh*16/9))] h-[min(100cqh,calc(100cqw*9/16))] flex items-center justify-center shadow-[0_0_64px_rgba(0,0,0,0.8)] ring-1 ring-slate-800/80">
        <canvas
          ref={canvasRef}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          aria-label="Chronicles of Ixia Overworld Viewport"
          className="pixelated block h-full w-full bg-[#0b0d11]"
        />
      </div>
    </div>
  );
}
