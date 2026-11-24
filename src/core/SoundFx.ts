class SoundFxManager {
  private ctx: AudioContext | null = null;
  private muted = false;

  isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType,
    volume: number,
    endFreq?: number,
    delaySec = 0
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const start = ctx.currentTime + delaySec;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (endFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          endFreq,
          start + durationSec
        );
      }
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + durationSec);
    } catch {
      // Ignore audio errors on restricted environments
    }
  }

  playInteract(): void {
    this.playTone(520, 0.08, 'triangle', 0.055, 660);
  }

  playDialogueAdvance(): void {
    this.playTone(460, 0.05, 'triangle', 0.04, 540);
  }

  playQuestInspect(): void {
    this.playTone(587.33, 0.1, 'sine', 0.055, 880);
  }

  playCyclePsynergy(): void {
    this.playTone(440, 0.085, 'sine', 0.045, 587.33);
  }

  playPsynergyPulse(): void {
    this.playTone(330, 0.22, 'sine', 0.06, 660);
    this.playTone(495, 0.2, 'triangle', 0.035, 990, 0.05);
  }

  playMindSpeak(): void {
    this.playTone(523.25, 0.16, 'sine', 0.05, 783.99);
    this.playTone(659.25, 0.22, 'sine', 0.045, 1046.5, 0.07);
  }

  playSecretReveal(): void {
    this.playTone(440, 0.12, 'triangle', 0.06, 554.37);
    this.playTone(554.37, 0.12, 'triangle', 0.06, 659.25, 0.09);
    this.playTone(659.25, 0.24, 'sine', 0.07, 880, 0.18);
  }

  playLocked(): void {
    this.playTone(170, 0.12, 'square', 0.035, 115);
  }

  playHit(): void {
    this.playTone(210, 0.09, 'sawtooth', 0.055, 75);
  }

  playBarrierDeflect(): void {
    this.playTone(740, 0.14, 'triangle', 0.05, 320);
    this.playTone(980, 0.12, 'sine', 0.04, 540, 0.04);
  }

  playPoisonApply(): void {
    this.playTone(310, 0.14, 'sawtooth', 0.04, 460);
    this.playTone(240, 0.16, 'triangle', 0.04, 180, 0.06);
  }

  playHeal(): void {
    this.playTone(523.25, 0.14, 'sine', 0.05, 659.25);
    this.playTone(659.25, 0.18, 'sine', 0.05, 783.99, 0.08);
  }

  playFeralSurge(): void {
    this.playTone(180, 0.35, 'sawtooth', 0.07, 720);
    this.playTone(360, 0.32, 'triangle', 0.06, 1080, 0.06);
    this.playTone(720, 0.28, 'sine', 0.06, 1440, 0.14);
  }

  playVictory(): void {
    this.playTone(523.25, 0.12, 'triangle', 0.06);
    this.playTone(659.25, 0.12, 'triangle', 0.06, undefined, 0.1);
    this.playTone(783.99, 0.14, 'triangle', 0.06, undefined, 0.2);
    this.playTone(1046.5, 0.3, 'sine', 0.07, undefined, 0.32);
  }

  playDefeat(): void {
    this.playTone(311.13, 0.18, 'triangle', 0.06, 277.18);
    this.playTone(261.63, 0.26, 'sawtooth', 0.045, 196.0, 0.16);
  }
}

export const soundFx = new SoundFxManager();
