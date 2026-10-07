// Capítulo 12 — Anticipar (12.1 a 12.4): familias, perillas, el salto de Punto, una tras otra.

import {lerp} from '../engine/rng.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {RULES, lineThrough, jump, readParabola, compose, double1, undoDouble1, sq, boxVolume} from '../logic/anticipate.js';
import {Drawing, Label, Shape, SHOTS, area, base, boardCast, clean, poly, dot, S, seedOf, WHITE, YELLOW, BLUE, dec, axes, curve} from './common.js';
import {studentWrites} from '../ch7/scenes-a.js';

// ——————————————————————————————————————————————
// 12.1 Familias
// ——————————————————————————————————————————————

const THUMBS = [
  {family: 'ola', f: x => Math.sin(x), xr: [0, 2 * Math.PI], yr: [-1.2, 1.2]},
  {family: 'recta', f: x => 1 + 10 * x, xr: [0, 6], yr: [0, 65]},
  {family: 'hueco', f: x => 1 / (x - 2), xr: [0, 4], yr: [-4, 4], asym: 2},
  {family: 'despega', f: x => 2 ** x, xr: [0, 6], yr: [0, 65]},
  {family: 'u', f: x => x * x, xr: [-3, 3], yr: [0, 9.5]},
  {family: 'aplana', f: x => Math.log2(x), xr: [0, 8], yr: [-2, 3.5]},
];
const PICKS = ['mara', 'punto', 'huerta', 'rueda', 'reparto', 'veces'];
const SHORT = {mara: 'Mara', punto: 'Punto', huerta: 'huerta', rueda: 'rueda', reparto: 'reparto', veces: 'veces'};
const HINT = {
  mara: 'La escalera de Mara sube lo mismo cada día: buscá la que sube pareja.',
  punto: 'La de Punto empieza lenta y después se dispara.',
  huerta: 'x · x da lo mismo con 3 y con −3: buscá la que es igual de los dos lados.',
  rueda: 'La altura de la rueda sube, baja y vuelve.',
  reparto: 'Con 2 no se puede repartir: buscá la que se corta en un lugar.',
  veces: 'Para llegar al doble hace falta una vez más: crece cada vez más despacio.',
};

