// Capítulo 7 — Crecer (7.3 a 7.9): contar los factores, muy grande, áreas con x, al revés,
// completar el cuadrado, ¿cuántas veces? y donde no se puede.

import {Drawing, Label, Shape} from '../engine/world.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {power, sci, expand, factor, completeSquare, timesToReach, undefinedAt, factorsOfProduct, factorsOfPower, exactRoot} from '../logic/growth.js';
import {GROUND, BOARD, SHOTS, T, base, cast, family, familiesHome, area, tile, plate, S, seedOf, WHITE, YELLOW, BLUE} from './common.js';
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
    await d.say('student', 'Se empieza en 1 y se multiplica por dos tantas veces como dice el número de arriba, chiquito.');
    await studentWrites(d, g, 'pw-def', `${pw(2, 4)} = 1 · 2 · 2 · 2 · 2 = 16`, A.x0 + 20, A.y0 + 36, {size: 28});
    // la tabla hacia abajo: el jugador baja renglón por renglón
    const rowY = i => A.y0 + 36 + i * 40;
    let n = 4;
    const row = (k, text, i) => w.add(new Label(`pw-r${k}`, text, A.x0 + 20, rowY(i), {size: 28, z: 12}));
    // el primer renglón de la tabla es la definición misma
    let zero = null;
    await d.shot(SHOTS.tiles, 0.8);
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
    await d.say('student', zero === '1' ? 'Dos dividido dos: uno. Y con la regla: empezar en 1 y multiplicar cero veces deja el 1.' : `No ${zero === '0' ? 'cero' : 'dos'}: dos dividido dos es uno. Y con la regla: empezar en 1 y multiplicar cero veces deja el 1.`);
    await d.say('Mara', '¿Y un renglón más abajo?');
    const a1 = w.add(new Label('pw-a-1', '÷ 2', A.x0 + 190, rowY(5) - 16, {size: 20, z: 12, ch: YELLOW, reveal: 0}));
    await d.draw(a1, 0.3, {key: 'reveal', sound: false});
    await studentWrites(d, g, 'pw-r-1', `${pw(2, -1)} = 1/2`, A.x0 + 20, rowY(5), {size: 28});
    await d.say('student', 'Punto, el exponente cuenta cuántas veces se multiplica por dos. Para abajo de cero, cuántas veces se divide.');
    await d.say('student', `Y el renglón n de tu escalera, «× 2 el anterior», ahora se escribe corto: el día n tenés 2 elevado a n. El día 8, ${pw(2, 8)} = 256.`);
    d.evidence('powers', {zero: power(2, 0), minus: power(2, -1)});
    g.flags.c7pow = true;
  },
};

// ——————————————————————————————————————————————
// 7.3b Juntar factores (propiedades de las potencias y raíz cúbica)
// ——————————————————————————————————————————————

/** Escribe los factores uno por uno, en grupos entre paréntesis, con su número de orden debajo. Devuelve dónde terminó. */
async function unfold(d, g, id, groups, x, y) {
  const w = g.world;
  const L = (k, t, lx, opts = {}) => w.add(new Label(`${id}-${k}`, t, lx, y, {size: 24, align: 'center', z: 12, ...opts}));
  let cx = x, k = 0;
  for (let gi = 0; gi < groups.length; gi++) {
    if (gi > 0) { L(`m${gi}`, '·', cx + 9); cx += 20; }
    L(`o${gi}`, '(', cx + 5); cx += 12;
    for (let j = 0; j < groups[gi].length; j++) {
      k++;
      const f = L(`f${k}`, String(groups[gi][j]), cx + 7, {reveal: 0});
      await d.draw(f, 0.18, {key: 'reveal', sound: false});
      w.add(new Label(`${id}-n${k}`, String(k), cx + 7, y + 22, {size: 14, align: 'center', z: 12, ch: YELLOW}));
      g.audio.tap(0.12, 1 + k * 0.07);
      if (j < groups[gi].length - 1) { L(`d${k}`, '·', cx + 21); cx += 28; } else cx += 16;
    }
    L(`c${gi}`, ')', cx + 4); cx += 12;
  }
  d.describe(`En la pizarra: ${groups.map(gr => `(${gr.join(' · ')})`).join(' · ')}. ${k} factores contados.`);
  return cx;
}

/** Una capa de un cubo de n por n bloques (perspectiva caballera): frente y costado; la tapa va aparte. */
function slab(id, bx, by, n, u, k, dx, dy) {
  const y0 = by - k * u, y1 = by - (k + 1) * u, seed = seedOf(id);
  const list = [S([[bx, y0], [bx + n * u, y0], [bx + n * u, y1], [bx, y1], [bx, y0]], seed, {w: 2.2, p: 0.9})];
  for (let i = 1; i < n; i++) list.push(S([[bx + i * u, y0], [bx + i * u, y1]], seed + i, {w: 1.2, p: 0.6, lift: false}));
  const rx = bx + n * u;
  list.push(S([[rx, y0], [rx + n * dx, y0 + n * dy], [rx + n * dx, y1 + n * dy], [rx, y1]], seed + 40, {w: 2.2, p: 0.9}));
  for (let i = 1; i < n; i++) list.push(S([[rx + i * dx, y0 + i * dy], [rx + i * dx, y1 + i * dy]], seed + 40 + i, {w: 1.2, p: 0.6, lift: false}));
  return new Drawing(id, list, {z: 12, progress: 0});
}

function lid(id, bx, top, n, u, dx, dy) {
  const seed = seedOf(id);
  const list = [S([[bx, top], [bx + n * u, top], [bx + n * u + n * dx, top + n * dy], [bx + n * dx, top + n * dy], [bx, top]], seed, {w: 2.2, p: 0.9})];
  for (let i = 1; i < n; i++) {
    list.push(S([[bx + i * dx, top + i * dy], [bx + n * u + i * dx, top + i * dy]], seed + i, {w: 1.1, p: 0.55, lift: false}));
    list.push(S([[bx + i * u, top], [bx + i * u + n * dx, top + n * dy]], seed + 20 + i, {w: 1.1, p: 0.55, lift: false}));
  }
  return new Drawing(id, list, {z: 13});
}

