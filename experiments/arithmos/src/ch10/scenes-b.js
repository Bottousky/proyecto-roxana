// Capítulo 10 — Vueltas y flechas (10.5 a 10.8): flechas, un cuarto de vuelta, dos pistas y lo que pasa a veces.

import {Drawing, Label, Shape} from '../engine/world.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {add, cmul, quarter, solve2} from '../logic/turns.js';
import {SHOTS, area, boardCast, clean, poly, dot, arrow, S, seedOf, WHITE, YELLOW, BLUE} from '../ch9/common.js';
import {studentWrites} from '../ch7/scenes-a.js';

const sg = n => (n < 0 ? `−${-n}` : String(n));
const pair = ([a, b]) => `(${sg(a)}, ${sg(b)})`;

/** Un mapa de dos rectas en la pizarra. Devuelve px, py. */
function grid(w, id, {X0, X1, Y0, Y1, U, gx, gy}) {
  const px = x => gx + (x - X0) * U, py = y => gy + (Y1 - y) * U;
  const lines = [];
  for (let x = X0; x <= X1; x++) lines.push(S([[px(x), py(Y1) - 4], [px(x), py(Y0) + 4]], seedOf(`${id}x`) + x + 50, {w: x === 0 ? 2.6 : 1.3, p: x === 0 ? 0.95 : 0.45, lift: false}));
  for (let y = Y0; y <= Y1; y++) lines.push(S([[px(X0) - 4, py(y)], [px(X1) + 4, py(y)]], seedOf(`${id}y`) + y + 50, {w: y === 0 ? 2.6 : 1.3, p: y === 0 ? 0.95 : 0.45, lift: false}));
  w.add(new Drawing(id, lines, {z: 11}));
  for (let x = X0; x <= X1; x++) if (x !== 0) w.add(new Label(`${id}lx${x}`, sg(x), px(x), py(Math.max(Y0, 0)) + 20, {size: 16, align: 'center', z: 12, ch: BLUE}));
  for (let y = Y0; y <= Y1; y++) if (y !== 0) w.add(new Label(`${id}ly${y}`, sg(y), px(Math.max(X0, 0)) - 8, py(y) + 6, {size: 16, align: 'right', z: 12, ch: BLUE}));
  return {px, py};
}

// ——————————————————————————————————————————————
// 10.5 Flechas
// ——————————————————————————————————————————————

