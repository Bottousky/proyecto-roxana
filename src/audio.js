/**
 * Original score for Ohmdal. A small, generative chamber ensemble: glass, soft
 * strings, a wooden pulse and filtered air. No downloaded recordings are used.
 * Scheduling uses the audio clock; area changes share one motif and crossfade.
 */
const midi = value => 440 * 2 ** ((value - 69) / 12);
const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));

const SPATIAL_PROFILES = {
  water: { volume: .18, filter: 1700, noise: true },
  fountain: { volume: .15, filter: 2400, noise: true },
  lake: { volume: .12, filter: 800, noise: true },
  wheel: { volume: .035, filter: 450, frequency: 64, pulse: 2.6 },
  pump: { volume: .04, filter: 380, frequency: 78, pulse: 4 },
  motor: { volume: .027, filter: 320, frequency: 96, pulse: 6 },
  forge: { volume: .10, filter: 600, noise: true },
  electrical: { volume: .015, filter: 280, frequency: 100 },
};

/** Camera yaw is zero: +X is screen right, independent of the player's facing. */
export function spatialMix(listener, emitter) {
  const dx = Number(emitter.x) - Number(listener?.x), dz = Number(emitter.z) - Number(listener?.z);
  const range = Math.max(1, Number(emitter.range) || 12), intensity = clamp(Number(emitter.intensity) || 0, 0, 1);
  if (!Number.isFinite(dx) || !Number.isFinite(dz)) return { gain: 0, pan: 0 };
  return { gain: intensity * Math.max(0, 1 - Math.hypot(dx, dz) / range) ** 1.6, pan: clamp(dx / Math.max(3, range * .5), -.9, .9) };
}

const THEMES = {
  portal: { root: 50, tempo: 62, chord: [0, 7, 10, 14], melody: [12, null, 19, 17, null, 14, 10, null], air: 0.009, bright: 1600, pulse: false },
  plaza: { root: 53, tempo: 78, chord: [0, 4, 7, 14], melody: [12, 16, 19, null, 21, 19, 16, 14], air: 0.004, bright: 2200, pulse: true },
  workshop: { root: 50, tempo: 84, chord: [0, 3, 7, 14], melody: [12, null, 15, 19, 17, null, 14, 12], air: 0.003, bright: 1700, pulse: true },
  road: { root: 48, tempo: 73, chord: [0, 7, 10, 14], melody: [12, 19, null, 17, 14, null, 10, 12], air: 0.010, bright: 1800, pulse: true },
  spring: { root: 55, tempo: 68, chord: [0, 4, 7, 11], melody: [12, 16, null, 19, 23, 19, 16, null], air: 0.016, bright: 2700, pulse: false },
  castle: { root: 46, tempo: 66, chord: [0, 3, 7, 14], melody: [12, null, 15, 14, 19, null, 17, 14], air: 0.005, bright: 1400, pulse: true },
  terraces: { root: 53, tempo: 77, chord: [0, 4, 9, 14], melody: [12, 16, 21, null, 19, 16, 14, 12], air: 0.012, bright: 2200, pulse: true },
  lake: { root: 50, tempo: 61, chord: [0, 7, 9, 14], melody: [12, null, 19, 21, null, 19, 14, null], air: 0.014, bright: 1700, pulse: false },
  lighthouse: { root: 50, tempo: 65, chord: [0, 5, 7, 14], melody: [12, null, 17, 19, null, 14, 12, null], air: 0.011, bright: 1900, pulse: false },
  restored: { root: 50, tempo: 76, chord: [0, 4, 7, 14], melody: [12, 16, 19, 21, 19, 16, 14, 12], air: 0.007, bright: 2600, pulse: true },
};

export class AudioDirector {
  constructor() {
    this.context = null;
    this.area = 'portal';
    this.volume = 0.68;
    this.muted = false;
    this.restored = false;
    this.disposed = false;
    this.timer = null;
    this.beat = 0;
    this.phrase = 0;
    this.nextBeat = 0;
    this.lastStep = 0;
    this.seed = 1931;
    this.voices = new Set();
    this.spatialVoices = new Map();
    this.worldScene = null;
    this.finaleUntil = 0;
    this._visibility = () => {
      if (typeof document !== 'undefined' && this.context) {
        if (document.hidden) this.context.suspend().catch(() => {});
        else if (!this.disposed) this.context.resume().catch(() => {});
      }
    };
  }

