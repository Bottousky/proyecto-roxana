// Capítulo 7 — Crecer (7.1 y 7.2): el lado del cuadrado y sumar o duplicar.

import {Drawing, Label, Shape} from '../engine/world.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, hop, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {race, overtakeDay, sideOf} from '../logic/growth.js';
import {GROUND, BOARD, boardTop, SHOTS, base, cast, family, familiesHome, area, plate, triangle, S, seedOf, WHITE, YELLOW} from './common.js';

/** El estudiante camina a la pizarra y escribe. */
export async function studentWrites(d, g, id, text, x, y, opts = {}) {
  const w = g.world;
  const s = w.get('student');
  const l = w.add(new Label(id, text, x, y, {size: opts.size ?? 28, z: 12, reveal: 0, align: opts.align ?? 'left', ch: opts.ch}));
  g.setCinematic(true);
  s.face(1);
  await d.walk(s, BOARD.x - BOARD.w / 2 - 40, GROUND, 240);
  s.setPose('write', 0.3);
  await d.draw(l, Math.min(1.3, 0.3 + text.length * 0.04), {key: 'reveal'});
  s.setPose('idle', 0.4);
  g.setCinematic(false);
  return l;
}

function boardCast(g) {
  const w = g.world;
  cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
  familiesHome(g);
  family(w, 0, BOARD.x + BOARD.w / 2 + 80, GROUND, {facing: -0.6});
}

// ——————————————————————————————————————————————
// 7.1 El lado del cuadrado
// ——————————————————————————————————————————————

const SQ = 104; // lado de un cuadro de huerta, para el corte

