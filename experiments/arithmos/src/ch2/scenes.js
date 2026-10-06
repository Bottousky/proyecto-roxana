// Capítulo 2 — Demasiados para marcar. Escenas jugables.

import {Drawing, Label, Link, Custom, Shape} from '../engine/world.js';
import {Figure} from '../engine/figure.js';
import {YELLOW, WHITE, BLUE, stroke, drawStrokes} from '../engine/chalk.js';
import {easeInOut, easeOut, lerp, mulberry32} from '../engine/rng.js';
import {fromNumeral, toNumeral, value} from '../logic/placevalue.js';
import {
  GROUND, GRADAS, SLED, PILE, FRAME, DEPOT, LEDGER, SHOTS, rooms, slot, item, mara, villager, base, depotBuilding,
  ledgerBoard, student, punto, art, art2, seedOf,
} from './common.js';
import {RONDA_IDS, rondaDot} from '../ch1/common.js';

// ——— utilidades de actuación (las mismas ideas que en el cap. 1) ———

async function zip(d, dot, x, y, dur = 0.32) {
  const x0 = dot.x, y0 = dot.y;
  dot.setMode?.('still');
  await d.tween(dur, k => { dot.x = lerp(x0, x, k); dot.y = lerp(y0, y, k); }, easeInOut);
}

async function hop(d, o, x, y, {dur = 0.4, h = 40, g, sound = 'tap'} = {}) {
  const x0 = o.x, y0 = o.y;
  o.setMode?.('still');
  if (g && sound) sound === 'tap' ? g.audio.tap(0.2, 1.7) : g.audio.punto(sound);
  await d.tween(dur, k => { o.x = lerp(x0, x, k); o.y = lerp(y0, y, k); o.lift = Math.sin(k * Math.PI) * h; });
  o.lift = 0;
  o.x = x;
  o.y = y;
}

async function pulse(d, o, times = 2, amount = 0.4, each = 0.2) {
  for (let i = 0; i < times; i++) await d.tween(each, k => { o.scale = (o.baseScale ?? 1) * (1 + Math.sin(k * Math.PI) * amount); });
  o.scale = o.baseScale ?? 1;
}

function follow(p, s) {
  p.setMode('anchor', {anchor: () => {
    const f = s.facing >= 0 ? 1 : -1;
    return [s.x + 44 * f, s.y - 150 + Math.sin(performance.now() / 380) * 5];
  }});
}

const spotOf = (o, label, onActivate, extra = {}) => ({id: o.id, kind: 'dot', label, rect: () => o.bounds(), onActivate, ...extra});
const rectSpot = (id, label, r, onActivate, extra = {}) => ({id, kind: 'rect', label, rect: typeof r === 'function' ? r : () => r, onActivate, ...extra});
const wordSpot = (id, text, x, y, onActivate, extra = {}) => ({id, kind: 'word', label: text, text, rect: () => ({x: x - 1, y: y - 1, w: 2, h: 2}), onActivate, ...extra});

// ——— la Ronda y Punto en las gradas, como quedaron anoche ———

function morningCast(g) {
  const w = g.world;
  const seats = art.seatPositions(GRADAS.x, GROUND, GRADAS.seats);
  const free = seats.reduce((best, pos, j) => (pos[1] > seats[best][1] + 1 || (Math.abs(pos[1] - seats[best][1]) < 1 && pos[0] > seats[best][0]) ? j : best), 0);
  const ids = [...RONDA_IDS.slice(0, 6), 'punto', ...RONDA_IDS.slice(6)];
  let k = 0;
  seats.forEach((pos, j) => {
    if (j === free) return;
    const id = ids[k++];
    const d = id === 'punto' ? punto(w, pos[0], pos[1] - 14) : rondaDot(w, RONDA_IDS.indexOf(id));
    d.visible = true;
    d.fade = 1;
    d.x = pos[0];
    d.y = pos[1] - 14;
    d.setMode('bob', {home: [d.x, d.y]});
  });
  return seats[free];
}

// ——— el montón de palitos ———

const PILE_N = 37;
function pilePos(k) {
  const r = mulberry32(900 + k);
  return [PILE.x - 210 + r() * 420, PILE.y - r() * 46];
}

function makePile(g, n = PILE_N, prefix = 'pile') {
  const w = g.world;
  const list = [];
  for (let k = 0; k < n; k++) {
    const [x, y] = pilePos(k + (prefix === 'pile' ? 0 : 400));
    const sh = item(w, 0, x, y, `${prefix}${k}`);
    sh.rot = Math.PI / 2 + (mulberry32(77 + k)() - 0.5) * 0.9;
    sh.z = 12;
    list.push(sh);
  }
  return list;
}

// ——— el depósito ———

function syncDepot(g, counts, roomCount = 3) {
  const w = g.world;
  w.removeWhere(o => o.id.startsWith('dep-'));
  counts.forEach((n, i) => {
    for (let k = 0; k < n; k++) {
      const [x, y] = slot(i, k, roomCount);
      const sh = item(w, i, x, y, `dep-${i}-${k}`);
      sh.z = 13;
    }
  });
}

function depotItems(w, i) {
  return w.objects.filter(o => o.id?.startsWith(`dep-${i}-`)).sort((a, b) => Number(a.id.split('-')[2]) - Number(b.id.split('-')[2]));
}

/** Ata diez del cuarto i y pasa el atado al cuarto i+1 (animado). */
async function tieUp(d, g, counts, i, roomCount = 3) {
  const w = g.world;
  const ten = depotItems(w, i).slice(-10);
  const r = rooms(roomCount)[i];
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  g.audio.erase(0.4, 0.3);
  await d.all(...ten.map(o => {
    const x0 = o.x, y0 = o.y, r0 = o.rot;
    return d.tween(0.45, k => { o.x = lerp(x0, cx, k); o.y = lerp(y0, cy, k); o.rot = lerp(r0, 0, k); }, easeInOut);
  }));
  for (const o of ten) w.remove(o.id);
  const nb = item(w, i + 1, cx, cy, `dep-${i + 1}-${counts[i + 1] || 0}`);
  nb.z = 15;
  g.audio.chalkStart(0.35, 0.6);
  nb.progress = 0;
  await d.tween(0.35, k => { nb.progress = k; });
  counts[i] -= 10;
  counts[i + 1] = (counts[i + 1] || 0) + 1;
  const [tx, ty] = slot(i + 1, counts[i + 1] - 1, roomCount);
  await hop(d, nb, tx, ty, {g, h: 50, dur: 0.5});
  g.audio.tap(0.35, 1.2);
  syncDepot(g, counts, roomCount);
}

// ——— registro (números escritos en la pizarrita) ———

function ledgerLine(w, id, text, row, {reveal = 1, ch = WHITE, size = 40} = {}) {
  const x = LEDGER.x - 120, y = GROUND - 110 - 210 + 52 + row * 46;
  const l = w.ensure(id, () => new Label(id, text, x, y, {size, ch, z: 9, reveal}));
  l.text = text;
  return l;
}

// ——————————————————————————————————————————————
// 2.1 La mañana
// ——————————————————————————————————————————————

