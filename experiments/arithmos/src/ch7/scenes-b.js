// Capítulo 7 — Crecer (7.3 a 7.9): contar los factores, muy grande, áreas con x, al revés,
// completar el cuadrado, ¿cuántas veces? y donde no se puede.

import {Drawing, Label} from '../engine/world.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {power, sci, expand, factor, completeSquare, timesToReach, undefinedAt} from '../logic/growth.js';
import {GROUND, BOARD, SHOTS, T, base, cast, family, familiesHome, area, tile, S, seedOf, YELLOW, BLUE} from './common.js';
import {studentWrites} from './scenes-a.js';

const SUP = {'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'};
/** 2 y 4 → «2⁴»; los exponentes negativos llevan su signo alto. */
const pw = (b, n) => `${b}${String(n).split('').map(c => SUP[c]).join('')}`;

function boardCast(g, who = 0) {
  const w = g.world;
  cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
  familiesHome(g);
  family(w, who, BOARD.x + BOARD.w / 2 + 80, GROUND, {facing: -0.6});
}

function clean(g, re) {
  base(g);
  g.world.removeWhere(o => re.test(o.id));
}

/** Contorno punteado de un rectángulo (dónde van las fichas). */
function outline(w, id, x, y, wd, h) {
  const list = [];
  const per = [[x, y, x + wd, y], [x + wd, y, x + wd, y + h], [x + wd, y + h, x, y + h], [x, y + h, x, y]];
  let n = 0;
  for (const [ax, ay, bx, by] of per) {
    const m = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 10));
    for (let i = 0; i < m; i++) {
      const t0 = i / m, t1 = (i + 0.5) / m;
      list.push(S([[ax + (bx - ax) * t0, ay + (by - ay) * t0], [ax + (bx - ax) * t1, ay + (by - ay) * t1]], seedOf(id) + n++, {w: 1.8, p: 0.7, lift: false, wobble: 0.1}));
    }
  }
  return w.add(new Drawing(id, list, {z: 12}));
}

/** Lugares de un rectángulo (x + p)(x + q) armado con fichas, con la esquina en (ox, oy): q tiras paradas a la derecha, p acostadas abajo. */
function slotsFor(ox, oy, p, q) {
  const s = [{kind: 'x2', x: ox, y: oy}];
  for (let j = 0; j < q; j++) s.push({kind: 'x', vertical: true, x: ox + T.X + j * T.U, y: oy});
  for (let i = 0; i < p; i++) s.push({kind: 'x', vertical: false, x: ox, y: oy + T.X + i * T.U});
  for (let i = 0; i < p; i++) for (let j = 0; j < q; j++) s.push({kind: 'u', x: ox + T.X + j * T.U, y: oy + T.X + i * T.U});
  return s;
}

/** Lleva una ficha a su lugar; las tiras paradas giran un cuarto de vuelta sobre su esquina. */
function moveTile(d, t, sl, sec = 0.5) {
  const sx = t.x, sy = t.y, sr = t.rot || 0;
  const rot = sl.vertical ? Math.PI / 2 : 0;
  const tx = sl.vertical ? sl.x + T.U : sl.x;
  return d.tween(sec, q => { t.x = lerp(sx, tx, q); t.y = lerp(sy, sl.y, q); t.rot = lerp(sr, rot, q); }, easeInOut);
}

/** La bandeja de fichas sueltas, a la derecha de la pizarra (separadas para que cada una se pueda tocar). */
function tray(w, prefix, nx, nu) {
  const A = area();
  const tx = A.x0 + 296, ty = A.y0 + 10;
  const out = [tile(w, `${prefix}-T0`, 'x2', tx, ty)];
  for (let i = 0; i < nx; i++) out.push(tile(w, `${prefix}-Tx${i}`, 'x', A.x0 + 412, ty + i * 44));
  for (let i = 0; i < nu; i++) out.push(tile(w, `${prefix}-Tu${i}`, 'u', tx + (i % 3) * 42, ty + 110 + Math.floor(i / 3) * 42));
  return out;
}

const tileName = k => (k === 'x2' ? 'cuadrado x por x' : k === 'x' ? 'tira x por 1' : 'cuadradito 1 por 1');

// ——————————————————————————————————————————————
// 7.3 Contar los factores
// ——————————————————————————————————————————————

