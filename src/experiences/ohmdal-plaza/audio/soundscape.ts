import {
  Arc1WorldAmbience,
  type Arc1WorldAmbienceFrame,
} from '../../ohmdal-playcanvas/systems/audio/arc1WorldAmbience.ts';

export class PlazaAudioEngine {
  private readonly ambientBed: boolean;
  private readonly worldAmbience: Arc1WorldAmbience | null;
  private ctx: AudioContext | null = null;
  private humGain: GainNode | null = null;
  private humOsc: OscillatorNode | null = null;
  private humFilter: BiquadFilterNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private waterGain: GainNode | null = null;
  private waterSource: AudioBufferSourceNode | null = null;
  private waterFilter: BiquadFilterNode | null = null;
  private turbineGain: GainNode | null = null;
  private turbineOsc: OscillatorNode | null = null;
  private muted = false;
  private disposed = false;

  public constructor(options: { ambientBed?: boolean; worldAmbience?: Arc1WorldAmbience } = {}) {
    this.ambientBed = options.ambientBed ?? true;
    this.worldAmbience = options.worldAmbience ?? null;
  }

  public get isMuted(): boolean {
    return this.muted;
  }

  private ensure(): AudioContext | null {
    if (this.disposed || this.muted) return null;
    if (this.ctx) {
      if (this.ctx.state === 'suspended' && !this.muted) {
        void this.ctx.resume();
      }
      return this.ctx;
    }
    if (typeof window === 'undefined') return null;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    if (this.ambientBed) this.initAmbience();
    return this.ctx;
  }

  /**
   * Unlocks the shared context from a real input gesture and hands it to the
   * spatial bed. This never creates a second context and never resumes while
   * muted.
   */
  public unlockForGesture(): AudioContext | null {
    const ctx = this.ensure();
    if (!ctx || this.muted) return ctx;
    this.worldAmbience?.unlockFromGesture(ctx);
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    return ctx;
  }

  public updateWorldAmbience(frame: Arc1WorldAmbienceFrame): void {
    if (!this.worldAmbience || this.disposed) return;
    this.worldAmbience.update({ ...frame, muted: frame.muted || this.muted });
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.worldAmbience?.dispose();
    const sources = [this.ambientSource, this.waterSource, this.humOsc, this.turbineOsc];
    for (const source of sources) {
      if (!source) continue;
      try { source.stop(); } catch {}
      try { source.disconnect(); } catch {}
    }
    const nodes = [
      this.humFilter,
      this.humGain,
      this.ambientFilter,
      this.ambientGain,
      this.waterFilter,
      this.waterGain,
      this.turbineGain,
    ].filter((node) => node !== null);
    for (const node of nodes) {
      try { node.disconnect(); } catch {}
    }
    const context = this.ctx;
    this.ctx = null;
    if (context && context.state !== 'closed') void context.close().catch(() => undefined);
  }

