// Procedural sound, situated in the scene. Sources: the two familiar falls, the rising
// arch (noise whose band glides upward), the field apparatus hum (stronger near and inside
// the region), and event sounds for releases, reels, contacts, steps and field crossings.
// The mix has not been listened to by its author: it is UNVERIFIED until a person hears it.
export class Sound {
  constructor() { this.ctx = null; this.enabled = true; this.volume = 0.8; }

  start() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = this.ctx = new AC();
    this.master = c.createGain(); this.master.gain.value = this.volume; this.master.connect(c.destination);
    const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; }
    this.noise = buf;
    const loop = (filterType, freq, q, gain) => {
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true; src.playbackRate.value = 0.7 + Math.random() * 0.6;
      const f = c.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain(); g.gain.value = gain; const pan = c.createStereoPanner();
      src.connect(f).connect(g).connect(pan).connect(this.master); src.start();
      return { f, g, pan };
    };
    this.wind = loop('lowpass', 420, 0.4, 0.05);
    this.fallL = loop('bandpass', 900, 0.5, 0);
    this.fallR = loop('bandpass', 1100, 0.5, 0);
    this.arch = loop('bandpass', 700, 2.2, 0);
    // Field hum: two near-unison partials beating slowly, an octave shimmer when inside.
    const hum = (f0, type, gain) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f0; const g = c.createGain(); g.gain.value = gain; o.connect(g).connect(this.master); o.start(); return { o, g }; };
    this.hum = [hum(98, 'sine', 0), hum(98.6, 'sine', 0), hum(196.4, 'triangle', 0)];
  }

  /** listener: explorer x; inField: weight of the region on the explorer (0..1). */
  update(time, listenerX, near, inField) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime, s = (g, v) => g.gain.setTargetAtTime(v, t, 0.15);
    const prox = (x, r) => Math.max(0, 1 - Math.abs(listenerX - x) / r);
    s(this.fallL.g, 0.32 * prox(-20.3, 18) ** 1.5); this.fallL.pan.pan.value = Math.max(-1, Math.min(1, (-20.3 - listenerX) / 10));
    s(this.fallR.g, 0.28 * prox(19.6, 18) ** 1.5); this.fallR.pan.pan.value = Math.max(-1, Math.min(1, (19.6 - listenerX) / 10));
    s(this.arch.g, 0.34 * prox(2.6, 14) ** 1.3); this.arch.pan.pan.value = Math.max(-1, Math.min(1, (2.6 - listenerX) / 8));
    // Rising glide: the arch's band sweeps upward and resets, over and over.
    const ph = (time * 0.45) % 1;
    this.arch.f.frequency.setTargetAtTime(500 + ph * ph * 1400, t, 0.05);
    s(this.hum[0].g, 0.035 * near + 0.03 * inField); s(this.hum[1].g, 0.035 * near + 0.03 * inField); s(this.hum[2].g, 0.025 * inField);
  }

  blip({ freq = 600, to = null, dur = 0.12, type = 'sine', gain = 0.2, noise = 0, filter = 2000 }) {
    const c = this.ctx; if (!c || !this.enabled) return;
    const t = c.currentTime, g = c.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    g.connect(this.master);
    if (noise) {
      const n = c.createBufferSource(); n.buffer = this.noise; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filter;
      const ng = c.createGain(); ng.gain.value = noise; n.connect(f).connect(ng).connect(g); n.start(t, Math.random()); n.stop(t + dur);
    }
    if (freq) {
      const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      o.connect(g); o.start(t); o.stop(t + dur + 0.02);
    }
  }

  event(e, avatarId) {
    switch (e.type) {
      case 'release': this.blip({ freq: 1250, to: 900, dur: 0.09, type: 'triangle', gain: 0.16, noise: 0.3, filter: 5000 }); break;
      case 'reel': this.blip({ freq: 300, to: 340, dur: 0.25, type: 'square', gain: 0.04, noise: 0.2, filter: 3000 }); break;
      case 'armed': this.blip({ freq: 1500, dur: 0.06, type: 'triangle', gain: 0.12 }); break;
      case 'taut': this.blip({ freq: 220, to: 180, dur: 0.12, type: 'sawtooth', gain: 0.05 }); break;
      case 'pick': this.blip({ freq: 700, to: 980, dur: 0.08, type: 'sine', gain: 0.12 }); break;
      case 'drop': this.blip({ freq: 900, to: 620, dur: 0.08, type: 'sine', gain: 0.1 }); break;
      case 'reset': this.blip({ freq: 520, to: 1040, dur: 0.3, type: 'sine', gain: 0.1 }); break;
      case 'impact': {
        const v = Math.min(1, e.speed / 6);
        if (e.kind === 'avatar') this.blip({ freq: 90, to: 60, dur: 0.14, gain: 0.12 + v * 0.25, noise: 0.6, filter: 600 });
        else this.blip({ freq: 1600 + Math.random() * 500, to: 900, dur: 0.07 + v * 0.1, type: 'triangle', gain: 0.05 + v * 0.22, noise: 0.25, filter: 4000 });
        break;
      }
      case 'enter': if (e.body === avatarId) this.blip({ freq: 260, to: 620, dur: 0.6, type: 'sine', gain: 0.12, noise: 0.15, filter: 1800 }); break;
      case 'exit': if (e.body === avatarId) this.blip({ freq: 560, to: 280, dur: 0.5, type: 'sine', gain: 0.08 }); break;
    }
  }

  step() { this.blip({ freq: 0, dur: 0.06, gain: 0.07, noise: 1, filter: 900 + Math.random() * 400 }); }
}
