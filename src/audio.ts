/* Audio procedural del juego: música ambiental generativa + efectos sintetizados.
   Todo WebAudio, sin assets — pensado para el greybox. Cuando haya música real,
   este módulo se reemplaza manteniendo la misma interfaz (setAmbience + sfx*). */

export type Ambience = 'instituto' | 'ohmdal' | 'taller' | 'ohmdal-on' | 'castle';

/** Una pieza compuesta: pistas de melodía y bajo como listas de [nota, pulsos].
 *  null = silencio. Las notas en notación científica ('D5', 'Bb2', 'F#4'). */
interface ThemeDef {
  tempo: number;
  melody: [string | null, number][];
  bass: [string | null, number][];
  melodyLevel: number;
  bassLevel: number;
}

interface MoodDef {
  /** acordes del colchón grave: el primero es la afinación base, el drone
   *  deriva lentamente entre ellos (cada fila tiene una freq por voz) */
  chords: number[][];
  droneType: OscillatorType;
  /** lowpass del colchón */
  filter: number;
  level: number;
  /** zumbido eléctrico opcional (el taller de Lumen) */
  hum?: number;
  /** notas posibles para las frases */
  scale: number[];
  /** ms mín/máx de silencio entre frases */
  phraseGap: [number, number];
  pluckLevel: number;
  /** el tema compuesto de la zona */
  theme: ThemeDef;
}

/* ---------- los temas (compuestos a mano, nota por nota) ---------- */

// «El hall vacío» — cajita de música en re menor: baja, da una vuelta, no cierra del todo
const TEMA_INSTITUTO: ThemeDef = {
  tempo: 72,
  melody: [
    ['D5', 1.5], ['E5', 0.5], ['F5', 1], ['E5', 1], ['D5', 1], ['C5', 1], ['A4', 2], [null, 1],
    ['F5', 1.5], ['G5', 0.5], ['A5', 1], ['G5', 1], ['F5', 1], ['E5', 1], ['D5', 3], [null, 1],
    ['D5', 1.5], ['E5', 0.5], ['F5', 1], ['A5', 1], ['G5', 2], ['E5', 1], ['D5', 4], [null, 2],
  ],
  bass: [
    ['D3', 5], ['Bb2', 4], ['C3', 5], ['D3', 5], ['Bb2', 4], ['A2', 4], ['D3', 5],
  ],
  melodyLevel: 0.6,
  bassLevel: 0.5,
};

// «La plaza apagada» — la menor, lenta y espaciada: una pregunta sin respuesta
const TEMA_OHMDAL: ThemeDef = {
  tempo: 60,
  melody: [
    ['A4', 2], ['C5', 1], ['B4', 2], [null, 1], ['E5', 2], ['D5', 1], ['C5', 2], ['A4', 3], [null, 2],
    ['G4', 2], ['A4', 1], ['C5', 2], ['B4', 1], ['A4', 4], [null, 2],
  ],
  bass: [
    ['A2', 7], ['F2', 7], ['G2', 7], ['A2', 7],
  ],
  melodyLevel: 0.5,
  bassLevel: 0.45,
};

// «El taller de Lumen» — sol mayor con el fa natural de cierre: cálido, un poco juguetón
const TEMA_TALLER: ThemeDef = {
  tempo: 84,
  melody: [
    ['G4', 1], ['B4', 1], ['D5', 1], ['B4', 1], ['C5', 1.5], ['A4', 0.5], ['B4', 2], [null, 1],
    ['G4', 1], ['A4', 1], ['B4', 1], ['D5', 1], ['E5', 1.5], ['D5', 0.5], ['A4', 3], [null, 1],
    ['C5', 1], ['B4', 1], ['A4', 1], ['F4', 1], ['G4', 4], [null, 2],
  ],
  bass: [
    ['G2', 5], ['C3', 4], ['G2', 5], ['D3', 5], ['F2', 4], ['G2', 6],
  ],
  melodyLevel: 0.6,
  bassLevel: 0.5,
};

