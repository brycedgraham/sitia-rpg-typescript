export const FIXED_TIMESTEP = 1 / 60;
const MAX_FRAME_DELTA = 0.05;

export class GameLoop {
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private accumulator = 0;
  private running = false;

  constructor(
    private readonly onUpdate: (dt: number) => void,
    private readonly onRender: (elapsedSeconds: number) => void
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (timestamp: number): void => {
    if (!this.running) return;

    const rawDelta = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    const clampedDelta = Math.min(Math.max(rawDelta, 0), MAX_FRAME_DELTA);
    this.accumulator += clampedDelta;

    while (this.accumulator >= FIXED_TIMESTEP) {
      this.onUpdate(FIXED_TIMESTEP);
      this.accumulator -= FIXED_TIMESTEP;
    }

    this.onRender(timestamp / 1000);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
