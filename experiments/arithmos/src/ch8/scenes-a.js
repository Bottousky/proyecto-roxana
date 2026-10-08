// Capítulo 8 — Formas (8.1 a 8.4): la diagonal que no cae, la vuelta, copias y el doble de grande.

import {Label, Shape, Drawing} from '../engine/world.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {nearMisses, descend, scale as scaleBy} from '../logic/geometry.js';
import {GROUND, SHOTS, area, base, boardCast, clean, poly, gridSquare, wedge, angleOf, plate, S, seedOf, WHITE, YELLOW, BLUE} from './common.js';
import {studentWrites} from '../ch7/scenes-a.js';
import * as art from '../art.js';

const sq = (id, s, opts) => poly(id, [[0, 0], [s, 0], [s, s], [0, s]], opts);

// ——————————————————————————————————————————————
// 8.1 La diagonal que no cae
// ——————————————————————————————————————————————

export const diagonal = {
  id: 'c8.diagonal',
  title: 'La diagonal que no cae',
  setup(g) {
    g.world.clear();
    base(g);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const s = w.get('student');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Peldaño', 'Partí el lado del cuadro en doce y la diagonal no cayó en ninguna rayita. ¿En cuántas lo parto para que caiga justo?');
    await d.say('student', 'Si partiendo el lado en q cayera justo, la diagonal mediría p de esas rayitas. Con esa rayita chica, el cuadrado del lado tendría q · q cuadraditos, y el de la diagonal, p · p.');
    await d.think('Y el cuadrado de la diagonal es el de los dos cuadros: tendría que ser p · p = 2 · q · q, justo.');
    w.add(new Label('c8-goal', 'p · p = 2 · q · q', A.x0 + 20, A.y0 + 30, {size: 26, z: 12, ch: YELLOW}));
    await d.shot(SHOTS.tiles, 0.8);
    // probar con cuadrados de cuadraditos
    const QS = [2, 3, 5, 7, 12];
    const U = 7;
    const tried = [];
    const show = q => {
      w.removeWhere(o => o.id.startsWith('c8-t'));
      const r = nearMisses(q)[q - 1];
      const x0 = A.x0 + 20, y0 = A.y0 + 56;
      w.add(new Shape('c8-tp', gridSquare(`c8-tp${q}`, r.p, U), x0, y0, {z: 13}));
      w.add(new Shape('c8-tq1', gridSquare(`c8-tq1${q}`, q, U, BLUE), x0 + r.p * U + 24, y0, {z: 13}));
      w.add(new Shape('c8-tq2', gridSquare(`c8-tq2${q}`, q, U, BLUE), x0 + r.p * U + 24 + q * U + 8, y0, {z: 13}));
      const ly = y0 + 17 * U + 30;
      w.add(new Label('c8-tl', `en ${q}: la diagonal, casi ${r.p}.   ${r.p} · ${r.p} = ${r.pp}    2 · ${q} · ${q} = ${r.twoQq}`, x0, ly, {size: 19, z: 12}));
      w.add(new Label('c8-td', r.diff > 0 ? `sobra${r.diff === 1 ? ' un cuadradito' : `n ${r.diff} cuadraditos`}` : `falta${r.diff === -1 ? ' un cuadradito' : `n ${-r.diff} cuadraditos`}`, x0, ly + 28, {size: 22, z: 12, ch: YELLOW}));
      d.describe(`Partiendo en ${q}: un cuadrado de ${r.p} por ${r.p} tiene ${r.pp} cuadraditos; dos de ${q} por ${q} tienen ${r.twoQq}. No da justo.`);
      return r;
    };
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Elegí en cuántas partes partir el lado y compará el cuadrado grande con los dos chicos.', 'Probá varias.']);
      const refresh = () => g.ui.setSpots(QS.filter(q => !tried.includes(q)).map(q => {
        const i = QS.indexOf(q);
        return wordSpot(`c8-q${q}`, `en ${q}`, A.x1 - 140 + (i % 2) * 100, A.y0 + 40 + Math.floor(i / 2) * 72, () => tryQ(q), {label: `Partir el lado en ${q}`});
      }));
      const tryQ = async q => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        tried.push(q);
        const r = show(q);
        d.evidence('near-miss', {q, p: r.p, diff: r.diff});
        g.audio.tap(0.15, 1.1 + tried.length * 0.05);
        try { await d.wait(0.6); } catch { return; }
        busy = false;
        if (tried.length >= 3) { g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    await d.say('Mara', 'Una noche probé hasta mil. Siempre faltó o sobró, a veces uno solo.');
    const c = await d.choose([
      {id: 'more', text: 'Hay que seguir probando: alguno va a caer.'},
      {id: 'enough', text: 'Ya se probaron mil: no hay ninguno.'},
      {id: 'arg', text: 'Probando no se termina nunca: hace falta una razón.'},
    ], {prompt: 'Siempre falta o sobra un poco. ¿Y ahora?', evaluate: true});
    d.evidence('proof-need', {answer: c});
    if (c !== 'arg') await d.say('student', c === 'more' ? 'Los números no se terminan: probando, nunca se sabe si el siguiente cae.' : 'Mil no son todos: el mil uno podría caer. Hace falta una razón que sirva para todos.');
    // el argumento: si hubiera un par, habría otro más chico
    g.setCinematic(true);
    w.removeWhere(o => o.id.startsWith('c8-t'));
    g.setCinematic(false);
    const P = 168, Q = P / Math.SQRT2;
    const bx = A.x0 + 24, by = A.y0 + 64;
    w.add(new Label('c8-sup', 'si cumplieran justo:', bx, by - 14, {size: 18, z: 12, ch: YELLOW}));
    w.add(new Shape('c8-P', sq('c8-P', P, {w: 3}), bx, by, {z: 13}));
    w.add(new Label('c8-Pl', 'p', bx + P / 2, by + P + 24, {size: 22, align: 'center', z: 12}));
    const qa = w.add(new Shape('c8-Qa', sq('c8-Qa', Q, {ch: BLUE, hatch: 10}), A.x1 - Q - 10, A.y0 + 10, {z: 14}));
    const qb = w.add(new Shape('c8-Qb', sq('c8-Qb', Q, {ch: BLUE, hatch: 10}), A.x1 - Q - 10, A.y0 + 10 + Q + 8, {z: 14}));
    qb.fade = 0.9;
    await d.say('student', 'Supongamos que hubiera enteros p y q que cumplen. El de p tiene tanto lugar como los dos de q juntos. La diagonal es más larga que el lado y más corta que dos lados: q es menos que p, y p menos que 2q. Entonces cada cuadrado de q entra en el de p, y los dos juntos se pisan.');
    // el jugador elige en qué esquina va cada cuadrado de q
    const m = 2 * Q - P, e = P - Q;
    const CORNERS = {tl: [0, 0], tr: [P - Q, 0], bl: [0, P - Q], br: [P - Q, P - Q]};
    const NAMES = {tl: 'arriba a la izquierda', tr: 'arriba a la derecha', bl: 'abajo a la izquierda', br: 'abajo a la derecha'};
    const home = [[A.x1 - Q - 10, A.y0 + 10], [A.x1 - Q - 10, A.y0 + 10 + Q + 8]];
    const slide = async (t, x, y, sec = 0.5) => { const sx0 = t.x, sy0 = t.y; await d.tween(sec, k => { t.x = lerp(sx0, x, k); t.y = lerp(sy0, y, k); }, easeInOut); };
    const box = (id, x, y, wd, h, ch, hatch) => new Shape(id, poly(id, [[0, 0], [wd, 0], [wd, h], [0, h]], {ch, hatch, w: 2.6}), x, y, {z: 15, fade: 0});
    await d.say('Peldaño', 'Buscamos otro par más chico: un cuadrado con tanto lugar como dos cuadrados iguales. ¿En qué esquinas del grande ponés los dos de q para que aparezca? Tocá una esquina para cada uno.');
    // las cuatro esquinas, marcadas en tiza mientras se elige
    const cornerMarks = () => w.add(new Drawing('c8-cormk', Object.values(CORNERS).flatMap(([cx, cy], k) => {
      const x = bx + (cx ? P - 8 : 8), y = by + (cy ? P - 8 : 8), sx = cx ? -1 : 1, sy = cy ? -1 : 1;
      return [S([[x, y + sy * 26], [x, y], [x + sx * 26, y]], seedOf('c8-cormk') + k, {w: 3, p: 0.95, ch: YELLOW, lift: false})];
    }), {z: 16}));
    let where;
    for (let attempt = 0; ; attempt++) {
      where = [];
      for (const [n, t] of [qa, qb].entries()) {
        cornerMarks();
        const k = await d.interact(ctl => new Promise(resolve => {
          g.setHint(() => [`Tocá la esquina del cuadrado grande donde va el ${n ? 'otro' : 'primer'} cuadrado azul.`, 'Mirá qué forma tiene lo que se pisa y qué forma tiene lo que queda sin tapar.']);
          g.ui.setSpots([
            ...Object.entries(CORNERS).map(([id, [cx, cy]]) => rectSpot(`c8-cor-${id}`, `Poner el cuadrado de q ${NAMES[id]}`, {x: bx + cx + (cx ? Q - 52 : 4), y: by + cy + (cy ? Q - 52 : 4), w: 48, h: 48}, () => { if (ctl.alive()) resolve(id); })),
            // tocar el azul también vale como pregunta: se le dice qué hacer
            ...[qa, qb].filter((b, bi) => bi >= n).map(b => rectSpot(`c8-qhome-${b.id}`, 'Un cuadrado de q', () => ({x: b.x, y: b.y, w: Q, h: Q}), () => g.note('Tocá la esquina del cuadrado grande donde va.'))),
          ]);
        }));
        g.setHint(null);
        w.remove('c8-cormk');
        where.push(k);
        await slide(t, bx + CORNERS[k][0], by + CORNERS[k][1]).catch(() => {});
        g.audio.tap(0.2, 1.3 + n * 0.1);
      }
      const [k1, k2] = where;
      const [ax, ay] = CORNERS[k1], [cx2, cy2] = CORNERS[k2];
      const opposite = ax !== cx2 && ay !== cy2;
      d.evidence('proof-corners', {where: [...where], opposite});
      if (opposite) break;
      // se marca un momento lo pisado (amarillo) y lo que queda sin tapar (blanco), para ver su forma
      const ox0 = Math.max(ax, cx2), oy0 = Math.max(ay, cy2), ow = Math.min(ax, cx2) + Q - ox0, oh = Math.min(ay, cy2) + Q - oy0;
      const flash = [w.add(box('c8-flo', bx + ox0, by + oy0, ow, oh, YELLOW, 6))];
      if (k1 !== k2) {
        const free = ay === cy2 ? [0, ay ? 0 : Q, P, P - Q] : [ax ? 0 : Q, 0, P - Q, P];
        flash.push(w.add(box('c8-flf', bx + free[0], by + free[1], free[2], free[3], WHITE, 0)));
      }
      await d.all(...flash.map(f => d.fadeTo(f, 1, 0.4))).catch(() => {});
      d.describe(k1 === k2 ? 'Los dos azules quedan uno encima del otro.' : 'Lo pisado, en amarillo, es un rectángulo; lo que queda sin tapar, en blanco, es otro rectángulo.');
      await d.say('Peldaño', k1 === k2
        ? 'Uno encima del otro se tapan enteros, y no se ve nada nuevo. Probá en otras esquinas.'
        : 'Así lo pisado es un rectángulo, y lo que queda sin tapar, otro rectángulo: no son cuadrados, no dan otro par. Probá en otras esquinas.');
      for (const f of flash) w.remove(f.id);
      await d.all(slide(qa, home[0][0], home[0][1], 0.4), slide(qb, home[1][0], home[1][1], 0.4)).catch(() => {});
    }
    // lo pisado dos veces (en el medio) y las dos esquinas sin tapar, según dónde quedaron
    const freeAt = CORNERS[where[0]][0] === 0 && CORNERS[where[0]][1] === 0 || CORNERS[where[1]][0] === 0 && CORNERS[where[1]][1] === 0
      ? [[bx + Q, by], [bx, by + Q]] : [[bx, by], [bx + Q, by + Q]];
    g.setCinematic(true);
    const mid = w.add(new Shape('c8-mid', sq('c8-mid', m, {ch: YELLOW, hatch: 6, w: 3}), bx + P - Q, by + P - Q, {z: 15, fade: 0}));
    const c1 = w.add(new Shape('c8-c1', sq('c8-c1', e, {ch: WHITE, w: 2}), freeAt[0][0], freeAt[0][1], {z: 15, fade: 0}));
    const c2 = w.add(new Shape('c8-c2', sq('c8-c2', e, {ch: WHITE, w: 2}), freeAt[1][0], freeAt[1][1], {z: 15, fade: 0}));
    await d.all(d.fadeTo(mid, 1, 0.6), d.fadeTo(c1, 1, 0.6), d.fadeTo(c2, 1, 0.6));
    w.add(new Label('c8-midl', '2q − p', bx + P - Q + m / 2, by + P - Q + m / 2 + 6, {size: 16, align: 'center', z: 16, ch: YELLOW}));
    d.describe('Los dos cuadrados azules se pisan en un cuadrado del medio, en amarillo, y dejan sin tapar dos esquinas iguales.');
    g.setCinematic(false);
    // el jugador elige qué tiene que tener tanto lugar como lo pisado
    await d.say('Peldaño', 'Los dos de q juntos tienen tanto lugar como el de p. Lo amarillo se tapó dos veces: ¿qué parte del cuadrado grande tiene que tener tanto lugar como lo amarillo?');
    const found = new Set();
    // la cuadrícula de 3 × 3 que forman los bordes: el medio es lo pisado, dos esquinas están libres, el resto lo tapó un solo azul
    const cuts = [0, P - Q, Q, P];
    const once = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      if (r === 1 && c === 1) continue;
      const x = bx + cuts[c], y = by + cuts[r];
      if (freeAt.some(([fx, fy]) => Math.abs(fx - x) < 1 && Math.abs(fy - y) < 1)) continue;
      once.push({x, y, w: cuts[c + 1] - cuts[c], h: cuts[r + 1] - cuts[r]});
    }
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá la parte del cuadrado grande que tiene que tener tanto lugar como lo amarillo.', 'Lo amarillo lo cuentan los dos azules; hay partes del grande que no cuenta ninguno.']);
      const refresh = () => g.ui.setSpots([
        ...[c1, c2].filter(c => !found.has(c.id)).map(c => rectSpot(`${c.id}-pick`, 'Una esquina sin tapar del cuadrado grande', {x: c.x + 2, y: c.y + 2, w: e - 4, h: e - 4}, () => {
          if (!ctl.alive()) return;
          found.add(c.id);
          w.add(new Label(`${c.id}l`, 'p − q', c.x + e / 2, c.y + e / 2 + 6, {size: 15, align: 'center', z: 16}));
          g.audio.tap(0.15, 1.3 + found.size * 0.1);
          d.evidence('proof-compare', {pick: 'corner'});
          if (found.size === 2) { g.ui.setSpots([]); g.setHint(null); resolve(); return; }
          g.note('Una. ¿Hay otra parte que no tapó ningún azul?');
          refresh();
        })),
        rectSpot('c8-mid-pick', 'El cuadrado amarillo, lo pisado dos veces', {x: mid.x + 4, y: mid.y + 4, w: m - 8, h: m - 8}, () => {
          if (!ctl.alive()) return;
          d.evidence('proof-compare', {pick: 'mid'});
          g.note('Eso es lo amarillo mismo. ¿Qué parte del cuadrado grande no tapó ningún azul?');
        }),
        ...once.map((o, k) => rectSpot(`c8-once${k}`, 'Una parte tapada por un solo azul', {x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 4}, () => {
          if (!ctl.alive()) return;
          d.evidence('proof-compare', {pick: 'once'});
          g.note('Eso lo tapó un solo azul: cuenta una vez en los dos de q y una vez en el de p, así que se compensa. Buscá lo que no tapó ningún azul.');
        })),
      ]);
      refresh();
    }));
    await d.say('student', 'Los dos de q juntos tienen tanto lugar como el de p. Lo amarillo lo cuentan los dos azules; las esquinas, ninguno. Entonces lo amarillo tiene tanto lugar como las dos esquinas juntas.');
    await d.think('Un cuadrado, el del medio, con tanto lugar como dos cuadrados, las esquinas. Otro par que cumpliría. Sus lados, 2q − p y p − q, son enteros, y positivos porque q < p < 2q. Y más chicos que p y q.');
    // bajar: más chico, y más chico
    let level = 0;
    const draws = [];
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá "más chico": el par nuevo hace lo mismo.']);
      const refresh = () => g.ui.setSpots([wordSpot('c8-down', 'más chico', A.x1 - 80, A.y1 - 30, () => down(), {label: 'Hacer lo mismo con el par más chico'})]);
      const down = async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        level++;
        const Pk = P * (Math.SQRT2 - 1) ** level, Qk = Pk / Math.SQRT2;
        const x = bx + P + 30 + (level - 1) * 92, y = by + 20;
        const ids = [`c8-L${level}`, `c8-L${level}a`, `c8-L${level}b`, `c8-L${level}m`];
        draws.push(...ids);
        w.add(new Shape(ids[0], sq(ids[0], Pk, {w: 2.4}), x, y, {z: 13, progress: 0}));
        try {
          await d.draw(w.get(ids[0]), 0.4, {sound: false});
          w.add(new Shape(ids[1], sq(ids[1], Qk, {ch: BLUE, w: 2}), x, y, {z: 14}));
          w.add(new Shape(ids[2], sq(ids[2], Qk, {ch: BLUE, w: 2}), x + Pk - Qk, y + Pk - Qk, {z: 14}));
          w.add(new Shape(ids[3], sq(ids[3], 2 * Qk - Pk, {ch: YELLOW, w: 2}), x + Pk - Qk, y + Pk - Qk, {z: 15}));
          d.describe(`Otro cuadrado, más chico, con sus dos cuadrados adentro: ${level === 1 ? 'el par nuevo' : 'y otro más'}.`);
          g.audio.tap(0.15, 1.6 + level * 0.15);
          await d.wait(0.5);
        } catch { return; }
        busy = false;
        if (level >= 2) { g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    g.audio.punto('question');
    await pulse(d, p, 1, 0.3);
    const c2a = await d.choose([
      {id: 'forever', text: 'Para siempre: cada par da otro más chico.'},
      {id: 'one', text: 'No para siempre: los enteros positivos llegan a 1 y no bajan más.'},
      {id: 'chalk', text: 'Hasta que no se pueda dibujar.'},
    ], {prompt: 'Si hubiera un par de enteros que cumple, ¿hasta cuándo se podría seguir achicando?', evaluate: true});
    d.evidence('descent', {answer: c2a, example: [descend(7, 5), descend(3, 2)]});
    if (c2a === 'forever') await d.think('Eso dice la regla: cada par que cumple da otro más chico. Pero con enteros positivos no se puede bajar para siempre: q, uno menor, otro menor… en algún momento no hay más. Las dos cosas a la vez no pueden ser.');
    if (c2a === 'one') await d.think('Exacto: los enteros no bajan para siempre. Y sin embargo, si el par cumpliera, siempre habría otro más chico. Las dos cosas a la vez no pueden ser.');
    if (c2a === 'chalk') await d.think('El dibujo se acaba, pero el razonamiento no depende del dibujo. Si el par cumpliera, siempre habría otro más chico; y los enteros positivos no bajan para siempre. Las dos cosas a la vez no pueden ser.');
    await d.say('student', 'Punto, si hubiera un par de enteros que cumple, habría otro más chico, y otro, sin fin. Pero los enteros positivos no bajan para siempre. La suposición lleva a algo imposible: no hay ningún par.');
    // la Marea se lleva los dibujos; el razonamiento queda
    g.setCinematic(true);
    d.describe('Pasa una brisa de borrador: los cuadrados dibujados se deshacen. La cuenta de arriba, p · p = 2 · q · q, queda.');
    g.audio.erase(1.2, 0.5);
    g.camera.shake = 0.15;
    const pics = w.objects.filter(o => /^c8-(P|Pl|Qa|Qb|mid|midl|c1|c1l|c2|c2l|sup|L\d)/.test(o.id));
    await d.all(...pics.map(o => d.fadeTo(o, 0, 1.2)));
    for (const o of pics) w.remove(o.id);
    g.setCinematic(false);
    await studentWrites(d, g, 'c8-arg', 'si p y q cumplen →', A.x0 + 20, A.y0 + 90, {size: 20});
    await studentWrites(d, g, 'c8-arg2', '2q − p  y  p − q  también cumplen, y son más chicos', A.x0 + 40, A.y0 + 120, {size: 20});
    await studentWrites(d, g, 'c8-no', '√2 no es una fracción', A.x0 + 20, A.y0 + 176, {size: 30});
    await d.think('El dibujo mostraba lo que pasaría si existiera el par, y con un dibujo no se distingue un largo de un entero. Lo que prueba es el razonamiento, y vale para todos los p y q a la vez. Probando casos, en cambio, nunca se termina.');
    await d.say('Peldaño', 'En la puerta dejo √2, que es exacto. Y abajo, chiquito: «1,414 y un poco más».');
    // la puerta del primer día, apenas: lo que se entiende la va redibujando
    const door1 = w.add(new Drawing('c8-door1', art.doorFrame('c8-door1', 15890, GROUND, 150, 270), {z: 2, fade: 0}));
    await d.shot({x: 14820, y: GROUND - 440, w: 1200, h: 500}, 1.2);
    await d.fadeTo(door1, 0.2, 1.4);
    d.describe('Más allá de las Terrazas, apenas, se ve el contorno de una puerta: la del primer día.');
    await d.think('Peldaño tiene su puerta, con √2. Allá, después de las Terrazas, se ve apenas otra: la del primer día. Antes no estaba.');
    void s;
    d.evidence('irrational', {nearest: nearMisses(12).slice(-1)[0]});
    g.flags.c8irr = true;
  },
};