export const flechas = {
  id: 'c10.flechas',
  title: 'Flechas',
  setup(g) {
    clean(g, /^c10-/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const s = w.get('student');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Rampa', 'Punto, traeme la soga. Estás en el pozo, en el cero del mapa; mi casa está en (4, −2). Mara sólo te deja moverte con estas flechas.');
    const {px, py} = grid(w, 'c10-g', {X0: -1, X1: 6, Y0: -4, Y1: 4, U: 28, gx: A.x0 + 30, gy: A.y0 + 14});
    w.add(new Shape('c10-home', poly('c10-home', [[-10, 0], [10, 0], [10, -14], [0, -24], [-10, -14]], {ch: YELLOW, w: 2.4}), px(4), py(-2), {z: 14}));
    w.add(new Label('c10-homel', 'Rampa', px(4) + 14, py(-2) + 16, {size: 15, z: 14, ch: YELLOW}));
    const CARDS = [[3, 2], [1, -4], [2, 1]];
    d.describe('Un mapa con el pozo en el cero y la casa de Rampa en (4, −2). Tres flechas disponibles: (3, 2), (1, −4) y (2, 1).');
    await d.shot(SHOTS.tiles, 0.8);
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, px(0), py(0) - 12, 0.4);
    g.setCinematic(false);
    let pos = [0, 0];
    let used = [];
    let k = 0;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Elegí dos flechas, una después de la otra: cada una sale de donde terminó la anterior. Hay que llegar a (4, −2).']);
      const refresh = () => g.ui.setSpots(CARDS.filter(c => !used.includes(c)).map((c, i) => wordSpot(`c10-v${CARDS.indexOf(c)}`, pair(c), A.x1 - 70, A.y0 + 40 + CARDS.indexOf(c) * 70, () => go(c), {label: `Moverse con la flecha ${pair(c)}`})));
      const go = async c => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        used.push(c);
        const to = add(pos, c);
        k++;
        const ar = w.add(arrow(`c10-a${k}`, px(pos[0]), py(pos[1]), px(to[0]), py(to[1]), YELLOW));
        try {
          await d.draw(ar, 0.4, {sound: false});
          await zip(d, p, px(to[0]), py(to[1]) - 12, 0.4);
        } catch { return; }
        pos = to;
        d.evidence('vector-step', {c, pos});
        d.describe(`Punto sigue la flecha ${pair(c)} y queda en ${pair(pos)}.`);
        if (used.length === 2) {
          if (pos[0] === 4 && pos[1] === -2) { busy = false; g.setHint(null); resolve(); return; }
          g.note(`Quedaste en ${pair(pos)}, no en (4, −2). Probá con otro par de flechas.`);
          g.audio.punto('no');
          try {
            await d.wait(0.6);
            for (let j = 1; j <= k; j++) w.remove(`c10-a${j}`);
            await zip(d, p, px(0), py(0) - 12, 0.4);
          } catch { return; }
          pos = [0, 0];
          used = [];
        }
        busy = false;
        refresh();
      };
      refresh();
    }));
    g.audio.punto('happy');
    const c = await d.choose([
      {id: 'same', text: 'Al mismo lugar.'},
      {id: 'other', text: 'A otro lugar: cambia el camino.'},
    ], {prompt: 'Si Punto hace las mismas dos flechas en el otro orden, ¿adónde llega?', evaluate: true});
    d.evidence('vector-order', {answer: c});
    const [f1, f2] = used;
    const mid = f2;
    g.setCinematic(true);
    const b1 = w.add(arrow('c10-b1', px(0), py(0), px(mid[0]), py(mid[1]), BLUE));
    await d.draw(b1, 0.4, {sound: false});
    const end = add(f2, f1);
    const b2 = w.add(arrow('c10-b2', px(mid[0]), py(mid[1]), px(end[0]), py(end[1]), BLUE));
    await d.draw(b2, 0.4, {sound: false});
    g.setCinematic(false);
    d.describe('En azul, las mismas flechas en el otro orden: el camino es otro, pero termina en la casa de Rampa.');
    await d.say('student', c === 'same' ? 'Punto: el camino cambia, el destino no. Una flecha dice cuánto y hacia dónde, no desde dónde.' : 'Punto: el camino cambia, pero el destino no. Una flecha dice cuánto y hacia dónde, no desde dónde.');
    await studentWrites(d, g, 'c10-vsum', `${pair(f1)} + ${pair(f2)} = (4, −2)`, A.x0 + 20, A.y1 - 6, {size: 20});
    follow(p, s);
    d.evidence('vector', {used: [f1, f2]});
    g.flags.c10vector = true;
  },
};

// ——————————————————————————————————————————————
// 10.6 Un cuarto de vuelta (momento)
// ——————————————————————————————————————————————

