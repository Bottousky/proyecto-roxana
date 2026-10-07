// Capítulo 8 — Formas (8.5 a 8.8): la misma cerca, Pitágoras, dónde está cada casa y sombras.

import {Label, Shape, Drawing} from '../engine/world.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {rectsWithPerimeter, pythag, rearrange, distance} from '../logic/geometry.js';
import {GROUND, BOARD, SHOTS, area, boardCast, clean, poly, gridSquare, rightTri, family, S, seedOf, WHITE, YELLOW, BLUE} from './common.js';
import {studentWrites} from '../ch7/scenes-a.js';

const sq = (id, s, opts) => poly(id, [[0, 0], [s, 0], [s, s], [0, s]], opts);

// ——————————————————————————————————————————————
// 8.5 La misma cerca
// ——————————————————————————————————————————————

export const cerca = {
  id: 'c8.cerca',
  title: 'La misma cerca',
  setup(g) {
    clean(g, /^c8-/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Rampa', 'Me quedaron doce tramos de cerca. Quiero una huerta rectangular, con la mayor cantidad de tierra adentro.');
    // Punto ya sabe la respuesta… o cree que la sabe
    const p = w.get('punto'), st = w.get('student');
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, A.x0 + 200, A.y0 - 4, 0.4);
    const pl = w.add(new Label('c8-pl', 'misma cerca = misma tierra', A.x0 + 24, A.y0 + 12, {size: 18, z: 16, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(pl, 0.6, {key: 'reveal', sound: false});
    g.audio.punto('happy');
    d.describe('Punto escribe arriba, en amarillo: misma cerca = misma tierra.');
    follow(p, st);
    g.setCinematic(false);
    const pre = await d.choose([
      {id: 'same', text: 'Con la misma cerca, cualquier huerta tiene la misma tierra.'},
      {id: 'depends', text: 'Depende de la forma.'},
    ], {prompt: 'Con los mismos doce tramos, ¿cambia cuánta tierra queda adentro?', evaluate: true});
    d.evidence('perimeter-predict', {answer: pre});
    await d.shot(SHOTS.tiles, 0.8);
    const U = 30;
    const fx = A.x0 + 24, fy = A.y0 + 30;
    const all = rectsWithPerimeter(12);
    const tried = [];
    const table = (a, b, ar, i) => w.add(new Label(`c8-row${a}`, `${a} × ${b}:  tierra ${ar}`, A.x0 + 214, A.y0 + 40 + i * 30, {size: 20, z: 12, ch: ar === 9 ? YELLOW : undefined}));
    const show = a => {
      const b = 6 - a;
      w.removeWhere(o => o.id.startsWith('c8-f'));
      // la cerca: un trazo por tramo, con un poste en cada unión
      const posts = [];
      for (let i = 0; i <= a; i++) posts.push([i * U, 0]);
      for (let j = 1; j <= b; j++) posts.push([a * U, j * U]);
      for (let i = a - 1; i >= 0; i--) posts.push([i * U, b * U]);
      for (let j = b - 1; j >= 1; j--) posts.push([0, j * U]);
      const list = [];
      posts.forEach((p0, k) => {
        const p1 = posts[(k + 1) % posts.length];
        list.push(S([[p0[0] + 3, p0[1]], [p1[0] - (p1[0] > p0[0] ? 3 : p1[0] < p0[0] ? -3 : 0), p1[1] - (p1[1] > p0[1] ? 3 : p1[1] < p0[1] ? -3 : 0)]], seedOf(`c8-f${a}`) + k, {w: 3, p: 0.95}));
        list.push(S([[p0[0], p0[1] - 5], [p0[0], p0[1] + 5]], seedOf(`c8-fp${a}`) + k, {w: 3.4, p: 0.95}));
      });
      w.add(new Drawing(`c8-f${a}`, list.map(st => shift(st, fx, fy)), {z: 13}));
      w.add(new Shape(`c8-fg${a}`, gridSquareRect(`c8-fg${a}`, a, b, U), fx, fy, {z: 12}));
      d.describe(`Una huerta de ${a} por ${b} con los doce tramos de cerca: adentro entran ${a * b} cuadros de tierra.`);
      return a * b;
    };
    w.add(new Label('c8-wl', 'ancho:', A.x1 - 160, A.y0 + 14, {size: 18, z: 12, ch: BLUE}));
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Elegí el ancho de la huerta: el largo sale solo, porque la cerca es siempre la misma. Mirá cuánta tierra queda adentro.']);
      const refresh = () => g.ui.setSpots([1, 2, 3, 4, 5].filter(a => !tried.includes(a)).map(a => wordSpot(`c8-w${a}`, String(a), A.x1 - 140 + ((a - 1) % 2) * 100, A.y0 + 46 + Math.floor((a - 1) / 2) * 72, () => pick(a), {label: `Armar la huerta de ${a} de ancho`})));
      const pick = async a => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        tried.push(a);
        const ar = show(a);
        table(a, 6 - a, ar, tried.length - 1);
        d.evidence('fence', {a, b: 6 - a, area: ar});
        g.audio.tap(0.15, 1 + ar * 0.05);
        try { await d.wait(0.6); } catch { return; }
        busy = false;
        if (tried.length >= 3) { g.setHint(null); g.ui.setSpots([]); resolve(); } else refresh();
      };
      refresh();
    }));
    if (!tried.includes(3)) {
      await d.say('Rampa', '¿Y bien cuadrada, de tres por tres?');
      tried.push(3);
      table(3, 3, show(3), tried.length - 1);
      await d.wait(0.6);
    }
    const best = all.reduce((top, r) => (r.area > top.area ? r : top));
    const seenAreas = [...new Set(tried.map(a => a * (6 - a)))].sort((x, y) => x - y);
    await d.think(`La misma cerca y la tierra va de ${seenAreas[0]} a ${seenAreas[seenAreas.length - 1]}. ${pre === 'same' ? 'No es la misma: depende de la forma.' : 'Depende de la forma.'} De estas huertas, la cuadrada encierra más.`);
    // Punto se corrige solo
    g.setCinematic(true);
    await pulse(d, p, 1, 0.3);
    g.audio.erase(0.5, 0.4);
    await d.fadeTo(pl, 0, 0.6);
    w.remove('c8-pl');
    d.describe('Punto borra su cartel amarillo.');
    g.audio.punto('happy');
    g.setCinematic(false);
    g.flags.c8puntoFence = true;
    await d.say('student', 'Rampa, la cerca mide el borde, el perímetro; la tierra mide lo de adentro, el área. Son medidas distintas: saber una no alcanza para saber la otra.');
    await studentWrites(d, g, 'c8-per', `perímetro 12:  áreas ${seenAreas.join(', ')}`, A.x0 + 24, A.y1 - 14, {size: 24});
    d.evidence('perimeter', {areas: all.map(r => r.area), best: [best.a, best.b]});
    g.flags.c8perim = true;
  },
};

