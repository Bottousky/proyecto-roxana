// Capítulo 10 — Vueltas y flechas (10.5 a 10.8): flechas, un cuarto de vuelta, dos pistas y lo que pasa a veces.

import {Drawing, Label, Shape} from '../engine/world.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {add, cmul, quarter, solve2} from '../logic/turns.js';
import {SHOTS, area, boardCast, clean, poly, dot, arrow, S, seedOf, WHITE, YELLOW, BLUE} from '../ch9/common.js';
import {studentWrites} from '../ch7/scenes-a.js';

const sg = n => (n < 0 ? `−${-n}` : String(n));
const pair = ([a, b]) => `(${sg(a)}, ${sg(b)})`;
const term = n => (n < 0 ? `(${sg(n)})` : String(n));

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
    await d.say('Rampa', 'Punto, traeme la soga. Estás en el pozo, en el cero del mapa; mi casa está en (3, 2), como la anotó Mara. Mara sólo te deja moverte con estas flechas.');
    const {px, py} = grid(w, 'c10-g', {X0: -1, X1: 6, Y0: -4, Y1: 4, U: 28, gx: A.x0 + 30, gy: A.y0 + 14});
    w.add(new Shape('c10-home', poly('c10-home', [[-10, 0], [10, 0], [10, -14], [0, -24], [-10, -14]], {ch: YELLOW, w: 2.4}), px(3), py(2), {z: 14}));
    w.add(new Label('c10-homel', 'Rampa', px(3) + 14, py(2) + 16, {size: 15, z: 14, ch: YELLOW}));
    // la casa es un lugar; las flechas dicen cuánto moverse (ninguna es (3, 2))
    const HOME = [3, 2];
    const CARDS = [[4, -1], [-1, 3], [2, 1]];
    d.describe('Un mapa con el pozo en el cero y la casa de Rampa en (3, 2). Tres flechas disponibles: (4, −1), (−1, 3) y (2, 1).');
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
      g.setHint(() => ['Elegí dos flechas, una después de la otra: cada una sale de donde terminó la anterior. Hay que llegar a la casa, en (3, 2).']);
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
          if (pos[0] === HOME[0] && pos[1] === HOME[1]) { busy = false; g.setHint(null); resolve(); return; }
          g.note(`Quedaste en ${pair(pos)}, no en (3, 2). Probá con otro par de flechas.`);
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
    d.describe('En azul, las mismas flechas en el otro orden: el camino es otro, pero termina en la casa de Rampa. Los dos caminos son los lados de un paralelogramo.');
    await d.say('student', c === 'same' ? 'Punto, el camino cambia, el destino no. Una flecha dice cuánto y hacia dónde, no desde dónde. La casa, en cambio, es un lugar.' : 'Punto, el camino cambia, pero el destino no. Una flecha dice cuánto y hacia dónde, no desde dónde. La casa, en cambio, es un lugar.');
    await studentWrites(d, g, 'c10-vsum', `${pair(f1)} + ${pair(f2)} = (${sg(f1[0])} + ${term(f2[0])}, ${sg(f1[1])} + ${term(f2[1])}) = (3, 2)`, A.x0 + 10, A.y1 - 6, {size: 18});
    await d.say('student', 'Se suman los de adelante con los de adelante y los de arriba con los de arriba. Y como en cada suma el orden no importa, con cualquier par de flechas se llega al mismo lugar; si no van en la misma dirección, las dos rutas son los lados de un paralelogramo.');
    await d.say('student', 'La suma es la flecha (3, 2): la que va derecho del pozo a la casa. Desde el cero, la flecha que llega a un lugar se anota con los mismos números que el lugar; desde otro punto, no.');
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
    await d.say('student', 'Mara, a la flecha (0, 1), uno arriba del cero, le decimos i. Multiplicar por i es girar un cuarto de vuelta, contra el reloj. Dos cuartos son media vuelta: i · i = −1. i no está en la recta.');
    await studentWrites(d, g, 'c10-i', 'i · i = −1', A.x1 - 160, A.y0 + 40, {size: 30});
    w.add(new Label('c10-vn0', '3 + i', px(3), py(1) + 24, {size: 16, align: 'center', z: 14, ch: YELLOW}));
    d.describe('Debajo de la punta de la flecha amarilla, (3, 1), se anota «3 + i»: tres adelante y uno arriba.');
    await d.say('student', 'La flecha (3, 1) es el número 3 + i: tres adelante y uno arriba. Por i: i · 3 + i · i = 3i − 1. Es la flecha (−1, 3), la del primer giro: el de adelante pasa arriba, y el de arriba pasa adelante con el signo cambiado.');
    await studentWrites(d, g, 'c10-i3', 'i · (3 + i) = −1 + 3i', A.x1 - 195, A.y0 + 140, {size: 19});
    await d.say('Mara', '¿Y lo de Oval, que quería sacar −4 de «por sí mismo»?');
    await d.say('student', 'Con los números de la recta no se podía, y eso sigue valiendo en la recta. Con éstos sí: multiplicar por 2i es girar un cuarto de vuelta y estirar al doble. Dos veces: media vuelta y cuatro veces el largo, −4. Y −2i, girando para el otro lado, también.');
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
    await d.say('student', 'Mara, son Cornisa 4 y Balcón 3. Cada pista es una fila de pares; el que cumple las dos está en las dos filas. Si las filas se cruzaran entre puntos, con medios atados, no habría par de atados enteros.');
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
    // la raya que separa los números de la izquierda del resultado se dibuja derecha (la letra de tiza la inclina como una fracción)
    const table = async (id, rows, x, ch) => {
      for (const [i, [l, r]] of rows.entries()) {
        await studentWrites(d, g, `${id}${i}`, l, x, A.y0 + 178 + i * 26, {size: 19, ch});
        const rl = w.add(new Label(`${id}r${i}`, r, x + 74, A.y0 + 178 + i * 26, {size: 19, z: 12, ch, reveal: 0}));
        await d.draw(rl, 0.25, {key: 'reveal', sound: false});
      }
      const bar = w.add(new Drawing(`${id}bar`, [S([[x + 64, A.y0 + 160], [x + 64, A.y0 + 210]], seedOf(`${id}bar`), {w: 2, p: 0.9, ch: ch ?? WHITE})], {z: 12, progress: 0}));
      await d.draw(bar, 0.3, {sound: false});
    };
    await table('c10-tab', [['1    1', '7'], ['1  −1', '1']], A.x0 + 290, undefined);
    await table('c10-tabb', [['1    1', '7'], ['1    1', '3']], A.x0 + 405, BLUE);
    d.describe('Mara anota sólo los números de cada pista, en filas, con una raya antes del resultado. A la izquierda, «suman 7» (1, 1, raya, 7) y «le lleva 1» (1, −1, raya, 1); a la derecha, en azul, «suman 7» (1, 1, raya, 7) y «suman 3» (1, 1, raya, 3).');
    await d.think('Una tabla así, sólo con los números de cada pista, se llama matriz.');
    await d.say('student', 'Mara, en la tabla azul la parte de la izquierda es igual en las dos filas y el resultado no. Las mismas cuentas no pueden dar 7 y 3 a la vez: son paralelas, y se ve sin dibujarlas.');
    await d.say('Mara', '¿Y si te digo «suman 7» y «el doble de los dos suma 14»?');
    await d.say('student', 'Es la misma pista dicha dos veces: la segunda fila es la primera por 2. Es la misma recta, y sirven los ocho pares.');
    d.evidence('system', {sol, none: none.kind});
    g.flags.c10system = true;
  },
};