export const manana = {
  id: 'c2.manana',
  title: 'La mañana',
  setup(g) {
    const w = g.world;
    w.clear();
    base(g);
    const seat = morningCast(g);
    student(w, seat[0] - 6, {pose: 'sitGround', facing: 0.6});
    w.get('sun').progress = 0;
    g.camera.go(SHOTS.morning);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    g.setCinematic(true);
    d.describe('Amanece en el pizarrón. Un sol de tiza amarilla se dibuja solo.');
    g.audio.cue('door');
    await d.draw(w.get('sun'), 2.6, {sound: false});
    await d.wait(0.4);
    s.setPose('cheer', 0.8);
    await d.wait(0.9);
    s.setPose('idle', 0.6);
    s.face(-0.4);
    // Punto marca todo: junto a la Ronda… y en tu cabeza
    p.setMode('still');
    for (const id of ['r2', 'r7', 'r10']) {
      const t = w.get(id);
      await zip(d, p, t.x + 16, t.y - 18, 0.25);
      const mk = w.add(new Drawing(`mtick-${id}`, art.tally(`mtick-${id}`, t.x + 16, t.y - 22, 14).map(st => { st.ch = YELLOW; return st; }), {z: 16, progress: 0}));
      await d.draw(mk, 0.12, {sound: false});
      g.audio.tap(0.2, 1.9);
    }
    const head = s.headPos();
    await zip(d, p, head[0] + 4, head[1] - 22, 0.3);
    // una marquita en tu cabeza, que te sigue
    w.add(new Custom('head-mark', {z: 32, render(ctx) {
      const h = s.headPos();
      drawSingle(ctx, stroke([[h[0] - 2, h[1] - 9], [h[0] + 2, h[1] + 2]], {w: 3, p: 0.95, ch: YELLOW, seed: 5, lift: false}));
    }}));
    g.audio.tap(0.25, 2);
    s.setPose('think', 0.3);
    s.look(0, -1);
    await d.wait(0.5);
    g.setCinematic(false);
    await d.think('Desde anoche marca todo. Hasta a mí.');
    s.setPose('idle', 0.5);
    s.look(0.5, 0);
    // vuelve al 14 y rodea el 1
    g.setCinematic(true);
    await d.shot(SHOTS.board14, 1.6);
    const ring = w.get('one-ring');
    await zip(d, p, ring.bbox.x + ring.bbox.w / 2, ring.bbox.y - 10, 0.5);
    await d.tween(0.9, k => {
      const a = -Math.PI / 2 + k * Math.PI * 2;
      p.x = ring.bbox.x + ring.bbox.w / 2 + Math.cos(a) * 40;
      p.y = ring.bbox.y + ring.bbox.h / 2 + Math.sin(a) * 40;
    });
    g.audio.punto('question');
    p.setMode('bob', {home: [p.x, p.y - 30]});
    g.setCinematic(false);
    await d.say('student', 'Sí, ya sé. El 1. Todavía no lo sé.');
    // llega Mara con su trineo
    g.setCinematic(true);
    const m = mara(w, SLED.x + 600, {facing: -1});
    const sl = w.ensure('sled', () => new Drawing('sled', art2.sled('sled', 0, GROUND), {z: 11, cache: false}));
    const sledAt = x => { sl.strokes = art2.sled('sled', x, GROUND); sl.bbox = null; };
    sledAt(m.x + 170);
    const heap = w.ensure('heap', () => new Drawing('heap', heapStrokes(), {z: 12, cache: false}));
    const heapAt = x => { heap.strokes = heapStrokes(x); };
    heapAt(m.x + 170);
    await d.shot(SHOTS.arrival, 2);
    m.setPose('lean', 0.4);
    const walkDur = m.walkTo(SLED.x - 170, GROUND, 70);
    await d.tween(walkDur, () => { sledAt(m.x + 170); heapAt(m.x + 170); });
    m.arriveNow();
    sledAt(SLED.x);
    heapAt(SLED.x);
    m.setPose('idle', 0.5);
    s.face(1);
    follow(p, s);
    await d.walk(s, SLED.x - 470, GROUND, 160);
    g.setCinematic(false);
    await d.say('Mara', 'Uf. Todo lo que se llevó la Marea hay que volver a dibujarlo. Y sin tiza no se dibuja nada.');
    m.face(-0.7);
    m.look(-1, 0);
    await d.say('Mara', '¿Y vos? Tenés una tiza en la mano… ¿Sabés contar palitos?');
    const c = await d.choose([
      {id: 'help', text: 'Sí. ¿Te ayudo?'},
      {id: 'who', text: '¿Quién sos?'},
    ]);
    d.evidence('meet-mara', {choice: c});
    if (c === 'who') {
      await d.say('Mara', 'Mara, la del depósito. Guardo la tiza de todos y anoto cuánta le toca a cada familia.');
      await d.say('Mara', 'Y ahora ayudame, que llegó una carga y hay que anotarla.');
    } else {
      await d.say('Mara', '¡Por fin alguien! Soy Mara. Guardo la tiza de todos y anoto cuánta le toca a cada familia.');
    }
  },
};

function heapStrokes(x = SLED.x) {
  const rnd = mulberry32(31);
  const list = [];
  for (let i = 0; i < 26; i++) {
    const cx = x - 80 + rnd() * 150, cy = GROUND - 40 - rnd() * 34;
    const a = (rnd() - 0.5) * 2.4;
    list.push(stroke([[cx - Math.sin(a) * 18, cy - Math.cos(a) * 18], [cx + Math.sin(a) * 18, cy + Math.cos(a) * 18]], {w: 3, p: 0.9, seed: 300 + i, lift: false}));
  }
  return list;
}

function drawSingle(ctx, st) {
  drawStrokes(ctx, [st], 1, 1, 1, false);
}

// ——————————————————————————————————————————————
// 2.2 Demasiados para marcar
// ——————————————————————————————————————————————