// «La plaza encendida» — el MISMO tema del Instituto, pero en re mayor:
// la melancolía de la escuela, resuelta cuando el mundo recupera la luz
const TEMA_OHMDAL_ON: ThemeDef = {
  tempo: 76,
  melody: [
    ['D5', 1.5], ['E5', 0.5], ['F#5', 1], ['E5', 1], ['D5', 1], ['E5', 1], ['A5', 2], [null, 1],
    ['G5', 1.5], ['A5', 0.5], ['B5', 1], ['A5', 1], ['G5', 1], ['F#5', 1], ['E5', 3], [null, 1],
    ['F#5', 1.5], ['G5', 0.5], ['A5', 1], ['B5', 1], ['A5', 2], ['F#5', 1], ['D5', 4], [null, 2],
  ],
  bass: [
    ['D3', 5], ['G3', 4], ['A2', 5], ['D3', 5], ['G3', 4], ['A2', 4], ['D3', 5],
  ],
  melodyLevel: 0.6,
  bassLevel: 0.5,
};

// «El Castillo de Ohmdal» — la menor grave y reverberante; más baja y espaciada que la plaza
const TEMA_CASTLE: ThemeDef = {
  tempo: 52,
  melody: [
    ['A3', 2], ['C4', 1], ['B3', 2], [null, 2], ['E4', 2], ['D4', 1], ['C4', 2], ['A3', 4], [null, 3],
    ['F3', 2], ['G3', 1], ['A3', 3], ['G3', 2], ['E3', 4], [null, 3],
    ['A3', 2], ['B3', 1], ['C4', 2], ['E4', 2], ['D4', 3], ['A3', 5], [null, 4],
  ],
  bass: [
    ['A1', 9], ['F1', 9], ['G1', 9], ['A1', 9],
  ],
  melodyLevel: 0.45,
  bassLevel: 0.5,
};

const MOODS: Record<Ambience, MoodDef> = {
  // el Instituto: polvo, eco, melancolía — re menor (deriva i → VI → VII)
  instituto: {
    chords: [
      [73.42, 110.0], // re
      [58.27, 87.31], // sib
      [65.41, 98.0], // do
    ],
    droneType: 'sine',
    filter: 320,
    level: 0.13,
    scale: [293.66, 349.23, 392.0, 440.0, 523.25, 587.33],
    phraseGap: [4500, 10000],
    pluckLevel: 0.05,
    theme: TEMA_INSTITUTO,
  },
  // Ohmdal apagada: grave, muy espaciada, misterio (la → fa → sol)
  ohmdal: {
    chords: [
      [55.0, 82.41],
      [43.65, 65.41],
      [49.0, 73.42],
    ],
    droneType: 'triangle',
    filter: 220,
    level: 0.11,
    scale: [220.0, 261.63, 293.66, 329.63, 392.0],
    phraseGap: [6000, 14000],
    pluckLevel: 0.04,
    theme: TEMA_OHMDAL,
  },
  // el taller: cálido, con un zumbido eléctrico bajito (sol → fa → re)
  taller: {
    chords: [
      [98.0, 146.83],
      [87.31, 130.81],
      [73.42, 110.0],
    ],
    droneType: 'triangle',
    filter: 420,
    level: 0.12,
    hum: 100,
    scale: [392.0, 440.0, 493.88, 587.33, 659.25],
    phraseGap: [3500, 8000],
    pluckLevel: 0.05,
    theme: TEMA_TALLER,
  },
  // El Castillo: la menor, más grave y reverberante que la plaza apagada (la → fa → sol)
  castle: {
    chords: [
      [27.5, 41.2],   // la1 / mi1 — una octava más grave que ohmdal
      [21.83, 32.7],  // fa1 / do1
      [24.5, 36.71],  // sol1 / re1
    ],
    droneType: 'triangle',
    filter: 180,
    level: 0.13,
    scale: [110.0, 130.81, 146.83, 164.81, 196.0],
    phraseGap: [8000, 18000],
    pluckLevel: 0.035,
    theme: TEMA_CASTLE,
  },
  // Ohmdal encendida: el mismo re, pero abierto y luminoso (re → sol → la)
  'ohmdal-on': {
    chords: [
      [73.42, 110.0, 185.0],
      [98.0, 146.83, 196.0],
      [110.0, 164.81, 220.0],
    ],
    droneType: 'sine',
    filter: 520,
    level: 0.15,
    scale: [293.66, 329.63, 369.99, 440.0, 493.88, 587.33],
    phraseGap: [3000, 7000],
    pluckLevel: 0.06,
    theme: TEMA_OHMDAL_ON,
  },
};