export const factores = {
  id: 'c7.factores',
  title: 'Contar los factores',
  setup(g) {
    clean(g, /^(c7-|dp-|pw-)/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Lo de Punto se anota largo: dos por dos por dos por dos. ¿No hay una forma corta?');
    await d.say('student', 'Se cuentan los dos que se multiplican y se anota arriba, chiquito.');
    await studentWrites(d, g, 'pw-def', `${pw(2, 4)} = 2 · 2 · 2 · 2 = 16`, A.x0 + 20, A.y0 + 36, {size: 28});
    // la tabla hacia abajo: el jugador baja renglón por renglón
    const rowY = i => A.y0 + 36 + i * 40;
    let n = 4;
    const row = (k, text, i) => w.add(new Label(`pw-r${k}`, text, A.x0 + 20, rowY(i), {size: 28, z: 12}));
    // el primer renglón de la tabla es la definición misma
    let zero = null;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá "un renglón abajo": el exponente baja uno. Fijate qué le pasa al resultado.']);
      const refresh = () => g.ui.setSpots([wordSpot('pw-down', 'un renglón abajo', A.x1 - 120, A.y0 + 90, () => down(), {label: `Escribir ${pw(2, n - 1)}`})]);
      const down = async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        try {
          if (n > 1) {
            n--;
            const r = row(n, `${pw(2, n)} = ${power(2, n)}`, 4 - n);
            r.reveal = 0;
            await d.draw(r, 0.5, {key: 'reveal'});
            const a = w.add(new Label(`pw-a${n}`, '÷ 2', A.x0 + 190, rowY(4 - n) - 16, {size: 20, z: 12, ch: YELLOW, reveal: 0}));
            await d.draw(a, 0.3, {key: 'reveal', sound: false});
            d.evidence('pow-row', {n, v: power(2, n)});
            if (n === 2) await d.think('Cada renglón hacia abajo, un dos menos: el resultado se divide por dos.');
          } else {
            zero = await d.choose([
              {id: '0', text: `${pw(2, 0)} = 0: no queda ningún dos.`},
              {id: '1', text: `${pw(2, 0)} = 1.`},
              {id: '2', text: `${pw(2, 0)} = 2.`},
            ], {prompt: `Siguiendo la tabla hacia abajo, ¿cuánto vale ${pw(2, 0)}?`, evaluate: true});
            d.evidence('pow-zero', {answer: zero});
            resolve();
            return;
          }
        } catch { return; }
        busy = false;
        refresh();
      };
      refresh();
    }));
    g.setHint(null);
    const a0 = w.add(new Label('pw-a0', '÷ 2', A.x0 + 190, rowY(4) - 16, {size: 20, z: 12, ch: YELLOW, reveal: 0}));
    await d.draw(a0, 0.3, {key: 'reveal', sound: false});
    await studentWrites(d, g, 'pw-r0', `${pw(2, 0)} = 1`, A.x0 + 20, rowY(4), {size: 28});
    await d.say('student', zero === '1' ? 'Dos dividido dos: uno. La tabla no se corta.' : `No ${zero === '0' ? 'cero' : 'dos'}: dos dividido dos es uno. Si no, la tabla se corta.`);
    await d.say('Mara', '¿Y un renglón más abajo?');
    const a1 = w.add(new Label('pw-a-1', '÷ 2', A.x0 + 190, rowY(5) - 16, {size: 20, z: 12, ch: YELLOW, reveal: 0}));
    await d.draw(a1, 0.3, {key: 'reveal', sound: false});
    await studentWrites(d, g, 'pw-r-1', `${pw(2, -1)} = 1/2`, A.x0 + 20, rowY(5), {size: 28});
    await d.say('student', 'Punto: el exponente cuenta cuántas veces se multiplica por dos. Para abajo de cero, cuántas veces se divide.');
    d.evidence('powers', {zero: power(2, 0), minus: power(2, -1)});
    g.flags.c7pow = true;
  },
};

// ——————————————————————————————————————————————
// 7.4 Muy grande, muy chico
// ——————————————————————————————————————————————