export const familias = {
  id: 'c12.familias',
  title: 'Familias',
  setup(g) {
    g.world.clear();
    base(g);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Juntemos las reglas del viaje. Dibujé seis formas. Cada regla tiene la suya: si reconocemos la forma, sabemos qué esperar.');
    const cells = THUMBS.map((t, i) => ({...t, x: A.x0 + 10 + (i % 3) * 170, y: A.y0 + 8 + Math.floor(i / 3) * 112, w: 150, h: 84}));
    for (const [i, c] of cells.entries()) {
      const {px, py} = axes(w, `c12-ax${i}`, c, c.xr, c.yr);
      w.add(curve(`c12-th${i}`, c.f, c.xr, px, py, c.yr, {ch: WHITE, n: 60}));
      if (c.asym) w.add(new Drawing(`c12-as${i}`, Array.from({length: 6}, (_, k) => S([[px(c.asym), c.y + k * 15], [px(c.asym), c.y + k * 15 + 7]], seedOf(`c12-as${i}`) + k, {w: 1.6, p: 0.6, ch: BLUE, lift: false})), {z: 12}));
    }
    d.describe('Seis formas: una ola; una recta que sube pareja; una curva partida en dos, que no está definida en un lugar; una curva que empieza baja y se dispara; una U; y una curva que sube cada vez más despacio.');
    await d.shot(SHOTS.tiles, 0.8);
    const done = new Set();
    const placed = new Set();
    while (done.size < PICKS.length) {
      const idx = await d.interact(ctl => new Promise(resolve => {
        g.setHint(() => ['Tocá una forma: después elegís qué regla del viaje tiene esa forma.']);
        g.ui.setSpots(cells.map((c, i) => i).filter(i => !placed.has(i)).map(i => rectSpot(`c12-c${i}`, `La forma ${i + 1}`, {x: cells[i].x, y: cells[i].y, w: cells[i].w, h: cells[i].h}, () => { if (ctl.alive()) { g.ui.setSpots([]); g.setHint(null); resolve(i); } })));
      }));
      const c = cells[idx];
      const rid = await d.choose(PICKS.filter(id => !done.has(id)).map(id => ({id, text: RULES.find(r => r.id === id).name})), {prompt: '¿Qué regla del viaje tiene esta forma?'});
      const rule = RULES.find(r => r.id === rid);
      d.evidence('family-try', {rule: rid, family: c.family, ok: rule.family === c.family});
      if (rule.family !== c.family) { await d.think(HINT[rid]); continue; }
      done.add(rid);
      placed.add(idx);
      w.add(new Label(`c12-fl${idx}`, rule.name, c.x + c.w / 2, c.y + c.h + 14, {size: 14, align: 'center', z: 13, ch: YELLOW}));
      g.audio.tap(0.2, 1.2 + done.size * 0.08);
    }
    await d.say('student', 'Mara, cada forma es una familia. Las rectas cambian parejo, lo mismo por paso; las que despegan crecen cada vez más rápido; las U son iguales de los dos lados del eje parado, y por eso se dice que son simétricas; las olas vuelven; las del «¿cuántas veces?» suben cada vez más despacio.');
    const hc = cells.findIndex(c => c.asym);
    if (hc >= 0) {
      const c = cells[hc];
      const ax = c.x + (c.asym - c.xr[0]) / (c.xr[1] - c.xr[0]) * c.w;
      w.add(new Label('c12-asl', 'asíntota', ax - 4, c.y + 12, {size: 13, align: 'right', z: 13, ch: BLUE}));
      d.describe('En la forma partida, junto a la raya punteada, en el 2, donde no se puede repartir, se escribe «asíntota».');
    }
    await d.say('student', 'Las partidas no están definidas en un lugar: el gráfico se interrumpe ahí, y a eso se le dice discontinuidad. Cerca del 2 se disparan, y se acercan a la raya punteada tanto como se quiera: una raya así se llama asíntota. Esta no la tocan nunca, porque en el 2 no hay valor.');
    await d.say('student', 'La del «¿cuántas veces?» también tiene una: cerca del 0 baja sin fin, pegada al eje parado.');
    await d.say('student', 'Viendo un pedazo, uno sabe qué esperar si la regla sigue igual: es una suposición, y hay que mirar si se cumple.');
    d.evidence('families', {done: [...done]});
    g.flags.c12families = true;
  },
};

// ——————————————————————————————————————————————
// 12.2 Perillas
// ——————————————————————————————————————————————

