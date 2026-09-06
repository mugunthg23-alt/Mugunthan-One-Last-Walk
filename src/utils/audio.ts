/**
 * Pure Web Audio API Ambient Sound Synthesizer
 * Generates an ethereal, warm, cinematic ambient drone chord.
 * Starts strictly upon explicit user toggle (default muted).
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public play() {
    try {
      this.init();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (this.isPlaying) return;

      const now = this.ctx.currentTime;

      // Master Gain with gentle fade in
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.08, now + 3); // Soft ambient volume
      this.masterGain.connect(this.ctx.destination);

      // Warm low-pass filter with slow breathing modulation
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(450, now);
      this.filter.Q.setValueAtTime(1.5, now);
      this.filter.connect(this.masterGain);

      // Slow LFO for organic filter sweep
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.08, now); // ~12-second breath cycle
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(160, now);
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.filter.frequency);
      this.lfo.start();

      // Warm chord voicing (D maj9 / F# minor cinematic harmony)
      // D2 (73.4Hz), A2 (110Hz), D3 (146.8Hz), F#3 (185.0Hz), A3 (220Hz), C#4 (277.2Hz)
      const frequencies = [73.42, 110.0, 146.83, 185.0, 220.0, 277.18];

      this.oscillators = frequencies.map((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        // Subtle detune for rich analog chorusing
        const detuneAmount = (i % 2 === 0 ? 1 : -1) * (i * 2.5);
        osc.detune.setValueAtTime(detuneAmount, now);
        osc.frequency.setValueAtTime(freq, now);

        const oscGain = this.ctx!.createGain();
        oscGain.gain.setValueAtTime(0.18 / frequencies.length, now);

        osc.connect(oscGain);
        oscGain.connect(this.filter!);
        osc.start();
        return osc;
      });

      this.isPlaying = true;
    } catch (err) {
      console.warn('Audio playback not supported or blocked:', err);
      this.isPlaying = false;
    }
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      // Gentle 1.5s fade out
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch { /* noop */ }
        });
        this.oscillators = [];
        if (this.lfo) {
          try { this.lfo.stop(); this.lfo.disconnect(); } catch { /* noop */ }
          this.lfo = null;
        }
        if (this.filter) {
          this.filter.disconnect();
          this.filter = null;
        }
        if (this.masterGain) {
          this.masterGain.disconnect();
          this.masterGain = null;
        }
        this.isPlaying = false;
      }, 1600);
    } catch {
      this.isPlaying = false;
    }
  }

  public getPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientAudio = new AmbientAudioEngine();

/**
 * Playful cartoon pop / chime when Jerry Mugunthan enters or starts reading
 */
export function playJerryCartoonSound(type: 'pop' | 'chime' | 'giggle' = 'pop') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'pop') {
      // Gentle cartoon bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    } else if (type === 'chime') {
      // Cheerful double chime
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);

        gain.gain.setValueAtTime(0.1, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.32);
      });
    }
  } catch {
    // Graceful fallback if audio context is blocked
  }
}
