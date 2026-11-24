import { TILE_SIZE } from '../data/maps';
import type {
  FacingDirection,
  InteractTarget,
  MapActor,
  MapData,
  PsynergyPulseVfx,
  Vec2,
} from '../types';
import { isActorVisible } from './Collision';
import { getSpriteAtlas, type TileSpriteKey } from './SpriteAtlas';

export const VIEWPORT_WIDTH = 384;
export const VIEWPORT_HEIGHT = 216;

export interface RenderState {
  map: MapData;
  playerPos: Vec2;
  playerFacing: FacingDirection;
  playerAnimFrame: 0 | 1;
  camera: Vec2;
  revealedIds: readonly string[];
  healedIds: readonly string[];
  storyFlags: Readonly<Record<string, boolean | string | number>>;
  activeTarget: InteractTarget | null;
  activePulses: readonly PsynergyPulseVfx[];
  inWithdrawal: boolean;
  elapsedSeconds: number;
}

function isInCarpet(map: MapData, col: number, row: number): {
  inside: boolean;
  isEdge: boolean;
} {
  if (!map.carpets) return { inside: false, isEdge: false };
  for (const rect of map.carpets) {
    if (
      col >= rect.colStart &&
      col <= rect.colEnd &&
      row >= rect.rowStart &&
      row <= rect.rowEnd
    ) {
      const isEdge =
        row === rect.rowStart ||
        row === rect.rowEnd ||
        col === rect.colStart ||
        col === rect.colEnd;
      return { inside: true, isEdge };
    }
  }
  return { inside: false, isEdge: false };
}

function resolveTableTile(map: MapData, col: number, row: number): TileSpriteKey {
  const leftClutter = map.tiles[row]?.[col - 1] === 'clutter';
  const rightClutter = map.tiles[row]?.[col + 1] === 'clutter';
  const upClutter = map.tiles[row - 1]?.[col] === 'clutter';

  if (!upClutter) {
    if (!leftClutter) return 'table_top_left';
    if (!rightClutter) return 'table_top_right';
    return 'table_top_mid';
  }
  if (!leftClutter) return 'table_bot_left';
  if (!rightClutter) return 'table_bot_right';
  return 'table_bot_mid';
}

function drawNameplate(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  baselineY: number,
  text: string,
  accentColor: string,
  isHighlighted: boolean
): void {
  ctx.save();
  ctx.font = '600 6.5px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textWidth = Math.ceil(ctx.measureText(text).width);
  const padX = 4;
  const boxW = textWidth + padX * 2;
  const boxH = 10;
  const boxX = Math.round(centerX - boxW / 2);
  const boxY = Math.round(baselineY - boxH / 2);

  ctx.fillStyle = isHighlighted
    ? 'rgba(15, 23, 42, 0.95)'
    : 'rgba(11, 13, 17, 0.84)';
  ctx.fillRect(boxX, boxY, boxW, boxH);

  ctx.strokeStyle = isHighlighted ? accentColor : 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);

  ctx.fillStyle = isHighlighted ? '#f8fafc' : '#cbd5e1';
  ctx.fillText(text, Math.round(centerX), Math.round(baselineY + 0.5));
  ctx.restore();
}

function drawSignifierDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colorHex: string,
  bobOffset: number
): void {
  const cx = Math.round(x);
  const cy = Math.round(y + bobOffset);

  ctx.fillStyle = '#0b0d11';
  ctx.fillRect(cx - 2, cy - 2, 5, 5);

  ctx.fillStyle = colorHex;
  ctx.fillRect(cx - 1, cy - 1, 3, 3);
  ctx.fillRect(cx, cy - 2, 1, 5);
  ctx.fillRect(cx - 2, cy, 5, 1);
}

function drawPromptBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accentColor: string,
  elapsedSeconds: number
): void {
  const bob = Math.round(Math.sin(elapsedSeconds * 5) * 1.5);
  const cx = Math.round(x);
  const cy = Math.round(y + bob);

  const w = 14;
  const h = 11;
  const bx = cx - Math.floor(w / 2);
  const by = cy - Math.floor(h / 2);

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
  ctx.fillRect(bx, by, w, h);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 0.5, w - 1, h - 1);

  ctx.font = '700 7px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('E', cx, cy + 0.5);
  ctx.restore();
}