export const grande = {
  id: 'c7.grande',
  title: 'Muy grande, muy chico',
  setup(g) {
    clean(g, /^(pw-|sc-)/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const s = w.get('student');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', 'Medí el polvo de tiza que dejó la Marea esta noche: tres millones de granos. No me entra en la libreta.');
    // el número, cifra por cifra
    const digits = '3000000'.split('');
    const dx = i => A.x0 + 24 + i * 40 + (i >= 1 ? 10 : 0) + (i >= 4 ? 10 : 0);
    const dy = A.y0 + 46;
    digits.forEach((c, i) => w.add(new Label(`sc-d${i}`, c, dx(i), dy, {size: 34, z: 12})));
    d.describe('En la pizarra, tres millones escrito con todas sus cifras: un 3 y seis ceros.');
    // Punto lo anota corto… y cuenta mal
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, A.x0 + 420, dy - 40, 0.4);
    const bad = w.add(new Label('sc-bad', `3 · ${pw(10, 7)}`, A.x0 + 350, dy, {size: 34, z: 16, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(bad, 0.6, {key: 'reveal', sound: false});
    g.audio.punto('happy');
    d.describe(`Punto escribe en amarillo: 3 · ${pw(10, 7)}. Contó siete cifras.`);
    g.setCinematic(false);
    // el jugador cuenta los lugares
    await d.shot(SHOTS.tiles, 0.8);
    const counted = new Set();
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Cada lugar que se corre el 3 es un × 10. Tocá cada cero que hay detrás del 3.', 'Cuando estén todos, tocá "listo".']);
      const refresh = () => {
        const spots = digits.map((c, i) => i === 0 || counted.has(i) ? null : rectSpot(`sc-z${i}`, `Contar el cero ${i}`, {x: dx(i) - 6, y: dy - 34, w: 32, h: 40}, () => tap(i))).filter(Boolean);
        if (counted.size) spots.push(wordSpot('sc-ok', 'listo', A.x0 + 170, dy + 70, () => ok(), {label: `Listo: ${counted.size} ${counted.size === 1 ? 'lugar' : 'lugares'}`}));
        g.ui.setSpots(spots);
      };
      const tap = async i => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        counted.add(i);
        const m = w.add(new Label(`sc-m${i}`, '×10', dx(i) + 9, dy + 24, {size: 16, z: 12, ch: BLUE, align: 'center', reveal: 0}));
        try { await d.draw(m, 0.2, {key: 'reveal', sound: false}); } catch { return; }
        g.audio.tap(0.12, 1.1 + counted.size * 0.06);
        busy = false;
        refresh();
      };
      const ok = () => {
        if (busy || !ctl.alive()) return;
        if (counted.size < 6) { g.note(`Quedan ceros sin contar: van ${counted.size}.`); d.evidence('sci-short', {counted: counted.size}); return; }
        g.ui.setSpots([]);
        resolve();
      };
      refresh();
    }));
    g.setHint(null);
    await d.say('student', 'Punto: seis ceros, seis veces por diez. El 3 no se cuenta: es el que se multiplica.');
    // Punto se corrige solo
    g.setCinematic(true);
    await pulse(d, p, 1, 0.3);
    g.audio.erase(0.5, 0.4);
    await d.fadeTo(bad, 0, 0.5);
    w.remove('sc-bad');
    const good = w.add(new Label('sc-a', `3 · ${pw(10, 6)}`, A.x0 + 350, dy, {size: 34, z: 16, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(good, 0.6, {key: 'reveal', sound: false});
    d.describe(`Punto borra el 7 y escribe 3 · ${pw(10, 6)}.`);
    g.audio.punto('happy');
    follow(p, s);
    g.setCinematic(false);
    const a = sci(3000000), b = sci(400000);
    if (a.e !== 6 || b.e !== 5) console.error('[grande] la notación científica no da 10⁶ y 10⁵');
    await d.say('Cornisa', `La de anoche la anoté así: 4 · ${pw(10, 5)}.`);
    w.add(new Label('sc-b', `4 · ${pw(10, 5)}`, A.x0 + 350, dy + 66, {size: 34, z: 12}));
    const c = await d.choose([
      {id: 'a', text: `Esta noche: 3 · ${pw(10, 6)}.`},
      {id: 'b', text: `Anoche: 4 · ${pw(10, 5)}, porque 4 es más que 3.`},
      {id: 'same', text: 'Dejaron más o menos lo mismo.'},
    ], {prompt: '¿Qué noche dejó más polvo?', evaluate: true});
    d.evidence('sci-compare', {answer: c});
    await studentWrites(d, g, 'sc-be', '= 400 000', A.x0 + 350, dy + 112, {size: 28});
    await d.say('student', c === 'a' ? 'Esta noche: tres millones contra cuatrocientos mil. El exponente dice cuántos lugares, y pesa más que el 3 o el 4.' : 'Esta noche: tres millones contra cuatrocientos mil. Primero se mira el exponente, cuántos lugares; el 3 o el 4 vienen después.');
    await studentWrites(d, g, 'sc-cmp', `3 · ${pw(10, 6)} > 4 · ${pw(10, 5)}`, A.x0 + 24, dy + 160, {size: 28});
    await d.say('Cornisa', 'Y un grano solo es nada: una milésima de gramo.');
    await studentWrites(d, g, 'sc-small', `0,001 = 1 · ${pw(10, -3)}`, A.x0 + 24, dy + 206, {size: 28});
    await d.say('student', 'Lo chico también se corre: tres lugares para el otro lado, como la tabla de los dos, para abajo.');
    d.evidence('sci', {a, b, small: sci(0.001)});
    g.flags.c7sci = true;
  },
};

// ——————————————————————————————————————————————
// 7.5 Áreas con x (momento)
// ——————————————————————————————————————————————

export const areas = {
  id: 'c7.areas',
  title: 'Áreas con x',
  moment: 'Áreas con x',
  setup(g) {
    clean(g, /^(sc-|ar-)/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Peldaño', 'Agrando la huerta cuadrada: dos filas más para abajo y tres columnas más al costado. El lado de antes no lo sé: le digo x.');
    const ox = A.x0 + 70, oy = A.y0 + 34;
    outline(w, 'ar-out', ox, oy, T.X + 3 * T.U, T.X + 2 * T.U);
    w.add(new Label('ar-t', 'x + 3', ox + (T.X + 3 * T.U) / 2, oy - 8, {size: 22, align: 'center', z: 12}));
    w.add(new Label('ar-l', 'x + 2', ox - 8, oy + (T.X + 2 * T.U) / 2 + 8, {size: 22, align: 'right', z: 12}));
    d.describe('En la pizarra, el contorno punteado de la huerta nueva: x + 3 de ancho y x + 2 de alto.');
    const guess = await d.choose([
      {id: 'short', text: 'Un x por x y seis cuadraditos.'},
      {id: 'full', text: 'Un x por x, cinco tiras y seis cuadraditos.'},
      {id: 'swap', text: 'Un x por x, seis tiras y cinco cuadraditos.'},
    ], {prompt: '¿Qué fichas hacen falta para llenar la huerta nueva?', evaluate: true});
    d.evidence('expand-predict', {answer: guess});
    const pieces = tray(w, 'ar', 6, 8);
    d.describe('A la derecha, una bandeja con un x por x, seis tiras y ocho cuadraditos: alcanza y sobra.');
    await d.shot(SHOTS.tiles, 0.8);
    const slots = slotsFor(ox, oy, 2, 3);
    const used = new Set();
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá una ficha de la bandeja: va al lugar libre que le corresponde en la huerta.', 'Cuando la huerta esté llena, se cuentan las fichas.']);
      const refresh = () => g.ui.setSpots(pieces.filter(t => !t.placed).map(t => rectSpot(`ar-pick-${t.kind}-${t.id}`, `Ficha: ${tileName(t.kind)}`, () => ({x: t.x, y: t.y, w: t.w2, h: t.h2}), () => put(t))));
      const put = async t => {
        if (busy || !ctl.alive()) return;
        const k = slots.findIndex((sl, i) => !used.has(i) && sl.kind === t.kind);
        if (k < 0) {
          g.note(t.kind === 'x2' ? 'El x por x ya está puesto.' : t.kind === 'x' ? 'Los bordes ya tienen todas sus tiras: esa sobra.' : 'La esquina ya está llena: ese cuadradito sobra.');
          d.evidence('expand-extra', {kind: t.kind});
          return;
        }
        busy = true;
        g.ui.setSpots([]);
        used.add(k);
        t.placed = true;
        try { await moveTile(d, t, slots[k], 0.45); } catch { return; }
        g.audio.tap(0.15, 1.3 + used.size * 0.03);
        busy = false;
        if (used.size === slots.length) { g.ui.setSpots([]); resolve(); }
        else refresh();
      };
      refresh();
    }));
    g.setHint(null);
    const e = expand(2, 3);
    if (`${e.x2}|${e.x}|${e.one}` !== '1|5|6') console.error('[áreas] la cuenta de las fichas no da x² + 5x + 6');
    d.describe('La huerta llena: un x por x, tres tiras paradas, dos acostadas y seis cuadraditos en la esquina. En la bandeja sobran una tira y dos cuadraditos.');
    g.setCinematic(true);
    const rest = pieces.filter(t => !t.placed);
    await d.all(...rest.map(t => d.fadeTo(t, 0.25, 0.6)));
    g.setCinematic(false);
    await d.think(guess === 'full' ? 'Un x por x, cinco tiras, seis cuadraditos.' : 'Un x por x, cinco tiras y seis cuadraditos. Las tiras son los bordes nuevos: no se pueden olvidar.');
    await studentWrites(d, g, 'ar-eq', `(x + 2)(x + 3) = x${SUP['2']} + 5x + 6`, A.x0 + 24, A.y1 - 14, {size: 26});
    await d.say('student', 'Peldaño: es partir el rectángulo, como cuando repartimos en las Terrazas, pero de los dos lados. Dos por tres, los cuadraditos; dos más tres, las tiras.');
    d.evidence('expand', e);
    g.flags.c7area = true;
  },
};

