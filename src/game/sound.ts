// Web Audio API procedural sound effects + calm ambient puzzle music (zero external assets required)

interface ChillBar {
  pad: number[];
  melody: Array<{ beat: number; freq: number; dur: number; vel?: number }>;
}

// Slow, warm 66 BPM lo-fi ambient progression (two alternating 4-bar phrases)
const CHILL_BARS: ChillBar[] = [
  // Cycle A: Fmaj7 -> G6 -> Em7 -> Am7
  {
    pad: [174.61, 220.0, 261.63, 329.63], // F3 A3 C4 E4
    melody: [
      { beat: 0.0, freq: 523.25, dur: 1.7, vel: 0.024 }, // C5
      { beat: 1.5, freq: 659.25, dur: 1.5, vel: 0.021 }, // E5
      { beat: 2.75, freq: 440.0, dur: 1.8, vel: 0.019 }, // A4
    ],
  },
  {
    pad: [196.0, 246.94, 293.66, 329.63], // G3 B3 D4 E4
    melody: [
      { beat: 0.0, freq: 587.33, dur: 1.7, vel: 0.023 }, // D5
      { beat: 1.75, freq: 493.88, dur: 1.6, vel: 0.02 }, // B4
      { beat: 3.0, freq: 392.0, dur: 1.5, vel: 0.017 }, // G4
    ],
  },
  {
    pad: [164.81, 196.0, 246.94, 293.66], // E3 G3 B3 D4
    melody: [
      { beat: 0.0, freq: 493.88, dur: 1.8, vel: 0.023 }, // B4
      { beat: 1.5, freq: 587.33, dur: 1.5, vel: 0.021 }, // D5
      { beat: 2.75, freq: 392.0, dur: 1.8, vel: 0.018 }, // G4
    ],
  },
  {
    pad: [220.0, 261.63, 329.63, 392.0], // A3 C4 E4 G4
    melody: [
      { beat: 0.0, freq: 659.25, dur: 1.9, vel: 0.024 }, // E5
      { beat: 1.75, freq: 523.25, dur: 1.7, vel: 0.02 }, // C5
      { beat: 3.0, freq: 440.0, dur: 1.7, vel: 0.018 }, // A4
    ],
  },
  // Cycle B: Dm9 -> G13 -> Cmaj7 -> Am9
  {
    pad: [146.83, 220.0, 261.63, 329.63], // D3 A3 C4 E4
    melody: [
      { beat: 0.0, freq: 523.25, dur: 1.8, vel: 0.023 }, // C5
      { beat: 1.5, freq: 440.0, dur: 1.5, vel: 0.02 }, // A4
      { beat: 2.75, freq: 659.25, dur: 1.7, vel: 0.02 }, // E5
    ],
  },
  {
    pad: [196.0, 246.94, 293.66, 349.23], // G3 B3 D4 F4
    melody: [
      { beat: 0.0, freq: 587.33, dur: 1.7, vel: 0.022 }, // D5
      { beat: 1.5, freq: 659.25, dur: 1.4, vel: 0.02 }, // E5
      { beat: 2.75, freq: 493.88, dur: 1.8, vel: 0.019 }, // B4
    ],
  },
  {
    pad: [130.81, 196.0, 246.94, 329.63], // C3 G3 B3 E4
    melody: [
      { beat: 0.0, freq: 659.25, dur: 2.0, vel: 0.024 }, // E5
      { beat: 1.75, freq: 783.99, dur: 1.6, vel: 0.018 }, // G5 (soft shimmer)
      { beat: 3.0, freq: 523.25, dur: 1.8, vel: 0.019 }, // C5
    ],
  },
  {
    pad: [220.0, 261.63, 329.63, 493.88], // A3 C4 E4 B4
    melody: [
      { beat: 0.0, freq: 493.88, dur: 1.9, vel: 0.022 }, // B4
      { beat: 1.75, freq: 440.0, dur: 2.1, vel: 0.019 }, // A4
    ],
  },
];