export const juntar = {
  id: 'c7.juntar',
  title: 'Juntar factores',
  setup(g) {
    clean(g, /^(pw-|jf-)/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    const write = async (id, text, x, y, opts = {}) => {
      const l = w.add(new Label(id, text, x, y, {size: 24, z: 12, reveal: 0, ...opts}));
      await d.draw(l, Math.min(1, 0.3 + text.length * 0.04), {key: 'reveal'});
      d.describe(`En la pizarra: ${text}`);
      return l;
    };
    const tapToUnfold = label => d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá «desplegar»: se escriben los factores uno por uno, y se cuentan.']);
      g.ui.setSpots([wordSpot('jf-open', 'desplegar', A.x1 - 70, A.y1 - 34, () => {
        if (!ctl.alive()) return;
        g.ui.setSpots([]);
        g.setHint(null);
        resolve();
      }, {label})]);
    }));
    const rowY = [A.y0 + 40, A.y0 + 104, A.y0 + 168];

    // 1. multiplicar potencias del mismo número: se juntan los factores
    await d.say('Mara', 'El lunes Punto se duplicó tres veces seguidas, y el martes, dos veces más. Lo anoto corto.');
    await write('jf-a', `${pw(2, 3)} · ${pw(2, 2)} =`, A.x0 + 20, rowY[0]);
    await d.say('student', `Con otro número abajo se escribe igual: ${pw(4, 3)} es empezar en 1 y multiplicar por 4 tres veces, 1 · 4 · 4 · 4.`);
    await d.shot(SHOTS.tiles, 0.8);
    const c1 = await d.choose([
      {id: '5', text: `${pw(2, 5)}: tres dos y dos dos más.`},
      {id: '6', text: `${pw(2, 6)}: tres por dos.`},
      {id: '4', text: `${pw(4, 5)}: dos por dos abajo, y 3 + 2 arriba.`},
    ], {prompt: `¿Cuánto es ${pw(2, 3)} · ${pw(2, 2)}, como una sola potencia de 2?`, evaluate: true});
    d.evidence('pow-product', {answer: c1});
    await tapToUnfold(`Desplegar ${pw(2, 3)} · ${pw(2, 2)}`);
    const e1 = await unfold(d, g, 'jf-u1', [factorsOfProduct(2, 3, 2).slice(0, 3), factorsOfProduct(2, 3, 2).slice(3)], A.x0 + 120, rowY[0]);
    await write('jf-a2', `= ${pw(2, 5)} = ${power(2, 5)}`, e1 + 8, rowY[0], {ch: YELLOW});
    await d.think(c1 === '5' ? 'Cinco dos: 2⁵.' : c1 === '6' ? 'Son cinco dos, no seis: los tres del lunes y los dos del martes se juntan. Tres y dos se suman.' : 'El 2 de abajo no cambia: cada vez se multiplica por 2. Son cinco dos: 2⁵ = 32. 4⁵ sería 1024.');
    await d.say('student', 'Mara, multiplicar potencias del mismo número es juntar sus factores. Los exponentes se suman: 3 + 2 = 5. Con cualquier número abajo pasa lo mismo: se cuentan factores iguales.');

    // 2. elevar una potencia: se repiten los factores
    await d.say('Mara', 'Y si un día se duplica tres veces, y eso pasa dos días seguidos, lo anoto así.');
    await write('jf-b', `(${pw(2, 3)})${pw('', 2)} =`, A.x0 + 20, rowY[1]);
    const c2 = await d.choose([
      {id: '6', text: `${pw(2, 6)}: dos veces tres dos.`},
      {id: '5', text: `${pw(2, 5)}: 3 + 2.`},
      {id: '9', text: `${pw(2, 9)}: tres al cuadrado.`},
    ], {prompt: `¿Cuánto es (${pw(2, 3)})${pw('', 2)}, como una sola potencia de 2?`, evaluate: true});
    d.evidence('pow-power', {answer: c2});
    await tapToUnfold(`Desplegar (${pw(2, 3)})${pw('', 2)}`);
    const rep = factorsOfPower(2, 3, 2);
    const e2 = await unfold(d, g, 'jf-u2', [rep.slice(0, 3), rep.slice(3)], A.x0 + 108, rowY[1]);
    await write('jf-b2', `= ${pw(2, 6)} = ${power(2, 6)}`, e2 + 8, rowY[1], {ch: YELLOW});
    await d.think(c2 === '6' ? 'Seis dos: 2⁶.' : c2 === '5' ? 'Acá no se juntan dos potencias distintas: se repite la misma, 2³, dos veces. Tres dos, dos veces: seis.' : 'El cuadrado es de todo el 2³, no del 3 solo: 2³ · 2³. Seis dos, no nueve.');
    await d.say('student', 'Elevar una potencia es repetirla: tres dos, dos veces. Los exponentes se multiplican: 3 · 2 = 6.');

    // 3. sumando no se juntan
    await d.say('Mara', '¿Y si en vez de multiplicar sumo? ¿Se juntan igual?');
    const c3 = await d.choose([
      {id: 'no', text: `No: 8 + 4 = 12, y ${pw(2, 5)} es 32.`},
      {id: 'yes', text: 'Sí: los exponentes se suman.'},
    ], {prompt: `¿${pw(2, 3)} + ${pw(2, 2)} es ${pw(2, 5)}?`, evaluate: true});
    d.evidence('pow-sum', {answer: c3});
    await studentWrites(d, g, 'jf-c', `${pw(2, 3)} + ${pw(2, 2)} = 8 + 4 = 12, y ${pw(2, 5)} = 32`, A.x0 + 20, rowY[2], {size: 24});
    await d.think(c3 === 'no' ? 'Doce, no treinta y dos.' : 'Los exponentes se suman cuando se multiplica. Sumando, 8 + 4 = 12: no es 32.');
    await d.say('student', 'Sumar no junta factores: junta cantidades. Lo de sumar los exponentes vale para multiplicar.');

    // 3b. dividir saca factores: los exponentes se restan
    await d.say('Mara', '¿Y si divido? Cinco dos, divididos por dos dos.');
    const cq = await d.choose([
      {id: '3', text: `${pw(2, 3)}: cada 2 de ${pw(2, 2)} se va con un 2 de ${pw(2, 5)}.`},
      {id: '7', text: `${pw(2, 7)}: los exponentes se suman.`},
      {id: '1', text: `${pw(1, 3)}: se dividen las bases, 2 ÷ 2 = 1.`},
    ], {prompt: `¿Cuánto es ${pw(2, 5)} ÷ ${pw(2, 2)}, como una sola potencia?`, evaluate: true});
    d.evidence('pow-quotient', {answer: cq});
    await studentWrites(d, g, 'jf-d', `${pw(2, 5)} ÷ ${pw(2, 2)} = (2·2·2·2·2) ÷ (2·2) = 2·2·2 = ${pw(2, 3)}`, A.x0 + 20, rowY[2] + 58, {size: 21});
    await d.think(cq === '3' ? 'Tres dos: 8.' : cq === '7' ? 'Sumar los exponentes es para multiplicar. Dividiendo, cada 2 de 2² se va con un 2 de 2⁵: quedan tres, 8. 2⁷ sería 128.' : 'La base no se divide: se divide la cuenta entera. 32 ÷ 4 = 8, que es 2³; 1³ es 1.');
    await d.say('student', 'Dividir saca factores: si el que se divide tiene más factores, los exponentes se restan, 5 − 2 = 3. Como en la tabla de antes, cada renglón hacia abajo sacaba un dos.');

    // 4. raíz cúbica: el lado de un cubo
    g.setCinematic(true);
    const old = w.objects.filter(o => /^jf-(a|b|c|d|u)/.test(o.id));
    await d.tween(0.6, q => { for (const o of old) o.fade = 1 - q; });
    for (const o of old) w.remove(o.id);
    g.setCinematic(false);
    await d.say('Cornisa', 'Tengo 64 bloques de tiza y quiero apilarlos en un cubo: igual de largo, de ancho y de alto.');
    const c4 = await d.choose([
      {id: '4', text: '4: 4 · 4 · 4 = 64.'},
      {id: '8', text: '8: 8 · 8 = 64.'},
      {id: '21', text: '21 y pico: 64 ÷ 3.'},
    ], {prompt: '¿De cuántos bloques de lado es un cubo de 64 bloques?', evaluate: true});
    d.evidence('cube-predict', {answer: c4});
    const bx = A.x0 + 320, by = A.y1 - 14;
    if (c4 === '8') {
      g.setCinematic(true);
      const flat = w.add(slab('jf-flat', bx - 10, by, 8, 13, 0, 5, -5));
      await d.draw(flat, 0.8, {sound: false});
      w.add(lid('jf-flatl', bx - 10, by - 13, 8, 13, 5, -5));
      g.setCinematic(false);
      d.describe('Con 8 de lado, los 64 bloques forman una sola capa de 8 por 8: una baldosa, de un bloque de alto.');
      await d.think('Con 8 de lado, una sola capa de 8 por 8 ya usa los 64: queda una baldosa de un bloque de alto, no un cubo.');
      await d.tween(0.5, q => { for (const id of ['jf-flat', 'jf-flatl']) w.get(id).fade = 1 - q; });
      w.remove('jf-flat');
      w.remove('jf-flatl');
    } else if (c4 === '21') {
      await d.think('Dividir por 3 reparte en tres partes; no arma un cubo. Con 21 de lado, una sola capa ya tendría 21 · 21 = 441 bloques.');
    }
    await d.say('Cornisa', 'Probemos con capas de 4 por 4.');
    const U = 24, DX = 10, DY = -10;
    let layers = 0;
    const cnt = w.add(new Label('jf-cnt', '', bx + 68, by - 150, {size: 18, align: 'center', z: 14, ch: YELLOW}));
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá «otra capa»: cada capa tiene 4 por 4 bloques. Mirá cuántos van.']);
      const refresh = () => g.ui.setSpots([wordSpot('jf-layer', 'otra capa', A.x0 + 120, A.y0 + 200, async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        try {
          const sl = w.add(slab(`jf-l${layers}`, bx, by, 4, U, layers, DX, DY));
          await d.draw(sl, 0.5, {sound: false});
          w.remove('jf-lid');
          layers++;
          w.add(lid('jf-lid', bx, by - layers * U, 4, U, DX, DY));
        } catch { return; }
        g.audio.tap(0.2, 0.9 + layers * 0.12);
        cnt.text = `${layers} ${layers === 1 ? 'capa' : 'capas'}: ${16 * layers} bloques`;
        d.describe(`${layers} ${layers === 1 ? 'capa' : 'capas'} de 4 por 4: ${16 * layers} bloques.`);
        d.evidence('cube-layer', {layers, blocks: 16 * layers});
        busy = false;
        if (16 * layers >= 64) { g.setHint(null); resolve(); } else refresh();
      }, {label: 'Apilar otra capa de 4 por 4 bloques'})]);
      refresh();
    }));
    d.describe('Cuatro capas de 4 por 4: un cubo de 4 de largo, 4 de ancho y 4 de alto, con los 64 bloques.');
    await d.say('student', 'Cornisa, el cubo tiene 4 de largo, 4 de ancho y 4 de alto: 4 · 4 · 4 = 64. El lado del cubo es la raíz cúbica de 64: 4.');
    await studentWrites(d, g, 'jf-r3', 'raíz cúbica de 64 = 4', A.x0 + 20, A.y0 + 56, {size: 24});
    await d.say('student', 'Con 8 de lado sale un cuadrado, plano: 8 · 8 = 64, y √64 = 8. La raíz cuadrada pregunta por el lado de un cuadrado; la cúbica, por el de un cubo.');
    await studentWrites(d, g, 'jf-r2', '√64 = 8', A.x0 + 20, A.y0 + 104, {size: 24});
    await d.say('Mara', '¿Y cómo puede ser que el 64 sirva para las dos cosas?');
    await d.say('student', `64 son seis dos: ${pw(2, 6)}. Juntados de a dos, tres veces: 4 · 4 · 4. Juntados de a tres, dos veces: 8 · 8.`);
    await studentWrites(d, g, 'jf-r6', `64 = ${pw(2, 6)} = ${pw(4, 3)} = ${pw(8, 2)}`, A.x0 + 20, A.y0 + 152, {size: 24, ch: YELLOW});
    d.evidence('cube', {side: exactRoot(64, 3), square: exactRoot(64, 2)});
    g.flags.c7roots = true;
  },
};

