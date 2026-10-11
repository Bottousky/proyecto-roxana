// Sonido procedural: tiza, borrador, golpecitos, la voz de Punto y poca música.
// Todo se genera en el navegador (sin archivos ni servicios). El silencio es parte del diseño.

// golpe de cada apoyo de tiza con ?anim=2: sigue al rasgueo con que empieza su trazo (media de la envolvente en los primeros
// 60 ms), para quedar 3–6 dB por encima de él con trazos lentos y rápidos (medido con scripts/scene-audit.mjs, c30)
const ENV_TAP = 1.05;
const tapLevel = (env, t) => {
  const v = env.filter(e => !e.tap && e.t >= t && e.t <= t + 0.06).map(e => e.v);
  return v.length ? Math.max(0.35, v.reduce((a, b) => a + b, 0) / v.length) : 1; // 0.35: el rasgueo mínimo con la tiza apoyada
};

export class Sound {
  constructor() {
    this.ctx = null;
    this.vol = {master: 0.8, music: 0.7, sfx: 0.8};
    this.loops = new Set();
  }

  /** Debe llamarse desde un gesto del jugador. `offline` permite analizar sin parlantes. */
  unlock(offline = null) {
    if (this.ctx) {
      if (this.ctx.state === 'suspended' && !this.offline) this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC && !offline) return;
    const ctx = offline || new AC();
    this.offline = !!offline;
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    // limitador suave para que nada sature
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.005;
    comp.release.value = 0.2;
    comp.connect(this.master);
    this.bus = comp;
    this.musicGain = ctx.createGain();
    this.sfxGain = ctx.createGain();
    // las altas de la tiza se suavizan: nada de chirridos
    this.sfxShelf = ctx.createBiquadFilter();
    this.sfxShelf.type = 'highshelf';
    this.sfxShelf.frequency.value = 5200;
    this.sfxShelf.gain.value = -9;
    this.sfxGain.connect(this.sfxShelf);
    this.sfxShelf.connect(comp);
    this.musicGain.connect(comp);
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.#impulse(2.6, 2.4);
    this.revGain = ctx.createGain();
    this.revGain.gain.value = 0.32;
    this.reverb.connect(this.revGain);
    this.revGain.connect(comp);
    this.noise = this.#noiseBuffer(3, 'white');
    this.brown = this.#noiseBuffer(4, 'brown');
    this.apply();
  }

  setVolumes(v) {
    Object.assign(this.vol, v);
    this.apply();
  }