export const lado = {
  id: 'c7.lado',
  title: 'El lado del cuadrado',
  setup(g) {
    const w = g.world;
    w.clear();
    base(g);
    boardCast(g);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Peldaño', 'Tengo nueve cuadros de huerta y los quiero en una huerta cuadrada. ¿Cuánto mide el lado?');
    // nueve cuadraditos en fila
    const U = 40;
    const cells = [];
    for (let i = 0; i < 9; i++) {
      const c = w.add(new Shape(`c7-u${i}`, plate(`c7-u${i}`, U, U, YELLOW, false), A.x0 + 10 + i * (U + 6), A.y1 - U - 8, {z: 14}));
      cells.push(c);
    }
    d.describe('En la pizarra, nueve cuadraditos en fila.');
    const rows = await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Elegí en cuántas filas acomodar los nueve cuadros. Peldaño la quiere cuadrada.']);
      const opts = [1, 3, 9];
      g.ui.setSpots(opts.map((n, i) => wordSpot(`rows-${n}`, n === 1 ? 'en 1 fila' : `en ${n} filas`, A.x0 + 70 + i * 150, A.y0 + 24, () => { if (ctl.alive()) { g.ui.setSpots([]); g.setHint(null); resolve(n); } }, {label: `Acomodar los nueve cuadros en ${n === 1 ? 'una fila' : `${n} filas`}`})));
    }));
    d.evidence('square-rows', {rows});
    const arrange = async n => {
      const cols = 9 / n;
      d.describe(`Los nueve cuadros se acomodan en ${n} ${n === 1 ? 'fila' : 'filas'} de ${cols}.`);
      await d.all(...cells.map((c, i) => {
        const tx = A.x0 + 60 + (i % cols) * U, ty = A.y0 + 60 + Math.floor(i / cols) * U;
        const sx = c.x, sy = c.y;
        return d.tween(0.6, q => { c.x = lerp(sx, tx, q); c.y = lerp(sy, ty, q); }, easeInOut);
      }));
    };
    if (rows !== 3) {
      await arrange(rows);
      await d.say('Peldaño', rows === 1 ? 'Eso es un pasillo, no una huerta cuadrada.' : 'Una columna larguísima. Cuadrada, dije.');
    }
    await arrange(3);
    await d.say('student', 'Tres filas de tres: el lado mide 3. Punto, tres por tres es nueve: tres es la raíz de nueve.');
    await studentWrites(d, g, 'c7-r9', '√9 = 3', A.x0 + 220, A.y0 + 110, {size: 34});
    await d.say('Mara', 'En la cuenta de Oval, x · x = 9 también daba −3.');
    await d.say('student', 'Un lado no mide −3. La raíz de un número es la positiva; el −3 hay que agregarlo aparte.');
    // la otra huerta: dos cuadros, cuadrada
    g.setCinematic(true);
    await d.all(...cells.map(c => d.fadeTo(c, 0, 0.4)), d.fadeTo(w.get('c7-r9'), 0, 0.4));
    w.removeWhere(o => o.id.startsWith('c7-u') || o.id === 'c7-r9');
    g.setCinematic(false);
    await d.say('Peldaño', 'Y la que le conté a Mara: dos cuadros, también cuadrada. x · x = 2.');
    const ax = A.x0 + 16, ay = A.y0 + 70;
    const sqs = [0, 1].map(k => w.add(new Shape(`c7-s${k}`, plate(`c7-s${k}`, SQ, SQ, WHITE, true), ax + k * (SQ + 14), ay, {z: 14})));
    const guess = await d.choose([
      {id: '2', text: 'Lado 2: son dos cuadros.'},
      {id: 'less', text: 'Menos de 2.'},
      {id: 'more', text: 'Más de 2.'},
    ], {prompt: 'Una huerta cuadrada hecha con dos cuadros de lado 1: ¿cuánto mide su lado?', evaluate: true});
    d.evidence('side-predict', {answer: guess});
    // cortar cada cuadro por la diagonal y armar el cuadrado grande
    const tris = [];
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá cada cuadro para cortarlo por la diagonal.', 'Después tocá cada triángulo: se acomoda alrededor del centro.']);
      const C = [A.x1 - 132, A.y0 + 140];
      const quads = [[0, 0], [Math.PI / 2, 1], [Math.PI, 2], [-Math.PI / 2, 3]];
      let placed = 0;
      const refresh = () => {
        const spots = [];
        sqs.forEach((q, k) => { if (w.has(q.id)) spots.push(rectSpot(`cut${k}`, `Cortar el cuadro ${k + 1} por la diagonal`, {x: q.x, y: q.y, w: SQ, h: SQ}, () => cut(k))); });
        tris.filter(t => !t.placed).forEach((t, i) => spots.push(rectSpot(`tri-${t.id}`, `Llevar el triángulo ${i + 1} al cuadrado grande`, () => ({x: t.x + (t.rot ? -SQ : 0), y: t.y + (t.rot ? -SQ : 0), w: SQ, h: SQ}), () => place(t))));
        g.ui.setSpots(spots);
      };
      const cut = async k => {
        if (busy || !ctl.alive()) return;
        busy = true;
        const q = sqs[k];
        const x = q.x, y = q.y;
        w.remove(q.id);
        g.audio.erase(0.4, 0.3);
        d.describe(`El cuadro ${k + 1} se corta por la diagonal: dos triángulos.`);
        const t1 = w.add(new Shape(`c7-t${k}a`, triangle(`c7-t${k}a`, SQ), x, y, {z: 15}));
        const t2 = w.add(new Shape(`c7-t${k}b`, triangle(`c7-t${k}b`, SQ), x + SQ, y + SQ, {z: 15, rot: Math.PI}));
        tris.push(t1, t2);
        try { await d.tween(0.3, qq => { t1.x = x - qq * 4; t1.y = y - qq * 4; t2.x = x + SQ + qq * 4; t2.y = y + SQ + qq * 4; }); } catch { return; }
        busy = false;
        refresh();
      };
      const place = async t => {
        if (busy || !ctl.alive() || tris.length < 4) { if (tris.length < 4) g.note('Primero cortá los dos cuadros.'); return; }
        busy = true;
        const [rot] = quads[placed];
        t.placed = true;
        placed++;
        const sx = t.x, sy = t.y, sr = t.rot || 0;
        try {
          await d.tween(0.6, q => { t.x = lerp(sx, C[0], q); t.y = lerp(sy, C[1], q); t.rot = lerp(sr, rot, q); }, easeInOut);
          g.audio.tap(0.2, 1.3 + placed * 0.1);
        } catch { return; }
        busy = false;
        if (placed === 4) resolve();
        else refresh();
      };
      refresh();
    }));
    g.setHint(null);
    d.describe('Los cuatro triángulos forman un cuadrado grande, inclinado. Sus lados, en amarillo, son las diagonales de los cuadros.');
    await d.shot(SHOTS.close, 0.8);
    // comparar con un lado de 2
    const C = [A.x1 - 132, A.y0 + 140];
    const bar2 = w.add(new Drawing('c7-bar2', [S([[A.x0 + 16, A.y0 + 236], [A.x0 + 16 + 2 * SQ, A.y0 + 236]], seedOf('c7b2'), {w: 3, p: 0.9})], {z: 14, progress: 0}));
    const lab2 = w.add(new Label('c7-bar2l', 'un lado de 2', A.x0 + 16 + SQ, A.y0 + 226, {size: 20, align: 'center', z: 14}));
    await d.draw(bar2, 0.6, {sound: false});
    void lab2;
    await d.think(guess === 'less' ? 'Menos de 2: el lado es la diagonal de un cuadro.' : guess === '2' ? 'Un lado de 2 haría una huerta de cuatro cuadros, no de dos. El lado es la diagonal de un cuadro: menos de 2.' : 'Menos de 2, no más: el lado es la diagonal de un cuadro.');
    const r2 = sideOf(2);
    await d.say('student', 'Punto: el lado de esta huerta, por sí mismo, da dos. Es la diagonal que medimos: más o menos 1,414.');
    await studentWrites(d, g, 'c7-r2', '√2 · √2 = 2', A.x0 + 16, A.y0 + 60, {size: 28});
    await studentWrites(d, g, 'c7-r2b', '√2 ≈ 1,414', A.x0 + 16, A.y0 + 104, {size: 28});
    d.evidence('side', {lo: r2.lo, hi: r2.hi});
    await d.say('Peldaño', 'Así que el camino en diagonal mide raíz de dos. Lo pinto así en la puerta.');
    g.flags.c7root = true;
  },
};