// ——————————————————————————————————————————————
// 7.6 Al revés
// ——————————————————————————————————————————————

export const alReves = {
  id: 'c7.al-reves',
  title: 'Al revés',
  setup(g) {
    clean(g, /^(ar-|fx-)/);
    boardCast(g, 3);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Balcón', 'A mí me dieron las fichas sueltas: un x por x, cinco tiras y seis cuadraditos. Quiero una huerta rectangular, sin que sobre nada.');
    const ox = A.x0 + 16, oy = A.y0 + 30;
    await d.shot(SHOTS.tiles, 0.8);
    const pieces = tray(w, 'fx', 5, 6);
    const home = pieces.map(t => [t.x, t.y]);
    const opts = [
      {id: '16', text: 'x + 1 por x + 6', p: 1, q: 6},
      {id: '23', text: 'x + 2 por x + 3', p: 2, q: 3},
      {id: '15', text: 'x + 1 por x + 5', p: 1, q: 5},
    ];
    for (;;) {
      const id = await d.choose(opts.map(o => ({id: o.id, text: o.text})), {prompt: '¿Con qué lados probás armar la huerta?'});
      const o = opts.find(x => x.id === id);
      d.evidence('factor-try', {p: o.p, q: o.q});
      g.setCinematic(true);
      const out = outline(w, 'fx-out', ox, oy, T.X + o.q * T.U, T.X + o.p * T.U);
      const byKind = {x2: pieces.filter(t => t.kind === 'x2'), x: pieces.filter(t => t.kind === 'x'), u: pieces.filter(t => t.kind === 'u')};
      const next = {x2: 0, x: 0, u: 0};
      const moves = [];
      for (const sl of slotsFor(ox, oy, o.p, o.q)) {
        const t = byKind[sl.kind][next[sl.kind]++];
        if (t) moves.push(moveTile(d, t, sl, 0.6));
      }
      await d.all(...moves);
      const missX = Math.max(0, o.p + o.q - 5), extraX = Math.max(0, 5 - o.p - o.q);
      const missU = Math.max(0, o.p * o.q - 6), extraU = Math.max(0, 6 - o.p * o.q);
      const ok = !(missX || missU || extraX || extraU);
      d.describe(ok ? 'El rectángulo cierra justo: no falta ni sobra ninguna ficha.' : 'El rectángulo no cierra: quedan huecos o fichas afuera.');
      g.setCinematic(false);
      if (ok) break;
      const parts = [];
      if (missX) parts.push(`faltan ${missX === 1 ? 'una tira' : `${missX} tiras`}`);
      if (extraX) parts.push(`sobra${extraX === 1 ? ' una tira' : `n ${extraX} tiras`}`);
      if (missU) parts.push(`faltan ${missU} cuadraditos`);
      if (extraU) parts.push(`sobra${extraU === 1 ? ' un cuadradito' : `n ${extraU} cuadraditos`}`);
      await d.think(`Así no cierra: ${parts.join(' y ')}.`);
      g.setCinematic(true);
      await d.all(...pieces.map((t, i) => moveTile(d, t, {x: home[i][0], y: home[i][1]}, 0.4)));
      w.remove(out.id);
      g.setCinematic(false);
      opts.splice(opts.indexOf(o), 1);
    }
    const f = factor(5, 6);
    await studentWrites(d, g, 'fx-eq', `x${SUP['2']} + 5x + 6 = (x + ${f.p})(x + ${f.q})`, A.x0 + 16, A.y1 - 14, {size: 26});
    await d.say('student', 'Balcón: los dos números tienen que sumar cinco, por las tiras, y multiplicados dar seis, por los cuadraditos. Dos y tres.');
    await d.say('Balcón', '¿Y si me hubieran dado cinco cuadraditos?');
    const five = factor(5, 5);
    if (five) console.error('[al revés] x² + 5x + 5 no debería armarse');
    await d.think('Dos números que sumen cinco y multiplicados den cinco: uno y cuatro dan cuatro, dos y tres dan seis. Con enteros, ninguno: ese rectángulo no se arma.');
    d.evidence('factor', {f, five});
    g.flags.c7factor = true;
  },
};