  apply() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // ganancia de mezcla: los sonidos se diseñaron bajos; ver lab/audio.html
    this.master.gain.setTargetAtTime(this.vol.master * 2.1, t, 0.05);
    this.musicGain.gain.setTargetAtTime(this.vol.music * 0.55, t, 0.05);
    this.sfxGain.gain.setTargetAtTime(this.vol.sfx, t, 0.05);
  }

  get ready() {
    return !!this.ctx && (this.offline || this.ctx.state === 'running');
  }

  #noiseBuffer(sec, kind) {
    const ctx = this.ctx;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sec), ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'brown') {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      } else d[i] = w;
    }
    return buf;
  }

  #impulse(sec, decay) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  #src(buffer, loop = false) {
    const s = this.ctx.createBufferSource();
    s.buffer = buffer;
    s.loop = loop;
    return s;
  }

  /**
   * Tiza sobre el pizarrón durante `sec` segundos: ruido filtrado con un grano
   * irregular (los saltos de la tiza) y un cuerpo grave muy leve.
   */
  /**
   * `env` (opcional, ?anim=2): [{t, v}] — la tiza suena sólo mientras toca, con nivel según la velocidad de la punta
   * (v 0..1) y un golpe al empezar cada trazo ({t, tap: true}); reemplaza las levantadas simuladas a ritmo fijo.
   */
  chalkStart(sec = 1, strength = 1, env = null) {
    if (!this.ready) return null;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = this.#src(this.noise, true);
    src.loopStart = Math.random() * 2;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1700 + Math.random() * 700;
    bp.Q.value = 0.9;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 4800;
    const g = ctx.createGain();
    g.gain.value = 0;
    // grano: modulación irregular de amplitud
    const gr = ctx.createGain();
    gr.gain.value = 0.5;
    const lfo = this.#src(this.brown, true);
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.9;
    lfo.connect(lfoG);
    lfoG.connect(gr.gain);
    src.connect(bp);
    bp.connect(lp);
    lp.connect(gr);
    gr.connect(g);
    g.connect(this.sfxGain);
    const level = 0.16 * strength;
    g.gain.setValueAtTime(0, t);
    if (env?.length) {
      for (const e of env) {
        if (e.tap) { this.tap(ENV_TAP * strength * tapLevel(env, e.t), 1, e.t); continue; }
        g.gain.linearRampToValueAtTime(level * e.v, t + e.t);
      }
      g.gain.linearRampToValueAtTime(0, t + sec + 0.04);
      src.start(t); lfo.start(t); src.stop(t + sec + 0.1); lfo.stop(t + sec + 0.1);
      return this.#chalkHandle(g, src, lfo);
    }
    g.gain.linearRampToValueAtTime(level, t + 0.02);
    // pequeñas levantadas de tiza a lo largo del trazo
    const lifts = Math.floor(sec * 2.2);
    for (let i = 1; i <= lifts; i++) {
      const at = t + (i / (lifts + 1)) * sec;
      g.gain.setValueAtTime(level, at - 0.03);
      g.gain.linearRampToValueAtTime(level * 0.25, at);
      g.gain.linearRampToValueAtTime(level, at + 0.05);
    }
    g.gain.setValueAtTime(level, t + Math.max(0.03, sec - 0.06));
    g.gain.linearRampToValueAtTime(0, t + sec + 0.04);
    src.start(t);
    lfo.start(t);
    src.stop(t + sec + 0.1);
    lfo.stop(t + sec + 0.1);
    this.tap(0.35 * strength);
    return this.#chalkHandle(g, src, lfo);
  }

  #chalkHandle(g, src, lfo) {
    const ctx = this.ctx;
    const handle = {stop: () => {
      try {
        const n = ctx.currentTime;
        g.gain.cancelScheduledValues(n);
        g.gain.setTargetAtTime(0, n, 0.02);
        src.stop(n + 0.12);
        lfo.stop(n + 0.12);
      } catch { /* ya detenido */ }
      this.loops.delete(handle);
    }};
    this.loops.add(handle);
    return handle;
  }

  /** Golpe de tiza contra el pizarrón. */
  tap(strength = 0.6, pitch = 1, delay = 0) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime + delay; // delay: golpe programado (inicio de cada trazo con ?anim=2)
    const src = this.#src(this.noise);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1300 * pitch;
    bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32 * strength, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.sfxGain);
    src.start(t, Math.random());
    src.stop(t + 0.08);
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(210 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(90 * pitch, t + 0.06);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.18 * strength, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(og);
    og.connect(this.sfxGain);
    o.start(t);
    o.stop(t + 0.1);
  }

  /** Borrador de fieltro: ruido grave con frote rítmico. */
  erase(sec = 1.2, strength = 1) {
    if (!this.ready) return null;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = this.#src(this.noise, true);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;
    lp.Q.value = 0.4;
    const g = ctx.createGain();
    const rub = ctx.createOscillator();
    rub.frequency.value = 7 + Math.random() * 3;
    const rubG = ctx.createGain();
    rubG.gain.value = 0.05 * strength;
    rub.connect(rubG);
    rubG.connect(g.gain);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.13 * strength, t + 0.15);
    g.gain.setValueAtTime(0.13 * strength, t + sec * 0.7);
    g.gain.linearRampToValueAtTime(0, t + sec);
    src.connect(lp);
    lp.connect(g);
    g.connect(this.sfxGain);
    src.start(t, Math.random());
    rub.start(t);
    src.stop(t + sec + 0.05);
    rub.stop(t + sec + 0.05);
    return {stop: () => { try { g.gain.setTargetAtTime(0, ctx.currentTime, 0.05); } catch { /* */ } }};
  }

  /** La Marea: un borrador enorme que se acerca, pasa y se va. */
  marea(sec = 7) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = this.#src(this.brown, true);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(140, t);
    lp.frequency.linearRampToValueAtTime(700, t + sec * 0.5);
    lp.frequency.linearRampToValueAtTime(160, t + sec);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.3, t + sec * 0.45);
    g.gain.linearRampToValueAtTime(0.25, t + sec * 0.6);
    g.gain.linearRampToValueAtTime(0, t + sec);
    src.connect(lp);
    lp.connect(g);
    g.connect(this.sfxGain);
    g.connect(this.reverb);
    src.start(t);
    src.stop(t + sec + 0.1);
    this.erase(sec * 0.5, 1.4);
  }

  /** Nota con envolvente suave (tipo caja de música / campana de tiza). */
  note(freq, at = 0, dur = 0.8, {gain = 0.12, type = 'sine', rev = 0.5, bus = 'music', bright = 0.25} = {}) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime + at;
    const out = bus === 'music' ? this.musicGain : this.sfxGain;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    if (bright > 0) {
      const o2 = ctx.createOscillator();
      o2.type = 'sine';
      o2.frequency.value = freq * 2.01;
      const g2 = ctx.createGain();
      g2.gain.value = bright;
      o2.connect(g2);
      g2.connect(g);
      o2.start(t);
      o2.stop(t + dur + 0.05);
    }
    g.connect(out);
    const r = ctx.createGain();
    r.gain.value = rev;
    g.connect(r);
    r.connect(this.reverb);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  /** Acorde que crece despacio (revelación). */
  pad(freqs, at = 0, dur = 4, gain = 0.05) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime + at;
    for (const f of freqs) {
      for (const det of [-4, 4]) {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = f;
        o.detune.value = det;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1400;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(gain / freqs.length, t + dur * 0.45);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        o.connect(lp);
        lp.connect(g);
        g.connect(this.musicGain);
        g.connect(this.reverb);
        o.start(t);
        o.stop(t + dur + 0.1);
      }
    }
  }

  /** La voz de Punto: no son palabras; son contornos. `delay` (s): programada (el aterrizaje de un salto con ?anim=2). */
  punto(kind = 'hello', delay = 0) {
    if (!this.ready) return;
    const base = 880;
    const n = (st, at, d = 0.18, g = 0.07) => this.note(base * Math.pow(2, st / 12), at + delay, d, {gain: g, bus: 'sfx', rev: 0.35, bright: 0.12});
    switch (kind) {
      case 'hello': n(0, 0); n(4, 0.12); n(7, 0.24, 0.3); break; // su firma: tres notas ascendentes
      case 'happy': n(7, 0, 0.12); n(12, 0.09, 0.22); break;
      case 'hop': n(5 + Math.random() * 2, 0, 0.11, 0.09); break;
      case 'question': this.#glide(base, base * 1.33, 0.32, 0.06, delay); break;
      case 'scared': for (let i = 0; i < 5; i++) n(3 - i * 1.5, i * 0.06, 0.08, 0.05); break;
      case 'sad': n(3, 0, 0.35, 0.05); n(-2, 0.3, 0.6, 0.045); break;
      case 'no': n(2, 0, 0.1, 0.05); n(-1, 0.12, 0.16, 0.05); break;
      case 'yes': n(4, 0, 0.1, 0.05); n(9, 0.1, 0.16, 0.05); break;
      case 'surprise': this.#glide(base * 0.9, base * 1.6, 0.18, 0.07, delay); break;
      default: n(0, 0);
    }
  }

  #glide(f0, f1, dur, gain, delay = 0) {
    const ctx = this.ctx, t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
    o.connect(g);
    g.connect(this.sfxGain);
    const r = ctx.createGain();
    r.gain.value = 0.3;
    g.connect(r);
    r.connect(this.reverb);
    o.start(t);
    o.stop(t + dur + 0.1);
  }

  /** Motivos musicales breves, sólo en momentos que los merecen. */
  cue(name) {
    if (!this.ready) return;
    const hz = st => 293.66 * Math.pow(2, st / 12); // re
    const seq = (notes, step, opts) => notes.forEach((st, i) => st !== null && this.note(hz(st), i * step, opts?.dur ?? 1.1, {gain: 0.07, ...opts}));
    switch (name) {
      case 'ronda': // un vals pequeño, ligero
        seq([0, 7, 12, 4, 7, 12, 2, 7, 11, 4, 9, 12], 0.24, {dur: 0.9});
        this.note(hz(-12), 0, 2.5, {gain: 0.05});
        this.note(hz(-10), 1.44, 2.5, {gain: 0.045});
        break;
      case 'door':
        this.pad([hz(-5), hz(2), hz(7)], 0, 5, 0.06);
        break;
      case 'loss':
        this.note(hz(3), 0, 2.2, {gain: 0.06});
        this.note(hz(-2), 0.7, 2.8, {gain: 0.055});
        break;
      case 'found':
        seq([7, 11, 14], 0.18, {dur: 1.4});
        break;
      case 'all':
        for (let i = 0; i < 12; i++) this.note(hz([0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26][i]), i * 0.16, 1.2, {gain: 0.05});
        this.pad([hz(0), hz(4), hz(7), hz(11)], 1.8, 5, 0.06);
        break;
      case 'reveal':
        this.pad([hz(-12), hz(-5), hz(2), hz(7), hz(11)], 0, 6.5, 0.075);
        seq([14, null, 19, null, 21], 0.55, {dur: 2.2, gain: 0.04});
        break;
      case 'night':
        seq([12, null, 16, 19, null, null, 14], 0.6, {dur: 2.4, gain: 0.035});
        break;
      case 'end':
        this.pad([hz(-12), hz(0), hz(4), hz(9)], 0, 7, 0.07);
        seq([0, 4, 7, 9, 7, 4, 7], 0.5, {dur: 2, gain: 0.04});
        break;
    }
  }

  stopLoops() {
    for (const h of [...this.loops]) h.stop();
  }
}