// ——————————————————————————————————————————————
// 7.4 Muy grande, muy chico
// ——————————————————————————————————————————————

export const grande = {
  id: 'c7.grande',
  title: 'Muy grande, muy chico',
  setup(g) {
    clean(g, /^(pw-|sc-|jf-)/);
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
      g.setHint(() => ['Cada lugar que se corre el 3 es un × 10. Tocá lo que haya que contar.', 'Cuando estén todos, tocá "listo".']);
      const refresh = () => {
        const spots = digits.map((c, i) => counted.has(i) ? null : rectSpot(`sc-z${i}`, i === 0 ? 'Contar el 3' : `Contar el cero ${i}`, {x: dx(i) - 6, y: dy - 34, w: 32, h: 40}, () => tap(i))).filter(Boolean);
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
        if (counted.has(0)) {
          g.note('Contaste el 3: 3 · 10⁷ serían treinta millones. El 3 es lo que se multiplica; los lugares que se corre son los ceros.');
          d.evidence('sci-count3', {counted: counted.size});
          counted.delete(0);
          w.remove('sc-m0');
          refresh();
          return;
        }
        if (counted.size < 6) { g.note(`Quedan ceros sin contar: van ${counted.size}.`); d.evidence('sci-short', {counted: counted.size}); return; }
        g.ui.setSpots([]);
        resolve();
      };
      refresh();
    }));
    g.setHint(null);
    await d.say('student', 'Punto, seis ceros, seis veces por diez. El 3 no se cuenta: es el que se multiplica.');
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
    await d.say('Peldaño', 'Voy a agrandar una huerta cuadrada, pero todavía no decidí de qué lado: le digo x. Le sumo dos filas abajo y tres columnas al costado. Quiero una cuenta que sirva para cualquier lado.');
    await d.think('La ficha x la dibujo de un largo cualquiera: x puede ser cualquier número.');
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
    // el jugador elige la ficha y, para las tiras, en qué borde va (parada al costado o acostada abajo)
    await d.interact(ctl => new Promise(resolve => {
      let busy = false, sel = null;
      g.setHint(() => ['Tocá una ficha de la bandeja. Las tiras, después, tocá dónde van en la huerta.', 'Las tiras son los bordes nuevos: al costado y abajo del x por x.']);
      const freeFor = kind => slots.map((sl, i) => ({sl, i})).filter(({sl, i}) => !used.has(i) && sl.kind === kind);
      const rectOf = sl => (sl.kind === 'x2' ? {x: sl.x, y: sl.y, w: T.X, h: T.X} : sl.kind === 'u' ? {x: sl.x, y: sl.y, w: T.U, h: T.U} : sl.vertical ? {x: sl.x, y: sl.y, w: T.U, h: T.X} : {x: sl.x, y: sl.y, w: T.X, h: T.U});
      const ghosts = () => {
        w.removeWhere(o => /^ar-g\d/.test(o.id));
        if (sel) freeFor(sel.kind).forEach(({sl, i}) => { const r = rectOf(sl); outline(w, `ar-g${i}`, r.x + 3, r.y + 3, r.w - 6, r.h - 6); });
      };
      const refresh = () => {
        ghosts();
        const spots = pieces.filter(t => !t.placed).map(t => rectSpot(`ar-pick-${t.kind}-${t.id}`, `Ficha: ${tileName(t.kind)}`, () => ({x: t.x, y: t.y, w: t.w2, h: t.h2}), () => pick(t), {selected: sel === t}));
        if (sel) freeFor(sel.kind).forEach(({sl, i}) => spots.push(rectSpot(`ar-slot${i}`, `Poner la tira ${sl.vertical ? 'parada, al costado del x por x' : 'acostada, abajo del x por x'}`, rectOf(sl), () => put(i))));
        g.ui.setSpots(spots);
      };
      const put = async i => {
        if (busy || !ctl.alive() || !sel) return;
        busy = true;
        g.ui.setSpots([]);
        const t = sel;
        sel = null;
        used.add(i);
        t.placed = true;
        w.removeWhere(o => /^ar-g\d/.test(o.id));
        try { await moveTile(d, t, slots[i], 0.45); } catch { return; }
        g.audio.tap(0.15, 1.3 + used.size * 0.03);
        d.evidence('expand-place', {kind: t.kind, vertical: !!slots[i].vertical});
        busy = false;
        if (used.size === slots.length) { g.ui.setSpots([]); resolve(); } else refresh();
      };
      const pick = t => {
        if (busy || !ctl.alive()) return;
        const free = freeFor(t.kind);
        if (!free.length) {
          g.note(t.kind === 'x2' ? 'El x por x ya está puesto.' : t.kind === 'x' ? 'Los bordes ya tienen todas sus tiras: esa sobra.' : 'La esquina ya está llena: ese cuadradito sobra.');
          d.evidence('expand-extra', {kind: t.kind});
          return;
        }
        sel = t;
        // el x por x y los cuadraditos no tienen dónde elegir: van solos al primer lugar libre
        if (t.kind !== 'x') { put(free[0].i); return; }
        refresh();
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
    await d.say('student', 'Peldaño, es partir el rectángulo, como cuando repartimos en las Terrazas, pero de los dos lados. Dos por tres, los cuadraditos; dos más tres, las tiras.');
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
      if (missX) parts.push(missX === 1 ? 'falta una tira' : `faltan ${missX} tiras`);
      if (extraX) parts.push(`sobra${extraX === 1 ? ' una tira' : `n ${extraX} tiras`}`);
      if (missU) parts.push(missU === 1 ? 'falta un cuadradito' : `faltan ${missU} cuadraditos`);
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
    await d.say('student', 'Balcón, los dos números tienen que sumar cinco, por las tiras, y multiplicados dar seis, por los cuadraditos. Dos y tres.');
    await d.say('Balcón', '¿Y si me hubieran dado cinco cuadraditos?');
    const five = factor(5, 5);
    if (five) console.error('[al revés] x² + 5x + 5 no debería armarse');
    await d.think('Dos números que sumen cinco y multiplicados den cinco: cero y cinco dan cero, uno y cuatro dan cuatro, dos y tres dan seis. Con enteros, ninguno: con estas fichas, ese rectángulo no se arma. Con lados que no son enteros se podría, pero esas fichas no existen.');
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
    await d.say('student', 'Rampa, un cuadrado de nueve tiene lado 3. Entonces x + 1 = 3, y x mide 2.');
    // con x = 2 la huerta se dibuja a escala y se cuentan los cuadraditos
    g.setCinematic(true);
    await d.all(...['cq-x2', 'cq-xr', 'cq-xb', 'cq-u'].map(id => w.get(id)).filter(Boolean).map(o => d.fadeTo(o, 0, 0.5)));
    w.removeWhere(o => /^cq-(x2|xr|xb|u)$/.test(o.id));
    const k = T.U + 6;
    const cells = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const ch = i < 2 && j < 2 ? WHITE : i === 2 && j === 2 ? YELLOW : BLUE;
      cells.push(w.add(new Shape(`cq-c${i}${j}`, plate(`cq-c${i}${j}`, k - 4, k - 4, ch, false), ox + j * k + 2, oy + i * k + 2, {z: 14, fade: 0})));
    }
    await d.all(...cells.map(c => d.fadeTo(c, 1, 0.5)));
    g.setCinematic(false);
    d.describe('Con x = 2, la huerta a escala: un cuadrado de 2 por 2 en blanco, dos tiras de 2 en azul y la esquina amarilla. Tres por tres cuadraditos.');
    await d.think('Con x = 2 se pueden contar: cuatro del cuadrado y dos de cada tira, ocho de tierra. Con la esquina, nueve: tres por tres.');
    await studentWrites(d, g, 'cq-eq3', 'x + 1 = 3   o   x + 1 = −3', ex, A.y0 + 180, {size: 26});
    await d.think('Las dos cumplen (x + 1)² = 9, porque (−3) · (−3) también es 9. Pruebo x = −4 en la cuenta de Rampa: 16 − 8 = 8. Cumple. La huerta no: un lado no mide −4. La cuenta tiene dos soluciones; la huerta, una.');
    await studentWrites(d, g, 'cq-eq4', `x = ${r.roots[0]}   o   x = −${-r.roots[1]}`, ex, A.y0 + 224, {size: 26});
    await d.say('student', 'La raíz da el lado, el positivo. La raíz de (x + 1)² no siempre es x + 1: es lo lejos que está x + 1 del cero. Si x + 1 es positivo, es x + 1; si es negativo, no. Por eso x + 1 puede ser 3 o −3, los dos a 3 del cero.');
    // con una o ninguna solución
    await d.say('Mara', 'Al completar, siempre queda un cuadrado igual a un número. ¿Y si el número fuera otro?');
    const one = completeSquare(2, -1), none = completeSquare(2, -10);
    const z = await d.choose([
      {id: 'one', text: 'Una sola: x + 1 = 0, x = −1.'},
      {id: 'two', text: 'Dos, como con el 9: una positiva y una negativa.'},
      {id: 'none', text: 'Ninguna: el 0 no es el área de ningún cuadrado.'},
    ], {prompt: 'Si quedara (x + 1)² = 0, ¿cuántas soluciones tendría?', evaluate: true});
    d.evidence('complete-zero', {answer: z, roots: one.roots});
    await d.think(z === 'one' ? 'Una: sólo el 0, multiplicado por sí mismo, da 0.' : z === 'two' ? 'Con el 9 había 3 y −3. Con el 0, más cero y menos cero son lo mismo: x + 1 = 0, una sola, x = −1.' : 'Sin pensar en la huerta, con la cuenta: con x = −1, (−1 + 1)² = 0 · 0 = 0. Cumple: una sola.');
    const n = await d.choose([
      {id: 'none', text: 'Ninguna en la recta: no hay cuadrado de área negativa.'},
      {id: 'two', text: 'Dos: x = 2 y x = −4, como con el 9.'},
      {id: 'one', text: 'Una: x = −4, la negativa.'},
    ], {prompt: 'Y si quedara (x + 1)² = −9, ¿cuántas soluciones tendría?', evaluate: true});
    d.evidence('complete-negative', {answer: n, roots: none.roots});
    await d.think(n === 'none' ? 'Ninguna en la recta: con la cuenta también, un número de la recta multiplicado por sí mismo da 0 o positivo.' : `Con x = ${n === 'two' ? '2, (2 + 1)² = 9; con x = −4, (−4 + 1)² = 9' : '−4, (−4 + 1)² = 9'}: da 9, no −9. Un número de la recta multiplicado por sí mismo da 0 o positivo: ninguna.`);
    await d.say('student', 'Al completar el cuadrado queda (x + algo)² = un número. Si es positivo, dos soluciones; si es cero, una; si es negativo, ninguna en la recta.');
    await studentWrites(d, g, 'cq-eq5', '(x + 1)² = 9: dos   = 0: una   = −9: ninguna en la recta', A.x0 + 16, A.y1 - 4, {size: 16, ch: YELLOW});
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
    await d.shot(SHOTS.tiles, 0.8);
    let k = 0, v = 1;
    const val = w.add(new Label('lg-v', '1', A.x0 + 40, A.y0 + 70, {size: 48, z: 12, weight: 700}));
    const cnt = w.add(new Label('lg-c', '0 duplicaciones', A.x0 + 40, A.y0 + 116, {size: 26, z: 12}));
    const res = await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá "duplicar" hasta pasar mil, contando cuántas veces.', 'Cuando haya pasado mil, tocá "ya pasó".']);
      const refresh = () => {
        const spots = [];
        if (k < 13) spots.push(wordSpot('lg-dup', 'duplicar', A.x1 - 110, A.y0 + 50, () => dup()));
        if (k >= 1) spots.push(wordSpot('lg-ok', 'ya pasó', A.x1 - 110, A.y0 + 150, () => ok()));
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
    if (res.k > t.k) await d.think(`Con ${t.k} ya había pasado: ${t.above}. ${res.k - t.k === 1 ? 'La otra sobraba.' : `Las otras ${res.k - t.k} sobraban.`}`);
    await d.say('student', `Punto, ${t.k} veces. ${pw(2, 9)} es ${t.below}, todavía no; ${pw(2, 10)} es ${t.above}, ya pasó.`);
    await studentWrites(d, g, 'lg-eq', `${pw(2, 9)} = ${t.below} < 1000 < ${t.above} = ${pw(2, 10)}`, A.x0 + 24, A.y0 + 176, {size: 26});
    await d.think(guess === '10' ? 'Diez: duplicar llega lejos enseguida.' : `Diez, no ${guess === '100' ? 'cien' : 'quinientos'}: duplicar llega lejos enseguida.`);
    await d.say('Mara', 'Para pasar mil, diez. ¿Y para llegar justo a mil?');
    await d.say('student', 'Con duplicaciones enteras no se llega justo: nueve no alcanzan y diez se pasan. Pero puede haber pasos más chicos: media duplicación.');
    const half = await d.choose([
      {id: 'sqrt', text: '× √2, unos 1,41: dos medias seguidas tienen que hacer × 2.'},
      {id: '1.5', text: '× 1,5: la mitad del camino entre × 1 y × 2.'},
      {id: '1', text: '× 1: medio paso no alcanza para cambiar nada.'},
    ], {prompt: 'Media duplicación, ¿por cuánto multiplica?', evaluate: true});
    d.evidence('half-doubling', {answer: half});
    await d.think(half === 'sqrt' ? 'Dos veces × √2: √2 · √2 = 2. Una duplicación entera.' : half === '1.5' ? '× 1,5 dos veces es × 2,25: se pasa de duplicar. Tiene que ser un número que, dos veces, dé 2: √2, unos 1,41.' : '× 1 dos veces sigue siendo × 1: no duplica. Tiene que ser un número que, dos veces, dé 2: √2, unos 1,41.');
    await d.say('student', 'Si queremos que juntar exponentes siga valiendo también con medios, un medio y un medio tienen que hacer uno: media duplicación tiene que ser √2, el positivo. Por eso se elige escribir √2 como 2 elevado a un medio, igual que se eligió 2⁰ = 1 para que la tabla siguiera.');
    await studentWrites(d, g, 'lg-half', '2 elevado a 1/2 = √2', A.x1 - 222, A.y0 + 120, {size: 20, ch: YELLOW});
    await d.say('student', 'Nueve duplicaciones y media: 512 · 1,414, unos 724. Todavía no.');
    await d.think('El número justo está entre 9,5 y 10. La potencia pregunta: dos, tantas veces, ¿cuánto da? Esto es al revés: ¿cuántas veces, para que dé justo mil? Esa pregunta tiene nombre: logaritmo.');
    await studentWrites(d, g, 'lg-log', `log₂ 1000 ≈ ${t.log.toFixed(2).replace('.', ',')}`, A.x0 + 24, A.y0 + 222, {size: 26});
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
    const rowY = i => A.y0 + 84 + i * 28;
    w.add(new Label('ns-h', 'x      x − 2      1 ÷ (x − 2)', A.x0 + 24, rowY(0) - 6, {size: 20, z: 12, ch: BLUE}));
    await d.shot(SHOTS.tiles, 0.8);
    const tried = [];
    const VALS = [5, 4, 3, 2, 1, 0];
    const share = x => { const q = x - 2; return q === 0 ? '?' : q === 1 ? '1' : q === -1 ? '−1' : q > 0 ? `1/${q}` : `−1/${-q}`; };
    const sg = n => (n < 0 ? `−${-n}` : String(n));
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá un valor de x para probar la cuenta. Probá varios.']);
      const refresh = () => g.ui.setSpots(VALS.filter(x => !tried.includes(x)).map(x => wordSpot(`ns-x${x}`, `x = ${x}`, A.x1 - 150 + (VALS.indexOf(x) % 2) * 100, A.y0 + 34 + Math.floor(VALS.indexOf(x) / 2) * 72, () => put(x), {label: `Probar con x = ${x}`})));
      const put = async x => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        tried.push(x);
        const i = tried.length;
        const l = w.add(new Label(`ns-r${x}`, `${x}          ${sg(x - 2)}             ${share(x)}`, A.x0 + 24, rowY(i), {size: 22, z: 12, reveal: 0}));
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
    await studentWrites(d, g, 'ns-no', 'x ≠ 2', A.x1 - 150, A.y1 - 14, {size: 30});
    await d.say('student', `Rampa, la cuenta sirve para cualquier x menos 2. Ahí no da cero ni un número raro: no está definida, porque ${u.reason}.`);
    await d.say('Rampa', 'La cuenta sirve para cualquier x menos 2. Mi reparto, en cambio, sólo si vienen más de dos: con 1 o con 0 da negativo, y nadie cobra menos que nada. Lo anoto arriba.');
    d.evidence('rational', u);
    g.flags.c7rational = true;
    // simplificar sin perder dónde no se puede
    g.setCinematic(true);
    const olds = w.objects.filter(o => /^ns-/.test(o.id));
    await d.tween(0.5, q => { for (const o of olds) o.fade = 1 - q; });
    for (const o of olds) w.remove(o.id);
    g.setCinematic(false);
    await d.say('Mara', 'Yo tengo otra cuenta: (x · x − 4) ÷ (x − 2). Dicen que es lo mismo que x + 2, que es más corta.');
    const big = w.add(new Label('ns-q', '(x · x − 4) ÷ (x − 2)', A.x0 + 20, A.y0 + 40, {size: 26, z: 12, reveal: 0}));
    await d.draw(big, 0.6, {key: 'reveal'});
    w.add(new Label('ns-q2', '¿= x + 2?', A.x0 + 300, A.y0 + 40, {size: 26, z: 12, ch: YELLOW}));
    d.describe('En la pizarra: (x · x − 4) ÷ (x − 2), y al lado, con signo de pregunta, igual a x + 2.');
    const sim = await d.choose([
      {id: 'almost', text: 'Casi: dan lo mismo, menos en x = 2, donde la primera no está definida.'},
      {id: 'same', text: 'Sí: son la misma cuenta, para cualquier x.'},
      {id: 'diff', text: 'Tampoco con x = −2: ahí arriba da cero.'},
    ], {prompt: '¿Son la misma cuenta?', evaluate: true});
    d.evidence('rational-simplify', {answer: sim});
    const ROWS = [[3, '5 ÷ 1 = 5', '5'], [0, '−4 ÷ (−2) = 2', '2'], [2, '0 ÷ 0: no está definida', '4']];
    w.add(new Label('ns-th0', 'x', A.x0 + 20, A.y0 + 92, {size: 18, z: 12, ch: BLUE}));
    w.add(new Label('ns-th1', '(x · x − 4) ÷ (x − 2)', A.x0 + 70, A.y0 + 92, {size: 17, z: 12, ch: BLUE}));
    w.add(new Label('ns-th2', 'x + 2', A.x0 + 300, A.y0 + 92, {size: 18, z: 12, ch: YELLOW}));
    for (const [i, [x, a, b]] of ROWS.entries()) {
      const y = A.y0 + 126 + i * 32;
      w.add(new Label(`ns-tx${i}`, String(x), A.x0 + 20, y, {size: 19, z: 12}));
      const la = w.add(new Label(`ns-ta${i}`, a, A.x0 + 70, y, {size: 17, z: 12, ch: x === 2 ? YELLOW : undefined, reveal: 0}));
      await d.draw(la, 0.4, {key: 'reveal', sound: false});
      w.add(new Label(`ns-tb${i}`, b, A.x0 + 300, y, {size: 19, z: 12}));
      d.describe(`Con x = ${x}: la primera da ${a.replace(':', ',')}; x + 2 da ${b}.`);
    }
    await d.think(sim === 'almost' ? 'Con 3 y con 0 dan igual. Con 2, la primera es 0 ÷ 0: no está definida, y x + 2 da 4.' : sim === 'same' ? 'Con 3 y con 0 dan igual, pero con 2 la primera es 0 ÷ 0: no está definida, y x + 2 da 4. En x = 2 no son la misma.' : 'Con x = −2 arriba da 0 y abajo −4: 0 ÷ (−4) = 0, lo mismo que x + 2. Un cero arriba no molesta; el que molesta es el de abajo, con x = 2.');
    await d.say('student', 'Mara, con x = 2 queda 0 ÷ 0: cualquier número por 0 da 0, así que no hay un solo resultado. Por eso no está definida, aunque x + 2 dé 4.');
    await studentWrites(d, g, 'ns-fac', '(x − 2) · (x + 2) = x · x + 2 · x − 2 · x − 4 = x · x − 4', A.x0 + 20, A.y1 - 40, {size: 17});
    await d.say('student', 'Y x · x − 4 es (x − 2) · (x + 2). Si x no es 2, el (x − 2) que multiplica se va con el (x − 2) que divide, y queda x + 2. Simplificar vale, pero hay que anotar dónde no: x ≠ 2.');
    await studentWrites(d, g, 'ns-simp', '(x · x − 4) ÷ (x − 2) = x + 2,  con x ≠ 2', A.x0 + 20, A.y1 - 8, {size: 20});
    if (!replay) writeJournal7(g);
    await d.say('Peldaño', 'Con la raíz de dos pinté la puerta. Pero ayer partí el lado del cuadro en doce y la diagonal no cayó en ninguna rayita. ¿En cuántas hay que partirlo?');
    g.audio.punto('question');
  },
};

function writeJournal7(g) {
  // sólo lo de este capítulo: hay tipos de evidencia con el mismo nombre en otros (count, cut, scale…)
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1) && (!e.seg || e.seg.startsWith('c7.')));
  const first = k => ev.find(e => e.kind === k);
  const seen = [];
  const sp = first('side-predict');
  if (sp) seen.push(sp.answer === 'less' ? 'Anticipaste que una huerta cuadrada de dos cuadros tiene lado menor que 2; armándola con triángulos, el lado era la diagonal de un cuadro: √2.' : 'Pensaste que el lado de una huerta cuadrada de dos cuadros era 2 o más; armándola, el lado era la diagonal de un cuadro: √2 ≈ 1,414.');
  const rp = first('race-predict');
  if (rp) seen.push(rp.answer === 'mul' ? 'Apostaste por duplicar: al principio perdía, y desde el día 6 pasó adelante.' : `${rp.answer === 'add' ? 'Apostaste a sumar diez' : 'Pensaste que llegaban juntos'}; sumar ganó los primeros días y duplicar pasó adelante el día 6.`);
  const rg = first('race-general');
  if (rg) seen.push(rg.answer === 'ok' ? 'Para cualquier día n elegiste 1 + 10 · n.' : rg.answer === '10n' ? 'Para el día n dijiste 10 · n; faltaba el primero: 1 + 10 · n.' : 'Para el día n dijiste 11 · n; el 11 ya incluía el primero: 1 + 10 · n.');
  const pz = first('pow-zero');
  if (pz) seen.push(pz.answer === '1' ? 'Siguiendo la tabla hacia abajo, dijiste 2⁰ = 1.' : 'Para 2⁰ dijiste otro valor; la tabla, dividiendo por dos, daba 1.');
  const pp = first('pow-product');
  if (pp) seen.push(pp.answer === '5' ? 'Para 2³ · 2² juntaste los factores: 2⁵.' : pp.answer === '6' ? 'Para 2³ · 2² multiplicaste los exponentes; desplegados, eran cinco dos: 2⁵.' : 'Para 2³ · 2² sumaste arriba y multiplicaste los dos de abajo: 4⁵; el 2 no cambia: cinco dos, 2⁵.');
  const ppw = first('pow-power');
  if (ppw) seen.push(ppw.answer === '6' ? 'Para (2³)² viste seis dos: 2⁶.' : ppw.answer === '5' ? 'Para (2³)² sumaste los exponentes; es 2³ repetido dos veces: seis dos, 2⁶.' : 'Para (2³)² elevaste el 3 al cuadrado; es 2³ · 2³: seis dos, 2⁶.');
  const pq = first('pow-quotient');
  if (pq) seen.push(pq.answer === '3' ? 'Para 2⁵ ÷ 2² sacaste dos factores: 2³.' : pq.answer === '7' ? 'Para 2⁵ ÷ 2² sumaste los exponentes; dividiendo se restan: 2³.' : 'Para 2⁵ ÷ 2² dividiste los dos de abajo; se divide la cuenta: 32 ÷ 4 = 8 = 2³.');
  const ps = first('pow-sum');
  if (ps) seen.push(ps.answer === 'no' ? 'Viste que 2³ + 2² es 12, no 2⁵.' : 'Pensaste que 2³ + 2² era 2⁵; sumando da 12: los exponentes se juntan al multiplicar.');
  const cb = first('cube-predict');
  if (cb) seen.push(cb.answer === '4' ? 'Anticipaste que el cubo de 64 bloques tenía lado 4.' : cb.answer === '8' ? 'Para el cubo de 64 pensaste en 8; 8 · 8 = 64 es una capa plana. El cubo tiene lado 4.' : 'Para el cubo de 64 dividiste por 3; apilando capas de 4 por 4, el lado era 4.');
  const sc = first('sci-compare');
  if (sc) seen.push(sc.answer === 'a' ? 'Elegiste la noche de 3 · 10⁶: es más que 4 · 10⁵.' : sc.answer === 'b' ? 'Miraste primero el 3 y el 4; pesaba más el exponente: 3 · 10⁶ es más que 4 · 10⁵.' : 'Te parecieron parecidas; 3 · 10⁶ es más de siete veces 4 · 10⁵.');
  const ep = first('expand-predict');
  if (ep) seen.push(ep.answer === 'full' ? 'Anticipaste las cinco tiras de (x + 2)(x + 3).' : 'Armando (x + 2)(x + 3) con fichas, hicieron falta cinco tiras y seis cuadraditos.');
  const ft = ev.filter(e => e.kind === 'factor-try').map(e => `x + ${e.p} por x + ${e.q}`);
  if (ft.length) seen.push(`Para x² + 5x + 6 probaste ${ft.join(', después ')}.`);
  const co = first('complete-other');
  if (co) seen.push(co.answer === '9' ? 'Al completar el cuadrado sumaste 1 de los dos lados del igual.' : 'Al completar el cuadrado, el cuadradito también había que sumarlo del otro lado: 8 + 1.');
  const cz = first('complete-zero');
  if (cz) seen.push(cz.answer === 'one' ? 'Viste que (x + 1)² = 0 tiene una sola solución.' : cz.answer === 'two' ? 'Para (x + 1)² = 0 esperabas dos, como con el 9; más cero y menos cero son lo mismo: una.' : 'Para (x + 1)² = 0 pensaste que no había; con x = −1, (−1 + 1)² = 0: una.');
  const cn = first('complete-negative');
  if (cn) seen.push(cn.answer === 'none' ? 'Viste que (x + 1)² = −9 no tiene solución en la recta.' : cn.answer === 'two' ? 'Para (x + 1)² = −9 elegiste x = 2 y x = −4; con esos da 9, no −9: en la recta, ninguna.' : 'Para (x + 1)² = −9 elegiste x = −4; con ese da 9, no −9: en la recta, ninguna.');
  const hd = first('half-doubling');
  if (hd) seen.push(hd.answer === 'sqrt' ? 'Para media duplicación elegiste × √2: dos veces da × 2.' : hd.answer === '1.5' ? 'Para media duplicación elegiste × 1,5; dos veces da × 2,25: es × √2.' : 'Para media duplicación elegiste × 1; dos veces no duplica: es × √2.');
  const lp = first('log-predict');
  if (lp) seen.push(lp.answer === '10' ? 'Anticipaste unos diez días para pasar mil duplicando.' : 'Esperabas muchos más días; duplicando, alcanzaron diez.');
  const rs = first('rational-simplify');
  if (rs) seen.push(rs.answer === 'almost' ? 'Viste que (x · x − 4) ÷ (x − 2) es x + 2 salvo en x = 2.' : rs.answer === 'same' ? 'Pensaste que (x · x − 4) ÷ (x − 2) y x + 2 eran iguales para todo x; en x = 2 la primera no está definida.' : 'Pensaste que en x = −2 tampoco se podía, por el cero de arriba; un cero arriba no molesta: sólo el de abajo, en x = 2.');
  const rq = first('rational-predict');
  if (rq) seen.push(rq.answer === '2' ? 'Viste que 1 ÷ (x − 2) no se puede con x = 2.' : rq.answer === '0' ? 'Pensaste en x = 0; con 0 abajo queda −2, y se puede. La que no se puede es x = 2, donde abajo queda cero.' : 'Pensaste que se podía con cualquier x; con x = 2 abajo queda cero, y por cero no se divide.');
  const entry = {
    id: 'c7',
    title: 'Crecer',
    abbr: 'Multiplicar repetido crece distinto que sumar repetido, y cada crecimiento tiene su pregunta al revés.',
    body: [
      'La raíz es el lado de un cuadrado de área dada: √9 = 3. √2 es el largo de la diagonal de un cuadrado de lado 1 (≈ 1,414). El signo √ indica el número positivo, el lado; x · x = 9 tiene además −3. La raíz cúbica es el lado de un cubo: un cubo de 64 bloques tiene lado 4, porque 4 · 4 · 4 = 64; con 8 · 8 = 64 sale un cuadrado plano, √64 = 8.',
      'Sumar lo mismo crece parejo (sucesión aritmética: el día n, 1 + 10 · n); duplicar empieza lento y después saca cada vez más ventaja (sucesión geométrica: cada día, el doble del anterior). En 2ⁿ, el exponente n dice cuántas veces se multiplica por 2, empezando en 1; para abajo se divide: 2⁰ = 1, 2⁻¹ = 1/2. Con otro número abajo es igual: 4³ = 1 · 4 · 4 · 4. Cuando los exponentes cuentan factores, multiplicar potencias del mismo número los junta y los exponentes se suman: 2³ · 2² = 2⁵. Dividirlas saca factores, y los exponentes se restan: 2⁵ ÷ 2² = 2³. Elevar una potencia la repite, y los exponentes se multiplican: (2³)² = 2⁶. Sumando no: 2³ + 2² = 12. Los números muy grandes o muy chicos se escriben con un número de 1 a menos de 10 por una potencia de 10: 3 · 10⁶, 1 · 10⁻³.',
      'Un producto de sumas es un rectángulo partido: (x + 2)(x + 3) = x² + 5x + 6. Factorizar es armar el rectángulo con las fichas; completar el cuadrado es agregar la esquina que falta, de los dos lados del igual: (x + 1)² = 9 da x = 2 o x = −4. La raíz de (x + 1)² es lo lejos que está x + 1 del cero; por eso hay dos. Si x + 1 es positivo, la raíz de (x + 1)² es x + 1; si es negativo, no. Si el cuadrado da 0, hay una sola solución; si da un negativo, ninguna en la recta.',
      'Para pasar mil duplicando hacen falta diez duplicaciones (2⁹ = 512, 2¹⁰ = 1024). Media duplicación es multiplicar por √2 (dos veces da × 2); para que juntar exponentes siga valiendo, se elige escribirla 2 elevado a un medio. El número justo de veces para llegar a mil no es entero: es log₂ 1000 ≈ 9,97, la pregunta al revés de la potencia. Y una cuenta con x abajo de una división no vale donde ese abajo da cero: 1 ÷ (x − 2) pide x ≠ 2. Al simplificar, la restricción se anota: (x · x − 4) ÷ (x − 2) = x + 2, con x ≠ 2.',
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
