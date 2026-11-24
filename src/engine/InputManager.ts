import type { Vec2 } from '../types';

export type EdgeAction = 'interact' | 'castPsynergy' | 'cyclePsynergy';

const PREVENT_DEFAULT_CODES = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
  'Tab',
]);

export class InputManager {
  private heldCodes = new Set<string>();
  private queuedActions = new Set<EdgeAction>();
  private attached = false;

  attach(): void {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  detach(): void {
    if (!this.attached) return;
    this.attached = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.heldCodes.clear();
    this.queuedActions.clear();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (PREVENT_DEFAULT_CODES.has(event.code)) {
      event.preventDefault();
    }

    if (!event.repeat) {
      if (
        event.code === 'KeyE' ||
        event.code === 'Space' ||
        event.code === 'Enter'
      ) {
        this.queuedActions.add('interact');
      } else if (event.code === 'KeyQ') {
        this.queuedActions.add('castPsynergy');
      } else if (event.code === 'Tab') {
        this.queuedActions.add('cyclePsynergy');
      }
    }

    this.heldCodes.add(event.code);
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.heldCodes.delete(event.code);
  };

  private handleBlur = (): void => {
    this.heldCodes.clear();
    this.queuedActions.clear();
  };

  clearQueuedActions(): void {
    this.queuedActions.clear();
  }

  consumeAction(action: EdgeAction): boolean {
    if (!this.queuedActions.has(action)) return false;
    this.queuedActions.delete(action);
    return true;
  }

  getMoveVector(): Vec2 {
    let x = 0;
    let y = 0;

    if (this.heldCodes.has('KeyA') || this.heldCodes.has('ArrowLeft')) x -= 1;
    if (this.heldCodes.has('KeyD') || this.heldCodes.has('ArrowRight')) x += 1;
    if (this.heldCodes.has('KeyW') || this.heldCodes.has('ArrowUp')) y -= 1;
    if (this.heldCodes.has('KeyS') || this.heldCodes.has('ArrowDown')) y += 1;

    if (x !== 0 && y !== 0) {
      const invLen = Math.SQRT1_2;
      x *= invLen;
      y *= invLen;
    }

    return { x, y };
  }
}