export const cuarto = {
  id: 'c10.cuarto',
  title: 'Un cuarto de vuelta',
  moment: 'Un cuarto de vuelta',
  setup(g) {
    clean(g, /^c10-/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'En la Terraza de las Vueltas, cuando te dan media vuelta, se escribe × (−1). Así lo anotamos desde la piedra. ¿Y un cuarto de vuelta, cómo se escribe?');
    const U = 30;
    const {px, py} = grid(w, 'c10-g', {X0: -4, X1: 4, Y0: -4, Y1: 4, U, gx: A.x0 + 20, gy: A.y0 + 8});
    let v = [3, 1];
    const draw = (id, vv, ch) => w.add(arrow(id, px(0), py(0), px(vv[0]), py(vv[1]), ch));
    const a0 = draw('c10-v0', v, YELLOW);
    await d.draw(a0, 0.4, {sound: false});
    w.add(new Label('c10-vl0', pair(v), px(v[0]) + 10, py(v[1]) - 6, {size: 18, z: 14, ch: YELLOW}));
    d.describe('Una flecha amarilla del cero a (3, 1).');
    await d.shot(SHOTS.tiles, 0.8);
    let turns = 0;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá «girar un cuarto»: la flecha gira un cuarto de vuelta, contra el reloj. Mirá qué pasa con sus números.']);
      const refresh = () => g.ui.setSpots([wordSpot('c10-q', 'girar un cuarto', A.x1 - 80, A.y1 - 30, async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        const from = v, to = quarter(v);
        turns++;
        try {
          await d.tween(0.6, q => {
            const a = q * Math.PI / 2;
            const x = from[0] * Math.cos(a) - from[1] * Math.sin(a), y = from[0] * Math.sin(a) + from[1] * Math.cos(a);
            w.remove('c10-rot');
            w.add(new Drawing('c10-rot', [S([[px(0), py(0)], [px(x), py(y)]], seedOf('c10-rot'), {w: 2.4, p: 0.9, ch: BLUE})], {z: 13}));
          }, easeInOut);
          w.remove('c10-rot');
          const ar = draw(`c10-v${turns}`, to, BLUE);
          ar.progress = 1;
          w.add(new Label(`c10-vl${turns}`, pair(to), px(to[0]) + (to[0] < 0 ? -30 : 10), py(to[1]) + (to[1] < 0 ? 26 : -8), {size: 18, z: 14, ch: BLUE}));
        } catch { return; }
        v = to;
        g.audio.tap(0.2, 1.2 + turns * 0.1);
        d.describe(`Un cuarto de vuelta más: la flecha queda en ${pair(v)}.`);
        d.evidence('quarter', {turns, v});
        busy = false;
        if (turns >= 2) { g.setHint(null); resolve(); } else refresh();
      }, {label: 'Girar la flecha un cuarto de vuelta'})]);
      refresh();
    }));
    await d.think('Dos cuartos: (−3, −1). Media vuelta: la flecha apunta para el lado contrario, como multiplicar por −1. Cada cuarto, (a, b) pasa a (−b, a).');
    const c = await d.choose([
      {id: 'none', text: 'Ninguno: un número por sí mismo nunca da negativo.'},
      {id: 'new', text: 'Uno nuevo, que no está en la recta: el que gira un cuarto.'},
      {id: 'minus1', text: '−1.'},
    ], {prompt: '¿Qué número, multiplicado dos veces, da media vuelta, × (−1)?', evaluate: true});
    d.evidence('i-predict', {answer: c});
    if (c === 'minus1') await d.think('−1 por −1 es 1: dos medias vueltas, vuelta entera. Hace falta uno que sea medio camino: un cuarto.');
    if (c === 'none') await d.think('Ninguno de la recta: en la recta sólo hay ir para adelante o dar media vuelta. Un cuarto de vuelta sale de la recta.');
    const ii = cmul([0, 1], [0, 1]), m4 = cmul([0, 2], [0, 2]);
    await d.say('student', 'Mara: al cuarto de vuelta le decimos i. Dos cuartos son media vuelta: i · i = −1. No es un número de la recta: es un número que gira.');
    await studentWrites(d, g, 'c10-i', 'i · i = −1', A.x1 - 160, A.y0 + 40, {size: 30});
    await d.say('Mara', '¿Y lo de Oval, que quería sacar −4 de «por sí mismo»?');
    await d.say('student', 'Con los números de la recta no se podía. Con éstos sí: 2i · 2i = −4. Dos cuartos de vuelta y el doble de largo, dos veces.');
    await studentWrites(d, g, 'c10-2i', '2i · 2i = −4', A.x1 - 160, A.y0 + 90, {size: 26});
    g.audio.punto('happy');
    await pulse(d, p, 2, 0.4).catch(() => {});
    d.evidence('complex', {ii, m4});
    g.flags.c10complex = true;
  },
};

// ——————————————————————————————————————————————
// 10.7 Dos pistas
// ——————————————————————————————————————————————