export const marcar = {
  id: 'c2.marcar',
  title: 'Demasiados para marcar',
  setup(g) {
    const w = g.world;
    base(g);
    morningCast(g);
    w.removeWhere(o => o.id === 'heap' || o.id === 'head-mark' || o.id.startsWith('mtick-'));
    w.ensure('sled', () => new Drawing('sled', art2.sled('sled', SLED.x - 260, GROUND), {z: 11}));
    const s = student(w, PILE.x - 330);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    mara(w, PILE.x + 260, {facing: -0.7});
    w.removeWhere(o => o.id.startsWith('pile') || o.id.startsWith('ptally') || o.id.startsWith('yest') || o.id.startsWith('five'));
    makePile(g);
    g.camera.go(SHOTS.pile);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const m = w.get('mara');
    g.setCinematic(true);
    await d.shot(SHOTS.pile, 1.2);
    d.describe('Mara vuelca la carga: un montón de palitos de tiza desparramados.');
    g.audio.erase(0.6, 0.4);
    await d.wait(0.6);
    g.setCinematic(false);
    await d.say('Mara', 'Hay que anotar cuántos palitos llegaron.');
    // Punto marca uno por palito, con entusiasmo y cada vez más cansado
    g.setCinematic(true);
    d.describe('Punto hace una marca amarilla por cada palito. La hilera crece y crece.');
    p.setMode('still');
    const x0 = PILE.x - 260, y0 = GROUND - 280;
    const shot = {...SHOTS.pile, y: SHOTS.pile.y - 80};
    await d.shot(shot, 0.8);
    for (let k = 0; k < PILE_N; k++) {
      const st = w.get(`pile${k}`);
      const tired = k / PILE_N;
      await zip(d, p, st.x, st.y - 30, 0.08 + tired * 0.04);
      st.flash = 1;
      const mx = x0 + k * 15, my = y0 + Math.sin(k * 1.7) * tired * 8;
      const mk = w.add(new Drawing(`ptally${k}`, art.tally(`ptally${k}`, mx, my, 30).map(q => { q.ch = YELLOW; return q; }), {z: 9, progress: 0}));
      await zip(d, p, mx, my - 24, 0.07 + tired * 0.04);
      mk.progress = 1;
      g.audio.tap(0.12, 1.6 + (k % 5) * 0.08);
    }
    p.tremble = 1.4;
    await zip(d, p, x0 + PILE_N * 15 + 40, y0 + 30, 0.4);
    await d.tween(0.6, k => { p.squash = Math.sin(k * Math.PI) * 0.5; });
    p.setMode('bob', {home: [p.x, p.y]});
    // la carga de ayer, también en marcas
    const y1 = y0 - 70;
    for (let k = 0; k < 34; k++) {
      const mk = w.add(new Drawing(`yest${k}`, art.tally(`yest${k}`, x0 + 6 + k * 16.5, y1, 30), {z: 9, fade: 0.8}));
      void mk;
    }
    w.add(new Label('yest-label', 'ayer', x0 - 70, y1 + 10, {size: 30, z: 9}));
    w.add(new Label('hoy-label', 'hoy', x0 - 64, y0 + 10, {size: 30, z: 9, ch: YELLOW}));
    g.setCinematic(false);
    await d.say('Mara', 'Ayer anoté la carga así, con marcas. ¿Llegó más hoy que ayer?');
    const ans = await d.choose([
      {id: 'more', text: 'Hoy llegó más.'},
      {id: 'less', text: 'Hoy llegó menos.'},
      {id: 'same', text: 'Lo mismo.'},
      {id: 'cant', text: 'Así, de un vistazo, no se puede saber.'},
    ], {prompt: 'Dos hileras de marcas, una arriba de la otra.', evaluate: true});
    d.evidence('compare-tallies', {answer: ans});
    // Punto intenta emparejar las dos hileras y se pierde a mitad de camino
    g.setCinematic(true);
    d.describe('Punto empieza a saltar de una marca de arriba a una de abajo, de a pares. A la mitad se marea.');
    p.setMode('still');
    for (let k = 0; k < 14; k++) {
      await zip(d, p, x0 + 6 + k * 16.5, y1 - 30, 0.07);
      await zip(d, p, x0 + k * 15, y0 + 30, 0.07);
    }
    p.tremble = 1.4;
    g.audio.punto('scared');
    await d.tween(0.6, k => { p.squash = Math.sin(k * Math.PI * 3) * 0.4; });
    p.setMode('bob', {home: [p.x, p.y]});
    g.setCinematic(false);
    await d.think(ans === 'cant' ? 'Una por una, no se termina más.' : 'No lo sé. Una por una, no se termina más.');
    await d.say('Mara', 'Por eso en el depósito atamos. De a diez. Así se hizo siempre.');
    // Punto se adelanta y ata de a cinco
    g.setCinematic(true);
    d.describe('Punto, apurado, junta palitos de a cinco y les pasa una cinta amarilla.');
    const fives = [];
    for (let b = 0; b < 3; b++) {
      const group = Array.from({length: 5}, (_, i) => w.get(`pile${b * 5 + i}`));
      const cx = PILE.x - 120 + b * 70, cy = GROUND - 30;
      await zip(d, p, cx, cy - 40, 0.25);
      await d.all(...group.map((o, i) => d.tween(0.3, k => { o.x = lerp(o.x, cx + (i - 2) * 4, k); o.y = lerp(o.y, cy, k); o.rot = lerp(o.rot, 0, k); })));
      const rib = w.add(new Drawing(`five${b}`, [stroke([[cx - 12, cy + 2], [cx + 12, cy]], {w: 2.6, p: 0.9, ch: YELLOW, seed: 70 + b, lift: false})], {z: 16}));
      fives.push(rib);
      g.audio.tap(0.25, 1.3);
    }
    m.setPose('surprise', 0.3);
    g.setCinematic(false);
    await d.say('Mara', '¡Eso no es un atado! Un atado tiene diez.');
    m.setPose('idle', 0.5);
    await d.think('De a cinco también se cuenta. Pero en el registro de Mara, "siete atados" son setenta.');
    g.setCinematic(true);
    for (const f of fives) w.remove(f.id);
    for (let k = 0; k < 15; k++) {
      const o = w.get(`pile${k}`);
      const [x, y] = pilePos(k);
      hop(d, o, x, y, {h: 20, dur: 0.35}).catch(() => {});
    }
    p.tremble = 0.6;
    g.audio.punto('sad');
    await d.wait(0.6);
    w.removeWhere(o => o.id.startsWith('ptally') || o.id.startsWith('yest') || o.id === 'yest-label' || o.id === 'hoy-label');
  },
};

// ——————————————————————————————————————————————
// 2.3 Atados
// ——————————————————————————————————————————————

export const atados = {
  id: 'c2.atados',
  title: 'Atados',
  setup(g) {
    const w = g.world;
    base(g);
    morningCast(g);
    w.ensure('sled', () => new Drawing('sled', art2.sled('sled', SLED.x - 260, GROUND), {z: 11}));
    const s = student(w, PILE.x - 330);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    mara(w, PILE.x + 260, {facing: -0.7});
    w.removeWhere(o => /^(pile|fr-|bund-|frame10|num37|atar|small|b14|p14)/.test(o.id));
    const st = g.scratch('c2.atados');
    makePile(g, PILE_N - (st.bundles || 0) * 10);
    for (let b = 0; b < (st.bundles || 0); b++) placeBundle(g, b);
    const f = art2.frame10('frame10', FRAME.x, FRAME.y);
    w.add(new Drawing('frame10', f.strokes, {z: 10}));
    g.camera.go(SHOTS.frame);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const m = w.get('mara');
    const st = g.scratch();
    st.bundles ??= 0;
    const f = art2.frame10('frame10', FRAME.x, FRAME.y);
    await d.shot(SHOTS.frame, 1);
    if (!st.bundles) {
      await d.say('Mara', 'Este es el molde de diez: diez ranuras, un palito en cada una. Cuando se llena, se ata.');
      await d.say('Mara', '¿Por qué de a diez? No me preguntes. Así se hizo siempre.');
    }
    const result = await fillFrames(d, g, f.slots, {total: PILE_N, prefix: 'pile', keepScratch: st});
    // tres atados y siete sueltos
    g.setCinematic(true);
    s.setPose('write', 0.3);
    const lab = w.add(new Label('num37', '37', FRAME.x + 190, FRAME.y + 40, {size: 64, weight: 700, z: 9, reveal: 0}));
    await d.draw(lab, 0.8, {key: 'reveal'});
    s.setPose('idle', 0.4);
    g.setCinematic(false);
    d.evidence('bundled', {bundles: result.bundles, loose: result.loose, tieTries: result.badTies});
    await d.think('Tres atados y siete sueltos. Treinta y siete.');
    s.setPose('surprise', 0.3);
    await d.think('Entonces… el 1 de 14.');
    s.setPose('idle', 0.5);
    await d.say('student', 'Punto, vení. Mirá.');
    // catorce: un atado y cuatro sueltos
    await d.say('Mara', '¿Catorce? Tomá, de la otra bolsa.');
    w.removeWhere(o => /^(pile|bund-|num37)/.test(o.id));
    const small = makePile(g, 14, 'small');
    for (const o of small) { o.x -= 0; }
    const r2 = await fillFrames(d, g, f.slots, {total: 14, prefix: 'small', keepScratch: {}, quickAvailable: true});
    void r2;
    // Punto escribe sus primeros dígitos
    g.setCinematic(true);
    const bnd = w.get('bund-0');
    const looseList = w.objects.filter(o => o.id.startsWith('small'));
    const [lx] = [looseList.reduce((a, o) => a + o.x, 0) / Math.max(1, looseList.length)];
    p.setMode('still');
    await zip(d, p, bnd.x, bnd.y + 60, 0.5);
    d.describe('Punto escribe un 1 debajo del atado y un 4 debajo de los cuatro sueltos. Son sus primeros números.');
    const d1 = w.add(new Label('p14-1', '1', bnd.x - 10, bnd.y + 86, {size: 56, ch: YELLOW, z: 16, reveal: 0, weight: 700}));
    g.audio.chalkStart(0.6, 0.6);
    await d.draw(d1, 0.6, {key: 'reveal', sound: false});
    await zip(d, p, lx, bnd.y + 60, 0.4);
    const d4 = w.add(new Label('p14-4', '4', lx - 12, bnd.y + 86, {size: 56, ch: YELLOW, z: 16, reveal: 0, weight: 700}));
    g.audio.chalkStart(0.6, 0.6);
    await d.draw(d4, 0.6, {key: 'reveal', sound: false});
    g.audio.punto('happy');
    await pulse(d, p, 2, 0.5);
    g.setCinematic(false);
    await d.say('student', '¡Escribiste!');
    await d.think('El 1 no cuenta palitos: cuenta atados.');
    g.flags.punto14 = true;
    p.setMode('bob', {home: [p.x, p.y]});
    await d.say('Mara', 'Bueno, bueno. Lindo. Ahora vamos al depósito, que hay que guardar todo.');
  },
};

function placeBundle(g, b) {
  const sh = item(g.world, 1, FRAME.x - 120 + b * 60, GROUND - 40, `bund-${b}`);
  sh.z = 13;
  return sh;
}