export const perillas = {
  id: 'c12.perillas',
  title: 'Perillas',
  setup(g) {
    clean(g, /^c12-/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Rampa', 'Todas las rectas son de la misma familia, pero no son iguales. La escalera de Mara: el día 0 tenía 1 escalón; el día 3, 31. ¿Qué recta es?');
    const box = {x: A.x0 + 40, y: A.y0 + 20, w: 300, h: 200};
    const {px, py} = axes(w, 'c12-g', box, [0, 6], [0, 70], {xticks: [1, 2, 3, 4, 5, 6], yticks: [10, 30, 50, 70], xname: 'día'});
    for (const [x, y] of [[0, 1], [3, 31]]) w.add(new Shape(`c12-t${x}`, dot(`c12-t${x}`, 6, YELLOW), px(x), py(y), {z: 14}));
    let a = 4, b = 5;
    const draw = () => {
      w.remove('c12-line');
      w.add(curve('c12-line', x => a * x + b, [0, 6], px, py, [0, 70], {ch: BLUE, n: 6}));
      w.remove('c12-eq');
      w.add(new Label('c12-eq', `y = ${a} · x + ${b}`, A.x1 - 150, A.y0 + 240, {size: 22, z: 12, ch: BLUE}));
    };
    draw();
    d.describe('Un mapa con dos puntos amarillos: (0, 1) y (3, 31). Una recta azul, y = 4 · x + 5, que no pasa por ninguno.');
    await d.shot(SHOTS.tiles, 0.8);
    const target = lineThrough([0, 1], [3, 31]);
    let moves = 0;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['La perilla a inclina la recta; la b la sube o la baja. Llevala hasta que pase por los dos puntos.']);
      const btn = (id, text, x, y, fn, label) => wordSpot(id, text, x, y, () => { if (!ctl.alive()) return; fn(); moves++; draw(); g.audio.tap(0.15, 1 + a * 0.03); d.evidence('knob', {a, b}); d.describe(`La recta ahora es y = ${a} · x + ${b}.`); if (a === target.a && b === target.b) { g.ui.setSpots([]); g.setHint(null); resolve(); } }, {label});
      g.ui.setSpots([
        btn('c12-ap', 'a +', A.x1 - 110, A.y0 + 40, () => { a += 2; }, 'Inclinar más la recta (a más 2)'),
        btn('c12-am', 'a −', A.x1 - 30, A.y0 + 40, () => { a -= 2; }, 'Inclinar menos la recta (a menos 2)'),
        btn('c12-bp', 'b +', A.x1 - 110, A.y0 + 120, () => { b += 2; }, 'Subir la recta (b más 2)'),
        btn('c12-bm', 'b −', A.x1 - 30, A.y0 + 120, () => { b -= 2; }, 'Bajar la recta (b menos 2)'),
      ]);
    }));
    await d.say('student', `Rampa, b es dónde empieza, el día 0: 1. a es cuánto sube por día: 10. La escalera de Mara es y = 10 · x + 1. Con las perillas se elige cuál de la familia.`);
    d.evidence('params', {a, b, moves});
    // otra familia con perilla: las U y = a · x · x
    g.setCinematic(true);
    const olds = w.objects.filter(o => /^c12-/.test(o.id));
    await d.tween(0.5, q => { for (const o of olds) o.fade = 1 - q; });
    for (const o of olds) w.remove(o.id);
    g.setCinematic(false);
    await d.say('Rampa', 'Las U de las huertas también tienen perilla. Mi huerta nueva: con lado 2, quiero 8 de tierra.');
    const ub = {x: A.x0 + 40, y: A.y0 + 20, w: 260, h: 210};
    const U2 = axes(w, 'c12-ug', ub, [-3, 3], [0, 10], {xticks: [-2, 2], yticks: [4, 8], xname: 'x'});
    const UA = [{a: 0.5, ch: WHITE, t: 'a = 1/2'}, {a: 1, ch: BLUE, t: 'a = 1'}, {a: 2, ch: YELLOW, t: 'a = 2'}];
    for (const [i, u] of UA.entries()) {
      w.add(curve(`c12-u${i}`, x => u.a * x * x, [-3, 3], U2.px, U2.py, [0, 10], {ch: u.ch, n: 40}));
      const xl = Math.min(2.9, Math.sqrt(9.4 / u.a));
      w.add(new Label(`c12-ul${i}`, u.t, U2.px(xl) + 6, U2.py(u.a * xl * xl) + 4, {size: 15, z: 13, ch: u.ch}));
    }
    w.add(new Shape('c12-u28', dot('c12-u28', 6, YELLOW), U2.px(2), U2.py(8), {z: 14}));
    w.add(new Label('c12-u28l', '(2, 8)', U2.px(2) - 12, U2.py(8) - 8, {size: 16, align: 'right', z: 14}));
    d.describe('Tres U: y = a · x · x con a = 1/2, a = 1 y a = 2. Cuanto más grande es a, más angosta la U. Un punto en (2, 8).');
    const ua = await d.choose([
      {id: '2', text: 'a = 2: 2 · 2 · 2 = 8.'},
      {id: '1', text: 'a = 1: es la U de siempre, x · x.'},
      {id: '0.5', text: 'a = 1/2: la más abierta, para que entre más tierra.'},
    ], {prompt: '¿Qué perilla pasa por (2, 8)?', evaluate: true});
    d.evidence('params-u', {answer: ua});
    await d.think(ua === '2' ? 'a = 2: con x = 2, 2 · 4 = 8.' : ua === '1' ? 'Con a = 1 y x = 2 da 4, no 8. Hace falta a = 2: 2 · 4 = 8.' : 'Con a = 1/2 y x = 2 da 2. Más abierta es menos alta: hace falta a = 2, más angosta.');
    await d.say('student', 'Rampa, en las U la perilla a la estrecha o la abre: con a más grande, sube más rápido y queda más angosta. Para pasar por (2, 8), a = 2.');
    g.flags.c12params = true;
  },
};