// ——————————————————————————————————————————————
// 7.7 Completar el cuadrado
// ——————————————————————————————————————————————

export const completar = {
  id: 'c7.completar',
  title: 'Completar el cuadrado',
  setup(g) {
    clean(g, /^(fx-|cq-)/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Rampa', 'Mi huerta: un cuadrado de lado x y dos tiras de x pegadas, una a cada lado. En total, ocho cuadraditos de tierra. ¿Cuánto mide x?');
    const ox = A.x0 + 40, oy = A.y0 + 30;
    tile(w, 'cq-x2', 'x2', ox, oy);
    const xr = tile(w, 'cq-xr', 'x', ox + T.X + T.U, oy);
    xr.rot = Math.PI / 2;
    tile(w, 'cq-xb', 'x', ox, oy + T.X);
    const ex = A.x0 + 200;
    w.add(new Label('cq-eq0', `x${SUP['2']} + 2x = 8`, ex, A.y0 + 46, {size: 30, z: 12}));
    d.describe('El cuadrado de lado x, una tira parada a la derecha y otra acostada abajo: una L a la que le falta la esquina.');
    const c = await d.choose([
      {id: 'one', text: 'Un cuadradito en la esquina.'},
      {id: 'strip', text: 'Otra tira.'},
      {id: 'none', text: 'Nada: ya es un cuadrado.'},
    ], {prompt: '¿Qué le falta para ser un cuadrado?', evaluate: true});
    d.evidence('complete-predict', {answer: c});
    await d.shot(SHOTS.tiles, 0.8);
    if (c !== 'one') await d.think(c === 'strip' ? 'Una tira más lo haría más largo de un lado. Le falta el hueco de la esquina: uno por uno.' : 'Mirá la esquina de abajo a la derecha: hay un hueco de uno por uno.');
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá la esquina vacía para poner un cuadradito.']);
      g.ui.setSpots([rectSpot('cq-corner', 'Poner un cuadradito en la esquina vacía', {x: ox + T.X, y: oy + T.X, w: T.U, h: T.U}, async () => {
        if (!ctl.alive()) return;
        g.ui.setSpots([]);
        const u = tile(w, 'cq-u', 'u', ox + T.X + 90, oy + T.X + 50);
        try { await moveTile(d, u, {x: ox + T.X, y: oy + T.X}, 0.5); } catch { return; }
        g.audio.tap(0.2, 1.5);
        g.setHint(null);
        resolve();
      })]);
    }));
    d.describe('Con el cuadradito en la esquina, la huerta es un cuadrado de lado x + 1.');
    w.add(new Label('cq-eq1', `x${SUP['2']} + 2x + 1 = 8 + ?`, ex, A.y0 + 92, {size: 28, z: 12}));
    const other = await d.choose([
      {id: '9', text: '8 + 1: se agregó un cuadradito.'},
      {id: '8', text: 'Queda 8: el cuadradito es de la huerta, no de la cuenta.'},
      {id: '10', text: '8 + 2: eran dos tiras.'},
    ], {prompt: 'Del otro lado del igual, ¿qué escribís?', evaluate: true});
    d.evidence('complete-other', {answer: other});
    if (other !== '9') await d.think('Si la huerta ganó un cuadradito, la tierra también: lo que se agrega de un lado del igual, se agrega del otro.');
    w.remove('cq-eq1');
    await studentWrites(d, g, 'cq-eq1', `x${SUP['2']} + 2x + 1 = 8 + 1`, ex, A.y0 + 92, {size: 28});
    await studentWrites(d, g, 'cq-eq2', `(x + 1)${SUP['2']} = 9`, ex, A.y0 + 136, {size: 28});
    const r = completeSquare(2, 8);
    if (r.roots[0] !== 2 || r.roots[1] !== -4) console.error('[completar] (x + 1)² = 9 no da 2 y −4');
    await d.say('student', 'Rampa: un cuadrado de nueve tiene lado 3. Entonces x + 1 = 3, y x mide 2.');
    await d.say('Mara', 'Como en la cuenta de Oval: x · x = 9 también daba con −3.');
    await d.think('x + 1 = −3 también cumple la cuenta: x = −4. La huerta no, porque un lado no mide −4. La cuenta tiene dos soluciones; la huerta, una.');
    await studentWrites(d, g, 'cq-eq3', `x = ${r.roots[0]}  o  x = −${-r.roots[1]}`, ex, A.y0 + 180, {size: 28});
    d.evidence('complete', r);
    g.flags.c7complete = true;
  },
};