/**
 * Llenar el molde de a un palito (o de una vez, después del primero) y atar.
 * Atar con menos de diez no se puede: Mara lo dice.
 */
async function fillFrames(d, g, slots, {total, prefix, keepScratch, quickAvailable = false}) {
  const w = g.world;
  let inFrame = [];
  let bundles = keepScratch.bundles || 0;
  let badTies = 0;
  let quick = quickAvailable || bundles > 0;
  const loose = () => w.objects.filter(o => o.id.startsWith(prefix) && !inFrame.includes(o));
  await d.interact(ctl => new Promise(resolve => {
    let busy = false;
    g.setHint(() => [
      'Cada ranura del molde lleva un palito. Cuando las diez estén llenas, se puede atar.',
      'Tocá un palito suelto para ponerlo en el molde.',
      'Cuando quedan menos de diez sueltos, ya no se puede hacer otro atado.',
    ]);
    const refresh = () => {
      const free = loose();
      const spots = free.map((o, i) => spotOf(o, 'Palito suelto', () => put(o)));
      if (inFrame.length) spots.push(wordSpot('atar', inFrame.length === 10 ? 'atar' : `atar (${inFrame.length})`, FRAME.x + 175, FRAME.y - 4, () => tie()));
      if (quick && !inFrame.length && free.length >= 10) spots.push(wordSpot('llenar', 'llenar el molde de una vez', FRAME.x, FRAME.y - 70, () => fillAll()));
      if (bundles > 0 && free.length < 10 && !inFrame.length) spots.push(wordSpot('listo', 'listo', FRAME.x + 175, FRAME.y + 60, () => done()));
      g.ui.setSpots(spots);
    };
    const put = async (o, fast = false) => {
      if (busy && !fast) return;
      if (inFrame.length >= 10) {
        g.note('El molde ya está lleno: diez ranuras, diez palitos.');
        return;
      }
      busy = true;
      inFrame.push(o);
      const [x, y] = slots[inFrame.length - 1];
      try {
        await d.tween(fast ? 0.12 : 0.22, k => { o.x = lerp(o.x, x, k); o.y = lerp(o.y, y, k); o.rot = lerp(o.rot, 0, k); });
        g.audio.tap(0.12, 1.5 + inFrame.length * 0.05);
      } catch { return; }
      busy = false;
      if (!fast) refresh();
    };
    const fillAll = async () => {
      if (busy) return;
      d.evidence('fill-quick');
      const free = loose().slice(0, 10);
      for (const o of free) {
        busy = false;
        await put(o, true);
      }
      busy = false;
      refresh();
    };
    const tie = async () => {
      if (busy || !ctl.alive()) return;
      if (inFrame.length < 10) {
        badTies++;
        d.evidence('tie-short', {n: inFrame.length});
        g.note(`Mara: "Un atado es de diez. Con ${inFrame.length === 1 ? 'uno' : inFrame.length} no hay atado."`);
        return;
      }
      busy = true;
      const cx = FRAME.x, cy = FRAME.y;
      try {
        await d.all(...inFrame.map(o => d.tween(0.3, k => { o.x = lerp(o.x, cx + (inFrame.indexOf(o) - 4.5) * 3.6, k); })));
        for (const o of inFrame) w.remove(o.id);
        inFrame = [];
        const b = item(w, 1, cx, cy, `bund-${bundles}`);
        b.z = 15;
        b.progress = 0;
        g.audio.chalkStart(0.4, 0.6);
        await d.tween(0.4, k => { b.progress = k; });
        await hop(d, b, FRAME.x - 120 + bundles * 60, GROUND - 40, {h: 60, dur: 0.5, g});
        bundles++;
        keepScratch.bundles = bundles;
        g.queueSave();
        d.evidence('tie', {n: bundles});
        quick = true;
      } catch { return; }
      busy = false;
      refresh();
    };
    const done = () => {
      if (busy) return;
      g.setHint(null);
      resolve();
    };
    refresh();
  }));
  return {bundles, loose: loose().length, badTies};
}

// ——————————————————————————————————————————————
// 2.4 El depósito
// ——————————————————————————————————————————————

export const deposito = {
  id: 'c2.deposito',
  title: 'El depósito',
  setup(g) {
    const w = g.world;
    base(g, {dawn: false});
    w.removeWhere(o => /^(pile|small|bund-|num37|p14-|frame10|led|load|model|zero-)/.test(o.id));
    depotBuilding(w, 3);
    ledgerBoard(w);
    const s = student(w, DEPOT.right - 980);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    mara(w, LEDGER.x + 220, {facing: -0.8});
    const st = g.scratch('c2.deposito');
    syncDepot(g, st.counts || [0, 0, 0]);
    g.camera.go(SHOTS.depot);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const m = w.get('mara');
    const st = g.scratch();
    st.counts ??= [0, 0, 0];
    st.load ??= 0;
    const counts = st.counts;
    if (st.load === 0) {
      await d.shot(SHOTS.depot, 1.4);
      await d.say('Mara', 'El depósito. Tres cuartos: sueltos, atados y atados de atados.');
      await d.say('Mara', 'Regla de la casa: nunca más de nueve por cuarto. Con diez, se atan y pasan al de al lado.');
      await d.say('student', '¿Por qué nueve?');
      await d.say('Mara', 'Porque así se hizo siempre. La Marea desparramó todo; hay que guardar de nuevo.');
    }
    const loads = [
      {text: 'La carga de recién: tres atados y siete sueltos.', items: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]},
      {text: 'Otra carga: cinco sueltos.', items: [0, 0, 0, 0, 0]},
      {text: 'La última: seis atados y ocho sueltos.', items: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]},
    ];
    for (; st.load < loads.length; st.load++) {
      const L = loads[st.load];
      await d.say('Mara', L.text);
      await storeLoad(d, g, counts, L.items);
      g.queueSave();
      if (st.load === 1) {
        await d.think('"Me llevo uno"… era esto.');
      }
    }
    // anotar lo que hay: un número por cuarto
    await d.shot({...SHOTS.depot, w: SHOTS.depot.w + 300}, 1.2);
    await d.say('Mara', 'Ahora se anota como se anota: un número por cuarto, de izquierda a derecha.');
    const written = await writeRooms(d, g, counts);
    st.written = written;
    m.setPose('think', 0.4);
    await d.say('Mara', 'Hm. Yo siempre lo dejaba en blanco. Total, no había nada…');
    m.setPose('idle', 0.4);
  },
};

/** Guardar una carga: tocar un objeto y después el cuarto. Diez en un cuarto: hay que atar. */
async function storeLoad(d, g, counts, kinds) {
  const w = g.world;
  const objs = kinds.map((k, i) => {
    const o = item(w, k, DEPOT.right + 60 + (i % 7) * 26, GROUND - 30 - Math.floor(i / 7) * 54, `load-${i}`);
    o.z = 16;
    return o;
  });
  await d.interact(ctl => new Promise(resolve => {
    let sel = null;
    let busy = false;
    g.setHint(() => [
      'Los sueltos van al cuarto de la derecha; los atados, al del medio.',
      'Tocá algo de la carga y después el cuarto donde va.',
      'Si un cuarto junta diez, tocalo para atar y pasar.',
    ]);
    const roomR = rooms(3);
    const refresh = () => {
      const spots = objs.filter(o => w.has(o.id)).map(o => spotOf(o, o.kind === 0 ? 'Palito suelto de la carga' : 'Atado de la carga', () => pick(o), {selected: sel === o}));
      roomR.forEach((r, i) => {
        const over = counts[i] >= 10;
        spots.push(rectSpot(`room${i}`, ['Cuarto de los sueltos', 'Cuarto de los atados', 'Cuarto de los atados de atados'][i] + ` (${counts[i]})` + (over ? ': tiene diez, se puede atar' : ''), r, () => room(i)));
      });
      g.ui.setSpots(spots);
    };
    const pick = o => {
      if (busy) return;
      g.audio.tap(0.15, 1.7);
      sel = sel === o ? null : o;
      refresh();
    };
    const room = async i => {
      if (busy || !ctl.alive()) return;
      if (!sel) {
        if (counts[i] >= 10) {
          busy = true;
          try { await tieUp(d, g, counts, i); } catch { return; }
          busy = false;
          d.evidence('carry', {from: i});
          return finish();
        }
        g.note(counts[i] ? 'Elegí primero algo de la carga.' : 'Ese cuarto está vacío. Elegí algo de la carga.');
        return;
      }
      if (sel.kind !== i) {
        d.evidence('wrong-room', {item: sel.kind, room: i});
        g.note(sel.kind === 0 ? 'Mara: "Ese cuarto es de atados. Los sueltos van a la derecha."' : 'Mara: "Un atado no va con los sueltos: va al cuarto del medio."');
        return;
      }
      if (counts[i] >= 10) {
        g.note('Mara: "¡Ya hay diez! Primero se atan."');
        return;
      }
      busy = true;
      const o = sel;
      sel = null;
      const [tx, ty] = slot(i, counts[i]);
      try {
        await hop(d, o, tx, ty, {g, h: 50, dur: 0.38});
      } catch { return; }
      w.remove(o.id);
      counts[i]++;
      syncDepot(g, counts);
      busy = false;
      finish();
    };
    const finish = () => {
      const left = objs.filter(o => w.has(o.id)).length;
      if (!left && counts.every(c => c <= 9)) {
        g.setHint(null);
        resolve();
      } else refresh();
    };
    refresh();
  }));
}