const MAX_GAIN = 0.6;
const VOL_KEY = 'roxana-audio-vol';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let echoIn: DelayNode | null = null;
let noiseBuf: AudioBuffer | null = null;

/** 0 = silenciado, 1-10 = volumen */
let volLevel = Math.max(0, Math.min(10, parseInt(localStorage.getItem(VOL_KEY) ?? '7', 10)));
let currentMood: Ambience | null = null;
let pendingMood: Ambience | null = null;
let moodGen = 0;
let moodFade: { gain: GainNode; stop: () => void } | null = null;
/** hasta cuándo (performance.now) está sonando un tema — pausa las frases sueltas */
let themeUntil = 0;

/* ---------- arranque (necesita un gesto del usuario) ---------- */

export function initAudio(): void {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();

  master = ctx.createGain();
  master.gain.value = (volLevel / 10) * MAX_GAIN;
  master.connect(ctx.destination);

  musicBus = ctx.createGain();
  musicBus.gain.value = 0.9;
  musicBus.connect(master);

  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.9;
  sfxBus.connect(master);

  // eco compartido: le da aire a plucks, campana y portal
  echoIn = ctx.createDelay(1);
  echoIn.delayTime.value = 0.31;
  const damp = ctx.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.value = 1800;
  const fb = ctx.createGain();
  fb.gain.value = 0.32;
  const echoOut = ctx.createGain();
  echoOut.gain.value = 0.5;
  echoIn.connect(damp);
  damp.connect(fb);
  fb.connect(echoIn);
  damp.connect(echoOut);
  echoOut.connect(musicBus);

  // buffer de ruido blanco reutilizable
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  // iOS y autoplay: reanudar ante cualquier gesto
  const resume = () => {
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  };
  window.addEventListener('pointerdown', resume);
  window.addEventListener('keydown', resume);

  if (pendingMood) startMood(pendingMood);
}

/* ---------- volumen ---------- */

export function getVolume(): number {
  return volLevel;
}

export function setVolume(v: number): void {
  volLevel = Math.max(0, Math.min(10, Math.round(v)));
  localStorage.setItem(VOL_KEY, String(volLevel));
  if (ctx && master) master.gain.setTargetAtTime((volLevel / 10) * MAX_GAIN, ctx.currentTime, 0.04);
}

function iconForVolume(v: number): string {
  if (v === 0) return '🔇';
  if (v <= 3) return '🔈';
  if (v <= 6) return '🔉';
  return '🔊';
}

/** Conecta el botón 🔊 del HUD (abre popover con slider) y la tecla M. */
export function initAudioButton(): void {
  const btn = document.getElementById('audio-btn') as HTMLButtonElement | null;
  if (!btn) return;

  // --- popover ---
  const pop = document.createElement('div');
  pop.id = 'audio-pop';
  pop.className = 'hidden';
  pop.innerHTML = `
    <input id="vol-slider" type="range" min="0" max="10" step="1" />
    <span id="vol-label"></span>`;
  btn.parentElement!.appendChild(pop);

  const slider = pop.querySelector<HTMLInputElement>('#vol-slider')!;
  const label = pop.querySelector<HTMLSpanElement>('#vol-label')!;

  const paint = () => {
    btn.textContent = iconForVolume(volLevel);
    btn.title = 'Volumen (M silencia)';
    slider.value = String(volLevel);
    label.textContent = String(volLevel);
  };

  slider.addEventListener('input', () => {
    setVolume(Number(slider.value));
    paint();
  });

  let popOpen = false;
  const openPop = () => {
    popOpen = true;
    paint();
    pop.classList.remove('hidden');
  };
  const closePop = () => {
    popOpen = false;
    pop.classList.add('hidden');
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    if (popOpen) closePop(); else openPop();
  });

  document.addEventListener('click', (e) => {
    if (popOpen && !pop.contains(e.target as Node) && e.target !== btn) closePop();
  });

  // M: silencia/restaura sin tocar el slider
  let lastNonZero = volLevel > 0 ? volLevel : 7;
  window.addEventListener('keydown', (ev) => {
    if (ev.code === 'KeyM') {
      if (volLevel > 0) {
        lastNonZero = volLevel;
        setVolume(0);
      } else {
        setVolume(lastNonZero);
      }
      paint();
    }
  });

  paint();
}