// ——————————————————————————————————————————————
// 7.8 ¿Cuántas veces? (momento)
// ——————————————————————————————————————————————

export const cuantasVeces = {
  id: 'c7.cuantas-veces',
  title: '¿Cuántas veces?',
  moment: '¿Cuántas veces?',
  setup(g) {
    clean(g, /^(cq-|lg-)/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Punto, con tu manera de duplicar: empezando con un escalón, ¿cuántos días hasta pasar los mil de la escalera grande?');
    const guess = await d.choose([
      {id: '10', text: 'Unos diez días.'},
      {id: '100', text: 'Unos cien días.'},
      {id: '500', text: 'Quinientos días: la mitad de mil.'},
    ], {prompt: 'Empezando con uno y duplicando cada día, ¿cuántos días para pasar mil?', evaluate: true});
    d.evidence('log-predict', {answer: guess});
    let k = 0, v = 1;
    const val = w.add(new Label('lg-v', '1', A.x0 + 40, A.y0 + 70, {size: 48, z: 12, weight: 700}));
    const cnt = w.add(new Label('lg-c', '0 duplicaciones', A.x0 + 40, A.y0 + 116, {size: 26, z: 12}));
    const res = await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá "duplicar" hasta pasar mil, contando cuántas veces.', 'Cuando haya pasado mil, tocá "ya pasó".']);
      const refresh = () => {
        const spots = [];
        if (k < 13) spots.push(wordSpot('lg-dup', 'duplicar', A.x1 - 110, A.y0 + 60, () => dup()));
        if (k >= 1) spots.push(wordSpot('lg-ok', 'ya pasó', A.x1 - 110, A.y0 + 110, () => ok()));
        g.ui.setSpots(spots);
      };
      const dup = () => {
        if (!ctl.alive()) return;
        k++;
        v *= 2;
        val.text = String(v);
        cnt.text = `${k} ${k === 1 ? 'duplicación' : 'duplicaciones'}`;
        g.audio.tap(0.15, 1.1 + k * 0.05);
        if (p) pulse(d, p, 1, 0.2).catch(() => {});
        d.evidence('log-step', {k, v});
        refresh();
      };
      const ok = () => {
        if (!ctl.alive()) return;
        if (v <= 1000) { g.note(`${v} todavía no pasa mil.`); d.evidence('log-early', {k, v}); return; }
        g.ui.setSpots([]);
        resolve({k, v});
      };
      refresh();
    }));
    g.setHint(null);
    const t = timesToReach(2, 1000);
    if (t.k !== 10) console.error('[cuántas veces] 2 a la cuántas no da 10');
    if (res.k > t.k) await d.think(`Con ${t.k} ya había pasado: ${t.above}. Las otras ${res.k - t.k} sobraban.`);
    await d.say('student', `Punto: ${t.k} veces. ${pw(2, 9)} es ${t.below}, todavía no; ${pw(2, 10)} es ${t.above}, ya pasó.`);
    await studentWrites(d, g, 'lg-eq', `${pw(2, 9)} = ${t.below} < 1000 < ${t.above} = ${pw(2, 10)}`, A.x0 + 24, A.y0 + 176, {size: 26});
    await d.think(guess === '10' ? 'Diez: duplicar llega lejos enseguida.' : `Diez, no ${guess === '100' ? 'cien' : 'quinientos'}: duplicar llega lejos enseguida.`);
    await d.say('student', 'La potencia pregunta: dos, diez veces, ¿cuánto da? Esto es al revés: ¿cuántas veces, para llegar a mil? Esa pregunta tiene nombre: logaritmo.');
    await studentWrites(d, g, 'lg-log', `log₂ 1000 ≈ ${t.log.toFixed(2).replace('.', ',')}`, A.x0 + 24, A.y0 + 222, {size: 26});
    await d.say('Mara', 'Casi diez: nueve duplicaciones no alcanzan y diez se pasan un poco.');
    d.evidence('log', {k: t.k, log: +t.log.toFixed(3)});
    g.flags.c7log = true;
  },
};