// ——————————————————————————————————————————————
// 8.2 La vuelta
// ——————————————————————————————————————————————

export const vuelta = {
  id: 'c8.vuelta',
  title: 'La vuelta',
  setup(g) {
    clean(g, /^c8-/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', 'Voy a cortar tejas triangulares. El carpintero dice que las tres puntas juntas siempre hacen lo mismo. ¿Lo mismo que qué?');
    const Pa = [A.x0 + 40, A.y0 + 196], Pb = [A.x0 + 270, A.y0 + 196], Pc = [A.x0 + 104, A.y0 + 48];
    w.add(new Shape('c8-tri', poly('c8-tri', [Pa, Pb, Pc], {hatch: 12}), 0, 0, {z: 12}));
    w.add(new Label('c8-nA', 'A', Pa[0] - 14, Pa[1] + 18, {size: 20, z: 12, align: 'center'}));
    w.add(new Label('c8-nB', 'B', Pb[0] + 14, Pb[1] + 18, {size: 20, z: 12, align: 'center'}));
    w.add(new Label('c8-nC', 'C', Pc[0], Pc[1] - 12, {size: 20, z: 12, align: 'center'}));
    const ang = (o, a, b) => {
      const s0 = angleOf(a[0] - o[0], a[1] - o[1]);
      let sw = angleOf(b[0] - o[0], b[1] - o[1]) - s0;
      while (sw < 0) sw += Math.PI * 2;
      return {start: s0, sweep: sw};
    };
    // cada punta: de un lado al otro, en sentido horario de la pantalla
    const corners = [
      {k: 'A', at: Pa, ...ang(Pa, Pc, Pb)},
      {k: 'B', at: Pb, ...ang(Pb, Pa, Pc)},
      {k: 'C', at: Pc, ...ang(Pc, Pb, Pa)},
    ];
    const deg = r => Math.round(r * 180 / Math.PI);
    if (deg(corners[0].sweep + corners[1].sweep + corners[2].sweep) !== 180) console.error('[vuelta] las puntas no suman media vuelta');
    const O = [A.x0 + 400, A.y0 + 196];
    w.add(new Shape('c8-line', poly('c8-line', [[-96, 0], [96, 0]], {closed: false, w: 2.6}), O[0], O[1], {z: 12}));
    const wedges = corners.map(c => w.add(new Shape(`c8-w${c.k}`, wedge(`c8-w${c.k}`, c.sweep, 40, YELLOW), c.at[0], c.at[1], {z: 14, rot: c.start, fade: 0.55})));
    d.describe('En la pizarra, un triángulo con las puntas A, B y C marcadas en amarillo, y a la derecha una línea recta.');
    await d.shot(SHOTS.tiles, 0.8);
    let acc = Math.PI;
    const moved = new Set();
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá cada punta del triángulo: se recorta y va a la línea de la derecha, una al lado de la otra.']);
      const refresh = () => g.ui.setSpots(corners.filter(c => !moved.has(c.k)).map(c => rectSpot(`c8-cut${c.k}`, `Recortar la punta ${c.k}`, {x: c.at[0] - 26, y: c.at[1] - 26, w: 52, h: 52}, () => cut(c))));
      const cut = async c => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        moved.add(c.k);
        const wd = w.get(`c8-w${c.k}`);
        const sx0 = wd.x, sy0 = wd.y, r0 = wd.rot, r1 = acc;
        acc += c.sweep;
        g.audio.erase(0.25, 0.3);
        try { await d.tween(0.7, k => { wd.x = lerp(sx0, O[0], k); wd.y = lerp(sy0, O[1], k); wd.rot = lerp(r0, r1, k); wd.fade = lerp(0.55, 1, k); }, easeInOut); } catch { return; }
        g.audio.tap(0.2, 1.2 + moved.size * 0.1);
        d.evidence('angle-cut', {corner: c.k, deg: deg(c.sweep)});
        busy = false;
        if (moved.size === 3) { g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    d.describe('Las tres puntas, una al lado de la otra sobre la línea, la cubren justo de un lado: media vuelta.');
    await d.think('Las tres puntas juntas hacen la línea recta: media vuelta.');
    await d.say('student', 'Media vuelta es lo que gira Punto para mirar para atrás. Si la vuelta entera se parte en 360 partes, los grados, media vuelta son 180.');
    const c = await d.choose([
      {id: 'why', text: 'Con este pasó; para saber si pasa con todos, hace falta una razón.'},
      {id: 'yes', text: 'Pasa con todos: ya lo vimos.'},
      {id: 'no', text: 'Con otro triángulo daría distinto.'},
    ], {prompt: 'Cornisa va a cortar tejas de muchas formas. ¿Pasa con todos los triángulos?', evaluate: true});
    d.evidence('angle-general', {answer: c});
    if (c === 'yes') await d.think('Vimos uno. Recortar y juntar con todos no se puede.');
    // la paralela por C
    g.setCinematic(true);
    const par = w.add(new Shape('c8-par', poly('c8-par', [[-88, 0], [200, 0]], {closed: false, w: 2, ch: BLUE}), Pc[0], Pc[1], {z: 12, progress: 0}));
    await d.draw(par, 0.7, {sound: false});
    g.setCinematic(false);
    await d.say('student', 'Por la punta de arriba, una recta paralela a la de abajo: no se cruzan nunca.');
    const sA = corners[0], sB = corners[1];
    const leftAtC = w.add(new Shape('c8-wCa', wedge('c8-wCa', sA.sweep, 46, BLUE), Pc[0], Pc[1], {z: 14, rot: Math.PI - sA.sweep, fade: 0}));
    const rightAtC = w.add(new Shape('c8-wCb', wedge('c8-wCb', sB.sweep, 46, BLUE), Pc[0], Pc[1], {z: 14, rot: 0, fade: 0}));
    await d.all(d.fadeTo(leftAtC, 1, 0.5), d.fadeTo(rightAtC, 1, 0.5));
    d.describe('Arriba, entre la paralela y los lados, quedan dos ángulos marcados en azul: uno a la izquierda de C y otro a la derecha.');
    // ¿a cuál de abajo es igual?
    let hits = 0;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => [
        'Arriba, a la izquierda de C, hay un ángulo azul. ¿Qué ángulo de abajo es igual a él? Tocalo.',
        'El ángulo azul de la izquierda tiene un lado sobre AC. ¿Cuál de los dos ángulos de abajo también tiene un lado sobre AC?',
      ]);
      const pick = k => {
        if (!ctl.alive()) return;
        hits++;
        d.evidence('alt-angle', {pick: k});
        if (k !== 'A') { g.note('Ese está del otro lado del triángulo. El de la izquierda, arriba, y el de A se apoyan en el mismo lado, AC, como una zeta.'); return; }
        g.ui.setSpots([]);
        g.setHint(null);
        resolve();
      };
      g.ui.setSpots([
        rectSpot('c8-alt-A', 'El ángulo de abajo en A', {x: Pa[0] - 4, y: Pa[1] - 40, w: 60, h: 44}, () => pick('A')),
        rectSpot('c8-alt-B', 'El ángulo de abajo en B', {x: Pb[0] - 56, y: Pb[1] - 40, w: 60, h: 44}, () => pick('B')),
      ]);
    }));
    await d.think('Con dos paralelas, el lado AC está igual de inclinado contra las dos: el ángulo de A y el de arriba a la izquierda son iguales. Lo mismo B, del otro lado.');
    await d.say('student', 'Cornisa, arriba, sobre la paralela, quedan el de A, el de C y el de B, uno al lado del otro: media vuelta. No usé ninguna medida de este triángulo: vale para cualquiera.');
    await studentWrites(d, g, 'c8-sum', '∠A + ∠B + ∠C = 180°', A.x0 + 190, A.y1 - 14, {size: 26});
    await d.think('En un plano, como la pizarra o el piso. Sobre una pelota, un triángulo grande suma más: ahí no hay paralelas que no se crucen.');
    d.evidence('angles', {A: deg(corners[0].sweep), B: deg(corners[1].sweep), C: deg(corners[2].sweep), wrongPicks: hits - 1});
    g.flags.c8angle = true;
  },
};