export const pistas = {
  id: 'c10.pistas',
  title: 'Dos pistas',
  setup(g) {
    clean(g, /^c10-/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Pensé dos números de atados: el de Cornisa y el de Balcón. Primera pista: entre los dos suman 7.');
    const U = 32;
    const {px, py} = grid(w, 'c10-g', {X0: 0, X1: 7, Y0: 0, Y1: 7, U, gx: A.x0 + 40, gy: A.y0 + 10});
    w.add(new Label('c10-ax', 'Cornisa →', A.x0 + 40 + 7 * U + 14, A.y0 + 10 + 7 * U + 6, {size: 14, z: 12, ch: BLUE}));
    const sum7 = Array.from({length: 8}, (_, a) => [a, 7 - a]);
    const diff1 = Array.from({length: 7}, (_, b) => [b + 1, b]);
    for (const [a, b] of sum7) w.add(new Shape(`c10-s${a}`, dot(`c10-s${a}`, 5, WHITE), px(a), py(b), {z: 14}));
    d.describe('En el mapa, todos los pares que suman 7, en blanco: forman una recta inclinada hacia abajo.');
    await d.think('Con una sola pista hay ocho pares de atados posibles, en fila sobre una recta. Atados enteros: sólo los puntos.');
    await d.say('Mara', 'Segunda pista: el de Cornisa le lleva 1 al de Balcón.');
    for (const [a, b] of diff1) w.add(new Shape(`c10-d${a}`, dot(`c10-d${a}`, 5, YELLOW), px(a), py(b), {z: 14}));
    d.describe('En amarillo, los pares donde el primero le lleva 1 al segundo: otra recta, que sube.');
    await d.shot(SHOTS.tiles, 0.8);
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá el par que cumple las dos pistas a la vez.']);
      g.ui.setSpots(diff1.map(([a, b]) => rectSpot(`c10-p${a}_${b}`, `El par (${a}, ${b})`, {x: px(a) - 16, y: py(b) - 16, w: 32, h: 32}, () => {
        if (!ctl.alive()) return;
        d.evidence('system-try', {a, b, ok: a + b === 7});
        if (a + b !== 7) { g.note(`(${a}, ${b}): ${a} le lleva 1 a ${b}, pero suman ${a + b}, no 7.`); return; }
        g.ui.setSpots([]);
        g.setHint(null);
        resolve();
      })));
    }));
    const sol = solve2([1, 1, 7], [1, -1, 1]);
    w.add(new Shape('c10-sol', poly('c10-sol', Array.from({length: 10}, (_, i) => [Math.cos(i / 10 * Math.PI * 2) * 12, Math.sin(i / 10 * Math.PI * 2) * 12]), {ch: YELLOW, w: 3}), px(sol.x), py(sol.y), {z: 15}));
    d.describe('El par (4, 3), donde se cruzan las dos rectas, queda marcado.');
    await d.say('student', 'Mara: Cornisa 4, Balcón 3. Cada pista es una fila de pares; el que cumple las dos está en las dos filas. Si las filas se cruzaran entre puntos, con medios atados, no habría par de atados enteros.');
    await studentWrites(d, g, 'c10-sys', 'a + b = 7', A.x0 + 300, A.y0 + 36, {size: 22});
    await studentWrites(d, g, 'c10-sys2', 'a − b = 1', A.x0 + 300, A.y0 + 66, {size: 22});
    await studentWrites(d, g, 'c10-sys3', '→ (4, 3)', A.x0 + 300, A.y0 + 98, {size: 22, ch: YELLOW});
    await d.say('Mara', '¿Y si te digo «suman 7» y «suman 3»?');
    const c = await d.choose([
      {id: 'none', text: 'Ningún par: esas dos filas no se cruzan.'},
      {id: '52', text: '(5, 2).'},
      {id: 'many', text: 'Muchos: cualquiera de la primera.'},
    ], {prompt: 'Con «suman 7» y «suman 3», ¿qué par cumple las dos?', evaluate: true});
    d.evidence('system-parallel', {answer: c});
    g.setCinematic(true);
    for (let a = 0; a <= 3; a++) w.add(new Shape(`c10-t${a}`, dot(`c10-t${a}`, 5, BLUE), px(a), py(3 - a), {z: 14}));
    await d.wait(0.4);
    g.setCinematic(false);
    const none = solve2([1, 1, 7], [1, 1, 3]);
    d.describe('En azul, los pares que suman 3: otra fila, paralela a la de los que suman 7. No tienen ningún punto en común.');
    await d.think(c === 'none' ? 'Paralelas: ningún par cumple las dos.' : c === '52' ? '(5, 2) suma 7, pero no 3. Las dos filas son paralelas: ningún par cumple las dos.' : 'Ninguno de la primera suma 3: las filas son paralelas y no se tocan. Si fueran la misma fila, servirían todos.');
    w.add(new Label('c10-tabh', 'en tabla:', A.x0 + 300, A.y0 + 150, {size: 16, z: 12, ch: BLUE}));
    await studentWrites(d, g, 'c10-tab', '1    1  |  7', A.x0 + 310, A.y0 + 178, {size: 20});
    await studentWrites(d, g, 'c10-tab2', '1  −1  |  1', A.x0 + 310, A.y0 + 204, {size: 20});
    await d.think('Mara anota sólo los números de cada pista, en filas: una tabla así se llama matriz. Sirve para no escribir las letras todo el tiempo.');
    d.evidence('system', {sol, none: none.kind});
    g.flags.c10system = true;
  },
};