/** Escribir el número del depósito: un dígito por cuarto; para el vacío, decidir. */
async function writeRooms(d, g, counts) {
  const w = g.world;
  const s = w.get('student');
  const p = w.get('punto');
  ledgerBoard(w);
  await d.walk(s, LEDGER.x - 190, GROUND, 180);
  await d.shot(SHOTS.ledger, 1);
  const digits = [...counts].reverse(); // izquierda a derecha
  let attempt = 0;
  for (;;) {
    const emptyChoice = await d.choose([
      {id: 'blank', text: 'Nada: si no hay nada, no se escribe.'},
      {id: 'space', text: 'Un espacio en blanco.'},
      {id: 'zero', text: 'Un 0.'},
    ], {prompt: 'En el depósito: un atado de atados, un atado y ningún suelto. ¿Qué escribís para el cuarto vacío?', evaluate: true});
    d.evidence('write-empty', {choice: emptyChoice, attempt});
    const text = digits.map(n => (n ? String(n) : emptyChoice === 'zero' ? '0' : emptyChoice === 'space' ? ' ' : '')).join('');
    const line = ledgerLine(w, 'led-dep', text, 0, {reveal: 0});
    s.setPose('write', 0.3);
    await d.draw(line, 0.6, {key: 'reveal'});
    s.setPose('idle', 0.3);
    // Punto lo lee y lo vuelve a cargar en un depósito de prueba
    if (emptyChoice === 'space') {
      // un soplido de polvo borra el espacio
      g.audio.erase(0.8, 0.5);
      d.describe('Un soplido de polvo pasa por la pizarrita y el espacio desaparece: los números quedan juntos.');
      await d.wait(0.8);
      line.text = text.replace(/ /g, '');
    }
    const shown = line.text;
    const model = fromNumeral(shown);
    d.describe('Punto copia lo escrito sobre un depósito chiquito, cuarto por cuarto, empezando por la derecha.');
    const ok = await loadModel(d, g, shown, counts) && shown === toNumeral(counts);
    g.audio.punto(ok ? 'yes' : 'question');
    if (!ok) {
      await d.say('Mara', `Eso dice ${spell(value(model))}.`);
      await d.think('Sin el cuarto vacío, todo se corrió un lugar.');
      line.text = '';
      line.reveal = 0;
      w.removeWhere(o => o.id.startsWith('mdl-'));
      attempt++;
      follow(p, s);
      continue;
    }
    await d.say('Mara', `Ciento diez. Un atado de atados, un atado… y ningún suelto.`);
    w.removeWhere(o => o.id.startsWith('mdl-'));
    follow(p, s);
    return shown;
  }
}

/**
 * Depósito de prueba en la pizarrita: cajas con lo que hay de verdad (de izquierda a derecha,
 * del grupo más grande al suelto) y, arriba, los dígitos escritos ubicados por Punto desde la
 * derecha. Donde no coinciden, una cruz. Devuelve true si todo coincide.
 */
async function loadModel(d, g, written, real) {
  const w = g.world;
  const p = w.get('punto');
  w.removeWhere(o => o.id.startsWith('mdl-'));
  const n = Math.max(real.length, written.length);
  const bw = 66, gap = 10;
  const x0 = LEDGER.x - (n * bw + (n - 1) * gap) / 2;
  const by = GROUND - 200;
  const boxes = [];
  for (let k = 0; k < n; k++) {
    const room = n - 1 - k; // de izquierda a derecha: el grupo más grande primero
    const bx = x0 + k * (bw + gap);
    boxes.push({bx, room});
    w.add(new Drawing(`mdl-box${k}`, art.rectStrokesFor(`mdl-box${k}`, bx, by, bw, 52), {z: 11}));
    const c = real[room] || 0;
    for (let j = 0; j < c; j++) {
      const it = item(w, Math.min(room, 2), bx + 12 + (j % 5) * 11, by + 26 + Math.floor(j / 5) * 4, `mdl-it${k}-${j}`);
      it.scale = room === 0 ? 0.42 : room === 1 ? 0.38 : 0.2;
      it.z = 12;
    }
  }
  // Punto ubica cada dígito sobre su caja, empezando por la derecha
  const digits = [...written];
  let ok = digits.length === real.length;
  p.setMode('still');
  for (let k = 0; k < digits.length; k++) {
    const box = boxes[n - 1 - k];
    const ch = digits[digits.length - 1 - k];
    await zip(d, p, box.bx + bw / 2, by - 50, 0.3);
    const lab = w.add(new Label(`mdl-d${k}`, ch, box.bx + bw / 2, by - 10, {size: 34, align: 'center', ch: YELLOW, z: 12, reveal: 0, weight: 700}));
    await d.draw(lab, 0.25, {key: 'reveal', sound: false});
    g.audio.tap(0.2, 1.6);
    if (Number(ch) !== (real[box.room] || 0)) ok = false;
  }
  // cajas sin dígito o con otro número: una cruz
  for (const [k, box] of boxes.entries()) {
    const fromRight = n - 1 - k;
    const ch = digits[digits.length - 1 - fromRight];
    if (ch === undefined ? (real[box.room] || 0) !== 0 : Number(ch) !== (real[box.room] || 0)) {
      w.add(new Drawing(`mdl-x${k}`, art.crossFor(`mdl-x${k}`, box.bx + bw / 2, by + 26, 22), {z: 13}));
      g.audio.punto('no');
      await d.wait(0.25);
    }
  }
  return ok;
}

const UNITS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince'];
function spell(n) {
  if (n < UNITS.length) return UNITS[n];
  return String(n);
}

// ——————————————————————————————————————————————
// 2.5 El cero que falta (momento)
// ——————————————————————————————————————————————

const OVAL = {x: 9100};