// ——————————————————————————————————————————————
// 8.3 Copias
// ——————————————————————————————————————————————

const L = [[0, 0], [28, 0], [28, 42], [63, 42], [63, 63], [0, 63]];

export const copias = {
  id: 'c8.copias',
  title: 'Copias',
  setup(g) {
    clean(g, /^c8-/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', 'Mi ventana tiene esta forma de ele. Me trajeron cuatro marcos. ¿Cuáles son copias de la mía?');
    const ox = A.x0 + 20, oy = A.y0 + 40;
    w.add(new Shape('c8-orig', poly('c8-orig', L, {hatch: 8}), ox, oy, {z: 12}));
    w.add(new Label('c8-origl', 'la de Cornisa', ox + 32, oy + 90, {size: 16, align: 'center', z: 12}));
    // los candidatos: girado, dado vuelta, agrandado, estirado
    const cands = [
      {id: 'rot', op: 'girar', x: A.x0 + 300, y: A.y0 + 24, make: id => new Shape(id, poly(id, L, {ch: BLUE}), 0, 0, {z: 14, rot: Math.PI / 2})},
      {id: 'flip', op: 'dar vuelta', x: A.x0 + 400, y: A.y0 + 24, make: id => { const sh = new Shape(id, poly(id, L, {ch: BLUE}), 0, 0, {z: 14}); sh.sx = -1; return sh; }},
      {id: 'big', op: 'achicar a la mitad', x: A.x0 + 300, y: A.y0 + 110, make: id => new Shape(id, poly(id, L, {ch: BLUE}), 0, 0, {z: 14, scale: 2})},
      {id: 'wide', op: 'no hay manera', x: A.x0 + 20, y: A.y0 + 190, make: id => new Shape(id, poly(id, L.map(([x, y]) => [x * 2, y]), {ch: BLUE}), 0, 0, {z: 14})},
    ];
    // lugar de cada uno (su esquina visible arriba a la izquierda)
    const offset = c => (c.id === 'rot' || c.id === 'flip' ? 63 : 0);
    // esquina superior izquierda de la caja del marco, según su giro, espejo y escala (para apoyarlo sobre la ventana)
    const minCorner = (c, rot, fx, sc) => {
      const [W, H] = c.id === 'wide' ? [126, 63] : [63, 63];
      let mx = Infinity, my = Infinity;
      for (const [qx, qy] of [[0, 0], [W, 0], [W, H], [0, H]]) {
        const X = sc * fx * qx, Y = sc * qy;
        mx = Math.min(mx, Math.cos(rot) * X - Math.sin(rot) * Y);
        my = Math.min(my, Math.sin(rot) * X + Math.cos(rot) * Y);
      }
      return [mx, my];
    };
    for (const c of cands) {
      c.sh = w.add(c.make(`c8-k${c.id}`));
      c.sh.x = c.x + offset(c);
      c.sh.y = c.y;
      c.home = [c.sh.x, c.sh.y];
    }
    const rectOf = c => (c.id === 'big' ? {x: c.x, y: c.y, w: 126, h: 126} : c.id === 'wide' ? {x: c.x, y: c.y, w: 126, h: 63} : {x: c.x, y: c.y, w: 63, h: 63});
    d.describe('Cuatro marcos azules: uno girado, uno dado vuelta como en un espejo, uno el doble de grande y uno estirado sólo a lo ancho.');
    await d.shot(SHOTS.tiles, 0.8);
    const OPS = ['girar', 'dar vuelta', 'achicar a la mitad', 'no hay manera'];
    const done = {};
    let sel = null;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => sel ? [`Elegí qué hacerle al marco para que calce justo sobre la ventana de Cornisa. Si nada sirve, "no hay manera".`] : ['Tocá un marco azul: se acerca a la ventana de Cornisa.']);
      const refresh = () => {
        if (!sel) g.ui.setSpots(cands.filter(c => !done[c.id]).map(c => rectSpot(`c8-sel-${c.id}`, `Probar el marco ${({rot: 'girado', flip: 'dado vuelta', big: 'grande', wide: 'ancho'})[c.id]}`, rectOf(c), () => pickC(c))));
        else g.ui.setSpots(OPS.map((op, i) => wordSpot(`c8-op${i}`, op, A.x1 - 110, A.y0 + 24 + i * 72, () => apply(op), {label: op === 'no hay manera' ? 'Ninguna operación lo hace calzar' : `${op[0].toUpperCase()}${op.slice(1)} el marco`})));
      };
      const pickC = async c => {
        if (busy || !ctl.alive()) return;
        busy = true;
        sel = c;
        g.ui.setSpots([]);
        // se pone al lado de la ventana
        const sx0 = c.sh.x, sy0 = c.sh.y;
        const tx = ox + 80 + offset(c), ty = oy;
        for (const o of cands) if (o !== c) o.sh.fade = 0.2;
        try { await d.tween(0.5, k => { c.sh.x = lerp(sx0, tx, k); c.sh.y = lerp(sy0, ty, k); }, easeInOut); } catch { return; }
        busy = false;
        refresh();
      };
      const goHome = async c => {
        const sx0 = c.sh.x, sy0 = c.sh.y, r0 = c.sh.rot, s0 = c.sh.scale, f0 = c.sh.sx ?? 1;
        const r1 = c.id === 'rot' ? Math.PI / 2 : 0, sc1 = c.id === 'big' ? 2 : 1, f1 = c.id === 'flip' ? -1 : 1;
        await d.tween(0.4, k => { c.sh.x = lerp(sx0, c.home[0], k); c.sh.y = lerp(sy0, c.home[1], k); c.sh.rot = lerp(r0, r1, k); c.sh.scale = lerp(s0, sc1, k); c.sh.sx = lerp(f0, f1, k); }, easeInOut);
      };
      const apply = async op => {
        if (busy || !ctl.alive() || !sel) return;
        busy = true;
        g.ui.setSpots([]);
        const c = sel;
        d.evidence('copy-try', {cand: c.id, op});
        try {
          if (op === 'no hay manera') {
            if (c.op === op) {
              done[c.id] = 'none';
              w.add(new Label(`c8-cl${c.id}`, 'ni igual ni parecida', c.x + 140, c.y + 38, {size: 15, z: 12, ch: YELLOW}));
              await goHome(c);
              d.describe('El marco ancho vuelve a su lugar: ni igual ni parecido. Estirado de un solo lado cambia la forma.');
            } else {
              g.note('Sí hay una manera: probá otra.');
              await goHome(c);
            }
          } else {
            // la operación, sobre el marco, encima de la ventana
            const sx0 = c.sh.x, sy0 = c.sh.y, r0 = c.sh.rot, s0 = c.sh.scale, f0 = c.sh.sx ?? 1;
            const r1 = op === 'girar' ? r0 - Math.PI / 2 : r0;
            const f1 = op === 'dar vuelta' ? -f0 : f0;
            const s1 = op === 'achicar a la mitad' ? s0 / 2 : s0;
            // dónde queda la esquina: el girado y el dado vuelta tienen su origen corrido 63
            const fits = op === c.op;
            const tx = fits ? ox : ox + 6, ty = fits ? oy : oy + 6;
            await d.tween(0.8, k => {
              c.sh.rot = lerp(r0, r1, k);
              c.sh.sx = lerp(f0, f1, k);
              c.sh.scale = lerp(s0, s1, k);
              const [mx, my] = minCorner(c, c.sh.rot, c.sh.sx ?? 1, c.sh.scale);
              c.sh.x = lerp(sx0, tx - mx, k);
              c.sh.y = lerp(sy0, ty - my, k);
            }, easeInOut);
            if (fits) {
              g.audio.tap(0.2, 1.5);
              done[c.id] = c.id === 'big' ? 'similar' : 'equal';
              const txt = c.id === 'big' ? 'parecida (× 2)' : `igual (${c.id === 'rot' ? 'girada' : 'dada vuelta'})`;
              w.add(new Label(`c8-cl${c.id}`, txt, c.x + (c.id === 'big' ? 63 : 32), c.y + (c.id === 'big' ? 146 : 84), {size: 15, align: 'center', z: 12, ch: YELLOW}));
              d.describe(`El marco ${({rot: 'girado', flip: 'dado vuelta', big: 'grande'})[c.id]} calza justo sobre la ventana.`);
              await d.wait(0.6);
              await goHome(c);
            } else {
              g.audio.punto('no');
              g.note(c.id === 'wide' ? 'No calza: sigue el doble de ancho que de alto donde no debe.' : 'No calza. Volvé a probar.');
              await d.wait(0.5);
              await goHome(c);
            }
          }
        } catch { return; }
        for (const o of cands) o.sh.fade = done[o.id] ? 0.6 : 1;
        sel = null;
        busy = false;
        if (Object.keys(done).length === 4) { g.setHint(null); g.ui.setSpots([]); resolve(); } else refresh();
      };
      refresh();
    }));
    await d.say('student', 'Cornisa, el girado y el dado vuelta son iguales a tu ventana, congruentes: se mueven y calzan. El grande es parecido, semejante: achicado a la mitad, calza. Y los iguales también son semejantes, con × 1.');
    const c = await d.choose([
      {id: 'angles', text: 'La forma: los ángulos iguales y todos los lados multiplicados por lo mismo.'},
      {id: 'sides', text: 'Los lados: miden lo mismo.'},
      {id: 'area', text: 'El área: ocupa lo mismo.'},
    ], {prompt: '¿Qué tiene igual una copia parecida?', evaluate: true});
    d.evidence('similar-keeps', {answer: c});
    if (c !== 'angles') await d.think(c === 'sides' ? 'Los lados del grande miden el doble. Lo que se mantiene es la forma: los ángulos, y que todos los lados se multiplican por 2.' : 'El grande ocupa más. Lo que se mantiene es la forma: los ángulos y la proporción de los lados.');
    await d.say('Cornisa', 'Y el ancho tiene los mismos ángulos, todos rectos, pero no todos sus lados se multiplicaron por lo mismo: estirado de un solo lado ya no es mi ventana.');
    g.flags.c8copy = true;
  },
};

