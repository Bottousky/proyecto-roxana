// Auditoría numérica de una escena real del juego. El sonido se certifica midiendo, no escuchando (como en el «Opus 5.5
// Motion Lab» de Florence: cada golpe se alinea con el cuadro de su imagen midiendo el audio decodificado), y los puntos
// no se teletransportan (0xMovez: «never let the ball teleport between components: show the path of every handoff»).
//
// La escena corre con un reloj fijo de 60 Hz: cada cuadro avanza exactamente 1/60 s del juego, tarde lo que tarde en
// dibujarse (sirve igual en una Mac con GPU que en un contenedor con WebGL por software). Se registran:
//  - cada pedido al sonido (`game.audio`: chalkStart, tap, punto, note, cue…) con su tiempo de juego;
//  - los contactos visibles: despegue, aterrizaje, aparición y llegada de cada punto (desde su recorrido), comienzo de
//    cada trazo de tiza o letra (el plan de mano de `Drawing`/`Label` con ?anim=2);
//  - la posición dibujada de cada punto en cada cuadro.
// Después el sonido se vuelve a generar sin parlantes (OfflineAudioContext, 48 kHz) en tres pistas — mezcla, golpes
// (tap, voz de Punto, golpes de inicio de trazo) y fondo (rasgueo, borrador, música) — y se mide:
//  - sincronía: pico de cada golpe menos el cuadro de su contacto, en cuadros de 60 Hz (QUALITY_BAR §Sonido: en el cuadro
//    del contacto o el siguiente, −1 < Δ ≤ +1; perceptible si se adelanta > 45 ms o se atrasa > 125 ms);
//  - golpe sobre el fondo: energía con ponderación K en los primeros 60 ms (objetivo 3–6 dB);
//  - sonoridad integrada (BS.1770, LUFS), sonoridad en la banda de un parlante de teléfono (200 Hz–6 kHz), pico verdadero
//    aproximado (sobremuestreo ×4) y continua;
//  - contactos sin sonido y golpes sin contacto (para decidir, no necesariamente defectos).
// Traspasos: un punto visible que se corre más de 24 px en un cuadro y más de 4× que en los cuadros vecinos (sin camino).
//
// Uso: node scripts/scene-audit.mjs <carpeta-salida> <escena> [segundos de juego=20] [--q=anim=2] [--wav]
// Con --wav guarda la mezcla (mezcla.wav) para escucharla [H]. Con --replay=<carpeta de una auditoría anterior> no corre
// la escena: vuelve a generar y medir el sonido de los mismos pedidos con el motor de sonido actual (para ajustar niveles
// midiendo, en segundos; los pedidos grabados no cambian, así que sirve para cambios en audio.js, no en las escenas).
import {writeFile, mkdir, readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {launch} from './browser.mjs';
import {startServer} from './serve.mjs';

const args = process.argv.slice(2);
const [outDir, seg, secs = '20'] = args.filter(a => !a.startsWith('--'));
const extra = (args.find(a => a.startsWith('--q=')) || '').slice(4);
const wantWav = args.includes('--wav');
const replay = (args.find(a => a.startsWith('--replay=')) || '').slice(9);
if (!outDir || !seg) { console.error('uso: node scripts/scene-audit.mjs <carpeta-salida> <escena> [segundos] [--q=anim=2] [--wav]'); process.exit(2); }
await mkdir(outDir, {recursive: true});

const server = await startServer(0);
const browser = await launch(['--autoplay-policy=no-user-gesture-required', '--use-angle=metal', '--enable-gpu']);
const page = await browser.newPage({viewport: {width: 1600, height: 900}});
const errors = [];
page.on('pageerror', e => errors.push(String(e.stack || e)));

let rec;
if (replay) {
  const old = JSON.parse(await readFile(join(replay, 'audit.json'), 'utf8'));
  // sin tracks.json (no se versiona: es pesado) quedan los contactos guardados y no se buscan teletransportes
  const tracks = await readFile(join(replay, 'tracks.json'), 'utf8').then(JSON.parse, () => null);
  rec = {calls: old.calls, contacts: old.contacts, vol: old.vol ?? {master: 0.8, music: 0.7, sfx: 0.8}, T: old.T, tracks: tracks ?? {}, keepContacts: !tracks};
  await page.goto(`http://127.0.0.1:${server.address().port}/README.md`);
} else {
  await page.addInitScript(() => {
    // reloj fijo: cada cuadro de requestAnimationFrame avanza 1/60 s; performance.now es ese reloj
    const STEP = 1000 / 60, raf = window.requestAnimationFrame.bind(window);
    let vnow = 0, frame = 0, q = [];
    performance.now = () => vnow;
    const clock = window.__clock = {frame: 0, t: 0, after: []};
    window.requestAnimationFrame = cb => {
      q.push(cb);
      if (q.length === 1) raf(() => {
        const cbs = q; q = [];
        vnow += STEP; frame++; clock.frame = frame; clock.t = frame / 60;
        for (const c of cbs) c(vnow);
        for (const h of clock.after) h(clock.t);
      });
      return q.length;
    };

    // registro del sonido: sólo los pedidos de primer nivel (chalkStart llama a tap por dentro: no se cuenta dos veces)
    const calls = window.__calls = [];
    const FNS = ['chalkStart', 'tap', 'erase', 'marea', 'note', 'pad', 'punto', 'cue'];
    let depth = 0, handles = 0;
    const hook = audio => {
      for (const fn of FNS) {
        const orig = audio[fn]?.bind(audio);
        if (!orig) continue;
        audio[fn] = (...a) => {
          const top = depth === 0;
          // origen: la interfaz (pasar el diálogo, elegir) responde al jugador, no a un contacto de la escena
          const rec = top ? {t: clock.t, fn, args: JSON.parse(JSON.stringify(a)), src: /engine\/ui\.js/.test(new Error().stack) ? 'ui' : 'escena'} : null;
          if (top) calls.push(rec);
          depth++;
          let r;
          try { r = orig(...a); } finally { depth--; }
          if (!top || (fn !== 'chalkStart' && fn !== 'erase')) return r;
          // el pedido devuelve un mango que se puede detener antes de tiempo (saltar, d.draw que termina)
          rec.h = ++handles;
          return {stop: () => { calls.push({t: clock.t, fn: 'stop', h: rec.h}); r?.stop(); }};
        };
      }
    };
    let game = null;
    Object.defineProperty(window, '__game', {configurable: true, get: () => game, set: g => { game = g; if (g?.audio) hook(g.audio); }});

    // contactos y recorridos de los puntos, cuadro a cuadro (después de que el juego dibujó el cuadro)
    const contacts = window.__contacts = [], tracks = window.__tracks = {}, prev = new Map();
    clock.after.push(t => {
      const g = window.__game;
      if (!g?.world) return;
      for (const o of g.world.objects) {
        const kind = o.constructor?.name;
        if (kind === 'Dot') {
          const so = o.settleNow;
          const vis = o.visible !== false && (o.fade ?? 1) > 0.05 ? 1 : 0;
          const x = o.x + (so ? so[0] : 0), y = o.y - (o.lift || 0) + (so ? so[1] : 0);
          // [t, x, y dibujadas, visible, altura del salto]: despegues y aterrizajes se deciden después con la rapidez vertical
          (tracks[o.id] ??= []).push([+t.toFixed(4), +x.toFixed(2), +y.toFixed(2), vis, +(o.lift || 0).toFixed(2)]);
        }
        const plan = o.dep ?? o.gplan?.plan;
        if (plan?.list && typeof o.planDuration === 'function') {
          const v = o[o.planKey ?? 'progress'] ?? 0, n = plan.list.filter(e => v * plan.T > e.t0).length;
          const p = prev.get(o) ?? {n: 0, v: 0};
          // un dibujo que aparece entero de un cuadro al otro (saltar, ya estaba) no es escritura
          if (n > p.n && !(p.v <= 0 && v >= 1)) for (let i = p.n; i < n; i++) contacts.push({t, kind: kind === 'Label' ? 'letra' : 'trazo', id: o.id, i});
          prev.set(o, {n, v});
        }
      }
    });
  });

  await page.goto(`http://127.0.0.1:${server.address().port}/?seg=${seg}${extra ? '&' + extra : ''}`);
  await page.waitForFunction(() => window.__ready === true, null, {timeout: 60000});
  await page.evaluate(() => window.__game.audio.unlock());
  const wallEnd = Date.now() + 15 * 60 * 1000;
  while (Date.now() < wallEnd) {
    // avanza el texto como alguien que lee rápido; elige la última opción si hay que elegir
    const t = await page.evaluate(() => {
      const g = window.__game;
      if (g?.ui.waiting && !g.ui.typing) g.ui.advance();
      const opts = [...document.querySelectorAll('#choices button:not([disabled])')];
      if (opts.length) opts.at(-1).click();
      return window.__clock.t;
    }).catch(() => 0);
    if (t >= Number(secs)) break;
    await page.waitForTimeout(100);
  }

  rec = await page.evaluate(() => ({calls: window.__calls, contacts: window.__contacts, tracks: window.__tracks, vol: window.__game.audio.vol, T: window.__clock.t}));
}

// contactos de los puntos, desde sus recorridos (también con --replay: se recalculan con las reglas de ahora)
const DOT_KINDS = new Set(['despegue', 'aterrizaje', 'aparece', 'llega']);
if (!rec.keepContacts) rec.contacts = rec.contacts.filter(c => !DOT_KINDS.has(c.kind));
for (const [id, tr] of Object.entries(rec.tracks)) {
  const step = k => Math.hypot(tr[k][1] - tr[k - 1][1], tr[k][2] - tr[k - 1][2]);
  let moving = false;
  for (let k = 1; k < tr.length; k++) {
    // aparece: se vuelve visible (los puntos de la Ronda que vuelven de a uno)
    if (tr[k][3] && !tr[k - 1][3]) rec.contacts.push({t: tr[k][0], kind: 'aparece', id});
    if (!tr[k][3]) { moving = false; continue; }
    // despegue / aterrizaje: deja el suelo o vuelve a él con rapidez vertical ≥ 1.5 px por cuadro (media de 3 cuadros
    // del lado del aire); una subida lenta (la Ronda que flota, un saltito de 10 px en 0.5 s) no es un contacto
    const up = (tr[k][4] ?? 0) > 0.01, was = (tr[k - 1][4] ?? 0) > 0.01;
    if (up !== was) {
      const air = up ? tr.slice(k, k + 3) : tr.slice(Math.max(0, k - 3), k);
      const v = air.length > 1 ? Math.abs(air.at(-1)[4] - air[0][4]) / (air.length - 1) : air[0]?.[4] ?? 0;
      if (Math.max(v, up ? 0 : tr[k - 1][4]) >= 1.5) rec.contacts.push({t: tr[k][0], kind: up ? 'despegue' : 'aterrizaje', id});
    }
    // llega: después de un viaje rápido (≥ 4 px por cuadro, 240 px/s) queda quieto (< 0.5 px por cuadro); el andar de la
    // Ronda y el deambular no llegan a esa rapidez
    const v = step(k);
    if (v >= 4 && !up) moving = true;
    else if (moving && v < 0.5) { moving = false; if (!up) rec.contacts.push({t: tr[k][0], kind: 'llega', id}); }
  }
}
rec.contacts.sort((a, b) => a.t - b.t);

// ——— sonido: tres pistas sin parlantes y sus medidas ———
const audio = await page.evaluate(async ({calls, vol, T, wantWav}) => {
  const {Sound} = await import('/src/engine/audio.js');
  const SR = 48000, Q = 128 / SR, LEN = Math.ceil(SR * (T + 3));
  const isHit = c => c.fn === 'tap' || c.fn === 'punto';
  const renderErrors = [];

  async function render(stem) {
    const ctx = new OfflineAudioContext(2, LEN, SR);
    const s = new Sound();
    s.unlock(ctx);
    s.setVolumes(vol);
    const handles = new Map(), hits = [], groups = new Map();
    for (const c of calls) {
      const k = Math.max(1, Math.round(c.t / Q));
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(c);
    }
    const play = (c, at) => {
      if (c.fn === 'stop') { if (stem !== 'hits') handles.get(c.h)?.stop(); return; }
      if (c.fn === 'chalkStart') {
        const [sec = 1, strength = 1, env = null] = c.args;
        const taps = env?.length ? env.filter(e => e.tap).map(e => e.t) : [0];
        taps.forEach(dt => hits.push({t: at + dt, fn: 'tiza', call: c.t, src: c.src}));
        // golpes: los mismos que pide el chalkStart del motor (se capturan con una instancia de prueba que nunca suena)
        if (stem === 'hits') {
          const probe = new Sound(), asked = [];
          probe.unlock(new OfflineAudioContext(1, 128, SR));
          probe.tap = (...a) => asked.push(a);
          probe.chalkStart(...c.args);
          for (const a of asked) s.tap(...a);
          return;
        }
        if (stem === 'bed') s.tap = () => {};
        try { handles.set(c.h, s.chalkStart(...c.args)); } finally { delete s.tap; }
        return;
      }
      if (isHit(c)) {
        hits.push({t: at + (c.fn === 'tap' ? c.args[2] ?? 0 : c.args[1] ?? 0), fn: c.fn === 'tap' ? 'golpe' : `punto ${c.args[0] ?? 'hello'}`, call: c.t, src: c.src});
        if (stem === 'bed') return;
      } else if (stem === 'hits') return;
      const r = s[c.fn](...c.args);
      if (c.h) handles.set(c.h, r);
    };
    // un pedido que falla no puede dejar el render suspendido para siempre: se anota y se sigue
    for (const [k, cs] of groups) ctx.suspend(k * Q).then(() => { for (const c of cs) try { play(c, k * Q); } catch (e) { renderErrors.push(`${c.fn} @${c.t}: ${e.message}`); } ctx.resume(); });
    const buf = await ctx.startRendering();
    return {L: buf.getChannelData(0), R: buf.getChannelData(1), hits};
  }

  // ponderación K (BS.1770 a 48 kHz) y filtros de banda
  const biquad = (x, b, a) => {
    const y = new Float32Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) { const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
    return y;
  };
  const kw = x => biquad(biquad(x, [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]), [1, -2, 1], [1, -1.99004745483398, 0.99007225036621]);
  const butter = (x, f, hp) => { // segundo orden, Q = 0.7071
    const w = 2 * Math.PI * f / SR, al = Math.sin(w) / (2 * Math.SQRT1_2), c = Math.cos(w), a0 = 1 + al;
    const b = hp ? [(1 + c) / 2, -(1 + c), (1 + c) / 2] : [(1 - c) / 2, 1 - c, (1 - c) / 2];
    return biquad(x, b.map(v => v / a0), [1, -2 * c / a0, (1 - al) / a0]);
  };
  const phone = x => butter(butter(butter(butter(x, 200, true), 200, true), 6000, false), 6000, false);
  function lufs(L, R) {
    const n = Math.round(0.4 * SR), hop = Math.round(0.1 * SR), blocks = [];
    for (let i = 0; i + n <= L.length; i += hop) { let s = 0; for (let j = i; j < i + n; j++) s += L[j] * L[j] + R[j] * R[j]; blocks.push(s / n); }
    const loud = z => -0.691 + 10 * Math.log10(Math.max(z, 1e-12));
    const abs = blocks.filter(z => loud(z) > -70);
    if (!abs.length) return -Infinity;
    const rel = loud(abs.reduce((a, b) => a + b, 0) / abs.length) - 10;
    const gated = abs.filter(z => loud(z) > rel);
    return +loud(gated.reduce((a, b) => a + b, 0) / gated.length).toFixed(1);
  }
  function truePeak(x) { // sobremuestreo ×4 con sinc enventanado (±8 muestras)
    let pk = 0;
    const taps = [1, 2, 3].map(p => { const f = p / 4, w = []; for (let k = -7; k <= 8; k++) { const u = k - f; const h = 0.5 * (1 + Math.cos(Math.PI * u / 8.5)); w.push(u === 0 ? 1 : Math.sin(Math.PI * u) / (Math.PI * u) * h); } return w; });
    for (let i = 7; i < x.length - 8; i++) {
      pk = Math.max(pk, Math.abs(x[i]));
      for (const w of taps) { let s = 0; for (let k = 0; k < 16; k++) s += w[k] * x[i - 7 + k]; pk = Math.max(pk, Math.abs(s)); }
    }
    return pk;
  }
  const db = v => +(20 * Math.log10(Math.max(v, 1e-9))).toFixed(1);
  const energy = (x, i0, i1) => { let s = 0; for (let i = Math.max(0, i0); i < Math.min(x.length, i1); i++) s += x[i] * x[i]; return s; };

  const mix = await render('mix'), hitsStem = await render('hits'), bed = await render('bed');
  const mean = x => x.reduce((a, b) => a + b, 0) / x.length;
  const lowShare = (() => { const lo = butter(butter(mix.L, 60, false), 60, false); return energy(lo, 0, lo.length) / Math.max(1e-12, energy(mix.L, 0, mix.L.length)); })();
  const summary = {
    lufs: lufs(mix.L, mix.R),
    lufsPhone: lufs(phone(mix.L), phone(mix.R)),
    truePeakDb: db(Math.max(truePeak(mix.L), truePeak(mix.R))),
    dc: +Math.max(Math.abs(mean(mix.L)), Math.abs(mean(mix.R))).toExponential(1),
    under60Hz: +lowShare.toFixed(3),
  };
  // cada golpe: dónde cae su pico (en la pista de golpes) y cuánto sobresale del fondo (ponderación K, 60 ms)
  const hk = kw(hitsStem.L), bk = kw(bed.L), W = Math.round(0.06 * SR);
  const hits = hitsStem.hits.map(h => {
    const i0 = Math.round(h.t * SR);
    let pk = 0, at = i0;
    for (let i = Math.max(0, i0 - 96); i < Math.min(hitsStem.L.length, i0 + Math.round(0.04 * SR)); i++) { const v = Math.abs(hitsStem.L[i]); if (v > pk) { pk = v; at = i; } }
    // sobre un fondo de menos de −60 dBFS el golpe suena sobre silencio: no hay relación que medir (null)
    const eh = energy(hk, i0, i0 + W), eb = energy(bk, i0, i0 + W);
    return {...h, t: +h.t.toFixed(4), peakT: +(at / SR).toFixed(4), overBedDb: eb / W < 1e-6 ? null : +(10 * Math.log10(eh / eb)).toFixed(1)};
  });
  let wav = null;
  if (wantWav) {
    const n = mix.L.length, buf = new DataView(new ArrayBuffer(44 + n * 4));
    const str = (o, s) => [...s].forEach((c, i) => buf.setUint8(o + i, c.charCodeAt(0)));
    str(0, 'RIFF'); buf.setUint32(4, 36 + n * 4, true); str(8, 'WAVEfmt '); buf.setUint32(16, 16, true); buf.setUint16(20, 1, true); buf.setUint16(22, 2, true);
    buf.setUint32(24, SR, true); buf.setUint32(28, SR * 4, true); buf.setUint16(32, 4, true); buf.setUint16(34, 16, true); str(36, 'data'); buf.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { buf.setInt16(44 + i * 4, Math.max(-1, Math.min(1, mix.L[i])) * 32767, true); buf.setInt16(46 + i * 4, Math.max(-1, Math.min(1, mix.R[i])) * 32767, true); }
    const bytes = new Uint8Array(buf.buffer);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    wav = btoa(bin);
  }
  return {summary: {...summary, renderErrors: [...new Set(renderErrors)]}, hits, wav};
}, {...rec, wantWav});

await browser.close();
server.close();

// ——— emparejar golpes con contactos ———
const FRAME = 1 / 60, WIN = 0.1;
const contacts = rec.contacts.map(c => ({...c, t: +c.t.toFixed(4)}));
const used = new Set();
const hits = audio.hits.map(h => {
  if (h.src === 'ui') return {...h, contact: null, offsetFrames: null};
  let best = null;
  for (const [i, c] of contacts.entries()) {
    const d = h.peakT - c.t;
    if (Math.abs(d) <= WIN && (!best || Math.abs(d) < Math.abs(best.d))) best = {i, d};
  }
  if (best) used.add(best.i);
  return {...h, contact: best ? contacts[best.i] : null, offsetFrames: best ? +(best.d / FRAME).toFixed(2) : null};
});
const matched = hits.filter(h => h.contact);
// objetivo: en el cuadro del contacto o el siguiente (Florence: «each hit lands 1 frame after its visual event»); `early`
// y `late` cuentan lo que cae antes del cuadro o más de un cuadro después; `noticeable`, lo que pasa la tolerancia de la
// percepción (ITU-R BT.1359: sonido adelantado más de 45 ms o atrasado más de 125 ms)
const early = matched.filter(h => h.offsetFrames < 0), late = matched.filter(h => h.offsetFrames > 1);
const noticeable = matched.filter(h => h.offsetFrames * FRAME < -0.045 || h.offsetFrames * FRAME > 0.125);
// las llegadas (un punto que queda quieto tras un viaje rápido) sirven para emparejar, pero que una llegada sea muda no es
// un hallazgo (la Ronda que vuelve a su lugar): se cuentan aparte
const silent = contacts.filter((c, i) => !used.has(i) && c.kind !== 'llega');
const silentArrivals = contacts.filter((c, i) => !used.has(i) && c.kind === 'llega').length;
const silentByKind = Object.entries(silent.reduce((a, c) => (a[c.kind] = (a[c.kind] || 0) + 1, a), {})).map(([k, n]) => `${k} ${n}`).join(', ');
const overBed = matched.map(h => h.overBedDb).filter(v => v != null);

// ——— traspasos: saltos de posición sin camino ———
const teleports = [];
for (const [id, tr] of Object.entries(rec.tracks)) {
  const d = tr.slice(1).map((p, k) => (p[3] && tr[k][3] ? Math.hypot(p[1] - tr[k][1], p[2] - tr[k][2]) : 0));
  d.forEach((v, k) => {
    const nb = Math.max(d[k - 1] ?? 0, d[k + 1] ?? 0);
    if (v > 24 && v > 4 * nb) teleports.push({id, t: tr[k + 1][0], px: +v.toFixed(1), from: tr[k].slice(1, 3), to: tr[k + 1].slice(1, 3)});
  });
}

const report = {
  seg, extra, T: +rec.T.toFixed(2), errors,
  sound: {
    ...audio.summary,
    calls: rec.calls.length, hits: hits.length, matched: matched.length,
    syncFrames: matched.length ? {min: Math.min(...matched.map(h => h.offsetFrames)), max: Math.max(...matched.map(h => h.offsetFrames))} : null,
    early: early.length, late: late.length, noticeable: noticeable.length,
    uiHits: hits.filter(h => h.src === 'ui').length, unmatchedHits: hits.filter(h => h.src !== 'ui' && !h.contact).length,
    overBedDb: overBed.length ? {min: Math.min(...overBed), median: overBed.sort((a, b) => a - b)[overBed.length >> 1], max: Math.max(...overBed), below3: overBed.filter(v => v < 3).length, above6: overBed.filter(v => v > 6).length} : null,
    silentContacts: silentByKind || 'ninguno', silentArrivals,
  },
  teleports,
};
await writeFile(join(outDir, 'audit.json'), JSON.stringify({...report, replay: replay || undefined, vol: rec.vol, hitsDetail: hits, contacts, calls: rec.calls}, null, 1));
await writeFile(join(outDir, 'tracks.json'), JSON.stringify(rec.tracks));
if (audio.wav) await writeFile(join(outDir, 'mezcla.wav'), Buffer.from(audio.wav, 'base64'));
console.log(JSON.stringify(report, null, 1));