// ——————————————————————————————————————————————
// 7.2 Sumar o duplicar
// ——————————————————————————————————————————————

export const duplicar = {
  id: 'c7.duplicar',
  title: 'Sumar o duplicar',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(c7-|dp-)/.test(o.id));
    boardCast(g);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'La Marea se llevó entera la escalera del fondo: cien escalones. Hoy dibujo uno, y después diez por día.');
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, A.x1 - 60, A.y0 + 30, 0.4);
    d.describe('Punto escribe en amarillo: × 2. Él dibujaría cada día el doble de lo que ya hay.');
    const pl = w.add(new Label('dp-p', '× 2 cada día', A.x1 - 160, A.y0 + 30, {size: 24, z: 16, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(pl, 0.5, {key: 'reveal', sound: false});
    g.audio.punto('happy');
    follow(p, s);
    g.setCinematic(false);
    const guess = await d.choose([
      {id: 'add', text: 'El de Mara: diez por día.'},
      {id: 'mul', text: 'El de Punto: cada día, el doble.'},
      {id: 'tie', text: 'Llegan juntos.'},
    ], {prompt: 'Empezando los dos con un escalón: ¿quién llega antes a cien?', evaluate: true});
    d.evidence('race-predict', {answer: guess});
    // la tabla y dos columnas que crecen
    const rows = race(1, 10, 2, 10);
    const tx = A.x0 + 10, ty = A.y0 + 22;
    const colX = [tx, tx + 64, tx + 140];
    ['día', 'Mara', 'Punto'].forEach((h, i) => w.add(new Label(`dp-h${i}`, h, colX[i], ty, {size: 20, z: 12, ch: i === 2 ? YELLOW : undefined})));
    const barX = [A.x1 - 150, A.x1 - 70];
    const barBottom = A.y1 - 8, scale = (A.y1 - A.y0 - 40) / 130;
    const barId = i => `dp-bar${i}`;
    w.add(new Label('dp-bl0', 'Mara', barX[0] + 16, barBottom + 18, {size: 16, align: 'center', z: 12}));
    w.add(new Label('dp-bl1', 'Punto', barX[1] + 16, barBottom + 18, {size: 16, align: 'center', z: 12, ch: YELLOW}));
    w.add(new Drawing('dp-100', [S([[barX[0] - 10, barBottom - 100 * scale], [barX[1] + 42, barBottom - 100 * scale]], seedOf('dp100'), {w: 1.6, p: 0.7})], {z: 12}));
    w.add(new Label('dp-100l', '100', barX[0] - 14, barBottom - 100 * scale + 6, {size: 16, align: 'right', z: 12}));
    const setBars = r => {
      [0, 1].forEach(i => {
        const v = Math.min(130, i ? r.mul : r.add);
        const strokes = plate(`dp-b${i}-${r.day}`, 32, Math.max(2, v * scale), i ? YELLOW : WHITE, true).map(st => shiftStroke(st, barX[i], barBottom - v * scale));
        w.add(new Drawing(barId(i), strokes, {z: 13}));
      });
    };
    let day = 0;
    const addRow = r => {
      [r.day, r.add, r.mul].forEach((v, i) => w.add(new Label(`dp-r${r.day}-${i}`, String(v), colX[i], ty + 22 + r.day * 21, {size: 18, z: 12})));
      setBars(r);
    };
    addRow(rows[0]);
    let overtook = false;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá "otro día" y mirá las dos columnas.', 'Podés parar cuando quieras, después de que alguno llegue a cien.']);
      const refresh = () => {
        const spots = [];
        if (day < 10) spots.push(wordSpot('dp-next', 'otro día', A.x0 + 290, A.y1 - 70, () => next()));
        if (rows[day].mul >= 100) spots.push(wordSpot('dp-stop', 'parar', A.x0 + 290, A.y1 - 30, () => { if (!busy && ctl.alive()) resolve(); }));
        g.ui.setSpots(spots);
      };
      const next = async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        day++;
        addRow(rows[day]);
        g.audio.tap(0.15, 1.2 + day * 0.05);
        d.evidence('race-day', {day, add: rows[day].add, mul: rows[day].mul});
        try {
          if (day === 1) { g.audio.punto('sad'); await d.think('Once contra dos. Punto se queda atrás.'); }
          if (!overtook && rows[day].mul > rows[day].add) {
            overtook = true;
            g.audio.punto('happy');
            await pulse(d, p, 2, 0.4);
            await d.think(`Día ${day}: ${rows[day].mul} contra ${rows[day].add}. Punto pasa adelante.`);
          }
        } catch { return; }
        busy = false;
        if (day >= 10) resolve();
        else refresh();
      };
      refresh();
    }));
    g.setHint(null);
    const od = overtakeDay(1, 10, 2);
    await d.say('student', 'Punto: al principio sumar diez gana. Duplicar empieza lento, pero cada día suma todo lo que ya había. Desde el día ' + od + ', no te alcanza nadie.');
    await d.say('Mara', 'Entonces la redibujamos a tu manera. ¿Y de dónde sacás tanta tiza el día siete?');
    g.audio.punto('question');
    d.evidence('race', {overtake: od, guess});
    g.flags.c7race = true;
  },
};

/** Corre un trazo ya armado (copiado de ch2/art.shift, para no depender de él). */
function shiftStroke(s, dx, dy) {
  const pts = new Float32Array(s.pts);
  for (let i = 0; i < s.n; i++) {
    pts[i * 3] += dx;
    pts[i * 3 + 1] += dy;
  }
  return {...s, pts};
}

export {Drawing, Shape, hop, WHITE};