  private initAmbience(): void {
    if (!this.ctx) return;
    try {
      // 50Hz Electrical Hum
      this.humOsc = this.ctx.createOscillator();
      this.humOsc.type = 'sawtooth';
      this.humOsc.frequency.setValueAtTime(50, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);
      this.humFilter = filter;

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.humOsc.connect(filter);
      filter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);
      this.humOsc.start();

      // Ambient Wind & Dusk noise (brown noise approximation)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i += 1) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i]!;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      this.ambientSource = noiseNode;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(240, this.ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);
      this.ambientFilter = noiseFilter;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
      noiseNode.start();

      // Water channel / hydraulic flow node
      const waterFilter = this.ctx.createBiquadFilter();
      waterFilter.type = 'lowpass';
      waterFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.setValueAtTime(0, this.ctx.currentTime);

      const waterSource = this.ctx.createBufferSource();
      waterSource.buffer = noiseBuffer;
      waterSource.loop = true;
      this.waterSource = waterSource;
      this.waterFilter = waterFilter;
      waterSource.connect(waterFilter);
      waterFilter.connect(this.waterGain);
      this.waterGain.connect(this.ctx.destination);
      waterSource.start();

      // Turbine generator hum
      this.turbineOsc = this.ctx.createOscillator();
      this.turbineOsc.type = 'triangle';
      this.turbineOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

      this.turbineGain = this.ctx.createGain();
      this.turbineGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.turbineOsc.connect(this.turbineGain);
      this.turbineGain.connect(this.ctx.destination);
      this.turbineOsc.start();
    } catch {
      // Ignore audio initialization errors
    }
  }

  public updateElectricalHum(intensity: number): void {
    if (!this.ambientBed || !this.humGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(0.08, intensity * 0.06));
    this.humGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.2);
  }

  public setWaterFlow(intensity: number): void {
    if (!this.ambientBed || !this.waterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(0.06, intensity * 0.05));
    this.waterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.3);
  }

  public setTurbineHum(rpmRatio: number): void {
    if (!this.ambientBed || !this.turbineGain || !this.turbineOsc || !this.ctx) return;
    const clampedRatio = Math.max(0, Math.min(1.0, rpmRatio));
    const targetFreq = 40 + clampedRatio * 180;
    const targetGain = clampedRatio > 0.05 ? Math.min(0.045, clampedRatio * 0.04) : 0;
    this.turbineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.15);
    this.turbineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
  }

  public playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.08, start = 0): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    g.gain.setValueAtTime(0.001, ctx.currentTime + start);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.05);
  }

  public playSwitchClunk(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    this.playTone(180, 0.08, 'square', 0.05);
    this.playTone(65, 0.16, 'triangle', 0.09, 0.02);
  }

  public playHeavyBreakerClunk(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    this.playTone(95, 0.12, 'square', 0.08);
    this.playTone(48, 0.22, 'triangle', 0.12, 0.02);
    this.playTone(320, 0.04, 'sawtooth', 0.04, 0.01);
  }

  public playRelayEngage(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    this.playTone(420, 0.05, 'sawtooth', 0.06);
    this.playTone(120, 0.2, 'triangle', 0.1, 0.03);
    this.playTone(840, 0.08, 'sine', 0.03, 0.05);
  }

  public playBreakerTrip(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    this.playTone(280, 0.06, 'sawtooth', 0.08);
    this.playTone(85, 0.25, 'triangle', 0.14, 0.02);
    this.playTone(550, 0.08, 'square', 0.05, 0.04);
  }

  public playBreakerReset(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    this.playTone(140, 0.09, 'square', 0.06);
    this.playTone(280, 0.14, 'triangle', 0.08, 0.03);
  }

  public playBranchSwitch(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    this.playTone(210, 0.07, 'square', 0.05);
    this.playTone(110, 0.12, 'triangle', 0.07, 0.02);
  }

  public playGalvanometerClick(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    this.playTone(680, 0.03, 'sine', 0.04);
    this.playTone(1360, 0.02, 'triangle', 0.02, 0.015);
  }

  public playBellChime(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const baseFreq = 440;
    const partials = [1, 2.02, 2.76, 3.48, 5.2];
    const gains = [0.12, 0.07, 0.05, 0.03, 0.02];
    const durations = [1.8, 1.4, 1.1, 0.9, 0.6];

    partials.forEach((p, idx) => {
      this.playTone(baseFreq * p, durations[idx] ?? 1.0, 'sine', gains[idx] ?? 0.04);
    });
  }

  public playWireScrape(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    for (let i = 0; i < 4; i += 1) {
      this.playTone(1200 + Math.random() * 800, 0.04, 'sawtooth', 0.025, i * 0.03);
    }
  }

  public playProbeContact(voltage: number): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const freq = 220 + Math.min(voltage, 30) * 35;
    this.playTone(freq, 0.18, 'sine', 0.07);
    this.playTone(freq * 1.5, 0.12, 'triangle', 0.03, 0.03);
  }

  public playDiscoveryChime(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const notes = [329.63, 440.0, 659.25, 880.0];
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.6 + i * 0.2, 'sine', 0.07, i * 0.12);
    });
  }

  public playForgeRoar(intensity: number): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const count = Math.max(1, Math.min(4, Math.floor(intensity)));
    for (let i = 0; i < count; i += 1) {
      this.playTone(75 + i * 22, 0.45, 'triangle', 0.03 + intensity * 0.01, i * 0.08);
    }
  }

  public playPumpRhythm(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    this.playTone(110, 0.14, 'square', 0.04);
    this.playTone(55, 0.24, 'triangle', 0.07, 0.04);
  }

  public playBeaconSync(): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const notes = [587.33, 739.99, 880.0, 1174.66];
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.45 + i * 0.15, 'sine', 0.06, i * 0.09);
    });
  }

  public playVocalChirp(who: string): void {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    if (who === 'Ohm') {
      this.playTone(720, 0.06, 'triangle', 0.04);
      this.playTone(960, 0.08, 'sine', 0.04, 0.04);
    } else if (who === 'Edda') {
      this.playTone(480, 0.05, 'sine', 0.03);
      this.playTone(560, 0.07, 'sine', 0.03, 0.04);
    } else if (who === 'Lumen') {
      this.playTone(220, 0.08, 'triangle', 0.04);
      this.playTone(190, 0.08, 'triangle', 0.04, 0.05);
    } else {
      this.playTone(380, 0.06, 'sine', 0.03);
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    this.worldAmbience?.setMuted(this.muted);
    if (this.muted) {
      if (this.ctx) void this.ctx.suspend().catch(() => undefined);
    } else {
      this.unlockForGesture();
    }
    return this.muted;
  }
}