/* ---------- música ambiental ---------- */

/** Cambia (con crossfade) la atmósfera musical. Se puede llamar antes de initAudio. */
export function setAmbience(mood: Ambience): void {
  pendingMood = mood;
  if (!ctx || currentMood === mood) return;
  currentMood = mood;
  startMood(mood);
}

function startMood(mood: Ambience): void {
  if (!ctx || !musicBus) return;
  currentMood = mood;
  moodGen++;
  const gen = moodGen;
  const def = MOODS[mood];
  const t = ctx.currentTime;

  // despedir la atmósfera anterior
  if (moodFade) {
    const old = moodFade;
    old.gain.gain.cancelScheduledValues(t);
    old.gain.gain.setValueAtTime(old.gain.gain.value, t);
    old.gain.gain.linearRampToValueAtTime(0, t + 2.2);
    window.setTimeout(old.stop, 2600);
  }

  const moodGain = ctx.createGain();
  moodGain.gain.setValueAtTime(0, t);
  moodGain.gain.linearRampToValueAtTime(def.level, t + 2.5);
  moodGain.connect(musicBus);

  const stops: (() => void)[] = [];

  // colchón con filtro que se mueve muy despacio
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = def.filter;
  lp.connect(moodGain);

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.03;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = def.filter * 0.18;
  lfo.connect(lfoGain);
  lfoGain.connect(lp.frequency);
  lfo.start();
  stops.push(() => lfo.stop());

  // colchón por acordes: UNA onda por voz (los pares desafinados producían
  // batidos rítmicos tipo hélice) y cambio de acorde por crossfade
  // (el glide de frecuencia sonaba a motor acelerando)
  const liveChord: (() => void)[] = [];

  const spawnChord = (chord: number[], fadeS: number): void => {
    if (!ctx) return;
    // despedir el acorde anterior con fade
    for (const bye of liveChord.splice(0)) bye();
    const tt = ctx.currentTime;
    for (const f of chord) {
      const vg = ctx.createGain();
      vg.gain.setValueAtTime(0, tt);
      vg.gain.linearRampToValueAtTime(0.68, tt + fadeS);
      vg.connect(lp);

      // respiración lenta e independiente por voz
      const breath = ctx.createOscillator();
      breath.frequency.value = 0.018 + Math.random() * 0.022; // ~30-50 s por ciclo
      const depth = ctx.createGain();
      depth.gain.value = 0.22;
      breath.connect(depth);
      depth.connect(vg.gain);
      breath.start();

      const o = ctx.createOscillator();
      o.type = def.droneType;
      o.frequency.value = f;
      o.connect(vg);
      o.start();

      liveChord.push(() => {
        if (!ctx) return;
        const tb = ctx.currentTime;
        vg.gain.cancelScheduledValues(tb);
        vg.gain.setValueAtTime(vg.gain.value, tb);
        vg.gain.linearRampToValueAtTime(0, tb + 3.5);
        window.setTimeout(() => {
          try {
            o.stop();
            breath.stop();
          } catch {
            /* ya detenido */
          }
          vg.disconnect();
        }, 3800);
      });
    }
  };
  // que el stop del mood también apague el acorde vigente
  stops.push(() => {
    for (const bye of liveChord.splice(0)) bye();
  });

  spawnChord(def.chords[0], 2.5);

  // deriva armónica: cada tanto, crossfade hacia otro acorde de la tonalidad
  let chordIdx = 0;
  const drift = () => {
    window.setTimeout(() => {
      if (gen !== moodGen || !ctx) return;
      // no cambiar de acorde mientras suena el tema (la melodía pide la tónica)
      if (performance.now() < themeUntil) {
        drift();
        return;
      }
      let next = Math.floor(Math.random() * def.chords.length);
      if (next === chordIdx) next = (next + 1) % def.chords.length;
      chordIdx = next;
      spawnChord(def.chords[chordIdx], 4.5);
      drift();
    }, 20000 + Math.random() * 20000);
  };
  drift();

  // el tema compuesto de la zona, cada tanto, sobre el colchón
  const themePlay = (first: boolean) => {
    window.setTimeout(() => {
      if (gen !== moodGen || !ctx) return;
      // el colchón vuelve a la tónica bajo la melodía
      if (chordIdx !== 0) {
        chordIdx = 0;
        spawnChord(def.chords[0], 3);
      }
      const ms = playTheme(def.theme, moodGain);
      themeUntil = performance.now() + ms + 2500;
      themePlay(false);
    }, first ? 8000 + Math.random() * 6000 : 35000 + Math.random() * 30000);
  };
  themePlay(true);

  if (def.hum) {
    const hum = ctx.createOscillator();
    hum.type = 'square';
    hum.frequency.value = def.hum;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.04;
    hum.connect(humGain);
    humGain.connect(lp);
    hum.start();
    stops.push(() => hum.stop());
  }

  moodFade = {
    gain: moodGain,
    stop: () => {
      for (const s of stops) {
        try {
          s();
        } catch {
          /* ya detenido */
        }
      }
      moodGain.disconnect();
    },
  };

  schedulePhrase(def, moodGain, gen);
}