  async unlock() {
    if (this.disposed) return false;
    if (!this.context) {
      const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContext) return false;
      try {
        this.context = new AudioContext({ latencyHint: 'interactive' });
        this._buildGraph();
      } catch {
        this.context = null;
        return false;
      }
      if (typeof document !== 'undefined') document.addEventListener('visibilitychange', this._visibility);
    }
    try {
      if (this.context.state === 'suspended') await this.context.resume();
    } catch { return false; }
    if (!this.timer) {
      this.nextBeat = this.context.currentTime + 0.15;
      this._schedule();
      this.timer = setInterval(() => this._schedule(), 100);
    }
    return true;
  }

  _random() {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  _buildGraph() {
    const ctx = this.context;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 16;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.01;
    this.compressor.release.value = 0.2;
    this.music = ctx.createGain();
    this.music.gain.value = 0.63;
    this.effects = ctx.createGain();
    this.effects.gain.value = 0.56;
    this.music.connect(this.master);
    this.effects.connect(this.master);
    this.master.connect(this.compressor);
    this.compressor.connect(ctx.destination);

    this.reverb = ctx.createConvolver();
    const length = Math.floor(ctx.sampleRate * 2.7);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < length; index++) {
        const decay = (1 - index / length) ** 3.2;
        data[index] = (this._random() * 2 - 1) * decay * (index < 100 ? index / 100 : 1);
      }
    }
    this.reverb.buffer = impulse;
    this.reverbGain = ctx.createGain();
    this.reverbGain.gain.value = 0.24;
    this.reverb.connect(this.reverbGain);
    this.reverbGain.connect(this.music);

    // A gentle, seamless wind/water bed. Two low-pass poles remove white-noise hiss.
    const noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const channel = noise.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < channel.length; index++) {
      previous = (previous + (this._random() * 2 - 1) * 0.023) / 1.023;
      channel[index] = previous * 3;
    }
    this.noiseBuffer = noise;
    this.air = ctx.createBufferSource();
    this.air.buffer = noise;
    this.air.loop = true;
    this.airFilter = ctx.createBiquadFilter();
    this.airFilter.type = 'lowpass';
    this.airFilter.frequency.value = 800;
    this.airFilter.Q.value = 0.35;
    this.airGain = ctx.createGain();
    this.airGain.gain.value = 0;
    this.air.connect(this.airFilter);
    this.airFilter.connect(this.airGain);
    this.airGain.connect(this.music);
    this.air.start();
    this._updateAmbience();
    if (this.worldScene) this.updateWorld(this.worldScene);
  }

    setArea(id,{continuous=false}={}) {
      if (id !== this.area&&!continuous) this._clearSpatial();
    this.area = Object.hasOwn(THEMES, id) ? id : 'portal';
    this._updateAmbience();
  }

  /** Update existing emitters in place; a silent or departed source is released. */
  updateWorld(scene) {
    this.worldScene = scene || null;
    if (!this.context || !this.noiseBuffer || this.disposed) return;
    const now = this.context.currentTime, active = new Set();
    for (const emitter of (scene?.emitters || []).slice(0, 12)) {
      const profile = SPATIAL_PROFILES[emitter.kind], mix = spatialMix(scene.listener, emitter);
      if (!profile || !emitter.id || mix.gain < .001) continue;
      const key = `${scene.area}:${emitter.id}`;active.add(key);
      let voice = this.spatialVoices.get(key);
      if (voice && voice.kind !== emitter.kind) { this._stopSpatial(key); voice = null; }
      if (!voice) { voice = this._spatialVoice(emitter.kind, profile); this.spatialVoices.set(key, voice); }
      voice.gain.gain.setTargetAtTime(mix.gain * profile.volume, now, .22);
      voice.stereo.pan.setTargetAtTime(mix.pan, now, .18);
    }
    for (const key of this.spatialVoices.keys()) if (!active.has(key)) this._stopSpatial(key);
  }

  _spatialVoice(kind, profile) {
    const ctx = this.context, source = profile.noise ? ctx.createBufferSource() : ctx.createOscillator();
    if (profile.noise) { source.buffer = this.noiseBuffer; source.loop = true; }
    else { source.type = 'triangle'; source.frequency.value = profile.frequency; }
    const filter = ctx.createBiquadFilter(), pulse = ctx.createGain(), gain = ctx.createGain(), stereo = ctx.createStereoPanner();
    filter.type = 'lowpass';filter.frequency.value = profile.filter;filter.Q.value = .35;
    pulse.gain.value = profile.pulse ? .78 : 1;gain.gain.value = 0;
    source.connect(filter);filter.connect(pulse);pulse.connect(gain);gain.connect(stereo);stereo.connect(this.effects);
    const sources = [source], nodes = [filter, pulse, gain, stereo];
    if (profile.pulse) {
      const modulation = ctx.createOscillator(), depth = ctx.createGain();
      modulation.frequency.value = profile.pulse;depth.gain.value = .2;
      modulation.connect(depth);depth.connect(pulse.gain);modulation.start();sources.push(modulation);nodes.push(depth);
    }
    source.start();
    return { kind, sources, nodes, gain, stereo };
  }

  _stopSpatial(key, immediate = false) {
    const voice = this.spatialVoices.get(key);if (!voice) return;
    this.spatialVoices.delete(key);
    const now = this.context.currentTime;
    voice.gain.gain.setTargetAtTime(0, now, immediate ? .001 : .09);
    voice.sources[0].onended = () => [...voice.sources, ...voice.nodes].forEach(node => { try { node.disconnect(); } catch { /* Already disposed. */ } });
    for (const source of voice.sources) { try { source.stop(now + (immediate ? 0 : .5)); } catch { /* Already stopped. */ } }
  }

  _clearSpatial(immediate = false) {
    for (const key of this.spatialVoices.keys()) this._stopSpatial(key, immediate);
  }

  /** One authored physical response per restoration; bank feedback stays separate. */
  playRestoration(id) {
    if (!this.context || this.context.state !== 'running' || this.muted || this.disposed) return false;
    const time = this.context.currentTime + .01;
    const kinds = { gate: 'gate', pump: 'pump', irrigation: 'water', workshop: 'electrical', beacon_network: 'motor', awaken: 'electrical', distribution: 'electrical', beacon_supply: 'electrical' };
    const emitter = this.worldScene?.emitters?.find(item => item.kind === kinds[id]);
    const mix = emitter ? spatialMix(this.worldScene.listener, emitter) : { gain: 1, pan: 0 };
    const level = Math.max(.4, mix.gain), pan = mix.pan;
    const tone = (frequency, at, duration, volume) => this._tone(frequency, time + at, duration, volume * level, 'sine', this.effects, pan, false);
    const noise = (at, duration, volume, cutoff) => this._noise(time + at, duration, volume * level, cutoff, false, pan);
    switch (id) {
      case 'gate':
        noise(0, .16, .18, 500);tone(170, .05, .35, .08);
        for (let i = 0; i < 14; i++) { noise(.65 + i * .18, .1, .06, 1200);tone(280 + i % 3 * 33, .65 + i * .18, .15, .028); }
        noise(3.2, .45, .13, 260);tone(75, 3.25, .8, .07);break;
      case 'pump':
        for (let i = 0; i < 8; i++) { tone(75, i * .22, .15, .04);noise(i * .22, .15, .06, 400); }
        noise(.9, 2.3, .17, 1500);break;
      case 'irrigation': noise(0, 2.8, .16, 1800);tone(190, .08, .2, .04);break;
      case 'workshop': noise(0, .07, .06, 900);tone(440, .12, .8, .045);tone(660, .24, 1.2, .024);break;
      case 'beacon_network':
        for (let i = 0; i < 9; i++) { tone(120 + i * 3, i * .17, .2, .04);noise(i * .17, .09, .035, 700); }
        tone(96, 1.2, 1.6, .045);break;
      // A spark, a rising note, then two soft heartbeats with the light's two pulses.
      // The Castillo: the infirmary lights, then the kitchen on its own branch, then the seal comes off.
      case 'distribution': noise(0, .06, .07, 900);tone(330, .05, 1, .032);noise(.5, .06, .07, 900);tone(392, .55, 1, .03);noise(1.25, .14, .1, 420);tone(140, 1.3, .35, .045);break;
      // The Faro's supply: a low generator hum that swells and settles under the tower.
      case 'beacon_supply': tone(55, 0, 2, .07);tone(110, .25, 1.7, .035);noise(0, 1.6, .05, 260);break;
      case 'awaken': tone(520, 0, .3, .03);tone(780, .22, 1.1, .045);tone(68, 1.2, .2, .09);tone(68, 1.55, .18, .07);break;
      case 'beacon_lens': this.finale();break;
      default: return false;
    }
    return true;
  }

  _updateAmbience() {
    if (!this.context || !this.airGain) return;
    const profile = this._theme();
    const now = this.context.currentTime;
    this.airGain.gain.setTargetAtTime(profile.air, now, 1.6);
    this.airFilter.frequency.setTargetAtTime(this.area === 'spring' ? 1600 : this.area === 'lake' ? 950 : 620, now, 1.5);
  }

  _theme() {
    return this.restored && (this.area === 'lighthouse' || this.area === 'lake' || this.area === 'plaza') ? THEMES.restored : THEMES[this.area] || THEMES.portal;
  }

  _schedule() {
    const ctx = this.context;
    if (!ctx || this.disposed || ctx.state !== 'running') return;
    if (this.nextBeat < ctx.currentTime - 0.5) this.nextBeat = ctx.currentTime + 0.1;
    let guard = 0;
    while (this.nextBeat < ctx.currentTime + 0.35 && guard++ < 12) {
      const profile = this._theme();
      const beatLength = 60 / profile.tempo;
      this._scoreBeat(profile, this.nextBeat, beatLength);
      this.nextBeat += beatLength;
      this.beat++;
      if (this.beat % 16 === 0) this.phrase++;
    }
  }

  _scoreBeat(profile, time, beatLength) {
    const step = this.beat % 16;
    const chordShift = [0, -5, -3, -5][this.phrase % 4];
    const root = profile.root + chordShift;
    const quiet = time < this.finaleUntil ? 0.28 : 1;

    // The same eight-note question is answered differently in each place.
    if (step === 0 || step === 8) {
      profile.chord.forEach((interval, i) => this._pad(midi(root + interval), time + i * 0.045, beatLength * 8.7, 0.0085 * quiet, (i - 1.5) * 0.24));
      this._tone(midi(root - 12), time, beatLength * 6, 0.018 * quiet, 'sine', this.music, 0, false);
    }
    if (step % 2 === 0) {
      const note = profile.melody[step / 2];
      if (note !== null) {
        const octave = this.phrase % 4 === 3 ? 12 : 0;
        this._glass(midi(root + note + octave), time, 2.8, 0.046 * quiet, Math.sin(this.beat * 0.7) * 0.38);
      }
    }
    if (profile.pulse && step % 4 === 2) {
      this._wood(midi(root + 12 + profile.chord[(step / 2) % 4]), time, 0.018 * quiet, this.music);
    }
    if ((this.area === 'spring' || this.area === 'terraces') && step % 4 === 3 && this._random() > 0.3) {
      this._glass(midi(root + [24, 28, 31][this.phrase % 3]), time + beatLength * 0.4, 0.9, 0.012 * quiet, (this._random() - 0.5) * 1.2);
    }
  }

  _track(source, nodes = []) {
    this.voices.add(source);
    source.onended = () => {
      this.voices.delete(source);
      try { source.disconnect(); } catch { /* Already disposed. */ }
      nodes.forEach(node => { try { node.disconnect(); } catch { /* Already disposed. */ } });
    };
    return source;
  }

  _tone(frequency, time, duration, volume, type = 'sine', bus = this.effects, pan = 0, wet = true) {
    if (!this.context || this.disposed) return;
    const ctx = this.context;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const stereo = ctx.createStereoPanner();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    stereo.pan.value = clamp(pan, -1, 1);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), time + Math.min(0.02, duration * 0.1));
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(gain);
    gain.connect(stereo);
    stereo.connect(bus);
    if (wet) stereo.connect(this.reverb);
    this._track(oscillator, [gain, stereo]);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.03);
    return oscillator;
  }

  _glass(frequency, time, duration = 2, volume = 0.04, pan = 0) {
    this._tone(frequency, time, duration, volume, 'sine', this.music, pan);
    this._tone(frequency * 2.005, time, duration * 0.35, volume * 0.20, 'sine', this.music, -pan);
    this._tone(frequency * 3.01, time, duration * 0.16, volume * 0.045, 'sine', this.music, pan);
  }

  _pad(frequency, time, duration, volume, pan) {
    const ctx = this.context;
    for (const detune of [-3, 3]) {
      const oscillator = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const stereo = ctx.createStereoPanner();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detune;
      filter.type = 'lowpass';
      filter.frequency.value = this._theme().bright;
      filter.Q.value = 0.2;
      stereo.pan.value = clamp(pan + detune * 0.035, -1, 1);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(volume, time + Math.min(1.8, duration * 0.25));
      gain.gain.setValueAtTime(volume * 0.85, time + duration * 0.55);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(stereo);
      stereo.connect(this.music);
      stereo.connect(this.reverb);
      this._track(oscillator, [filter, gain, stereo]);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.05);
    }
  }

  _wood(frequency, time, volume = 0.05, bus = this.effects) {
    this._tone(frequency, time, 0.16, volume, 'sine', bus, 0, false);
    this._tone(frequency * 2.76, time, 0.055, volume * 0.2, 'sine', bus, 0, false);
  }

  _noise(time, duration, volume, cutoff = 800, highpass = false, pan = 0) {
    if (!this.context || !this.noiseBuffer) return;
    const ctx = this.context;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = highpass ? 'highpass' : 'lowpass';
    filter.frequency.value = cutoff;
    const gain = ctx.createGain();
    const stereo = ctx.createStereoPanner();stereo.pan.value = clamp(pan, -1, 1);
    gain.gain.setValueAtTime(Math.max(volume, 0.0001), time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(stereo);stereo.connect(this.effects);
    this._track(source, [filter, gain, stereo]);
    source.start(time, this._random() * 2);
    source.stop(time + duration + 0.02);
  }

  play(name) {
    if (!this.context || this.context.state !== 'running' || this.muted || this.disposed) return;
    const time = this.context.currentTime + 0.005;
    const [effect, surface, pace] = String(name || '').toLowerCase().split(':');
    switch (effect) {
      case 'step':
      case 'footstep': {
        // Cadence follows the pace; the ground decides the colour of each step.
        if (time - this.lastStep < (pace === 'run' ? 0.17 : 0.26)) return;
        this.lastStep = time;
        const ground = surface || (this.area === 'workshop' ? 'wood' : 'stone'), jitter = 0.85 + this._random() * 0.3;
        if (ground === 'grass') this._noise(time, 0.09, 0.05 * jitter, 320);
        else if (ground === 'wood') { this._noise(time, 0.04, 0.06 * jitter, 700); this._wood(130 + this._random() * 40, time, 0.024); }
        else { this._noise(time, 0.035, 0.07 * jitter, 1500, true); this._wood(210 + this._random() * 60, time, 0.01); }
        break;
      }
      case 'success':
      case 'solve':
      case 'complete':
      case 'restore':
      case 'restored':
        [62, 69, 74, 78, 81].forEach((note, index) => this._tone(midi(note), time + index * 0.11, 1.8, 0.07 - index * 0.007, 'sine', this.effects, (index - 2) * 0.13));
        this._tone(midi(38), time, 1.5, 0.07, 'sine', this.effects);
        break;
      case 'error':
      case 'fail':
      case 'invalid':
      case 'locked':
        this._wood(180, time, 0.055);
        this._wood(145, time + 0.11, 0.04);
        break;
      case 'connect':
      case 'wire':
      case 'toggle':
      case 'switch':
        this._noise(time, 0.04, 0.14, 2200, true);
        this._wood(360, time, 0.055);
        this._tone(660, time + 0.025, 0.22, 0.032, 'sine', this.effects, 0);
        break;
      case 'map':
        // A sheet unfolding: two short rustles and a soft settle.
        this._noise(time, 0.09, 0.06, 2600, true);
        this._noise(time + 0.07, 0.12, 0.05, 1800, true);
        this._noise(time + 0.17, 0.16, 0.035, 900);
        break;
      case 'page':
        // A notebook leaf turning: a quick whisk of paper and the soft slap as it lands.
        this._noise(time, 0.11, 0.05, 3400, true);
        this._noise(time + 0.1, 0.06, 0.04, 1200);
        break;
      case 'disconnect':
        this._wood(300, time, 0.05);
        this._noise(time, 0.05, 0.09, 1400, true);
        break;
      case 'measure':
      case 'meter':
      case 'probe':
        this._tone(880, time, 0.11, 0.042, 'sine', this.effects, 0, false);
        this._tone(1174.66, time + 0.08, 0.16, 0.03, 'sine', this.effects, 0, false);
        break;
      case 'secret':
      case 'discovery':
      case 'journal':
        [74, 81, 85].forEach((note, index) => this._tone(midi(note), time + index * 0.13, 1.4, 0.045, 'sine', this.effects, (index - 1) * 0.25));
        break;
      case 'travel':
      case 'transition':
      case 'portal':
        this._tone(midi(50), time, 1.5, 0.05, 'sine', this.effects);
        this._tone(midi(69), time + 0.2, 1.8, 0.03, 'sine', this.effects, 0.2);
        this._noise(time, 0.9, 0.04, 1000);
        break;
      case 'dialogue':
      case 'voice':
      case 'text':
        this._wood(460 + this._random() * 70, time, 0.009);
        break;
      case 'finale':
        this.finale();
        break;
      case 'click':
      case 'dial':
      case 'interact':
      case 'open':
      case 'close':
      case 'ui':
      default:
        this._wood(effect === 'close' ? 320 : 490, time, 0.035);
        break;
    }
  }

  setVolume(value) {
    const numeric = Number(value);
    this.volume = Number.isFinite(numeric) ? clamp(numeric, 0, 1) : this.volume;
    if (this.master && this.context) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.context.currentTime, 0.05);
  }

  setMuted(value) {
    this.muted = Boolean(value);
    if (this.master && this.context) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.context.currentTime, 0.04);
  }

  finale() {
    this.restored = true;
    this._updateAmbience();
    if (!this.context || this.context.state !== 'running' || this.disposed) return;
    const time = this.context.currentTime + 0.08;
    this.finaleUntil = time + 15;
    const progression = [
      { at: 0, notes: [38, 50, 57, 62, 66] },
      { at: 3.2, notes: [43, 55, 62, 66, 69] },
      { at: 6.4, notes: [45, 57, 62, 64, 69] },
      { at: 9.6, notes: [38, 50, 57, 62, 66, 74] },
    ];
    progression.forEach(chord => chord.notes.forEach((note, index) => {
      this._pad(midi(note), time + chord.at + index * 0.028, 5.5, index === 0 ? 0.035 : 0.019, (index - 2.5) * 0.17);
    }));
    const melody = [
      [0.7, 74], [1.4, 78], [2.1, 81], [3.5, 83], [4.2, 81], [4.9, 78],
      [6.8, 76], [7.5, 78], [8.2, 81], [9.8, 86], [11.2, 81], [12.6, 86],
    ];
    melody.forEach(([at, note], index) => this._glass(midi(note), time + at, 3.8, 0.085, Math.sin(index) * 0.25));
    // The final low bell is also Nereo's long-awaited answer from the Plaza.
    [0, 4.8, 10].forEach((at, index) => {
      const fundamental = midi(index === 1 ? 43 : 38);
      [1, 2, 2.76, 4.08].forEach((ratio, partial) => this._tone(fundamental * ratio, time + at, 5 / (partial + 1), 0.085 / (partial + 1), 'sine', this.music, index === 1 ? -0.4 : 0.4));
    });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this._clearSpatial(true);
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this._visibility);
    this.voices.forEach(source => { try { source.stop(); } catch { /* Voice may have ended. */ } });
    this.voices.clear();
    try { this.air?.stop(); } catch { /* Already stopped. */ }
    if (this.context && this.context.state !== 'closed') this.context.close().catch(() => {});
  }
}

export default AudioDirector;