/** Corre un trazo ya armado. */
function shift(st, dx, dy) {
  const pts = new Float32Array(st.pts);
  for (let i = 0; i < st.n; i++) { pts[i * 3] += dx; pts[i * 3 + 1] += dy; }
  return {...st, pts};
}

/** Cuadrícula de a × b cuadraditos amarillos (la tierra de adentro). */
function gridSquareRect(id, a, b, u) {
  const list = [];
  for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) list.push(...poly(`${id}-${i}-${j}`, [[i * u + 4, j * u + 4], [i * u + u - 4, j * u + 4], [i * u + u - 4, j * u + u - 4], [i * u + 4, j * u + u - 4]], {ch: YELLOW, w: 1.6}));
  return list;
}

// ——————————————————————————————————————————————
// 8.6 Pitágoras (momento)
// ——————————————————————————————————————————————

export const pitagoras = {
  id: 'c8.pitagoras',
  title: 'El tirante',
  moment: 'El tirante',
  setup(g) {
    clean(g, /^c8-/);
    boardCast(g, 3);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Balcón', 'Para la escalera nueva quiero un tirante en diagonal. Las patas miden 3 y 4 cuadros, en escuadra. ¿Cuánto mide el tirante?');
    const U = 24, a = 3, b = 4, sa = a * U, sb = b * U, S2 = sa + sb;
    // el triángulo de Balcón, a la derecha
    const tx = A.x1 - 150, ty = A.y0 + 40;
    w.add(new Shape('c8-bt', rightTri('c8-bt', sa, sb), tx, ty, {z: 12}));
    w.add(new Label('c8-bta', '3', tx + sa / 2, ty - 6, {size: 18, align: 'center', z: 12}));
    w.add(new Label('c8-btb', '4', tx - 10, ty + sb / 2 + 6, {size: 18, align: 'right', z: 12}));
    w.add(new Label('c8-btc', '?', tx + sa / 2 + 10, ty + sb / 2 + 10, {size: 20, z: 12, ch: YELLOW}));
    const guess = await d.choose([
      {id: '7', text: 'Siete: tres más cuatro.'},
      {id: '5', text: 'Cinco.'},
      {id: 'measure', text: 'Sin medirlo no se puede saber.'},
    ], {prompt: '¿Cuánto mide el tirante?', evaluate: true});
    d.evidence('pythag-predict', {answer: guess});
    if (guess === '7') await d.think('Ir por las patas, 3 y después 4, es más largo que ir derecho por la diagonal.');
    await d.say('student', 'Armo un cuadrado de lado 3 + 4 con cuatro triángulos como el de Balcón, uno en cada esquina.');
    await d.shot(SHOTS.tiles, 0.8);
    const bx = A.x0 + 30, by = A.y0 + 40;
    w.add(new Shape('c8-big', sq('c8-big', S2, {w: 3}), bx, by, {z: 12}));
    // posiciones: [x, y, giro] en el cuadrado grande, antes y después
    const before = [[0, 0, 0], [S2, 0, Math.PI / 2], [S2, S2, Math.PI], [0, S2, -Math.PI / 2]];
    const after = [[0, sa, 0], [S2, 0, Math.PI / 2], [sa, S2, Math.PI], [sa, sa, -Math.PI / 2]];
    const tris = before.map(([x, y, r], k) => w.add(new Shape(`c8-T${k}`, rightTri(`c8-T${k}`, sa, sb, BLUE), bx + x, by + y, {z: 14, rot: r})));
    const tilt = w.add(new Shape('c8-tilt', poly('c8-tilt', [[sa, 0], [S2, sa], [sb, S2], [0, sb]], {ch: YELLOW, w: 2.6}), bx, by, {z: 15}));
    const tiltL = w.add(new Label('c8-tiltl', 'tirante × tirante', bx + S2 / 2, by + S2 / 2 + 6, {size: 15, align: 'center', z: 16, ch: YELLOW}));
    d.describe('Un cuadrado grande con un triángulo azul en cada esquina. En el medio queda libre un cuadrado inclinado, amarillo: sus lados son tirantes.');
    await d.think('Lo que queda libre en el medio tiene cuatro lados iguales, tirantes. ¿Y sus esquinas? En cada borde se juntan las dos puntas agudas de dos triángulos; esas dos suman 90°, porque las tres puntas de un triángulo suman 180° y una es recta. Queda 180° − 90° = 90°: es un cuadrado.');
    // correr tres triángulos
    const moved = new Set([1]);
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá los triángulos que se pueden correr: quedan de a dos, formando rectángulos. El cuadrado grande no cambia.']);
      const boxOf = k => {
        const [x, y, r] = before[k];
        // caja del triángulo según su giro
        const wv = Math.abs(Math.cos(r)) > 0.5 ? sa : sb, hv = Math.abs(Math.cos(r)) > 0.5 ? sb : sa;
        const x0 = r === Math.PI || r === Math.PI / 2 ? x - wv : x, y0 = r === Math.PI || r === -Math.PI / 2 ? y - hv : y;
        return {x: bx + x0, y: by + y0, w: wv, h: hv};
      };
      const refresh = () => g.ui.setSpots([0, 2, 3].filter(k => !moved.has(k)).map(k => rectSpot(`c8-mv${k}`, `Correr el triángulo ${k + 1}`, boxOf(k), () => mv(k))));
      const mv = async k => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        moved.add(k);
        if (moved.size === 2) { g.setCinematic(true); await d.fadeTo(tilt, 0, 0.4).catch(() => {}); tiltL.fade = 0; g.setCinematic(false); }
        const t = tris[k];
        const [x1, y1] = after[k];
        const sx0 = t.x, sy0 = t.y;
        try { await d.tween(0.6, q => { t.x = lerp(sx0, bx + x1, q); t.y = lerp(sy0, by + y1, q); }, easeInOut); } catch { return; }
        g.audio.tap(0.2, 1.2 + moved.size * 0.1);
        d.evidence('pythag-move', {k});
        busy = false;
        if (moved.size === 4) { g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    // lo que queda libre ahora
    g.setCinematic(true);
    const fa = w.add(new Shape('c8-fa', gridSquare('c8-fa', a, U, YELLOW), bx, by, {z: 15, fade: 0}));
    const fb = w.add(new Shape('c8-fb', gridSquare('c8-fb', b, U, YELLOW), bx + sa, by + sa, {z: 15, fade: 0}));
    await d.all(d.fadeTo(fa, 1, 0.6), d.fadeTo(fb, 1, 0.6));
    w.add(new Label('c8-fal', '3 × 3', bx + sa / 2, by + sa / 2 + 6, {size: 15, align: 'center', z: 16}));
    w.add(new Label('c8-fbl', '4 × 4', bx + sa + sb / 2, by + sa + sb / 2 + 6, {size: 15, align: 'center', z: 16}));
    g.setCinematic(false);
    d.describe('Los triángulos quedaron de a dos. Lo libre ahora son dos cuadrados: uno de 3 por 3 y otro de 4 por 4.');
    const r = rearrange(a, b), pz = pythag(3, 4, 5);
    if (r.freeA !== r.squaresAB || !pz.holds) console.error('[pitágoras] el reacomodo no cierra');
    await d.think('El mismo cuadrado grande y los mismos cuatro triángulos: lo libre tiene que ser lo mismo. Antes, el cuadrado del tirante; ahora, 9 más 16.');
    await d.say('student', guess === '5' ? 'Balcón, el cuadrado del tirante tiene 9 + 16 = 25 cuadros. El tirante mide 5.' : 'Balcón, el cuadrado del tirante tiene 9 + 16 = 25 cuadros: el tirante mide 5, porque 5 · 5 = 25.');
    await studentWrites(d, g, 'c8-py', '3² + 4² = 5²', A.x1 - 160, A.y0 + 184, {size: 28});
    const gen = await d.choose([
      {id: 'right', text: 'Para cualquier triángulo con ángulo recto: el reacomodo no usó el 3 ni el 4.'},
      {id: 'only', text: 'Sólo para 3, 4 y 5.'},
      {id: 'any', text: 'Para cualquier triángulo.'},
    ], {prompt: '¿Para qué triángulos vale esto?', evaluate: true});
    d.evidence('pythag-general', {answer: gen});
    if (gen === 'only') await d.think('Con patas a y b cualesquiera, el reacomodo es el mismo: quedan libres a · a y b · b.');
    if (gen === 'any') {
      await d.say('Balcón', 'Mi otra escalera tiene patas 4 y 5, pero no en escuadra, y el tirante mide 6.');
      const no = pythag(4, 5, 6);
      await d.think(`${no.left} no es ${no.right}. Los cuatro triángulos encajan en las esquinas del cuadrado grande porque tienen una esquina recta: sin ángulo recto, no hay reacomodo.`);
    }
    await d.say('student', 'El lado de enfrente del ángulo recto se llama hipotenusa; los otros dos, catetos.');
    await studentWrites(d, g, 'c8-pyg', 'cateto² + cateto² = hipotenusa²', A.x0 + 24, A.y1 - 14, {size: 22});
    await d.say('Balcón', 'Cinco cuadros de tirante. Y sin medir.');
    d.evidence('pythag', {r, holds: pz.holds});
    g.flags.c8pythag = true;
  },
};

// ——————————————————————————————————————————————
// 8.7 Dónde está cada casa
// ——————————————————————————————————————————————

export const casas = {
  id: 'c8.casas',
  title: 'Dónde está cada casa',
  setup(g) {
    clean(g, /^c8-/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'La Marea borró el camino entre las casas. Las vuelvo a dibujar con mi mapa: dos rectas como la del pozo, una acostada y una parada.');
    const U = 52, X0 = -1, X1 = 5, Y0 = -1, Y1 = 3;
    const gx = A.x0 + 40, gy = A.y0 + 22;
    const px = x => gx + (x - X0) * U, py = y => gy + (Y1 - y) * U;
    const lines = [];
    for (let x = X0; x <= X1; x++) lines.push(S([[px(x), py(Y1) - 6], [px(x), py(Y0) + 6]], seedOf('c8-gx') + x, {w: x === 0 ? 2.6 : 1.4, p: x === 0 ? 0.95 : 0.5, lift: false}));
    for (let y = Y0; y <= Y1; y++) lines.push(S([[px(X0) - 6, py(y)], [px(X1) + 6, py(y)]], seedOf('c8-gy') + y, {w: y === 0 ? 2.6 : 1.4, p: y === 0 ? 0.95 : 0.5, lift: false}));
    w.add(new Drawing('c8-grid', lines, {z: 11}));
    for (let x = X0; x <= X1; x++) w.add(new Label(`c8-gxl${x}`, x < 0 ? `−${-x}` : String(x), px(x) - 12, py(0) + 22, {size: 21, align: 'center', z: 12, ch: BLUE}));
    for (let y = Y0; y <= Y1; y++) if (y !== 0) w.add(new Label(`c8-gyl${y}`, y < 0 ? `−${-y}` : String(y), px(0) - 8, py(y) - 6, {size: 21, align: 'right', z: 12, ch: BLUE}));
    d.describe('En la pizarra, una cuadrícula con dos rectas numeradas que se cruzan en el cero: una acostada y una parada.');
    await d.shot(SHOTS.tiles, 0.8);
    const house = (id, x, y, name) => {
      w.add(new Shape(id, poly(id, [[-10, 0], [10, 0], [10, -14], [0, -24], [-10, -14]], {ch: YELLOW, w: 2.4}), px(x), py(y), {z: 14}));
      w.add(new Label(`${id}l`, name, px(x) + 14, py(y) - 18, {size: 19, z: 14, ch: YELLOW}));
    };
    const placeAt = (target, name, wrongNote) => d.interact(ctl => new Promise(resolve => {
      g.setHint(() => [`Tocá el cruce donde va la casa de ${name}: el primer número se cuenta por la recta acostada; el segundo, por la parada.`]);
      const spots = [];
      for (let x = X0; x <= X1; x++) for (let y = Y0; y <= Y1; y++) {
        spots.push(rectSpot(`c8-pt${x}_${y}`, `El cruce (${x}, ${y})`, {x: px(x) - 18, y: py(y) - 18, w: 36, h: 36}, () => {
          if (!ctl.alive()) return;
          d.evidence('coord-try', {name, x, y});
          if (x === target[0] && y === target[1]) { g.ui.setSpots([]); g.setHint(null); resolve(); return; }
          g.note(wrongNote(x, y));
        }));
      }
      g.ui.setSpots(spots);
    }));
    await d.say('Mara', 'La casa de Rampa la tengo anotada así: (3, 2).');
    await placeAt([3, 2], 'Rampa', (x, y) => (x === 2 && y === 3 ? 'Ese es (2, 3): dos por la acostada y tres por la parada. El orden importa.' : `Ese es (${x}, ${y}). Desde el cero: tres por la recta acostada, dos para arriba.`));
    house('c8-hR', 3, 2, 'Rampa');
    g.audio.tap(0.2, 1.4);
    await d.say('student', 'Tres para el costado y dos para arriba. Al revés, (2, 3), es otro lugar.');
    await d.say('Mara', 'Y Peldaño vive del otro lado de los dos ceros, como el pozo: (−1, −1).');
    await placeAt([-1, -1], 'Peldaño', (x, y) => `Ese es (${x}, ${y}). Los dos números son −1: uno para la izquierda y uno para abajo.`);
    house('c8-hP', -1, -1, 'Peldaño');
    g.audio.tap(0.2, 1.4);
    // la distancia en línea recta
    const dist = distance([-1, -1], [3, 2]);
    const c = await d.choose([
      {id: '7', text: 'Siete: lo que camina yendo por las rectas.'},
      {id: '5', text: 'Cinco.'},
      {id: 'measure', text: 'Sin medir no se sabe.'},
    ], {prompt: '¿Cuánto camina Peldaño hasta lo de Rampa, en línea recta?', evaluate: true});
    d.evidence('coord-distance', {answer: c});
    g.setCinematic(true);
    const legs = w.add(new Drawing('c8-legs', [
      S([[px(-1), py(-1)], [px(3), py(-1)]], seedOf('c8-l1'), {w: 2.4, p: 0.9, ch: BLUE}),
      S([[px(3), py(-1)], [px(3), py(2)]], seedOf('c8-l2'), {w: 2.4, p: 0.9, ch: BLUE}),
      S([[px(-1), py(-1)], [px(3), py(2)]], seedOf('c8-l3'), {w: 3, p: 0.95, ch: YELLOW}),
    ], {z: 13, progress: 0}));
    await d.draw(legs, 0.9, {sound: false});
    g.setCinematic(false);
    d.describe('Entre las dos casas, un triángulo con ángulo recto: 4 por la acostada, 3 por la parada, y el camino derecho en amarillo.');
    await d.say('student', `Por la acostada, de −1 a 3: 3 − (−1) = 4. Por la parada, de −1 a 2: 2 − (−1) = 3. Es el tirante de Balcón otra vez: 4² + 3² = 25, el camino derecho mide ${dist.d}.`);
    if (c === '7') await d.think('Siete es yendo por las rectas, en ele. Derecho, cinco.');
    await studentWrites(d, g, 'c8-co', '(3, 2) ≠ (2, 3)', A.x0 + 372, A.y0 + 40, {size: 20});
    d.evidence('coords', {dist});
    g.flags.c8coords = true;
  },
};

// ——————————————————————————————————————————————
// 8.8 Sombras
// ——————————————————————————————————————————————

const SHADOW = {8: 4, 10: 2, 12: 1, 14: 2, 16: 4};

export const sombras = {
  id: 'c8.sombras',
  title: 'Sombras',
  setup(g) {
    clean(g, /^c8-/);
    boardCast(g, 2);
    const w = g.world;
    const c = w.get('cornisa');
    if (c) { c.x = 13450; c.face?.(1); }
    g.camera.go(SHOTS.shadow);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const p = w.get('punto');
    const A = area();
    const cor = w.get('cornisa');
    const fx = cor ? cor.x : 13450;
    await d.shot(SHOTS.shadow, 1);
    await d.say('Cornisa', 'Desde que entendí lo de las copias, mido mi sombra para saber la hora. ¿Me ayudan a armar la tabla?');
    const sun = w.add(new Shape('c8-sun', poly('c8-sun', Array.from({length: 12}, (_, i) => [Math.cos(i / 12 * Math.PI * 2) * 22, Math.sin(i / 12 * Math.PI * 2) * 22]), {ch: YELLOW, w: 2.6}), fx, GROUND - 420, {z: 3}));
    // la sombra apunta para el lado contrario al sol: a la mañana a la derecha, a la tarde a la izquierda
    const dirOf = h => (h < 12 ? 1 : h > 12 ? -1 : 0);
    const setShadow = (len, h) => {
      w.remove('c8-shadow');
      const dir = dirOf(h);
      const pts = dir === 0 ? [[fx - len * 20, GROUND - 3], [fx + len * 20, GROUND - 3]] : [[fx + dir * 4, GROUND - 3], [fx + dir * (4 + len * 40), GROUND - 3]];
      w.add(new Drawing('c8-shadow', [S(pts, seedOf(`c8-sh${h}`), {w: 11, p: 0.8, ch: BLUE})], {z: 2}));
    };
    const tried = [];
    const HOURS = [8, 10, 12, 14, 16];
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá una hora: el sol se mueve y la sombra de Cornisa cambia. Se anota en la tabla.']);
      const refresh = () => g.ui.setSpots(HOURS.filter(h => !tried.includes(h)).map((h, i) => wordSpot(`c8-h${h}`, `${h} h`, fx - 280 + HOURS.indexOf(h) * 140, GROUND + 70, () => at(h), {label: `Mirar la sombra a las ${h}`})));
      const at = async h => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        tried.push(h);
        const t = (h - 6) / 12;
        const sx0 = sun.x, sy0 = sun.y;
        const tx = fx - 420 + t * 840, ty = GROUND - 220 - Math.sin(t * Math.PI) * 220;
        try { await d.tween(0.8, q => { sun.x = lerp(sx0, tx, q); sun.y = lerp(sy0, ty, q); }, easeInOut); } catch { return; }
        setShadow(SHADOW[h], h);
        const dir = dirOf(h);
        w.add(new Label(`c8-sr${h}`, `${h} h:  largo ${SHADOW[h]}  ${dir > 0 ? '→' : dir < 0 ? '←' : '(la más corta)'}`, A.x0 + 20, A.y0 + 40 + (tried.length - 1) * 34, {size: 22, z: 12}));
        d.describe(`A las ${h}, la sombra de Cornisa mide ${SHADOW[h]} ${SHADOW[h] === 1 ? 'paso' : 'pasos'}${dir > 0 ? ' y apunta a la derecha, lejos del sol de la mañana' : dir < 0 ? ' y apunta a la izquierda, lejos del sol de la tarde' : ': la más corta, con el sol bien alto'}.`);
        d.evidence('shadow', {h, len: SHADOW[h]});
        busy = false;
        if (tried.length >= HOURS.length) { g.setHint(null); g.ui.setSpots([]); resolve(); } else refresh();
      };
      refresh();
    }));
    await d.think('A la mañana la sombra apunta para un lado; a la tarde, para el otro. Y el largo baja hasta el mediodía y después vuelve a subir.');
    if (!replay) writeJournal8(g);
    await d.say('Mara', 'Cornisa, si un viajero te dice sólo el largo de su sombra, sin decir para qué lado apunta, ¿le podés decir qué hora es?');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.3).catch(() => {});
    g.flags.c8shadow = true;
  },
};