// ——————————————————————————————————————————————
// 7.9 Donde no se puede
// ——————————————————————————————————————————————

export const noSePuede = {
  id: 'c7.no-se-puede',
  title: 'Donde no se puede',
  setup(g) {
    clean(g, /^(lg-|ns-)/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const p = w.get('punto');
    const s = w.get('student');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Rampa', 'Tengo un atado para repartir entre los que vengan a la escalera, menos los dos que ya cobraron. Si vienen x, a cada uno le toca 1 ÷ (x − 2).');
    w.add(new Label('ns-f', '1 ÷ (x − 2)', A.x0 + 24, A.y0 + 42, {size: 32, z: 12}));
    const pre = await d.choose([
      {id: '0', text: 'Con x = 0: dividir por cero.'},
      {id: '2', text: 'Con x = 2.'},
      {id: 'all', text: 'Se puede con cualquier x.'},
    ], {prompt: '¿Para qué x no se puede hacer esa cuenta?', evaluate: true});
    d.evidence('rational-predict', {answer: pre});
    // la tabla: el jugador prueba valores
    const rowY = i => A.y0 + 90 + i * 34;
    w.add(new Label('ns-h', 'x      x − 2      1 ÷ (x − 2)', A.x0 + 24, rowY(0) - 6, {size: 20, z: 12, ch: BLUE}));
    await d.shot(SHOTS.tiles, 0.8);
    const tried = [];
    const VALS = [5, 4, 3, 2];
    const share = x => (x - 2 === 1 ? '1' : x - 2 === 0 ? '?' : `1/${x - 2}`);
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá un valor de x para probar la cuenta. Probá varios.']);
      const refresh = () => g.ui.setSpots(VALS.filter(x => !tried.includes(x)).map(x => wordSpot(`ns-x${x}`, `x = ${x}`, A.x1 - 80, A.y0 + 40 + VALS.indexOf(x) * 56, () => put(x), {label: `Probar con x = ${x}`})));
      const put = async x => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        tried.push(x);
        const i = tried.length;
        const l = w.add(new Label(`ns-r${x}`, `${x}          ${x - 2}             ${share(x)}`, A.x0 + 24, rowY(i), {size: 24, z: 12, reveal: 0}));
        try {
          await d.draw(l, 0.5, {key: 'reveal'});
          d.evidence('rational-try', {x});
          if (x === 2) {
            // Punto rellena el hueco… mal
            g.setCinematic(true);
            p.setMode('still');
            await zip(d, p, A.x0 + 250, rowY(i) - 30, 0.35);
            const bad = w.add(new Label('ns-bad', '= 0', A.x0 + 300, rowY(i), {size: 24, z: 16, ch: YELLOW, reveal: 0, weight: 700}));
            await d.draw(bad, 0.4, {key: 'reveal', sound: false});
            d.describe('Punto escribe en amarillo, junto al signo de pregunta: = 0.');
            g.setCinematic(false);
            await d.say('student', 'Punto, ¿uno repartido entre nadie da cero? Acordate de las bolsas de las Terrazas: no hay cuántas.');
            // la Marea: se lleva lo que no se entiende
            g.setCinematic(true);
            await d.shot(SHOTS.board, 0.6);
            d.describe('Pasa una brisa de borrador. El "= 0" de Punto se deshace; el renglón con el signo de pregunta queda.');
            g.audio.erase(1.2, 0.5);
            g.camera.shake = 0.15;
            await d.fadeTo(bad, 0, 1.2);
            w.remove('ns-bad');
            g.audio.punto('sad');
            follow(p, s);
            g.setCinematic(false);
          }
        } catch { return; }
        busy = false;
        if (tried.includes(2) && tried.length >= 3) { g.ui.setSpots([]); resolve(); }
        else refresh();
      };
      refresh();
    }));
    g.setHint(null);
    const u = undefinedAt(2);
    await d.think(pre === '2' ? 'Con x = 2, abajo queda cero. Con x = 0 sí se puede: abajo queda −2.' : pre === '0' ? 'Con x = 0 abajo queda −2, y eso se divide. El cero que molesta es el de abajo: aparece con x = 2.' : 'Con x = 2, abajo queda cero, y por cero no se divide.');
    await studentWrites(d, g, 'ns-no', 'x ≠ 2', A.x0 + 24, A.y1 - 14, {size: 30});
    await d.say('student', `Rampa: la cuenta sirve para cualquier x menos 2. Ahí no da cero ni un número raro: no está definida, porque ${u.reason}.`);
    await d.say('Rampa', 'Entonces escribo arriba: "si vienen más de dos". Con 3, un atado entero cada uno; con 5, un tercio.');
    d.evidence('rational', u);
    g.flags.c7rational = true;
    if (!replay) writeJournal7(g);
    await d.say('Peldaño', 'Con la raíz de dos pinté la puerta. Pero ayer partí la diagonal en doce y no cayó en ninguna rayita. ¿En cuántas hay que partirla?');
    g.audio.punto('question');
  },
};

