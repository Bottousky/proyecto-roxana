/** Original chamber miniature: the same six pitches survive every rearrangement. */
export function createAudio() {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let reverb: ConvolverNode | null = null;
  let muted = false; let paused = false; let disposed = false; let chapter = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let next = 0; let beat = 0;
  const motif = [0, 7, 12, 16, 19, 24];
  const chords = [48, 45, 41, 43];
  const nodes = new Set<AudioScheduledSourceNode>();
  function note(midi: number, at: number, duration: number, velocity = 0.09, glass = false) {
    if (!context || !master || muted || paused || disposed) return;
    const ctx = context;
    for (let partial = 0; partial < 3; partial++) {
      const oscillator = ctx.createOscillator(); const envelope = ctx.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12) * (partial === 0 ? 1 : partial === 1 ? 2 : glass ? 4.01 : 3);
      const level = velocity / (partial * 3 + 1);
      envelope.gain.setValueAtTime(0, at); envelope.gain.linearRampToValueAtTime(level, at + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration / (1 + partial * 0.3));
      oscillator.connect(envelope); envelope.connect(master); if (reverb) envelope.connect(reverb);
      oscillator.start(at); oscillator.stop(at + duration + 0.05); nodes.add(oscillator);
      oscillator.onended = () => { nodes.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
    }
  }
  function gain() {
    if (!context || !master) return;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(muted || paused ? 0 : 0.5, context.currentTime, 0.09);
  }
  function schedule() {
    if (!context || paused || muted || disposed || context.state !== 'running') return;
    while (next < context.currentTime + 0.2) {
      const root = chords[Math.floor(beat / 12) % chords.length];
      const index = (beat * (chapter % 2 ? 5 : 1)) % motif.length;
      note(root + motif[index], next, 2.8, 0.042, beat % 3 === 0);
      if (beat % 6 === 0) { note(root - 12, next, 5.8, 0.032); note(root + 7, next + 0.18, 4.5, 0.022); }
      beat++; next += 0.64;
    }
  }
  function start() {
    if (disposed) return;
    if (!context) {
      context = new AudioContext(); master = context.createGain(); master.gain.value = 0; master.connect(context.destination);
      // Deterministic synthesized room impulse; no downloaded samples or media assets.
      reverb = context.createConvolver(); const size = Math.floor(context.sampleRate * 2.6);
      const impulse = context.createBuffer(2, size, context.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel); let seed = 729 + channel;
        for (let i = 0; i < size; i++) { seed = (seed * 16807) % 2147483647; data[i] = (seed / 1073741823.5 - 1) * Math.pow(1 - i / size, 3.6) * 0.25; }
      }
      reverb.buffer = impulse; const wet = context.createGain(); wet.gain.value = 0.17; reverb.connect(wet); wet.connect(master);
      timer = setInterval(schedule, 100);
    }
    if (!paused) void context.resume().then(() => { if (!context || disposed) return; next = context.currentTime + 0.08; gain(); schedule(); });
  }
  function phrase(notes: number[], speed: number, velocity: number) {
    if (!context) return; const time = context.currentTime + 0.015;
    notes.forEach((n, i) => note(n, time + i * speed, 1.8, velocity, true));
  }
  return {
    start,
    setMuted(on: boolean) { muted = on; gain(); if (!on && context) next = context.currentTime + 0.1; },
    setPaused(on: boolean) {
      paused = on; gain();
      if (context) { if (on) void context.suspend(); else if (!disposed) void context.resume().then(() => { if (context) next = context.currentTime + 0.1; }); }
    },
    setChapter(index: number) { chapter = index; },
    transform() { phrase([60, 67, 72, 76, 79, 84].reverse(), 0.043, 0.06); },
    pick() { phrase([72, 79], 0.028, 0.045); },
    reject() { phrase([60, 67, 62], 0.08, 0.038); },
    restore(final: boolean) {
      if (!context) return;
      const root = final ? 48 : 60;
      [0, 7, 12, 16, 19, 24, 31, 28, 24].forEach((pitch, i) => note(root + pitch, context!.currentTime + i * 0.24, 4.2, 0.075, true));
      if (final) [0,7,12,16].forEach((pitch, i) => note(36 + pitch, context!.currentTime + i * 0.3, 7, 0.045));
    },
    dispose() { disposed = true; if (timer) clearInterval(timer); nodes.forEach(n => { try { n.stop(); } catch { /* Already ended. */ } }); nodes.clear(); if (context) void context.close(); context = null; master = null; reverb = null; },
  };
}
