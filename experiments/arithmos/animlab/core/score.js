// Partitura de sonido determinista: se arma desde la línea de tiempo de la escena (no con duraciones a ojo)
// y se puede renderizar fuera de línea (OfflineAudioContext) a WAV o tocar en vivo desde un instante.
//
// Reglas (verificables con la envolvente RMS contra la sonda de contacto):
//  - el rasgueo de tiza suena SÓLO mientras la punta toca; su volumen sigue la velocidad de la punta
//    y su brillo sube con la velocidad (filtro pasabanda que se corre);
//  - cada apoyo de la tiza es un golpecito; levantar la tiza es silencio;
//  - los pasos son golpes graves y apagados; los saltos de Punto, una nota corta (contar = una escala que sube).
// Nada de esto está certificado como "suena bien": eso lo decide quien lo escucha [H].

const SR = 44100;

/** Ruido blanco determinista (mismo resultado en cada render). */
function noiseBuffer(ctx, sec, seed = 7) {
  const b = ctx.createBuffer(1, Math.ceil(sec * ctx.sampleRate), ctx.sampleRate);
  const d = b.getChannelData(0);
  let a = seed >>> 0;
  for (let i = 0; i < d.length; i++) {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    d[i] = (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  }
  return b;
}

/**
 * events:
 *  {type:'chalk', t0, t1, speed: t => px/s}   rasgueo con envolvente de velocidad
 *  {type:'tap', t, strength}                   apoyo de tiza
 *  {type:'step', t, strength}                  paso
 *  {type:'note', t, freq, dur, gain}           nota (Punto)
 *  {type:'erase', t0, t1, speed}               borrador
 */
export function renderScore(ctx, events, {t0 = 0} = {}) {
  const out = ctx.createDynamicsCompressor();
  out.threshold.value = -14; out.knee.value = 12; out.ratio.value = 4; out.attack.value = 0.005; out.release.value = 0.2;
  const master = ctx.createGain();
  master.gain.value = 0.9;
  out.connect(master);
  master.connect(ctx.destination);
  const shelf = ctx.createBiquadFilter();
  shelf.type = 'highshelf'; shelf.frequency.value = 5200; shelf.gain.value = -9;
  shelf.connect(out);
  const noise = noiseBuffer(ctx, 4);
  const at = t => Math.max(0, t - t0);
  for (const e of events) {
    if ((e.t1 ?? e.t) < t0) continue;
    if (e.type === 'chalk' || e.type === 'erase') {
      const src = ctx.createBufferSource();
      src.buffer = noise; src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = e.type === 'chalk' ? 'bandpass' : 'lowpass';
      bp.Q.value = e.type === 'chalk' ? 0.9 : 0.4;
      const g = ctx.createGain();
      g.gain.value = 0;
      src.connect(bp); bp.connect(g); g.connect(shelf);
      // envolvente: se muestrea la velocidad a 120 Hz
      const vref = e.type === 'chalk' ? 600 : 900;
      g.gain.setValueAtTime(0, at(e.t0));
      for (let t = e.t0; t <= e.t1 + 1e-6; t += 1 / 120) {
        const v = e.speed(t);
        const k = Math.min(1.3, Math.pow(v / vref, 0.7));
        // grano: la tiza salta en el diente (modulación rápida, determinista)
        const grain = e.type === 'chalk' ? 0.75 + 0.25 * Math.sin(t * 173) * Math.sin(t * 61 + 1) : 1;
        g.gain.linearRampToValueAtTime((e.type === 'chalk' ? 0.17 : 0.13) * k * grain, at(t));
        bp.frequency.linearRampToValueAtTime(e.type === 'chalk' ? 1400 + 900 * Math.min(1.2, v / vref) : 700 + 500 * Math.min(1, v / vref), at(t));
      }
      g.gain.linearRampToValueAtTime(0, at(e.t1) + 0.03);
      src.start(at(e.t0), (e.t0 * 0.37) % 3);
      src.stop(at(e.t1) + 0.06);
    } else if (e.type === 'tap' || e.type === 'step') {
      const tap = e.type === 'tap';
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = tap ? 1300 : 260; bp.Q.value = tap ? 1.4 : 0.8;
      const g = ctx.createGain();
      const s = e.strength ?? 0.5, T = at(e.t);
      g.gain.setValueAtTime(0.0001, T);
      g.gain.exponentialRampToValueAtTime((tap ? 0.3 : 0.22) * s, T + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, T + (tap ? 0.05 : 0.09));
      src.connect(bp); bp.connect(g); g.connect(shelf);
      src.start(T, (e.t * 0.91) % 3); src.stop(T + 0.12);
    } else if (e.type === 'note') {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = e.freq;
      const g = ctx.createGain();
      const T = at(e.t), dur = e.dur ?? 0.22;
      g.gain.setValueAtTime(0.0001, T);
      g.gain.exponentialRampToValueAtTime(e.gain ?? 0.07, T + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, T + dur);
      o.connect(g); g.connect(out);
      o.start(T); o.stop(T + dur + 0.02);
    }
  }
}

/** Renderiza fuera de línea y devuelve {wav: base64, rms: Float32Array a 60 Hz}. */
export async function renderOffline(events, duration) {
  const ctx = new OfflineAudioContext(1, Math.ceil(duration * SR), SR);
  renderScore(ctx, events);
  const buf = await ctx.startRendering();
  const d = buf.getChannelData(0);
  const hop = SR / 60, rms = new Float32Array(Math.floor(d.length / hop));
  for (let i = 0; i < rms.length; i++) { let a = 0; for (let j = 0; j < hop; j++) { const v = d[i * hop + j] || 0; a += v * v; } rms[i] = Math.sqrt(a / hop); }
  return {wav: toWavBase64(d, SR), rms};
}

function toWavBase64(d, sr) {
  const n = d.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i])) * 32767, true);
  let s = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Escala para contar (pentatónica que sube): la n-ésima cuenta suena más aguda. */
export const countNote = n => 392 * Math.pow(2, [0, 2, 4, 7, 9, 12, 14, 16, 19, 21][n % 10] / 12);