export const cero = {
  id: 'c2.cero',
  title: 'El cero que falta',
  moment: 'El cero que falta',
  setup(g) {
    const w = g.world;
    base(g, {dawn: false});
    w.removeWhere(o => /^(load|led|oval|house|shelf|zr-)/.test(o.id));
    depotBuilding(w, 3);
    ledgerBoard(w);
    const s = student(w, LEDGER.x - 190);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    mara(w, LEDGER.x + 230, {facing: -0.8});
    syncDepot(g, [0, 1, 1]);
    ledgerLine(w, 'led-dep', '110', 0);
    villager(w, 'oval-a', OVAL.x, 'oval');
    villager(w, 'oval-b', OVAL.x + 70, 'oval', {scale: 0.78});
    g.camera.go(SHOTS.ledger);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const m = w.get('mara');
    const oa = w.get('oval-a'), ob = w.get('oval-b');
    // el registro viejo, con huecos que dejó la Marea
    const old = [['Familia Oval', '3 2'], ['Familia Recta', '52'], ['Familia Curva', '37']];
    old.forEach(([name, num], i) => {
      const n = ledgerLine(w, `led-old-name${i}`, name, i + 1, {size: 30});
      n.x = LEDGER.x - 130;
      const v = ledgerLine(w, `led-old${i}`, num, i + 1, {size: 34});
      v.x = LEDGER.x + 70;
    });
    // mancha donde estuvo el cero
    const smudge = w.add(new Custom('zr-smudge', {z: -5, renderDust(ctx) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(LEDGER.x + 90, GROUND - 110 - 210 + 52 + 46 - 12, 16, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }}));
    void smudge;
    await d.shot({...SHOTS.ledger, x: SHOTS.ledger.x - 60, w: SHOTS.ledger.w + 600}, 1.2);
    oa.walkTo(LEDGER.x + 360, GROUND, 110);
    ob.walkTo(LEDGER.x + 430, GROUND, 110);
    await d.wait(1.6);
    oa.arriveNow(); ob.arriveNow();
    await d.say('Oval', 'Mara, con treinta y dos palitos no alcanza ni para la puerta. Antes de la Marea teníamos muchísimo más.');
    await d.say('Mara', 'El registro dice treinta y dos. Tres y dos.');
    if (!replay) {
      // mirar el registro y el estante de los Oval
      await d.think('Entre el 3 y el 2 hay una mancha.');
      const look = await d.choose([
        {id: 'nothing', text: 'Es una mancha: no había nada.'},
        {id: 'zero', text: 'Ahí había un cero: trescientos dos.'},
        {id: 'unknown', text: 'Ahí había algo, pero no se puede saber qué.'},
      ], {prompt: '¿Qué había entre el 3 y el 2?', evaluate: true});
      d.evidence('smudge', {answer: look});
      if (look === 'unknown') await d.think('Por la mancha sola no se sabe. Su tiza está guardada: eso sí se puede mirar.');
      else if (look === 'zero') await d.think('Puede ser. Hay que mirar su tiza guardada.');
      else await d.think('¿Y por qué dicen que tenían mucho más? Hay que mirar su tiza guardada.');
    }
    // el estante de los Oval: 3 atados de atados, 0 atados, 2 sueltos
    g.setCinematic(true);
    await d.walk(s, DEPOT.right + 70, GROUND, 200);
    s.face(-0.7);
    syncDepot(g, [2, 0, 3]);
    await d.shot({...SHOTS.depotRooms, w: SHOTS.depotRooms.w + 160}, 1.2);
    d.describe('En el depósito, el lugar de los Oval: tres atados de atados, ningún atado y dos sueltos.');
    g.setCinematic(false);
    if (!replay) {
      const read = await d.choose([
        {id: '32', text: 'Treinta y dos: 32.'},
        {id: '302', text: 'Trescientos dos: 302.'},
        {id: '320', text: 'Trescientos veinte: 320.'},
      ], {prompt: 'Tres atados de atados, ningún atado, dos sueltos. ¿Qué número es?', evaluate: true});
      d.evidence('read-oval', {answer: read});
      if (read !== '302') {
        // Punto lo copia sobre el depósito chiquito, al lado del de verdad
        await d.walk(s, LEDGER.x - 190, GROUND, 220);
        await d.shot(SHOTS.ledger, 0.8);
        await loadModel(d, g, read, [2, 0, 3]);
        await d.think(read === '32' ? 'Así, el 3 queda en el cuarto de los atados. Y es de atados de atados.' : 'Así quedan dos atados y ningún suelto. Es al revés.');
        w.removeWhere(o => o.id.startsWith('mdl-'));
      }
    }
    await d.think('Tres, cero, dos. Trescientos dos. Faltaba el cero.');
    // corregir el registro
    g.setCinematic(true);
    await d.walk(s, LEDGER.x - 190, GROUND, 200);
    await d.shot({...SHOTS.ledger, x: SHOTS.ledger.x - 60, w: SHOTS.ledger.w + 600}, 1.2);
    s.setPose('write', 0.3);
    const line = w.get('led-old0');
    line.text = '302';
    line.reveal = 0;
    await d.draw(line, 0.7, {key: 'reveal'});
    w.remove('zr-smudge');
    s.setPose('idle', 0.4);
    g.setCinematic(false);
    await d.say('Mara', '¡Trescientos dos! Y yo les daba treinta y dos…');
    await d.say('Mara', 'Siempre pensé que el cero no era nada. Que daba lo mismo ponerlo o no.');
    await d.say('student', 'No cuenta nada. Pero sin él, el 3 se corre de cuarto.');
    // los Oval vuelven a dibujar su casa
    g.setCinematic(true);
    d.describe('Con su tiza, los Oval vuelven a dibujar su casa, grande, al costado del camino.');
    const house = w.add(new Drawing('oval-house', art.ghostHouse('oval-house', OVAL.x + 300, GROUND, 1.25), {z: 3, progress: 0}));
    await d.shot({x: LEDGER.x - 200, y: 220, w: 1500, h: 560}, 1.4);
    oa.walkTo(OVAL.x + 240, GROUND, 140);
    ob.walkTo(OVAL.x + 380, GROUND, 140);
    await d.draw(house, 3.2);
    g.audio.cue('found');
    // una pasada leve de la Marea: los ceros, ahora entendidos, se quedan
    d.describe('Pasa una brisa de borrador. Los ceros del registro se quedan firmes.');
    g.audio.erase(1.4, 0.6);
    g.camera.shake = 0.2;
    await d.wait(1.4);
    g.setCinematic(false);
    m.setPose('think', 0.4);
    await d.say('Mara', 'Un cuarto vacío también se escribe.');
    m.setPose('idle', 0.4);
    if (!replay) g.flags.zero = true;
  },
};

// ——————————————————————————————————————————————
// 2.6 ¿Cuántos más?
// ——————————————————————————————————————————————

const SHELF = {a: 7500, b: 8150, y: GROUND - 60};

export const cuantos = {
  id: 'c2.cuantos',
  title: '¿Cuántos más?',
  setup(g) {
    const w = g.world;
    base(g, {dawn: false});
    w.removeWhere(o => /^(load|dep-|led-old|zr-|cmp-|shelf|oval-a|oval-b)/.test(o.id));
    depotBuilding(w, 3);
    ledgerBoard(w);
    const s = student(w, SHELF.a - 300);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    mara(w, SHELF.b + 330, {facing: -0.8});
    villager(w, 'recta', SHELF.a + 190, 'square', {facing: -0.5});
    villager(w, 'curva', SHELF.b + 200, 'curl', {facing: -0.5, scale: 0.92});
    g.camera.go({x: SHELF.a - 420, y: 260, w: 1500, h: 520});
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot({x: SHELF.a - 420, y: 260, w: 1500, h: 520}, 1);
    await d.say('Curva', 'Mara, ¿cuánta tiza más que nosotros tiene la familia Recta?');
    await d.say('Mara', 'Recta, cincuenta y dos. Curva, treinta y siete. Sacalo vos, que yo ya me mareé.');
    // dos estantes: cada uno con sus atados y sueltos
    const A = shelf(g, 'cmp-a', SHELF.a, 5, 2, 'Recta');
    const B = shelf(g, 'cmp-b', SHELF.b, 3, 7, 'Curva');
    await d.think('Como en la piedra: emparejar. Pero de a atados.');
    const r = await compareShelves(d, g, A, B);
    d.evidence('difference', r);
    g.setCinematic(true);
    s.setPose('write', 0.3);
    const eq = w.add(new Label('cmp-eq', '52 − 37 = 15', SHELF.a + 120, GROUND - 330, {size: 54, z: 9, reveal: 0}));
    await d.draw(eq, 1, {key: 'reveal'});
    s.setPose('idle', 0.4);
    g.setCinematic(false);
    await d.think('Quince le quedaron a Recta sin pareja.');
    await d.think('"Pedir prestado" era desatar.');
    await d.say('Curva', 'Quince. Bueno, no es tanto. Igual se lo voy a reclamar.');
  },
};