const BEAT_SEC = 60 / 66; // 66 BPM -> ~0.909s/beat
const BAR_SEC = BEAT_SEC * 4;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private musicMuted = false;
  private bgPaused = false;
  private musicUnlocked = false;

  private musicMasterGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private musicTimerId: number | null = null;
  private nextBarTime = 0;
  private barIndex = 0;

  setMuted(m: boolean) {
    this.muted = m;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMusicMuted(m: boolean) {
    this.musicMuted = m;
    if (m) {
      this.stopMusicLoop(true);
    } else if (this.musicUnlocked && !this.bgPaused) {
      this.startMusicLoop();
    }
  }

  isMusicMuted(): boolean {
    return this.musicMuted;
  }

  setBackgroundPaused(paused: boolean) {
    this.bgPaused = paused;
    if (paused) {
      this.stopMusicLoop(false);
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    } else if (!this.musicMuted && this.musicUnlocked) {
      this.startMusicLoop();
    }
  }

  unlockAndStartMusic() {
    this.musicUnlocked = true;
    if (!this.musicMuted && !this.bgPaused) {
      this.startMusicLoop();
    }
  }

  private getRawContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && !this.bgPaused) {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getSfxContext(): AudioContext | null {
    if (this.muted || this.bgPaused) return null;
    return this.getRawContext();
  }

  private ensureMusicBus(ctx: AudioContext): GainNode {
    if (!this.musicFilter || this.musicFilter.context !== ctx) {
      this.musicFilter = ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.setValueAtTime(880, ctx.currentTime);
      this.musicFilter.Q.setValueAtTime(0.5, ctx.currentTime);
      this.musicFilter.connect(ctx.destination);
    }
    if (!this.musicMasterGain || this.musicMasterGain.context !== ctx) {
      this.musicMasterGain = ctx.createGain();
      this.musicMasterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.musicMasterGain.connect(this.musicFilter);
    }
    return this.musicMasterGain;
  }

  private scheduleBar(ctx: AudioContext, master: GainNode, startTime: number, bar: ChillBar) {
    // 1. Soft warm pad voices
    for (const freq of bar.pad) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      g.gain.setValueAtTime(0.0001, startTime);
      g.gain.linearRampToValueAtTime(0.013, startTime + 1.05);
      g.gain.setValueAtTime(0.013, startTime + BAR_SEC - 1.35);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + BAR_SEC + 0.15);

      osc.connect(g);
      g.connect(master);
      osc.start(startTime);
      osc.stop(startTime + BAR_SEC + 0.2);
    }

    // 2. Delicate felt-bell notes
    for (const note of bar.melody) {
      const t = startTime + note.beat * BEAT_SEC;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const peak = note.vel ?? 0.022;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, t);

      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.045);
      g.gain.exponentialRampToValueAtTime(0.0001, t + note.dur);

      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + note.dur + 0.05);
    }
  }

  private startMusicLoop() {
    if (this.musicMuted || this.bgPaused || typeof window === 'undefined') return;
    const ctx = this.getRawContext();
    if (!ctx) return;

    const master = this.ensureMusicBus(ctx);
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.linearRampToValueAtTime(1.0, now + 0.65);

    if (this.musicTimerId !== null) return;

    this.nextBarTime = now + 0.08;
    const tickScheduler = () => {
      if (this.musicMuted || this.bgPaused || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
        return;
      }
      const lookahead = this.ctx.currentTime + 0.65;
      while (this.nextBarTime < lookahead) {
        if (this.nextBarTime < this.ctx.currentTime - 0.5) {
          this.nextBarTime = this.ctx.currentTime + 0.05;
        }
        const bar = CHILL_BARS[this.barIndex % CHILL_BARS.length];
        this.scheduleBar(this.ctx, master, this.nextBarTime, bar);
        this.nextBarTime += BAR_SEC;
        this.barIndex = (this.barIndex + 1) % CHILL_BARS.length;
      }
    };

    tickScheduler();
    this.musicTimerId = window.setInterval(tickScheduler, 300);
  }

  private stopMusicLoop(fadeOut: boolean) {
    if (this.musicTimerId !== null) {
      window.clearInterval(this.musicTimerId);
      this.musicTimerId = null;
    }
    if (this.ctx && this.musicMasterGain) {
      const now = this.ctx.currentTime;
      this.musicMasterGain.gain.cancelScheduledValues(now);
      if (fadeOut) {
        this.musicMasterGain.gain.setValueAtTime(Math.max(0.0001, this.musicMasterGain.gain.value), now);
        this.musicMasterGain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
      } else {
        this.musicMasterGain.gain.setValueAtTime(0.0001, now);
      }
    }
  }

  playTick() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.045);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  playSnap(steps = 1) {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const baseFreq = Math.min(460, 250 + steps * 40);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.06);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  playBump() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(125, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.07);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.085);
  }

  playHint() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [587.33, 880]; // D5 -> A5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.085;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  playGateUnlock() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [659.25, 987.77]; // E5 -> B5 crisp gate chime
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.07;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  playWin() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Brief police siren chirp (wee-ooo-wee) followed by triumphant triad
    const siren = ctx.createOscillator();
    const sirenGain = ctx.createGain();
    siren.type = 'triangle';
    siren.frequency.setValueAtTime(660, now);
    siren.frequency.linearRampToValueAtTime(920, now + 0.11);
    siren.frequency.linearRampToValueAtTime(680, now + 0.22);
    siren.frequency.linearRampToValueAtTime(980, now + 0.34);
    sirenGain.gain.setValueAtTime(0.09, now);
    sirenGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    siren.connect(sirenGain);
    sirenGain.connect(ctx.destination);
    siren.start(now);
    siren.stop(now + 0.4);

    // Victory fanfare chord arpeggio
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + 0.22 + idx * 0.07;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.46);
    });
  }
}

export const sound = new SoundEngine();