function writeJournal7(g) {
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const first = k => ev.find(e => e.kind === k);
  const seen = [];
  const sp = first('side-predict');
  if (sp) seen.push(sp.answer === 'less' ? 'Anticipaste que una huerta cuadrada de dos cuadros tiene lado menor que 2; armándola con triángulos, el lado era la diagonal de un cuadro: √2.' : 'Pensaste que el lado de una huerta cuadrada de dos cuadros era 2 o más; armándola, el lado era la diagonal de un cuadro: √2 ≈ 1,414.');
  const rp = first('race-predict');
  if (rp) seen.push(rp.answer === 'mul' ? 'Apostaste por duplicar: al principio perdía, y desde el día 6 pasó adelante.' : 'Apostaste a sumar diez o al empate; sumar ganó los primeros días y duplicar pasó adelante el día 6.');
  const pz = first('pow-zero');
  if (pz) seen.push(pz.answer === '1' ? 'Siguiendo la tabla hacia abajo, dijiste 2⁰ = 1.' : 'Para 2⁰ dijiste otro valor; la tabla, dividiendo por dos, daba 1.');
  const sc = first('sci-compare');
  if (sc) seen.push(sc.answer === 'a' ? 'Comparaste por el exponente: 3 · 10⁶ es más que 4 · 10⁵.' : 'Miraste primero el 3 y el 4; el exponente pesaba más: 3 · 10⁶ es más que 4 · 10⁵.');
  const ep = first('expand-predict');
  if (ep) seen.push(ep.answer === 'full' ? 'Anticipaste las cinco tiras de (x + 2)(x + 3).' : 'Armando (x + 2)(x + 3) con fichas, hicieron falta cinco tiras y seis cuadraditos.');
  const ft = ev.filter(e => e.kind === 'factor-try').map(e => `x + ${e.p} por x + ${e.q}`);
  if (ft.length) seen.push(`Para x² + 5x + 6 probaste ${ft.join(', después ')}.`);
  const co = first('complete-other');
  if (co) seen.push(co.answer === '9' ? 'Al completar el cuadrado sumaste 1 de los dos lados del igual.' : 'Al completar el cuadrado, el cuadradito también había que sumarlo del otro lado: 8 + 1.');
  const lp = first('log-predict');
  if (lp) seen.push(lp.answer === '10' ? 'Anticipaste unos diez días para pasar mil duplicando.' : 'Esperabas muchos más días; duplicando, alcanzaron diez.');
  const rq = first('rational-predict');
  if (rq) seen.push(rq.answer === '2' ? 'Viste que 1 ÷ (x − 2) no se puede con x = 2.' : 'Pensaste en otro valor; el que no se puede en 1 ÷ (x − 2) es x = 2, donde abajo queda cero.');
  const entry = {
    id: 'c7',
    title: 'Crecer',
    abbr: 'Multiplicar repetido crece distinto que sumar repetido, y cada crecimiento tiene su pregunta al revés.',
    body: [
      'La raíz es el lado de un cuadrado de área dada: √9 = 3. √2 es la diagonal de un cuadrado de lado 1 (≈ 1,414). El signo √ indica el lado, el número positivo; x · x = 9 tiene además −3.',
      'Sumar lo mismo crece parejo; duplicar empieza lento y después no lo alcanza nadie. 2ⁿ cuenta cuántas veces se multiplica por 2; para abajo se divide: 2⁰ = 1, 2⁻¹ = 1/2. Los números muy grandes o muy chicos se escriben corriendo lugares: 3 · 10⁶, 10⁻³.',
      'Un producto de sumas es un rectángulo partido: (x + 2)(x + 3) = x² + 5x + 6. Factorizar es armar el rectángulo con las fichas; completar el cuadrado es agregar la esquina que falta, de los dos lados del igual: (x + 1)² = 9 da x = 2 o x = −4.',
      '¿Cuántas veces hay que duplicar para pasar mil? Diez (2¹⁰ = 1024): es la pregunta al revés de la potencia, el logaritmo (log₂ 1000 ≈ 9,97). Y una cuenta con x abajo de una división no vale donde ese abajo da cero: 1 ÷ (x − 2) pide x ≠ 2.',
    ],
    seen,
    moments: [
      {id: 'c7.areas', label: 'Desplegar: áreas con x'},
      {id: 'c7.cuantas-veces', label: 'Desplegar: ¿cuántas veces?'},
    ],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora (≡)');
  g.saveNow();
}