// ——————————————————————————————————————————————
// 10.8 Lo que pasa a veces
// ——————————————————————————————————————————————

const PULLS = ['llena', 'llena', 'a medias', 'llena', 'llena', 'a medias'];

export const aVeces = {
  id: 'c10.a-veces',
  title: 'Lo que pasa a veces',
  setup(g) {
    clean(g, /^c10-/);
    boardCast(g, 3);
    g.camera.go(SHOTS.board);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const p = w.get('punto');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Balcón', 'Con la soga nueva, la rueda gira derecha. Pero el balde no siempre sube igual: a veces llega lleno y a veces a medias.');
    await d.shot(SHOTS.tiles, 0.8);
    let k = 0;
    const tally = {llena: 0, 'a medias': 0};
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá «subir el balde» y anotá cómo llega.']);
      const refresh = () => g.ui.setSpots([wordSpot('c10-pull', 'subir el balde', A.x1 - 80, A.y1 - 30, async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        const r = PULLS[k++];
        tally[r]++;
        const l = w.add(new Label(`c10-pl${k}`, `${k}.  ${r}`, A.x0 + 30, A.y0 + 30 + (k - 1) * 30, {size: 22, z: 12, ch: r === 'llena' ? undefined : YELLOW, reveal: 0}));
        try { await d.draw(l, 0.4, {key: 'reveal'}); } catch { return; }
        g.audio.tap(0.2, r === 'llena' ? 1.3 : 0.9);
        d.describe(`El balde número ${k} sube ${r}.`);
        d.evidence('pull', {k, r});
        busy = false;
        if (k >= 6) { g.setHint(null); resolve(); } else refresh();
      }, {label: 'Subir el balde'})]);
      refresh();
    }));
    w.add(new Label('c10-tl', `llena: ${tally.llena}    a medias: ${tally['a medias']}`, A.x0 + 260, A.y0 + 60, {size: 22, z: 12}));
    const c = await d.choose([
      {id: 'unsure', text: 'No se sabe seguro; lo más probable, llena.'},
      {id: 'full', text: 'Llena, seguro: casi siempre sube llena.'},
      {id: 'half', text: 'A medias: ya le toca.'},
    ], {prompt: 'El balde número 7, ¿cómo va a subir?', evaluate: true});
    d.evidence('chance-predict', {answer: c});
    await d.think(c === 'unsure' ? 'Ni la rueda ni el balde avisan. Lo que pasó dice qué es más común, no qué va a pasar.' : c === 'full' ? 'Casi siempre no es siempre: dos de seis subieron a medias.' : 'El balde no lleva la cuenta: que hayan salido llenas no hace que «le toque» a medias.');
    if (!replay) writeJournal10(g);
    await d.say('Mara', 'Lo que se repite igual se puede anticipar. Lo que pasa a veces… también se puede contar, pero de otra manera.');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.3).catch(() => {});
    g.flags.c10chance = true;
  },
};