function drawPsynergyPulses(
  ctx: CanvasRenderingContext2D,
  pulses: readonly PsynergyPulseVfx[]
): void {
  for (const pulse of pulses) {
    const t = Math.min(1, pulse.elapsedSeconds / pulse.durationSeconds);
    // Ease-out expansion curve
    const eased = 1 - Math.pow(1 - t, 3);
    const radius = Math.max(4, pulse.maxRadius * eased);
    const alpha = Math.max(0, 1 - t);

    ctx.save();
    ctx.globalAlpha = alpha * 0.22;
    ctx.fillStyle = pulse.colorHex;
    ctx.beginPath();
    ctx.arc(pulse.originX, pulse.originY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Primary crisp expanding Source ring
    ctx.globalAlpha = Math.min(1, alpha * 1.15);
    ctx.strokeStyle = pulse.colorHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pulse.originX, pulse.originY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary trailing harmonic ripple
    if (radius > 10) {
      ctx.globalAlpha = alpha * 0.6;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pulse.originX, pulse.originY, radius * 0.72, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

export function computeClampedCamera(
  map: MapData,
  targetPos: Vec2,
  currentCam: Vec2 | null,
  lerpFactor: number
): Vec2 {
  const worldW = map.cols * TILE_SIZE;
  const worldH = map.rows * TILE_SIZE;

  const desiredX =
    worldW <= VIEWPORT_WIDTH
      ? -(VIEWPORT_WIDTH - worldW) / 2
      : Math.max(
          0,
          Math.min(worldW - VIEWPORT_WIDTH, targetPos.x - VIEWPORT_WIDTH / 2)
        );

  const desiredY =
    worldH <= VIEWPORT_HEIGHT
      ? -(VIEWPORT_HEIGHT - worldH) / 2
      : Math.max(
          0,
          Math.min(worldH - VIEWPORT_HEIGHT, targetPos.y - VIEWPORT_HEIGHT / 2)
        );

  if (!currentCam) {
    return { x: desiredX, y: desiredY };
  }

  return {
    x: currentCam.x + (desiredX - currentCam.x) * lerpFactor,
    y: currentCam.y + (desiredY - currentCam.y) * lerpFactor,
  };
}

export function renderOverworld(
  ctx: CanvasRenderingContext2D,
  state: RenderState
): void {
  const atlas = getSpriteAtlas();
  const { map, playerPos, playerFacing, playerAnimFrame, elapsedSeconds } = state;
  const isSitia = map.act === 'Act1_Sitia';

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = isSitia ? '#0c1f16' : '#0b0d11';
  ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

  const camX = Math.round(state.camera.x);
  const camY = Math.round(state.camera.y);

  ctx.save();
  ctx.translate(-camX, -camY);

  // 1. Tilemap Layer
  const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
  const endCol = Math.min(
    map.cols - 1,
    Math.ceil((camX + VIEWPORT_WIDTH) / TILE_SIZE)
  );
  const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
  const endRow = Math.min(
    map.rows - 1,
    Math.ceil((camY + VIEWPORT_HEIGHT) / TILE_SIZE)
  );

  const torchPositions: Vec2[] = [];

  for (let r = startRow; r <= endRow; r += 1) {
    for (let c = startCol; c <= endCol; c += 1) {
      const tile = map.tiles[r][c];
      const px = c * TILE_SIZE;
      const py = r * TILE_SIZE;

      if (tile === 'wall') {
        const isInteriorObstacle =
          r > 0 && r < map.rows - 1 && c > 0 && c < map.cols - 1;

        if (isSitia) {
          ctx.drawImage(
            isInteriorObstacle
              ? atlas.tiles.sitia_stone_well
              : atlas.tiles.sitia_hedge_wall,
            px,
            py
          );
        } else if (isInteriorObstacle) {
          ctx.drawImage(atlas.tiles.wall_pillar, px, py);
        } else if (r === 0 && (c === 6 || c === 14 || c === 21)) {
          ctx.drawImage(atlas.tiles.wall_torch, px, py);
          torchPositions.push({ x: px + 8, y: py + 10 });
        } else if (r === 0) {
          ctx.drawImage(atlas.tiles.wall_face, px, py);
        } else {
          ctx.drawImage(atlas.tiles.wall_top, px, py);
        }
      } else {
        const floorTile = isSitia
          ? (r + c) % 2 === 0
            ? atlas.tiles.sitia_floor_a
            : atlas.tiles.sitia_floor_b
          : (r + c) % 2 === 0
            ? atlas.tiles.floor_a
            : atlas.tiles.floor_b;
        ctx.drawImage(floorTile, px, py);

        const carpet = isInCarpet(map, c, r);
        if (carpet.inside) {
          if (isSitia) {
            ctx.drawImage(
              carpet.isEdge
                ? atlas.tiles.sitia_plaza_edge
                : atlas.tiles.sitia_plaza_mid,
              px,
              py
            );
          } else {
            ctx.drawImage(
              carpet.isEdge
                ? atlas.tiles.carpet_edge
                : atlas.tiles.carpet_mid,
              px,
              py
            );
          }
        }

        if (tile === 'clutter') {
          if (isSitia) {
            ctx.drawImage(atlas.tiles.sitia_stall, px, py);
          } else {
            const tableKey = resolveTableTile(map, c, r);
            ctx.drawImage(atlas.tiles[tableKey], px, py);
          }
        }
      }
    }
  }

  // Subtle warm torchlight pools along Castle Ixia's north wall
  if (!isSitia) {
    const flicker = 0.08 + Math.sin(elapsedSeconds * 6.5) * 0.015;
    for (const torch of torchPositions) {
      const grad = ctx.createRadialGradient(
        torch.x,
        torch.y + 8,
        2,
        torch.x,
        torch.y + 8,
        36
      );
      grad.addColorStop(0, `rgba(251, 191, 36, ${flicker.toFixed(3)})`);
      grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(torch.x - 36, torch.y - 28, 72, 72);
    }
  }

  // 2. Interior Exit Transition Mats
  for (const transition of map.transitions) {
    const isUnlocked =
      !transition.requiredFlag ||
      Boolean(state.storyFlags[transition.requiredFlag]);
    const matTile = isUnlocked
      ? atlas.tiles.exit_open
      : atlas.tiles.exit_locked;
    const drawX = Math.round(transition.x - TILE_SIZE / 2);
    const drawY = Math.round(transition.y - TILE_SIZE / 2);
    ctx.drawImage(matTile, drawX, drawY);

    const isHighlighted =
      state.activeTarget?.type === 'transition' &&
      state.activeTarget.id === transition.id;
    const accent = isUnlocked ? '#38bdf8' : '#f87171';

    if (isHighlighted) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(drawX + 0.5, drawY + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
    }

    const nameplateY =
      transition.y > map.rows * TILE_SIZE - 34
        ? drawY - 7
        : drawY + TILE_SIZE + 7;

    drawNameplate(
      ctx,
      transition.x,
      nameplateY,
      transition.label,
      accent,
      isHighlighted
    );
  }

  // 3. Expanding Field Psynergy Pulse Waves (drawn over floor, beneath sprites for crisp clarity)
  if (state.activePulses.length > 0) {
    drawPsynergyPulses(ctx, state.activePulses);
  }

  // 4. Y-Sorted Entities (Visible Actors + Player)
  interface DrawableEntity {
    sortY: number;
    draw: () => void;
  }

  const visibleActors: MapActor[] = map.actors.filter((actor) =>
    isActorVisible(actor, state.revealedIds, state.storyFlags)
  );

  const drawables: DrawableEntity[] = [];

  for (const actor of visibleActors) {
    const isHealedFlora = Boolean(
      actor.healable && state.healedIds.includes(actor.healable.healableId)
    );

    drawables.push({
      sortY: actor.y,
      draw: () => {
        const ax = Math.round(actor.x - TILE_SIZE / 2);
        const ay = Math.round(actor.y - TILE_SIZE / 2);

        if (actor.kind === 'npc') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(ax + 3, ay + 13, 10, 3);
        } else if (actor.kind === 'quest_item') {
          const glowAlpha = 0.22 + Math.sin(elapsedSeconds * 4) * 0.08;
          ctx.fillStyle = isHealedFlora
            ? `rgba(52, 211, 153, ${(glowAlpha + 0.12).toFixed(2)})`
            : `rgba(251, 191, 36, ${glowAlpha.toFixed(2)})`;
          ctx.fillRect(ax + 1, ay + 2, 14, 13);
        } else if (actor.kind === 'revealable_switch') {
          const pulseAlpha = 0.24 + Math.sin(elapsedSeconds * 5.2) * 0.12;
          ctx.fillStyle = `rgba(192, 132, 252, ${pulseAlpha.toFixed(2)})`;
          ctx.fillRect(ax + 1, ay + 1, 14, 14);
        }

        if (isHealedFlora) {
          ctx.drawImage(atlas.healedMoonbloom, ax, ay);
        } else if (actor.sprite !== 'yelena') {
          ctx.drawImage(atlas.actors[actor.sprite], ax, ay);
        }
      },
    });
  }

  drawables.push({
    sortY: playerPos.y,
    draw: () => {
      const px = Math.round(playerPos.x - TILE_SIZE / 2);
      const py = Math.round(playerPos.y - TILE_SIZE / 2);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(px + 3, py + 13, 10, 3);

      const sprite = atlas.yelena[playerFacing][playerAnimFrame];
      ctx.drawImage(sprite, px, py);
    },
  });

  drawables.sort((a, b) => a.sortY - b.sortY);
  for (const item of drawables) {
    item.draw();
  }

  // 5. Universal Color-Coded Signifiers & Centered Nameplates
  const signifierBob = Math.sin(elapsedSeconds * 3.2) * 1.1;

  for (const actor of visibleActors) {
    const isHighlighted =
      state.activeTarget?.type === 'actor' && state.activeTarget.id === actor.id;
    const isHealedFlora = Boolean(
      actor.healable && state.healedIds.includes(actor.healable.healableId)
    );
    const label = isHealedFlora
      ? actor.healable!.healedName
      : actor.displayName;
    const headY = actor.y - 10;

    drawSignifierDiamond(ctx, actor.x, headY - 4, actor.colorHex, signifierBob);
    drawNameplate(
      ctx,
      actor.x,
      actor.y + 13,
      label,
      actor.colorHex,
      isHighlighted
    );
  }

  // 6. Floating [E] Prompt Badge on Active Interact Target
  if (state.activeTarget) {
    const promptY =
      state.activeTarget.type === 'transition'
        ? state.activeTarget.y - 14
        : state.activeTarget.y - 23;
    drawPromptBadge(
      ctx,
      state.activeTarget.x,
      promptY,
      state.activeTarget.accentColor,
      elapsedSeconds
    );
  }

  ctx.restore();

  // 7. Subtle Atmospheric Vignette or Pulsing Dungeon Withdrawal Vignette
  const vignette = ctx.createRadialGradient(
    VIEWPORT_WIDTH / 2,
    VIEWPORT_HEIGHT / 2,
    state.inWithdrawal ? VIEWPORT_HEIGHT * 0.26 : VIEWPORT_HEIGHT * 0.44,
    VIEWPORT_WIDTH / 2,
    VIEWPORT_HEIGHT / 2,
    VIEWPORT_WIDTH * 0.68
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  if (state.inWithdrawal) {
    const pulse = 0.48 + Math.sin(elapsedSeconds * 4.5) * 0.14;
    vignette.addColorStop(1, `rgba(88, 28, 135, ${pulse.toFixed(3)})`);
  } else {
    vignette.addColorStop(
      1,
      isSitia ? 'rgba(6, 28, 18, 0.24)' : 'rgba(6, 9, 14, 0.36)'
    );
  }
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
}