function writeJournal8(g) {
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const first = k => ev.find(e => e.kind === k);
  const seen = [];
  const nm = ev.filter(e => e.kind === 'near-miss').map(e => e.q);
  if (nm.length) seen.push(`Partiste el lado en ${nm.join(', ')}: nunca cayó justo.`);
  const pn = first('proof-need');
  if (pn) seen.push(pn.answer === 'arg' ? 'Viste que probando no se termina y que hacía falta una razón.' : pn.answer === 'more' ? 'Pensaste en seguir probando; los números no se terminan, y hacía falta una razón que sirva para todos.' : 'Pensaste que mil casos alcanzaban; mil no son todos, y hacía falta una razón que sirva para todos.');
  if (first('descent')) seen.push('Con dos cuadrados adentro de uno, cada par que cumpliera daba otro más chico: con enteros, imposible. √2 no es una fracción.');
  const ag = first('angle-general');
  if (ag) seen.push(ag.answer === 'why' ? 'Juntaste las puntas de un triángulo en media vuelta y pediste una razón para todos: la paralela.' : 'Juntaste las puntas de un triángulo en media vuelta; para todos los triángulos, la razón fue la paralela.');
  const sk = first('similar-keeps');
  if (sk) seen.push(sk.answer === 'angles' ? 'Una copia parecida conserva la forma: ángulos y proporción.' : 'Una copia parecida no conserva los lados ni el área: conserva la forma, los ángulos y la proporción.');
  const as = first('area-scale-predict'), vs = first('volume-scale-predict');
  if (as) seen.push(`Con el lado doble, anticipaste ${({2: 'el doble de tierra', 4: 'cuatro veces la tierra', 3: 'apenas un poco más de tierra'})[as.answer]}: fueron cuatro huertas como la de antes.`);
  if (vs) seen.push(vs.answer === '8' ? 'Para la caja de lado doble anticipaste ocho cajas: fueron ocho.' : `Para la caja de lado doble anticipaste ${vs.answer === '2' ? 'dos' : 'cuatro'} cajas: fueron ocho, por el largo, el ancho y el alto.`);
  const pp = first('perimeter-predict');
  if (pp) seen.push(pp.answer === 'depends' ? 'Con la misma cerca, anticipaste que la tierra depende de la forma: de 5 a 9.' : 'Pensaste que la misma cerca da la misma tierra; dio de 5 a 9.');
  const py = first('pythag-predict');
  if (py) seen.push(py.answer === '5' ? 'Anticipaste el tirante de 5.' : py.answer === '7' ? 'Para el tirante dijiste siete; derecho es más corto que por las patas: 9 + 16 = 25, mide 5.' : 'Pensaste que sin medir no se sabía; reacomodando los triángulos se supo: 9 + 16 = 25, mide 5.');
  const cd = first('coord-distance');
  if (cd) seen.push(cd.answer === '5' ? 'Entre (−1, −1) y (3, 2) viste el tirante: 5.' : cd.answer === '7' ? 'Entre (−1, −1) y (3, 2), derecho no son 7: son 5, como el tirante.' : 'Entre (−1, −1) y (3, 2) pensaste que había que medir; con el tirante, 5.');
  const entry = {
    id: 'c8',
    title: 'Formas',
    abbr: 'Una forma se mide, se copia, se agranda y se ubica; un dibujo muestra, un argumento prueba.',
    body: [
      'Probando casos no se termina: para saber que algo vale siempre hace falta una razón que sirva para todos a la vez. Así se ve que √2 no es una fracción: si hubiera un par de enteros, habría otro más chico, sin fin; pero los enteros positivos no bajan para siempre. La suposición lleva a algo imposible.',
      'Un ángulo es cuánto se gira. Los tres ángulos de un triángulo juntos hacen media vuelta, 180°: la paralela lo muestra para cualquier triángulo del plano.',
      'Copias iguales (congruentes): se mueven, se giran o se dan vuelta y calzan. Parecidas (semejantes): los mismos ángulos y todos los lados multiplicados por lo mismo. Con el lado × 2, el área va × 4 y el volumen × 8; con × 3, × 9 y × 27.',
      'El perímetro mide el borde; el área, lo de adentro: la misma cerca encierra distinta tierra. Con ángulo recto, cateto² + cateto² = hipotenusa² (reacomodando cuatro triángulos en un cuadrado). Un punto del plano se ubica con dos números en orden: (3, 2) no es (2, 3).',
    ],
    seen,
    moments: [
      {id: 'c8.doble', label: 'Desplegar: el doble de grande'},
      {id: 'c8.pitagoras', label: 'Desplegar: el tirante'},
    ],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora (≡)');
  g.saveNow();
}

export {family, WHITE};