// ——————————————————————————————————————————————
// 8.4 El doble de grande
// ——————————————————————————————————————————————

/** Un cubo de alambre en perspectiva caballera: frente cuadrado de lado s, fondo corrido (k·s, −k·s). */
function cube(id, s, ch = WHITE) {
  const k = s * 0.35;
  const F = [[0, 0], [s, 0], [s, s], [0, s]];
  const B = F.map(([x, y]) => [x + k, y - k]);
  const list = poly(`${id}f`, F, {ch, hatch: 9});
  list.push(...poly(`${id}b`, [B[0], B[1], B[2]], {ch, closed: false, w: 1.8}));
  list.push(...poly(`${id}c0`, [F[0], B[0]], {ch, closed: false, w: 1.8}));
  list.push(...poly(`${id}c1`, [F[1], B[1]], {ch, closed: false, w: 1.8}));
  list.push(...poly(`${id}c2`, [F[2], B[2]], {ch, closed: false, w: 1.8}));
  return list;
}

export const doble = {
  id: 'c8.doble',
  title: 'El doble de grande',
  moment: 'El doble de grande',
  setup(g) {
    clean(g, /^c8-/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Peldaño', 'Mi huerta es la de nueve cuadros, tres por tres. Quiero otra con el lado el doble de largo. ¿Cuánta tierra va a tener?');
    const U = 28;
    const hx = A.x0 + 16, hy = A.y0 + 60;
    w.add(new Shape('c8-h0', gridSquare('c8-h0', 3, U, YELLOW), hx, hy, {z: 13}));
    w.add(new Label('c8-h0l', 'la de ahora', hx + 1.5 * U, hy + 3 * U + 22, {size: 16, align: 'center', z: 12}));
    const bx = A.x0 + 130, by = A.y0 + 30;
    w.add(new Shape('c8-H', sq('c8-H', 6 * U, {w: 2.6}), bx, by, {z: 12}));
    w.add(new Label('c8-Hl', 'lado doble', bx + 3 * U, by + 6 * U + 22, {size: 16, align: 'center', z: 12}));
    const guess = await d.choose([
      {id: '2', text: 'El doble de tierra.'},
      {id: '4', text: 'Cuatro veces la tierra.'},
      {id: '3', text: 'Tres cuadros más por lado: algo más.'},
    ], {prompt: 'Con el lado el doble de largo, ¿cuánta tierra entra?', evaluate: true});
    d.evidence('area-scale-predict', {answer: guess});
    await d.shot(SHOTS.tiles, 0.8);
    // el jugador pone huertas como la de ahora donde quiere, y dice él cuándo la grande está llena
    const quads = [[0, 0], [3, 0], [0, 3], [3, 3]];
    const placed = new Set();
    let early = false;
    const count = () => {
      w.remove('c8-hcount');
      w.add(new Label('c8-hcount', `huertas: ${placed.size}   cuadros: ${9 * placed.size}`, bx + 3 * U, by - 8, {size: 16, align: 'center', z: 15, ch: YELLOW}));
    };
    for (;;) {
      const pick = await d.interact(ctl => new Promise(resolve => {
        g.setHint(() => ['Tocá un lugar vacío de la huerta grande para poner ahí otra huerta como la de ahora. Cuando esté llena, tocá «ya está llena».']);
        g.ui.setSpots([
          ...quads.map(([i, j], k) => ({i, j, k})).filter(q => !placed.has(q.k)).map(({i, j, k}) => rectSpot(`c8-q${k}`, 'Poner una huerta de tres por tres en ese lugar de la grande', {x: bx + i * U + 4, y: by + j * U + 4, w: 3 * U - 8, h: 3 * U - 8}, () => { if (ctl.alive()) resolve(k); })),
          wordSpot('c8-full', 'ya está llena', A.x1 - 80, A.y1 - 40, () => { if (ctl.alive()) resolve('full'); }, {label: 'La huerta grande ya está llena'}),
        ]);
      }));
      g.setHint(null);
      if (pick === 'full') {
        if (placed.size === quads.length) break;
        early = true;
        await d.say('Peldaño', placed.size ? 'Todavía queda tierra sin huerta. Mirá los huecos.' : 'Está vacía todavía: poné huertas como la de ahora.');
        continue;
      }
      placed.add(pick);
      const [i, j] = quads[pick];
      const t = w.add(new Shape(`c8-hc${pick}`, gridSquare(`c8-hc${pick}`, 3, U, YELLOW), hx, hy, {z: 14}));
      await d.tween(0.5, k => { t.x = lerp(hx, bx + i * U, k); t.y = lerp(hy, by + j * U, k); }, easeInOut);
      g.audio.tap(0.2, 1.2 + placed.size * 0.1);
      count();
      d.describe(`Ya hay ${placed.size} ${placed.size === 1 ? 'huerta' : 'huertas'} como la de ahora en la grande: ${9 * placed.size} cuadros.`);
    }
    d.evidence('area-fill', {early});
    d.describe('La huerta grande se llena con cuatro huertas como la de ahora: treinta y seis cuadros.');
    await d.think(guess === '4' ? 'Cuatro huertas como la de ahora: treinta y seis cuadros.' : guess === '2' ? 'Cuatro huertas, no dos: el doble de largo y el doble de ancho. Treinta y seis cuadros.' : 'No es un poco más: son cuatro huertas como la de ahora. El doble de largo y el doble de ancho: treinta y seis cuadros.');
    // la caja, por pisos: sin menú; el jugador la llena caja por caja
    await d.say('Mara', 'Y la caja de atados de Cornisa, que es de dos por dos por dos: si la hago con el lado doble, ¿cuántas cajas como esa entran? Llenala vos.');
    g.setCinematic(true);
    w.removeWhere(o => /^c8-(h|H)/.test(o.id));
    g.setCinematic(false);
    const s = 44;
    const cx = A.x0 + 24, cy = A.y0 + 90;
    w.add(new Shape('c8-cube0', cube('c8-cube0', s, YELLOW), cx, cy, {z: 13}));
    w.add(new Label('c8-cube0l', 'la de Cornisa', cx + s / 2, cy + s + 24, {size: 16, align: 'center', z: 12}));
    w.add(new Label('c8-cube0h', '2 de alto', cx + s / 2, cy + s + 46, {size: 16, align: 'center', z: 12}));
    // la caja grande: de arriba se ve el piso de abajo; de costado, que es el doble de alta
    const floors = [{x: A.x0 + 140, y: A.y0 + 70, name: 'piso de abajo'}, {x: A.x0 + 270, y: A.y0 + 70, name: 'piso de arriba'}];
    const drawFloor = i => {
      const f = floors[i];
      w.add(new Shape(`c8-fl${i}`, sq(`c8-fl${i}`, 2 * s, {w: 2.6}), f.x, f.y, {z: 12}));
      w.add(new Label(`c8-fll${i}`, f.name, f.x + s, f.y + 2 * s + 22, {size: 15, align: 'center', z: 12}));
    };
    drawFloor(0);
    const sideX = A.x0 + 400, sideY = A.y0 + 70;
    w.add(new Shape('c8-side', poly('c8-side', [[0, 0], [2 * s, 0], [2 * s, 2 * s], [0, 2 * s]], {w: 2.6}), sideX, sideY, {z: 12}));
    w.add(new Label('c8-sidel', 'de costado: 4 de alto', sideX + s, sideY + 2 * s + 22, {size: 15, align: 'center', z: 12}));
    w.add(new Label('c8-flt', 'la caja de lado doble, vista de arriba:', A.x0 + 140, A.y0 + 46, {size: 16, z: 12, ch: BLUE}));
    const topView = id => [...sq(`${id}s`, s - 6, {ch: YELLOW, w: 2.2}), ...poly(`${id}x`, [[4, 4], [s - 10, s - 10]], {ch: YELLOW, closed: false, w: 1.4}), ...poly(`${id}y`, [[s - 10, 4], [4, s - 10]], {ch: YELLOW, closed: false, w: 1.4})];
    const cells = floors.flatMap((f, fi) => [[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j], ci) => ({id: `c8-cell${fi}${ci}`, fi, x: f.x + 3 + i * s, y: f.y + 3 + j * s})));
    const filled = new Set();
    let earlyBox = false, floorsOpen = 1;
    for (;;) {
      const pick = await d.interact(ctl => new Promise(resolve => {
        g.setHint(() => ['Tocá un lugar vacío de un piso para poner ahí una caja como la de Cornisa. Si hace falta otro piso, tocá «agregar un piso». Cuando la caja grande esté llena, tocá «ya está llena».', 'Mirá la caja de costado: ¿cuántas de Cornisa entran a lo alto?']);
        g.ui.setSpots([
          ...cells.filter(c => c.fi < floorsOpen && !filled.has(c.id)).map(c => rectSpot(c.id, `Poner una caja como la de Cornisa en el ${floors[c.fi].name}`, {x: c.x + 2, y: c.y + 2, w: s - 10, h: s - 10}, () => { if (ctl.alive()) resolve(c); })),
          ...(floorsOpen < 2 ? [wordSpot('c8-addfloor', 'agregar un piso', A.x1 - 70, A.y0 + 30, () => { if (ctl.alive()) resolve('floor'); }, {label: 'Agregar otro piso arriba en la caja grande'})] : []),
          wordSpot('c8-boxfull', 'ya está llena', A.x1 - 70, A.y1 - 40, () => { if (ctl.alive()) resolve('full'); }, {label: 'La caja grande ya está llena'}),
        ]);
      }));
      g.setHint(null);
      if (pick === 'floor') {
        floorsOpen = 2;
        drawFloor(1);
        w.add(new Drawing('c8-sidemid', Array.from({length: 8}, (_, k) => S([[sideX + k * 11, sideY + s], [sideX + k * 11 + 6, sideY + s]], seedOf('c8-sidemid') + k, {w: 1.8, p: 0.7, lift: false})), {z: 12}));
        g.audio.tap(0.15, 1.2);
        d.describe('Aparece el piso de arriba de la caja grande; de costado, una raya parte la altura en dos pisos.');
        continue;
      }
      if (pick === 'full') {
        if (filled.size === cells.length) break;
        earlyBox = true;
        if (floorsOpen < 2) await d.say('Mara', 'La de Cornisa tiene 2 de alto y la grande, 4. ¿Ya está llena?');
        else {
          const free = floors.filter((_, fi) => cells.some(c => c.fi === fi && !filled.has(c.id)));
          await d.say('Mara', `Todavía hay lugar en el ${free.map(f => f.name).join(' y en el ')}.`);
        }
        continue;
      }
      filled.add(pick.id);
      const t = w.add(new Shape(`${pick.id}b`, topView(`${pick.id}b`), cx, cy, {z: 14}));
      await d.tween(0.35, q => { t.x = lerp(cx, pick.x, q); t.y = lerp(cy, pick.y, q); }, easeInOut);
      g.audio.tap(0.15, 1.1 + filled.size * 0.07);
      w.remove('c8-bcount');
      w.add(new Label('c8-bcount', `cajas: ${filled.size}`, A.x0 + 184, A.y0 + 212, {size: 17, align: 'center', z: 15, ch: YELLOW}));
      d.describe(`Una caja como la de Cornisa en el ${floors[pick.fi].name}. Van ${filled.size}.`);
    }
    d.evidence('volume-fill', {early: earlyBox});
    await d.think('Ocho: cuatro en el piso de abajo y cuatro en el de arriba. Se duplicaron el largo, el ancho y también el alto.');
    const sc = scaleBy(2);
    await studentWrites(d, g, 'c8-scale', `lado × 2:  área × ${sc.area},  volumen × ${sc.volume}`, A.x0 + 20, A.y1 - 10, {size: 24});
    await d.say('student', 'Peldaño, el lado se multiplica una vez; el área, por el largo y por el ancho; el volumen, también por el alto. Con el lado × 3 serían × 9 y × 27.');
    d.evidence('scale', sc);
    g.flags.c8scale = true;
  },
};

export {GROUND, zip, follow, plate};