/** Frases de 1-3 notas con ritmo y dinámica variables, separadas por
 *  silencios largos. A veces una octava abajo. Evita repetir la misma nota. */
function schedulePhrase(def: MoodDef, dest: GainNode, gen: number): void {
  const [a, b] = def.phraseGap;
  window.setTimeout(() => {
    if (gen !== moodGen || !ctx) return;
    // mientras suena el tema compuesto, las frases sueltas se callan
    if (performance.now() < themeUntil) {
      schedulePhrase(def, dest, gen);
      return;
    }
    const notas = 1 + Math.floor(Math.random() * 3);
    const octava = Math.random() < 0.25 ? 0.5 : 1;
    let prev = -1;
    let cuando = 0;
    for (let i = 0; i < notas; i++) {
      let idx = Math.floor(Math.random() * def.scale.length);
      if (idx === prev) idx = (idx + 1) % def.scale.length;
      prev = idx;
      pluck(def.scale[idx] * octava, def.pluckLevel * (0.65 + Math.random() * 0.35), dest, cuando);
      cuando += 0.32 + Math.random() * 0.55;
    }
    schedulePhrase(def, dest, gen);
  }, a + Math.random() * (b - a));
}

/* ---------- el secuenciador de temas ---------- */

const SEMIS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function noteFreq(n: string): number {
  const m = /^([A-G])(#|b)?(\d)$/.exec(n);
  if (!m) return 440;
  const semi = SEMIS[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const midi = 12 * (Number(m[3]) + 1) + semi;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Nota de melodía, timbre de cajita de música: fundamental + parcial agudo breve. */
function melodyNote(freq: number, when: number, dur: number, level: number, dest: GainNode): void {
  if (!ctx) return;
  const lvl = level * (0.85 + Math.random() * 0.3); // dinámica humana
  const ring = Math.min(dur * 1.5, 2.6); // las notas se solapan apenas, como cuerdas que siguen vibrando

  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(lvl, when + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, when + ring);
  g.connect(dest);
  if (echoIn) {
    const send = ctx.createGain();
    send.gain.value = 0.16;
    g.connect(send);
    send.connect(echoIn);
  }
  const o = ctx.createOscillator();
  o.frequency.value = freq;
  o.connect(g);
  o.start(when);
  o.stop(when + ring + 0.1);

  // parcial dos octavas arriba, muy corto: el "tink" metálico de la cajita
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0, when);
  g2.gain.linearRampToValueAtTime(lvl * 0.18, when + 0.008);
  g2.gain.exponentialRampToValueAtTime(0.0001, when + 0.35);
  g2.connect(dest);
  const o2 = ctx.createOscillator();
  o2.frequency.value = freq * 4;
  o2.connect(g2);
  o2.start(when);
  o2.stop(when + 0.45);
}

/** Nota de bajo: redonda y suave, sostiene casi toda su duración. */
function bassNote(freq: number, when: number, dur: number, level: number, dest: GainNode): void {
  if (!ctx) return;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(level, when + 0.06);
  g.gain.setValueAtTime(level, when + Math.max(dur * 0.6, 0.1));
  g.gain.linearRampToValueAtTime(0, when + dur * 1.02);
  g.connect(dest);
  const o = ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.value = freq;
  o.connect(g);
  o.start(when);
  o.stop(when + dur * 1.05 + 0.1);
}

/** Toca el tema completo (melodía + bajo) y devuelve su duración en ms. */
function playTheme(theme: ThemeDef, dest: GainNode): number {
  if (!ctx) return 0;
  const beat = 60 / theme.tempo;
  const t0 = ctx.currentTime + 0.08;
  let beats = 0;
  for (const [n, b] of theme.melody) {
    if (n) {
      const swing = (Math.random() - 0.5) * 0.018; // micro-desfase humano
      melodyNote(noteFreq(n), t0 + beats * beat + swing, b * beat, theme.melodyLevel, dest);
    }
    beats += b;
  }
  let bassBeats = 0;
  for (const [n, b] of theme.bass) {
    if (n) bassNote(noteFreq(n), t0 + bassBeats * beat, b * beat, theme.bassLevel, dest);
    bassBeats += b;
  }
  return Math.max(beats, bassBeats) * beat * 1000;
}

function pluck(freq: number, level: number, dest: GainNode, when = 0): void {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(level, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
  g.connect(dest);
  if (echoIn) g.connect(echoIn);
  const o = ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.value = freq;
  o.connect(g);
  o.start(t);
  o.stop(t + 2.3);
}

/* ---------- helpers de SFX ---------- */

function env(level: number, dur: number, attack = 0.005, when = 0): GainNode | null {
  if (!ctx || !sfxBus) return null;
  const t = ctx.currentTime + when;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(level, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(sfxBus);
  return g;
}

function tone(
  freq: number,
  type: OscillatorType,
  level: number,
  dur: number,
  opts: { when?: number; to?: number; echo?: boolean; attack?: number } = {},
): void {
  if (!ctx) return;
  const when = opts.when ?? 0;
  const g = env(level, dur, opts.attack ?? 0.005, when);
  if (!g) return;
  if (opts.echo && echoIn) g.connect(echoIn);
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
  o.connect(g);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(
  level: number,
  dur: number,
  filterType: BiquadFilterType,
  freq: number,
  opts: { when?: number; to?: number; q?: number } = {},
): void {
  if (!ctx || !noiseBuf) return;
  const when = opts.when ?? 0;
  const g = env(level, dur, 0.005, when);
  if (!g) return;
  const t = ctx.currentTime + when;
  const f = ctx.createBiquadFilter();
  f.type = filterType;
  f.frequency.setValueAtTime(freq, t);
  if (opts.to) f.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
  f.Q.value = opts.q ?? 1;
  f.connect(g);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  src.connect(f);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/* ---------- efectos del mundo ---------- */

let stepFlip = false;

/** Pasos (alterna dos timbres). `vol` atenúa: 1 = jugador, menos para NPCs. */
export function sfxStep(vol = 1): void {
  stepFlip = !stepFlip;
  noise(0.07 * vol, 0.07, 'lowpass', stepFlip ? 500 : 640);
}

/** Cruzar una puerta / cambiar de sala. */
export function sfxDoor(): void {
  noise(0.12, 0.25, 'bandpass', 600, { to: 250, q: 1.5 });
  tone(90, 'sine', 0.14, 0.18, { when: 0.08 });
}

/** Puerta trabada: dos golpes sordos. */
export function sfxLocked(): void {
  tone(95, 'square', 0.16, 0.09);
  tone(85, 'square', 0.14, 0.09, { when: 0.15 });
}

/** Avance de diálogo. */
export function sfxBlip(): void {
  tone(750, 'triangle', 0.05, 0.05);
}

/** Nota de la Bitácora (toast). */
export function sfxToast(): void {
  tone(880, 'sine', 0.07, 0.9, { echo: true });
  tone(1174.7, 'sine', 0.06, 0.9, { when: 0.12, echo: true });
}

/** Abrir un panel (banco, Bitácora). */
export function sfxUIOpen(): void {
  noise(0.07, 0.2, 'bandpass', 400, { to: 1400, q: 1.2 });
}

/** Cerrar un panel. */
export function sfxUIClose(): void {
  noise(0.07, 0.2, 'bandpass', 1400, { to: 400, q: 1.2 });
}

/** Tick de selección / botón. */
export function sfxClick(): void {
  tone(1500, 'square', 0.045, 0.03);
}

/** Clink metálico: engastar piedra, colocar puente, cambiar fusible. */
export function sfxBridge(): void {
  tone(2350, 'sine', 0.08, 0.12);
  tone(1570, 'sine', 0.06, 0.09, { when: 0.03 });
}

/** ¡FZZT! — fusible inmolado. */
export function sfxFzzt(): void {
  tone(320, 'sawtooth', 0.18, 0.45, { to: 55 });
  noise(0.15, 0.3, 'highpass', 1000);
  noise(0.08, 0.05, 'bandpass', 2600, { when: 0.32, q: 4 });
}

/** Fusible mayor del Tronco: chasquido eléctrico y trueno grave. */
export function sfxTrunkFuse(): void {
  sfxFzzt();
  noise(0.28, 1.15, 'lowpass', 190, { to: 55, q: 1.2 });
  tone(48, 'sine', 0.2, 1.2, { to: 32, attack: 0.02 });
}

/** Sobrecarga sin fusible: crepitar caliente. */
export function sfxHot(): void {
  for (let i = 0; i < 5; i++) {
    noise(0.07, 0.04, 'bandpass', 2000 + Math.random() * 1200, {
      when: i * 0.07 + Math.random() * 0.03,
      q: 5,
    });
  }
}

/** Resultado flojo / decepción suave. */
export function sfxDim(): void {
  tone(175, 'triangle', 0.1, 0.7, { to: 158 });
}

/** Luz firme: acorde cálido. */
export function sfxOk(): void {
  tone(587.33, 'sine', 0.08, 1.2, { echo: true });
  tone(739.99, 'sine', 0.07, 1.2, { when: 0.12, echo: true });
  tone(880, 'sine', 0.06, 1.2, { when: 0.24, echo: true });
}

/** Puzzle resuelto: arpegio. */
export function sfxWin(): void {
  const notas = [293.66, 369.99, 440, 587.33];
  notas.forEach((f, i) => tone(f, 'triangle', 0.09, 1.0, { when: i * 0.15, echo: true }));
}

/** La Puerta de Ohm abriéndose: retumbe que sube. */
export function sfxGate(): void {
  noise(0.22, 1.6, 'lowpass', 140);
  tone(49, 'sine', 0.12, 1.6, { to: 98, attack: 0.3 });
}

/** La campana de Ohmdal. */
export function sfxBell(): void {
  const base = 293.66;
  const parciales: [number, number][] = [
    [1, 0.16],
    [2.04, 0.1],
    [2.72, 0.07],
    [3.76, 0.05],
    [5.1, 0.03],
  ];
  for (const [ratio, lvl] of parciales) {
    tone(base * ratio, 'sine', lvl, 3.5 + Math.random(), { echo: true, attack: 0.002 });
  }
}

/** Cruzar el portal: destellos. */
export function sfxPortal(): void {
  for (let i = 0; i < 6; i++) {
    tone(900 + Math.random() * 1300, 'sine', 0.045, 0.8, { when: i * 0.09, echo: true });
  }
}

/** Timbre eléctrico de escuela: tono metálico repetitivo ~0.8 s. */
export function sfxSchoolBell(): void {
  // Tres pulsos metálicos característicos del timbre eléctrico de escuela
  const base = 880; // la5 — metálico
  for (let i = 0; i < 3; i++) {
    const when = i * 0.27;
    tone(base, 'square', 0.14, 0.18, { when, attack: 0.002 });
    tone(base * 1.5, 'sine', 0.07, 0.12, { when: when + 0.01 });
    noise(0.06, 0.09, 'bandpass', 3500, { when: when + 0.005, q: 6 });
  }
}
