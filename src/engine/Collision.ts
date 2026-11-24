import { TILE_SIZE } from '../data/maps';
import type {
  FacingDirection,
  InteractTarget,
  MapActor,
  MapData,
  Vec2,
} from '../types';

// Player foot collider anchored slightly lower inside the 16x16 sprite for classic 2.5D RPG feel
const PLAYER_HALF_W = 5;
const PLAYER_HALF_H = 4;
const PLAYER_FOOT_OFFSET_Y = 3;

const ACTOR_HALF_W = 5;
const ACTOR_HALF_H = 4;
const ACTOR_FOOT_OFFSET_Y = 3;

// Forgiving interaction thresholds per AGENTS_TS.md
const FORWARD_CHECK_DISTANCE = 20;
const FORWARD_CHECK_RADIUS = 16;
const PROXIMITY_FALLBACK_RADIUS = 24;

export function isTileSolid(map: MapData, col: number, row: number): boolean {
  if (row < 0 || row >= map.rows || col < 0 || col >= map.cols) {
    return true;
  }
  const tile = map.tiles[row][col];
  return tile === 'wall' || tile === 'clutter' || tile === 'water';
}

export function isActorVisible(
  actor: MapActor,
  revealedIds: readonly string[],
  storyFlags?: Readonly<Record<string, boolean | string | number>>
): boolean {
  if (actor.hideWhenFlag && storyFlags && Boolean(storyFlags[actor.hideWhenFlag])) {
    return false;
  }
  if (!actor.revealable?.startsHidden) return true;
  return revealedIds.includes(actor.revealable.revealableId);
}

function collidesAt(
  map: MapData,
  x: number,
  y: number,
  solidActors: readonly MapActor[]
): boolean {
  const left = x - PLAYER_HALF_W;
  const right = x + PLAYER_HALF_W;
  const top = y + PLAYER_FOOT_OFFSET_Y - PLAYER_HALF_H;
  const bottom = y + PLAYER_FOOT_OFFSET_Y + PLAYER_HALF_H;

  const minCol = Math.floor(left / TILE_SIZE);
  const maxCol = Math.floor((right - 0.001) / TILE_SIZE);
  const minRow = Math.floor(top / TILE_SIZE);
  const maxRow = Math.floor((bottom - 0.001) / TILE_SIZE);

  for (let row = minRow; row <= maxRow; row += 1) {
    for (let col = minCol; col <= maxCol; col += 1) {
      if (isTileSolid(map, col, row)) {
        return true;
      }
    }
  }

  for (const actor of solidActors) {
    const aLeft = actor.x - ACTOR_HALF_W;
    const aRight = actor.x + ACTOR_HALF_W;
    const aTop = actor.y + ACTOR_FOOT_OFFSET_Y - ACTOR_HALF_H;
    const aBottom = actor.y + ACTOR_FOOT_OFFSET_Y + ACTOR_HALF_H;

    if (left < aRight && right > aLeft && top < aBottom && bottom > aTop) {
      return true;
    }
  }

  return false;
}

/**
 * Axis-separated AABB collision resolution allowing smooth sliding along walls and props.
 */
export function moveWithCollision(
  map: MapData,
  pos: Vec2,
  dx: number,
  dy: number,
  solidActors: readonly MapActor[]
): Vec2 {
  let nextX = pos.x;
  let nextY = pos.y;

  if (dx !== 0) {
    const candidateX = nextX + dx;
    if (!collidesAt(map, candidateX, nextY, solidActors)) {
      nextX = candidateX;
    }
  }

  if (dy !== 0) {
    const candidateY = nextY + dy;
    if (!collidesAt(map, nextX, candidateY, solidActors)) {
      nextY = candidateY;
    }
  }

  return { x: nextX, y: nextY };
}

function facingVector(facing: FacingDirection): Vec2 {
  switch (facing) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
}

/**
 * Dual-check forgiving interaction resolver:
 * 1) 20px forward facing probe (radius 16px)
 * 2) 24px proximity radius fallback around Yelena
 */
export function findInteractTarget(
  map: MapData,
  playerPos: Vec2,
  facing: FacingDirection,
  revealedIds: readonly string[],
  storyFlags: Readonly<Record<string, boolean | string | number>>
): InteractTarget | null {
  const dir = facingVector(facing);
  const probeX = playerPos.x + dir.x * FORWARD_CHECK_DISTANCE;
  const probeY = playerPos.y + dir.y * FORWARD_CHECK_DISTANCE;

  let bestTarget: InteractTarget | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  const evaluateCandidate = (target: InteractTarget): void => {
    const distToPlayer = Math.hypot(
      target.x - playerPos.x,
      target.y - playerPos.y
    );
    const distToProbe = Math.hypot(target.x - probeX, target.y - probeY);

    const hitsForward = distToProbe <= FORWARD_CHECK_RADIUS;
    const hitsProximity = distToPlayer <= PROXIMITY_FALLBACK_RADIUS;

    if (!hitsForward && !hitsProximity) return;

    // Prefer targets in the player's facing direction when multiple overlap
    const score = hitsForward ? distToProbe * 0.75 : distToPlayer + 8;
    if (score < bestScore) {
      bestScore = score;
      bestTarget = target;
    }
  };

  for (const actor of map.actors) {
    if (!isActorVisible(actor, revealedIds)) continue;
    evaluateCandidate({
      type: 'actor',
      id: actor.id,
      label: actor.displayName,
      accentColor: actor.colorHex,
      x: actor.x,
      y: actor.y,
      actor,
    });
  }

  for (const transition of map.transitions) {
    const isUnlocked =
      !transition.requiredFlag || Boolean(storyFlags[transition.requiredFlag]);
    evaluateCandidate({
      type: 'transition',
      id: transition.id,
      label: transition.label,
      accentColor: isUnlocked ? '#38bdf8' : '#f87171',
      x: transition.x,
      y: transition.y,
      transition,
    });
  }

  return bestTarget;
}
