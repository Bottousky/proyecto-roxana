// Minimal Audio Bus.
// On first user interaction (click on the title screen), resumes the AudioContext.
// Uses procedural sound (Web Audio API oscillators) so we don't depend on
// generated audio assets for the greenfield rebuild. Replaced by real audio
// assets in a later pass.

export class AudioBus {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientNodes: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private electricalHum: { osc: OscillatorNode; gain: GainNode } | null = null;
  private unlocked = false;

  unlock() {
    if (this.unlocked) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
      this.unlocked = true;
    } catch {
      // Audio unavailable — keep silent.
    }
  }

  setAmbient(level: number) {
    if (!this.ctx || !this.master) return;
    if (level > 0 && this.ambientNodes.length === 0) {
      this.startAmbient();
    }
    if (this.ambientGain) {
      const target = Math.max(0, Math.min(1, level));
      this.ambientGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(target * 0.12, this.ctx.currentTime + 0.6);
    }
  }

  private startAmbient() {
    if (!this.ctx || !this.master) return;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0;
    this.ambientGain.connect(this.master);
    // Two slow detuned drones for "crepúsculo dormido" mood.
    const freqs = [110, 110 * 1.5];
    for (const f of freqs) {
      const o = this.ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.value = 0.5;
      // Slow LFO on amplitude for "alive" feel.
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.07 + Math.random() * 0.04;
      lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      o.connect(g);
      g.connect(this.ambientGain);
      o.start();
      lfo.start();
      this.ambientNodes.push(o, lfo);
    }
  }

  setElectricalHum(level: number) {
    if (!this.ctx || !this.master) return;
    const target = Math.max(0, Math.min(1, level));
    if (target > 0 && !this.electricalHum) {
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 60; // 60Hz mains hum.
      const g = this.ctx.createGain();
      g.gain.value = 0;
      // Slight detune for "live" feel.
      const detune = this.ctx.createOscillator();
      detune.type = "sine";
      detune.frequency.value = 0.3;
      const detuneAmp = this.ctx.createGain();
      detuneAmp.gain.value = 1.5;
      detune.connect(detuneAmp);
      detuneAmp.connect(osc.detune);
      osc.connect(g);
      g.connect(this.master);
      osc.start();
      detune.start();
      this.electricalHum = { osc, gain: g };
    }
    if (this.electricalHum && this.ctx) {
      this.electricalHum.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.electricalHum.gain.gain.linearRampToValueAtTime(target * 0.04, this.ctx.currentTime + 0.4);
    }
  }

  ping(freq: number, duration: number, volume: number) {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(volume, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }
}