function writeJournal10(g) {
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const first = k => ev.find(e => e.kind === k);
  const seen = [];
  const rp = first('radian-predict');
  if (rp) seen.push(rp.answer === '6+' ? 'Anticipaste seis rayos y un poco más alrededor de la rueda.' : rp.answer === '6' ? 'Esperabas seis justos; quedó un hueco: seis y un pedacito, 2π.' : 'Pensaste en los cuatro rayos dibujados; el borde mide seis rayos y un pedacito: 2π ≈ 6,28.');
  const s30 = first('sin30-predict');
  if (s30) seen.push(s30.answer === 'half' ? 'Anticipaste que a 30° la manija sube medio rayo.' : 'Pensaste otra altura para los 30°; sube medio rayo, por el triángulo de lados iguales.');
  const pp = first('period-predict');
  if (pp) seen.push(pp.answer === 'half' ? 'A los 390° pusiste la altura de los 30°: la ola se repite.' : 'A los 390° pensaste otra cosa; es una vuelta y 30°: la misma altura que a los 30°.');
  const rr = first('ratio-predict');
  if (rr) seen.push(rr.answer === '3' ? 'La rampa de 6 sube 3: alto ÷ largo no cambia.' : 'Para la rampa de 6 pensaste otra cosa; con la misma inclinación, alto ÷ largo no cambia: sube 3.');
  const vo = first('vector-order');
  if (vo) seen.push(vo.answer === 'same' ? 'Viste que el orden de las flechas no cambia el destino.' : 'Pensaste que el orden cambiaba el destino; cambia el camino, no adónde se llega.');
  const ip = first('i-predict');
  if (ip) seen.push(ip.answer === 'new' ? 'Buscaste un número nuevo para el cuarto de vuelta: i.' : 'Buscaste el cuarto de vuelta en la recta; no está ahí: es i, y i · i = −1.');
  const sp = first('system-parallel');
  if (sp) seen.push(sp.answer === 'none' ? 'Con «suman 7» y «suman 3» viste que no hay par: rectas paralelas.' : 'Con «suman 7» y «suman 3» buscaste un par; las rectas son paralelas: no hay.');
  const cp = first('chance-predict');
  if (cp) seen.push(cp.answer === 'unsure' ? 'Para el balde 7 dijiste «no se sabe seguro».' : cp.answer === 'full' ? 'Para el balde 7 dijiste «seguro llena»; casi siempre no es siempre.' : 'Para el balde 7 dijiste «ya le toca»; el balde no lleva la cuenta.');
  const entry = {
    id: 'c10',
    title: 'Vueltas y flechas',
    abbr: 'Los giros se miden con el radio; lo que gira se repite; las flechas se suman; i es un cuarto de vuelta.',
    body: [
      'Un giro se mide por cuántos rayos recorre el borde: una vuelta son 2π radianes (≈ 6,28), media vuelta π. π no es 3,14: es un número que no termina.',
      'En una rueda de un rayo, la altura del punto que gira es el seno del ángulo y el costado, el coseno: sen 30° = 0,5. Se repiten cada vuelta: sen(x + 360°) = sen x. En rampas de la misma inclinación, alto ÷ largo es siempre el seno del ángulo.',
      'Una flecha (vector) dice cuánto y hacia dónde; se suman punta con cola, y el orden no cambia el destino. Girar un cuarto de vuelta es multiplicar por i: i · i = −1, y 2i · 2i = −4.',
      'Dos condiciones de primer grado a la vez son dos filas de pares sobre rectas: lo que cumple las dos está en el cruce; si son paralelas, no hay; si son la misma, todos. Con atados enteros, además, el cruce tiene que caer en un punto entero. Los números de cada condición, en filas, forman una tabla llamada matriz.',
    ],
    seen,
    moments: [
      {id: 'c10.repite', label: 'Desplegar: lo que se repite'},
      {id: 'c10.cuarto', label: 'Desplegar: un cuarto de vuelta'},
    ],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora (≡)');
  g.saveNow();
}

export {lerp};