// ——————————————————————————————————————————————
// 10.8 Lo que pasa a veces
// ——————————————————————————————————————————————

const PULLS = ['llena', 'a medias', 'llena', 'llena', 'llena', 'a medias'];

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
    await d.think(c === 'unsure' ? 'Ni la rueda ni el balde avisan. Lo que pasó dice qué es más común, no qué va a pasar.' : c === 'full' ? 'Casi siempre no es siempre: dos de seis subieron a medias.' : 'El balde no lleva la cuenta: lo que salió antes no cambia lo que sale ahora.');
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
  if (rp) seen.push(rp.answer === '6+' ? 'Anticipaste seis rayos y un poco más alrededor de la rueda.' : rp.answer === '6' ? 'Esperabas seis justos: derecho, de punta a punta, entran seis; por el borde queda un hueco: seis y un pedacito, 2π.' : 'Pensaste en los cuatro rayos dibujados; el borde mide seis rayos y un pedacito: 2π ≈ 6,28.');
  const s30 = first('sin30-predict');
  if (s30) seen.push(s30.answer === 'half' ? 'Anticipaste que a 30° la manija sube medio rayo.' : s30.answer === 'unknown' ? 'Dijiste que sin medir no se sabía; se sabe: medio rayo, por el triángulo de lados iguales.' : 'Pensaste un tercio de rayo para los 30°; sube medio rayo, por el triángulo de lados iguales: la altura no crece parejo con el giro.');
  const pp = first('period-predict');
  if (pp) seen.push(pp.answer === 'half' ? 'A los 390° pusiste la altura de los 30°: la ola se repite.' : pp.answer === 'more' ? 'A los 390° pensaste más que 1; es una vuelta y 30°: la misma altura que a los 30°.' : 'A los 390° dijiste que no se sabía todavía; una vuelta entera deja la manija donde estaba: la altura de los 30°.');
  const rr = first('ratio-predict');
  if (rr) seen.push(rr.answer === '3' ? 'La rampa de 6 sube 3: alto ÷ largo no cambia.' : rr.answer === '4' ? 'Para la rampa de 6 sumaste; con la misma inclinación, alto ÷ largo no cambia: sube 3.' : 'Para la rampa de 6 querías construirla; con la misma inclinación, alto ÷ largo no cambia: sube 3.');
  const r60 = first('ratio60-predict');
  if (r60) seen.push(r60.answer === 'sin' ? 'Para la rampa de 60° usaste la tabla de la rueda: 4 · 0,87 ≈ 3,5.' : r60.answer === 'half' ? 'Para la rampa de 60° usaste la mitad, que es el seno de 30°; a 60° es 0,87: sube unos 3,5.' : 'Para la rampa de 60° doblaste el alto con el ángulo; no crece parejo: sube unos 3,5.');
  const vo = first('vector-order');
  if (vo) seen.push(vo.answer === 'same' ? 'Viste que el orden de las flechas no cambia el destino.' : 'Pensaste que el orden cambiaba el destino; cambia el camino, no adónde se llega.');
  const ip = first('i-predict');
  if (ip) seen.push(ip.answer === 'new' ? 'Buscaste un número nuevo para el cuarto de vuelta: i.' : ip.answer === 'none' ? 'Dijiste que ningún número, multiplicado dos veces, daba media vuelta; en la recta no hay, pero fuera de la recta está i, y i · i = −1.' : 'Probaste con −1; −1 · −1 es 1, vuelta entera. El cuarto de vuelta es i, y i · i = −1.');
  const sp = first('system-parallel');
  if (sp) seen.push(sp.answer === 'none' ? 'Con «suman 7» y «suman 3» viste que no hay par: rectas paralelas.' : sp.answer === 'many' ? 'Con «suman 7» y «suman 3» dijiste que servían muchos; las rectas son paralelas: no sirve ninguno.' : 'Con «suman 7» y «suman 3» propusiste (5, 2); suma 7, no 3: las rectas son paralelas y no hay par.');
  const cp = first('chance-predict');
  if (cp) seen.push(cp.answer === 'unsure' ? 'Para el balde 7 dijiste «no se sabe seguro».' : cp.answer === 'full' ? 'Para el balde 7 dijiste «seguro llena»; casi siempre no es siempre.' : 'Para el balde 7 dijiste «ya le toca»; el balde no lleva la cuenta.');
  const entry = {
    id: 'c10',
    title: 'Vueltas y flechas',
    abbr: 'Los giros se miden con el radio; lo que gira se repite; las flechas se suman; multiplicar por i gira un cuarto de vuelta.',
    body: [
      'Un giro se mide por cuántos rayos recorre el borde, siguiendo la curva: una vuelta, 360°, son 2π radianes (≈ 6,28), media vuelta π. Derecho, de punta a punta, el rayo entra seis veces justo; por el borde, que es más largo, seis y un pedacito. π no es 3,14: 3,14 es una aproximación, y π no es ninguna fracción.',
      'En una rueda de un rayo, la altura del punto que gira es el seno del ángulo y el costado, el coseno: sen 30° = 0,5, cos 30° ≈ 0,87; a la izquierda del centro el costado es negativo. Rayo, alto y costado forman un triángulo con esquina recta: alto² + costado² = 1. Se repiten cada vuelta: sen(x + 360°) = sen x. En una rampa, alto ÷ largo de la tabla (el lado de enfrente de la esquina recta) es el seno del ángulo con el piso; en triángulos, la esquina recta y la misma inclinación dejan la forma fija.',
      'Una flecha (vector) dice cuánto y hacia dónde, no desde dónde; un lugar no es una flecha, aunque desde el cero se anoten igual. Se suman punta con cola, coordenada a coordenada, y el orden no cambia el destino. La flecha (3, 1) es el número 3 + i. Multiplicar por i gira un cuarto de vuelta contra el reloj: (a, b) pasa a (−b, a), e i · i = −1. Con números de la recta, x · x nunca da negativo; con 2i, 2i · 2i = −4.',
      'Dos condiciones de primer grado a la vez («tanto de a más tanto de b da tanto») son dos filas de pares sobre rectas: lo que cumple las dos está en el cruce; si son paralelas, no hay; si son la misma, todos. Con atados enteros, además, el cruce tiene que caer en un punto entero. Los números de cada condición, en filas, forman una tabla llamada matriz: si la izquierda de una fila es la de la otra por un mismo número y el resultado no, son paralelas; si también el resultado, es la misma recta.',
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