function shelf(g, id, x, bundles, loose, name) {
  const w = g.world;
  const items = [];
  for (let k = 0; k < bundles; k++) items.push(Object.assign(item(w, 1, x - 120 + k * 46, SHELF.y - 70), {side: id}));
  for (let k = 0; k < loose; k++) items.push(Object.assign(item(w, 0, x - 120 + k * 17, SHELF.y), {side: id}));
  w.add(new Label(`${id}-name`, name, x - 130, SHELF.y + 70, {size: 32, z: 9}));
  w.add(new Drawing(`${id}-line`, art.hill(`${id}-line`, x - 150, x + 130, SHELF.y + 30, 0, 0.6), {z: 3}));
  return items;
}

/** Emparejar atados con atados y sueltos con sueltos; desatar cuando hace falta. */
async function compareShelves(d, g, A, B) {
  const w = g.world;
  const pairs = [];
  let untied = 0;
  let mixed = 0;
  return d.interact(ctl => new Promise(resolve => {
    let sel = null;
    let busy = false;
    g.setHint(() => [
      'Un atado se empareja con un atado; un suelto, con un suelto.',
      'Cuando a Curva le quedan sueltos sin pareja y a Recta no, se puede desatar un atado de Recta.',
      'Lo que le queda a Recta sin pareja es la diferencia.',
    ]);
    const live = list => list.filter(o => w.has(o.id) && !o.paired);
    const refresh = () => {
      const spots = [];
      for (const o of [...live(A), ...live(B)]) {
        spots.push(spotOf(o, `${o.side === 'cmp-a' ? 'Recta' : 'Curva'}: ${o.kind ? 'atado' : 'suelto'}${o.kind && o.side === 'cmp-a' ? ' (tocalo dos veces para desatar)' : ''}`, () => pick(o), {selected: sel === o}));
      }
      if (!live(B).length) spots.push(wordSpot('cmp-done', 'ya no queda nada de Curva', SHELF.b, GROUND - 300, () => finish()));
      g.ui.setSpots(spots);
    };
    const pick = async o => {
      if (busy || !ctl.alive()) return;
      g.audio.tap(0.15, 1.7);
      if (sel === o) {
        // tocar dos veces un atado de Recta lo desata
        if (o.kind === 1 && o.side === 'cmp-a') {
          busy = true;
          sel = null;
          try { await untie(o); } catch { return; }
          busy = false;
          untied++;
          d.evidence('untie');
        } else sel = null;
        return refresh();
      }
      if (!sel || sel.side === o.side) {
        sel = o;
        return refresh();
      }
      const a = sel.side === 'cmp-a' ? sel : o;
      const b = sel.side === 'cmp-a' ? o : sel;
      sel = null;
      if (a.kind !== b.kind) {
        mixed++;
        d.evidence('pair-mixed');
        g.note('Un atado son diez: no se empareja con uno solo.');
        return refresh();
      }
      a.paired = b.paired = true;
      pairs.push([a.id, b.id]);
      busy = true;
      const l = w.add(new Link(`cmp-l${pairs.length}`, () => [a.x, a.y - 26], () => [b.x, b.y - 26], {p: 0.6, w: 1.6, z: 8, progress: 0, dash: true, gap: 8}));
      try {
        await d.draw(l, 0.3, {sound: false});
        g.audio.note(a.kind ? 330 : 523, 0, 0.5, {gain: 0.05, bus: 'sfx'});
        await d.all(d.fadeTo(a, 0.25, 0.3), d.fadeTo(b, 0.25, 0.3), d.fadeTo(l, 0.3, 0.3));
      } catch { return; }
      busy = false;
      refresh();
    };
    const untie = async o => {
      const x0 = o.x, y0 = o.y;
      w.remove(o.id);
      g.audio.erase(0.4, 0.3);
      for (let k = 0; k < 10; k++) {
        const n = Object.assign(item(w, 0, x0, y0), {side: 'cmp-a'});
        A.push(n);
        const tx = x0 - 40 + k * 14, ty = SHELF.y - 140;
        d.tween(0.35, q => { n.x = lerp(x0, tx, q); n.y = lerp(y0, ty, q); }).catch(() => {});
      }
      await d.wait(0.4);
    };
    const finish = () => {
      const leftA = live(A);
      const value = leftA.reduce((acc, o) => acc + (o.kind ? 10 : 1), 0);
      if (value !== 15) {
        g.note('Todavía hay algo de Curva sin pareja.');
        return;
      }
      g.setHint(null);
      resolve({pairs: pairs.length, untied, mixed, left: value});
    };
    refresh();
  }));
}

// ——————————————————————————————————————————————
// 2.7 Un cuarto más
// ——————————————————————————————————————————————

export const cuarto = {
  id: 'c2.cuarto',
  title: 'Un cuarto más',
  setup(g) {
    const w = g.world;
    base(g, {dawn: false});
    w.removeWhere(o => /^(cmp-|load|led-old|oval-a|oval-b|recta)/.test(o.id) || (o.side && o.id.startsWith('it')));
    villager(w, 'curva', DEPOT.right + 300, 'curl', {facing: -0.5, scale: 0.92});
    depotBuilding(w, 3);
    ledgerBoard(w);
    const s = student(w, DEPOT.right - 980);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    mara(w, DEPOT.right + 120, {facing: -0.8});
    syncDepot(g, [9, 9, 9]);
    ledgerLine(w, 'led-dep', '999', 0);
    g.camera.go(SHOTS.depot);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const m = w.get('mara');
    await d.shot(SHOTS.depot, 1);
    await d.say('Mara', 'Todos devolvieron lo que les sobraba. Nueve, nueve y nueve: el depósito está lleno hasta el techo.');
    await d.say('Mara', 'Y acaban de traer un palito más.');
    const counts = [9, 9, 9];
    const one = item(w, 0, DEPOT.right + 70, GROUND - 30, 'load-one');
    one.z = 16;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Guardá el palito en el cuarto de los sueltos.', 'Cuando un cuarto junta diez, tocalo para atar y pasar.']);
      let busy = false;
      let stored = false;
      const rr = rooms(3);
      const refresh = () => {
        const spots = [];
        if (!stored) spots.push(spotOf(one, 'Un palito suelto', () => {}));
        rr.forEach((r, i) => spots.push(rectSpot(`room${i}`, ['Cuarto de los sueltos', 'Cuarto de los atados', 'Cuarto de los atados de atados'][i] + ` (${counts[i]})`, r, () => room(i))));
        g.ui.setSpots(spots);
      };
      const room = async i => {
        if (busy || !ctl.alive()) return;
        busy = true;
        try {
          if (!stored) {
            if (i !== 0) { busy = false; g.note('Un suelto va al cuarto de los sueltos.'); return; }
            const [tx, ty] = slot(0, 9);
            await hop(d, one, tx, ty, {g, h: 40});
            w.remove(one.id);
            counts[0] = 10;
            syncDepot(g, counts);
            stored = true;
          } else if (counts[i] >= 10 && i < 2) {
            await tieUp(d, g, counts, i);
            d.evidence('carry', {from: i});
          } else if (counts[i] >= 10 && i === 2) {
            busy = false;
            g.setHint(null);
            return resolve();
          } else g.note('Ese cuarto no tiene diez.');
        } catch { return; }
        busy = false;
        refresh();
      };
      refresh();
    }));
    m.setPose('worry', 0.3);
    await d.say('Mara', '¡Diez atados de atados! Y no hay más cuartos. ¿Qué hacemos?');
    m.setPose('idle', 0.4);
    for (;;) {
      const c = await d.choose([
        {id: 'leave', text: 'Dejar los diez ahí, total entran.'},
        {id: 'throw', text: 'Tirar un palito y listo.'},
        {id: 'build', text: 'Atarlos y dibujar un cuarto nuevo a la izquierda.'},
      ], {prompt: 'Diez atados de atados y ningún cuarto a la izquierda.', evaluate: true});
      d.evidence('new-room', {choice: c});
      if (c === 'build') break;
      if (c === 'leave') {
        // anotarlo así: un 10 no entra en un solo lugar
        d.describe('Punto intenta escribir 10 en el lugar de los atados de atados: el 1 y el 0 no entran en una sola caja.');
        await loadModel(d, g, '1000', [0, 0, 10]);
        await d.think('Diez no entra en un lugar.');
        w.removeWhere(o => o.id.startsWith('mdl-'));
      }
      if (c === 'throw') {
        m.setPose('surprise', 0.2);
        await d.say('Mara', '¡Ni se te ocurra tirar tiza!');
        m.setPose('idle', 0.4);
      }
    }
    // el estudiante dibuja el cuarto nuevo
    g.setCinematic(true);
    await d.shot({...SHOTS.depot, x: SHOTS.depot.x - 420, w: SHOTS.depot.w + 420}, 1.2);
    await d.walk(s, DEPOT.right - 1300, GROUND, 200);
    s.setPose('write', 0.3);
    const b4 = depotBuilding(w, 4);
    b4.progress = 0.75;
    await d.draw(b4, 1.6, {});
    s.setPose('idle', 0.4);
    // los diez atados de atados se atan y pasan
    const big = w.objects.filter(o => o.id.startsWith('dep-2-'));
    const r3 = rooms(4)[3];
    const cx = r3.x + r3.w / 2, cy = r3.y + r3.h / 2;
    await d.all(...big.map(o => d.tween(0.6, k => { o.x = lerp(o.x, cx, k); o.y = lerp(o.y, cy, k); }, easeInOut)));
    syncDepot(g, [0, 0, 0, 1], 4);
    g.audio.cue('found');
    g.setCinematic(false);
    s.setPose('write', 0.3);
    const L = ledgerLine(w, 'led-dep', '1000', 0, {reveal: 0});
    await d.draw(L, 0.8, {key: 'reveal'});
    s.setPose('idle', 0.4);
    await d.say('Mara', 'Mil. Nunca se había llenado tanto.');
    await d.think('Siempre se puede dibujar otro cuarto.');
    g.flags.thousand = true;
  },
};