// ——————————————————————————————————————————————
// 12.3 El salto de Punto (momento)
// ——————————————————————————————————————————————

export const salto = {
  id: 'c12.salto',
  title: 'El salto de Punto',
  moment: 'El salto de Punto',
  setup(g) {
    clean(g, /^c12-/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const s = w.get('student');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', 'Punto salta de alegría. Mara le midió la altura: a los t segundos está a 6t − t², y tarda 6 en volver al piso.');
    const box = {x: A.x0 + 40, y: A.y0 + 20, w: 330, h: 210};
    const {px, py} = axes(w, 'c12-g', box, [0, 6], [0, 10], {xticks: [1, 2, 3, 4, 5, 6], yticks: [3, 6, 9], xname: 't', yname: 'altura'});
    const pre = await d.choose([
      {id: '3', text: 'A los 3: la mitad del salto.'},
      {id: '5', text: 'Cerca del final, a los 5.'},
      {id: '1', text: 'Enseguida, al segundo 1.'},
    ], {prompt: '¿Cuándo está más alto?', evaluate: true});
    d.evidence('jump-predict', {answer: pre});
    await d.shot(SHOTS.tiles, 0.8);
    // Punto recorre su propio salto
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, px(0), py(0), 0.4);
    const line = w.add(curve('c12-jump', jump, [0, 6], px, py, [0, 10], {n: 60}));
    line.progress = 0;
    await d.tween(1.6, q => { const t = 6 * q; p.x = px(t); p.y = py(jump(t)); line.progress = q; });
    g.setCinematic(false);
    d.describe('Punto recorre su salto sobre el mapa: sube, se frena arriba y baja hasta el piso en el 6.');
    const r = readParabola(-1, 6, 0);
    const found = new Set();
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá el punto más alto del salto y los dos lugares donde Punto está en el piso.']);
      const refresh = () => g.ui.setSpots([0, 1, 2, 3, 4, 5, 6].filter(t => !found.has(t)).map(t => rectSpot(`c12-p${t}`, `El salto a los ${t} segundos, altura ${jump(t)}`, {x: px(t) - 18, y: py(jump(t)) - 18, w: 36, h: 36}, () => tap(t))));
      const tap = t => {
        if (!ctl.alive()) return;
        const key = t === r.top[0] ? 'top' : r.zeros.includes(t) ? 'zero' : null;
        d.evidence('jump-tap', {t, key});
        if (!key) { g.note(`A los ${t}, Punto está a ${jump(t)}: ni en el piso ni en lo más alto.`); return; }
        found.add(t);
        w.add(new Shape(`c12-m${t}`, dot(`c12-m${t}`, 7, key === 'top' ? YELLOW : BLUE), px(t), py(jump(t)), {z: 15}));
        w.add(new Label(`c12-ml${t}`, key === 'top' ? `máximo: ${jump(t)}` : 'cero', px(t) + (t === 6 ? -10 : 8), py(jump(t)) - 12, {size: 16, align: t === 6 ? 'right' : 'left', z: 15, ch: key === 'top' ? YELLOW : BLUE}));
        g.audio.tap(0.2, 1.4);
        if (found.size === 3) { g.ui.setSpots([]); g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    await d.think(pre === '3' ? 'A los 3, la mitad: el salto es igual de los dos lados.' : 'A los 3, justo en la mitad: el salto es una U dada vuelta, igual de los dos lados.');
    await d.say('student', 'Cornisa, los ceros, 0 y 6, son cuando toca el piso. Entre 0 y 3 la altura crece; entre 3 y 6, decrece. Arriba, a los 3, el máximo: 9. Y la altura nunca es negativa mientras salta.');
    await studentWrites(d, g, 'c12-read', 'crece  0 → 3    máximo 9    decrece  3 → 6', A.x0 + 20, A.y1 - 4, {size: 18});
    follow(p, s);
    d.evidence('jump', r);
    // otra forma, la misma lectura: la caja de Cornisa (grado 3)
    g.setCinematic(true);
    const olds = w.objects.filter(o => /^c12-/.test(o.id));
    await d.tween(0.5, q => { for (const o of olds) o.fade = 1 - q; });
    for (const o of olds) w.remove(o.id);
    g.setCinematic(false);
    await d.say('Cornisa', 'Con una tabla de 6 por 6 hago cajas: corto un cuadrado de lado x en cada esquina y levanto los bordes. Entra x · (6 − 2x) · (6 − 2x).');
    const bb = {x: A.x0 + 40, y: A.y0 + 24, w: 300, h: 200};
    const B = axes(w, 'c12-bx', bb, [0, 3], [0, 18], {xticks: [1, 2, 3], yticks: [8, 16], xname: 'corte x', yname: 'lo que entra'});
    const bc = w.add(curve('c12-box', boxVolume, [0, 3], B.px, B.py, [0, 18], {ch: WHITE, n: 60}));
    bc.progress = 0;
    await d.draw(bc, 0.9, {sound: false});
    d.describe('El gráfico de lo que entra en la caja según el corte x: sale de 0, sube hasta 16 en x = 1 y baja hasta 0 en x = 3. No es igual de los dos lados.');
    const bxa = await d.choose([
      {id: '1', text: 'x = 1: donde el gráfico está más alto, 16.'},
      {id: '1.5', text: 'x = 1,5: en la mitad, como el salto.'},
      {id: '3', text: 'x = 3: el corte más grande.'},
    ], {prompt: '¿Con qué corte entra más?', evaluate: true});
    d.evidence('box-predict', {answer: bxa});
    w.add(new Shape('c12-bmax', dot('c12-bmax', 6, YELLOW), B.px(1), B.py(16), {z: 14}));
    w.add(new Label('c12-bmaxl', '(1, 16)', B.px(1) + 10, B.py(16) - 8, {size: 16, z: 14, ch: YELLOW}));
    await d.think(bxa === '1' ? 'Uno: entra 1 · 4 · 4 = 16.' : bxa === '1.5' ? 'Con 1,5 entra 1,5 · 3 · 3 = 13,5. La caja no es una U: el máximo no queda en la mitad, queda en x = 1, con 16.' : 'Con 3 el fondo mide 6 − 6 = 0: la caja no tiene fondo y no entra nada. Es un cero. El máximo está en x = 1, con 16.');
    await d.say('student', 'Cornisa, se lee igual que el salto: ceros en 0 y en 3, crece hasta x = 1, el máximo es 16, y después decrece. Pero no es una U: no es igual de los dos lados. Multiplicando, aparece x · x · x: es un polinomio de grado 3.');
    await studentWrites(d, g, 'c12-boxw', 'x · (6 − 2x) · (6 − 2x) = 4 · x · x · x − 24 · x · x + 36 · x', A.x0 + 16, A.y1 - 4, {size: 15});
    d.evidence('box', {max: boxVolume(1)});
    g.flags.c12jump = true;
  },
};

// ——————————————————————————————————————————————
// 12.4 Una tras otra
// ——————————————————————————————————————————————

export const encadenar = {
  id: 'c12.encadenar',
  title: 'Una tras otra',
  setup(g) {
    clean(g, /^c12-/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Puse dos máquinas en fila: «el doble más uno» y «por sí mismo». Si entra 2, ¿importa cuál va primero?');
    const box = (id, x, label) => {
      w.add(new Shape(id, poly(id, [[0, 0], [110, 0], [110, 60], [0, 60]], {w: 3}), x, A.y0 + 40, {z: 12}));
      w.add(new Label(`${id}l`, label, x + 55, A.y0 + 76, {size: 17, align: 'center', z: 13, ch: YELLOW}));
    };
    box('c12-m1', A.x0 + 120, '× 2 + 1');
    box('c12-m2', A.x0 + 280, 'x · x');
    w.add(new Drawing('c12-pipe', [S([[A.x0 + 230, A.y0 + 70], [A.x0 + 280, A.y0 + 70]], seedOf('c12-pipe'), {w: 2.4, p: 0.9})], {z: 12}));
    await d.shot(SHOTS.tiles, 0.8);
    const done = new Set();
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Probá los dos órdenes con el 2.']);
      const refresh = () => g.ui.setSpots([
        ...(done.has('ab') ? [] : [wordSpot('c12-ab', 'doble más uno, después por sí mismo', A.x0 + 230, A.y0 + 150, () => run('ab'), {label: 'Primero el doble más uno, después por sí mismo'})]),
        ...(done.has('ba') ? [] : [wordSpot('c12-ba', 'por sí mismo, después doble más uno', A.x0 + 230, A.y0 + 220, () => run('ba'), {label: 'Primero por sí mismo, después el doble más uno'})]),
      ]);
      const run = k => {
        if (!ctl.alive()) return;
        done.add(k);
        const v = k === 'ab' ? compose(sq, double1)(2) : compose(double1, sq)(2);
        const txt = k === 'ab' ? `2 → 5 → ${v}` : `2 → 4 → ${v}`;
        w.add(new Label(`c12-o${k}`, txt, A.x0 + 20, A.y0 + 140 + (done.size - 1) * 34, {size: 22, z: 12}));
        g.audio.tap(0.2, 1.3);
        d.describe(k === 'ab' ? `Primero el doble más uno: 5; después por sí mismo: ${v}.` : `Primero por sí mismo: 4; después el doble más uno: ${v}.`);
        d.evidence('compose', {k, v});
        if (done.size === 2) { g.ui.setSpots([]); g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    await d.think('25 y 9: el orden importa. Encadenar reglas es otra regla, y depende de cuál va primero.');
    const c = await d.choose([
      {id: 'right', text: 'Menos uno, y después la mitad.'},
      {id: 'swap', text: 'La mitad, y después menos uno.'},
      {id: 'neg', text: 'El doble menos uno.'},
    ], {prompt: '¿Qué máquina deshace «el doble más uno»?', evaluate: true});
    d.evidence('inverse-predict', {answer: c});
    await d.think(c === 'right' ? 'Se deshace en el orden contrario, como en el capítulo de la caja: 5 menos 1 es 4, la mitad, 2.' : `Con 5: ${c === 'swap' ? 'la mitad es 2,5, menos uno 1,5' : 'el doble menos uno es 9'}: no vuelve al 2. Se deshace en el orden contrario: menos uno, la mitad.`);
    if (undoDouble1(double1(2)) !== 2) console.error('[encadenar] deshacer no vuelve');
    const c2 = await d.choose([
      {id: 'both', text: '3 o −3: con el 9 solo no se sabe.'},
      {id: '3', text: '3.'},
      {id: 'm3', text: '−3.'},
    ], {prompt: 'Si «por sí mismo» dio 9, ¿qué entró?', evaluate: true});
    d.evidence('inverse-square', {answer: c2});
    await d.say('student', 'Mara, «el doble más uno» se deshace siempre. «Por sí mismo», no: el 9 puede venir del 3 o del −3. Sólo se deshace si sabemos el signo; con los lados de las huertas, que son positivos, la raíz lo deshace.');
    await studentWrites(d, g, 'c12-inv', '× 2 + 1  ↔  − 1, ÷ 2        x · x  ↔  √ (si x ≥ 0)', A.x0 + 20, A.y1 - 6, {size: 17});
    // la raíz, dibujada: el gráfico de x · x (con x ≥ 0) dado vuelta sobre la diagonal
    const gb = {x: A.x0 + 330, y: A.y0 + 110, w: 104, h: 104};
    const ga = axes(w, 'c12-rg', gb, [0, 4], [0, 4], {xticks: [2, 4], yticks: [2, 4]});
    w.add(new Drawing('c12-rd', Array.from({length: 10}, (_, k) => S([[ga.px(k * 0.4), ga.py(k * 0.4)], [ga.px(k * 0.4 + 0.2), ga.py(k * 0.4 + 0.2)]], seedOf('c12-rd') + k, {w: 2, p: 0.85, ch: BLUE, lift: false})), {z: 12}));
    g.setCinematic(true);
    const sqc = w.add(curve('c12-rsq', x => x * x, [0, 2], ga.px, ga.py, [0, 4], {ch: WHITE, n: 30}));
    sqc.progress = 0;
    await d.draw(sqc, 0.6, {sound: false});
    w.add(new Shape('c12-r24', dot('c12-r24', 4, WHITE), ga.px(2), ga.py(4), {z: 14}));
    w.add(new Label('c12-r24l', '(2, 4)', ga.px(2) - 8, ga.py(4) + 4, {size: 13, align: 'right', z: 14}));
    const rtc = w.add(curve('c12-rrt', x => Math.sqrt(x), [0, 4], ga.px, ga.py, [0, 4], {ch: YELLOW, n: 40}));
    rtc.progress = 0;
    await d.draw(rtc, 0.6, {sound: false});
    w.add(new Shape('c12-r42', dot('c12-r42', 4, YELLOW), ga.px(4), ga.py(2), {z: 14}));
    w.add(new Label('c12-r42l', '(4, 2)', ga.px(4) + 6, ga.py(2) + 16, {size: 13, z: 14, ch: YELLOW}));
    w.add(new Label('c12-rsql', 'x · x', ga.px(0.15), ga.py(3.1), {size: 14, z: 13}));
    w.add(new Label('c12-rrtl', '√x', ga.px(2.8), ga.py(1.67) - 10, {size: 15, align: 'center', z: 13, ch: YELLOW}));
    g.setCinematic(false);
    d.describe('Un mapa chico, de 0 a 4 en los dos ejes: x · x en blanco hasta (2, 4), la raíz en amarillo hasta (4, 2), y la diagonal punteada en azul. Las dos curvas son una el reflejo de la otra sobre la diagonal.');
    await d.say('student', 'Dibujadas para x desde 0, la raíz es x · x dada vuelta sobre la diagonal: se cambian la entrada y la salida. 2 va a 4 en una; 4 vuelve a 2 en la otra: (2, 4) y (4, 2). Cada punto (a, b) de una es el (b, a) de la otra.');
    await d.say('student', 'Es la familia de las raíces. Como la del «¿cuántas veces?», sube cada vez más despacio, pero arranca en el 0 con valor 0; aquella, cerca del 0, baja sin fin.');
    g.flags.c12inverse = true;
  },
};

export {lerp, pulse, dec};