// ——————————————————————————————————————————————
// 2.8 Lo que vale el lugar (momento)
// ——————————————————————————————————————————————

export const lugar = {
  id: 'c2.lugar',
  title: 'Lo que vale el lugar',
  moment: 'Lo que vale el lugar',
  setup(g) {
    const w = g.world;
    base(g, {dawn: false});
    w.removeWhere(o => /^(load|cmp-|led-old|recta|oval-)/.test(o.id));
    villager(w, 'curva', LEDGER.x + 360, 'curl', {facing: -0.6, scale: 0.92});
    depotBuilding(w, 4);
    ledgerBoard(w);
    syncDepot(g, [0, 0, 0, 1], 4);
    ledgerLine(w, 'led-dep', '1000', 0);
    const s = student(w, LEDGER.x - 190);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    mara(w, LEDGER.x + 230, {facing: -0.8});
    g.camera.go(SHOTS.ledger);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const m = w.get('mara');
    await d.shot({...SHOTS.ledger, x: SHOTS.ledger.x - 80, w: SHOTS.ledger.w + 260}, 1);
    // Punto le explica a Mara el 14, con lo que aprendió
    g.setCinematic(true);
    p.setMode('still');
    const bx = LEDGER.x - 100, by = GROUND - 200;
    d.describe('Punto escribe 14 en la pizarrita de Mara, dibuja un atado debajo del 1 y cuatro palitos debajo del 4.');
    const n = w.add(new Label('lug-14', '14', bx, by, {size: 64, ch: YELLOW, weight: 700, z: 10, reveal: 0}));
    await zip(d, p, bx, by - 50, 0.4);
    await d.draw(n, 0.7, {key: 'reveal'});
    const bun = item(w, 1, bx + 16, by + 50);
    bun.z = 16;
    bun.progress = 0;
    await d.tween(0.6, k => { bun.progress = k; });
    for (let k = 0; k < 4; k++) {
      const st = item(w, 0, bx + 56 + k * 14, by + 50);
      st.z = 16;
      st.progress = 0;
      await d.tween(0.15, q => { st.progress = q; });
    }
    g.audio.punto('happy');
    g.setCinematic(false);
    await d.say('Mara', 'Así que por eso atábamos de a diez. Para que cada número tenga su lugar.');
    await d.say('student', 'De a cinco también se podría. Pero todos tienen que saber de a cuánto.');
    if (!replay) writeJournal2(g);
    // gancho: lo que se debe
    await d.say('Curva', 'Mara… te debo tres atados de ayer. Y no tengo ninguno.');
    m.setPose('think', 0.4);
    await d.say('Mara', '¿Y eso cómo lo anoto? ¿Menos que nada?');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.4);
    await d.think('Menos que nada. Punto me mira como anoche, cuando rodeó el 1.');
  },
};

function writeJournal2(g) {
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const all = k => ev.filter(e => e.kind === k);
  const seen = [];
  const b = all('bundled')[0];
  if (b) seen.push(`Ataste la carga en el molde de diez: ${b.bundles} atados y ${b.loose} sueltos, 37.${b.tieTries ? ' Cuando quisiste atar con menos de diez, no se pudo.' : ''}`);
  if (all('compare-tallies')[0]) seen.push(all('compare-tallies')[0].answer === 'cant' ? 'Viste que dos hileras largas de marcas no se comparan de un vistazo.' : 'Intentaste comparar dos hileras largas de marcas a ojo; sin emparejar no había forma de estar seguro.');
  if (all('carry').length) seen.push(`En el depósito, ${all('carry').length === 1 ? 'una vez' : `${all('carry').length} veces`} un cuarto juntó diez y lo ataste para pasarlo al de al lado: eso es "me llevo uno".`);
  const we = all('write-empty');
  if (we.length) seen.push(we.length > 1 ? `Para el cuarto vacío probaste ${we.map(e => ({blank: 'no escribir nada', space: 'un espacio', zero: 'un 0'}[e.choice])).join(', ')}: sólo el 0 mantuvo cada número en su lugar.` : 'Para el cuarto vacío escribiste 0 desde el principio.');
  if (g.flags.zero) seen.push('En el registro de los Oval faltaba un cero: 32 en lugar de 302. Lo comprobaste mirando su tiza guardada.');
  const diff = all('difference')[0];
  if (diff) seen.push(`Para comparar a Recta con Curva emparejaste atados con atados y sueltos con sueltos${diff.untied ? ', desataste un atado cuando no alcanzaban los sueltos' : ''}: sobraron 15.`);
  if (g.flags.thousand) seen.push('Cuando el último cuarto juntó diez, dibujaste un cuarto nuevo: 1000.');
  const hints = all('hint').filter(e => e.seg?.startsWith('c2')).length;
  if (hints) seen.push(`Pediste ${hints === 1 ? 'una ayuda' : `${hints} ayudas`}.`);
  const entry = {
    id: 'c2',
    title: 'Demasiados para marcar',
    abbr: 'El lugar dice el tamaño del grupo; el cero guarda el lugar vacío.',
    body: [
      'Para muchas cosas, las marcas no alcanzan: hay que agrupar. Acá, de a diez.',
      'Un numeral es una lista de cuántos grupos hay de cada tamaño: el de la derecha cuenta sueltos, el siguiente atados de diez, el siguiente atados de cien… Cada lugar vale diez veces el de su derecha.',
      '"Me llevo uno": cuando se juntan diez de un tamaño, se atan y pasan como uno al lugar de la izquierda.',
      'El cero no cuenta nada: dice que en ese lugar no hay ningún grupo, y así los demás números no se corren.',
      'Una resta también se puede leer como comparación: emparejar atado con atado y suelto con suelto; si no alcanzan los sueltos, se desata un atado ("pedir prestado"). Lo que sobra es la diferencia.',
      'Diez es una costumbre, no una ley: se puede agrupar de a otra cantidad, siempre que todos sepan de a cuánto.',
    ],
    seen,
    moments: [
      {id: 'c2.cero', label: 'Desplegar: el cero que faltaba'},
      {id: 'c2.lugar', label: 'Desplegar: lo que vale el lugar'},
    ],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora');
  g.saveNow();
}

export const SEGMENTS = [manana, marcar, atados, deposito, cero, cuantos, cuarto, lugar];
