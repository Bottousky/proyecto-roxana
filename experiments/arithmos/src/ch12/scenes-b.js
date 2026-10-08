// Capítulo 12 — Anticipar (12.5 a 12.8): qué tan rápido, lo que se junta, por tramos y anticipar (cierre).

import {lerp, easeInOut} from '../engine/rng.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {jump, avgRate, riemann, tariff} from '../logic/anticipate.js';
import {Drawing, Label, Shape, SHOTS, area, boardCast, clean, poly, dot, S, seedOf, WHITE, YELLOW, BLUE, dec, axes, curve} from './common.js';
import {studentWrites} from '../ch7/scenes-a.js';
import {RONDA_IDS, rondaDot, rondaDance} from '../ch1/common.js';
import {mareaBand} from '../ch1/scenes.js';
import {LAD, stair, restoreStair} from '../stair.js';
import * as art from '../art.js';
import {GROUND} from '../ch9/common.js';

// ——————————————————————————————————————————————
// 12.5 Qué tan rápido
// ——————————————————————————————————————————————

export const rapido = {
  id: 'c12.rapido',
  title: 'Qué tan rápido',
  setup(g) {
    clean(g, /^c12-/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', 'En el salto de Punto: justo al segundo 1, ¿qué tan rápido sube?');
    const box = {x: A.x0 + 40, y: A.y0 + 20, w: 300, h: 210};
    const {px, py} = axes(w, 'c12-g', box, [0, 6], [0, 10], {xticks: [1, 2, 3, 4, 5, 6], yticks: [3, 6, 9], xname: 't'});
    w.add(curve('c12-jump', jump, [0, 6], px, py, [0, 10], {ch: WHITE, n: 60}));
    w.add(new Shape('c12-p1', dot('c12-p1', 6), px(1), py(jump(1)), {z: 15}));
    d.describe('El salto de Punto en el mapa, con un punto amarillo en el segundo 1, a altura 5.');
    await d.say('student', 'En un tramo se puede medir: cuánto subió dividido cuánto tiempo pasó. Del 1 al 2 subió de 5 a 8: 3 por segundo.');
    await d.shot(SHOTS.tiles, 0.8);
    // el jugador elige qué tramo medir: hacia adelante del 1 o hacia atrás
    const TRAMOS = [{h: 1, t: 'Del 1 al 2.'}, {h: 0.5, t: 'Del 1 al 1,5.'}, {h: 0.1, t: 'Del 1 al 1,1.'}, {h: 0.01, t: 'Del 1 al 1,01.'}, {h: -0.1, t: 'Del 0,9 al 1.'}, {h: -0.01, t: 'Del 0,99 al 1.'}];
    const measured = [];
    let k = 0;
    const show = h => {
      const r = avgRate(jump, 1, h);
      w.remove('c12-sec');
      const x0 = 0.2, x1 = 2.6;
      w.add(new Drawing('c12-sec', [S([[px(x0), py(jump(1) + r * (x0 - 1))], [px(x1), py(jump(1) + r * (x1 - 1))]], seedOf(`c12-sec${h}`), {w: 2.2, p: 0.9, ch: BLUE})], {z: 14}));
      w.remove('c12-p2');
      w.add(new Shape('c12-p2', dot('c12-p2', 4, BLUE), px(1 + h), py(jump(1 + h)), {z: 15}));
      const lo = Math.min(1, 1 + h), hi = Math.max(1, 1 + h);
      w.add(new Label(`c12-r${k}`, `del ${dec(lo)} al ${dec(hi)}:  ${dec(r)}`, A.x1 - 158, A.y0 + 36 + k * 30, {size: 17, z: 12, ch: h < 0 ? YELLOW : undefined}));
      d.describe(`Del segundo ${dec(lo)} al ${dec(hi)}, subió a ${dec(r)} por segundo en promedio. La recta azul pasa por los dos puntos.`);
      d.evidence('rate', {h, r: +r.toFixed(3)});
      measured.push({h, r});
      k++;
    };
    show(1);
    for (;;) {
      const ready = measured.length >= 3 && measured.some(m => Math.abs(m.h) <= 0.1);
      const opts = TRAMOS.filter(o => !measured.some(m => m.h === o.h)).map(o => ({id: String(o.h), text: o.t}));
      if (ready) opts.push({id: 'done', text: 'Ya está: ya se ve adónde van.'});
      const pick = await d.choose(opts, {prompt: '¿Qué tramo medís ahora? Cuanto más corto, más cerca del segundo 1.'});
      if (pick === 'done') break;
      show(Number(pick));
      g.audio.tap(0.15, 1.2 + k * 0.08);
      if (measured.length === TRAMOS.length) break;
    }
    // la recta azul del final: la del tramo más corto que se midió
    const best = measured.reduce((a, b) => (Math.abs(b.h) < Math.abs(a.h) ? b : a));
    {
      const x0 = 0.2, x1 = 2.6;
      w.remove('c12-sec');
      w.add(new Drawing('c12-sec', [S([[px(x0), py(jump(1) + best.r * (x0 - 1))], [px(x1), py(jump(1) + best.r * (x1 - 1))]], seedOf('c12-secb'), {w: 2.2, p: 0.9, ch: BLUE})], {z: 14}));
      w.remove('c12-p2');
      w.add(new Shape('c12-p2', dot('c12-p2', 4, BLUE), px(1 + best.h), py(jump(1 + best.h)), {z: 15}));
    }
    const c = await d.choose([
      {id: '4', text: 'A 4: cada vez más cerca.'},
      {id: '3.99', text: 'Al último que salió: con eso alcanza.'},
      {id: 'none', text: 'A nada: con tramo cero no se puede dividir.'},
    ], {prompt: '¿A qué número se acercan?', evaluate: true});
    d.evidence('derivative-predict', {answer: c});
    if (measured.some(m => m.h < 0)) await d.think('Por la derecha dieron menos que 4 y por la izquierda, más: lo encierran.');
    await d.think(c === '4' ? 'Cuatro. Con tramo cero no se divide, pero los tramos cada vez más cortos se acercan a 4.' : c === '3.99' ? 'El último es una aproximación: con un tramo más corto cambiaría otra vez (3,999 por la derecha, 4,001 por la izquierda). Se acercan a 4.' : 'Con tramo cero no se puede dividir, es cierto. Pero los tramos cada vez más cortos se acercan a un número: 4.');
    await d.say('student', 'Cornisa, justo al segundo 1, Punto sube a 4 por segundo. Ese número al que se acercan las velocidades de tramos cada vez más cortos se llama derivada. La recta azul del final pasa por dos puntos muy cercanos; la recta que tiene justo inclinación 4 en el segundo 1 se llama tangente.');
    const right = measured.filter(m => m.h > 0).sort((a, b) => b.h - a.h).map(m => dec(m.r));
    const left = measured.filter(m => m.h < 0).sort((a, b) => a.h - b.h).map(m => dec(m.r));
    await studentWrites(d, g, 'c12-der', `en t = 1:  ${right.join(' → ')}${left.length ? `   ·   ${left.join(' → ')}` : ''}   → 4`, A.x0 + 20, A.y1 - 4, {size: 17});
    g.flags.c12rate = true;
  },
};

// ——————————————————————————————————————————————
// 12.6 Lo que se junta
// ——————————————————————————————————————————————

export const junta = {
  id: 'c12.junta',
  title: 'Lo que se junta',
  setup(g) {
    clean(g, /^c12-/);
    boardCast(g, 3);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Balcón', 'Abrí la canilla del pozo de a poco: a los t minutos salen 2t baldes por minuto. ¿Cuánta agua juntamos en 3 minutos?');
    const box = {x: A.x0 + 40, y: A.y0 + 20, w: 300, h: 210};
    const rate = t => 2 * t;
    const {px, py} = axes(w, 'c12-g', box, [0, 3], [0, 6], {xticks: [1, 2, 3], yticks: [2, 4, 6], xname: 'min', yname: 'baldes por minuto'});
    w.add(curve('c12-rate', rate, [0, 3], px, py, [0, 6], {ch: WHITE, n: 10}));
    d.describe('Un mapa con el caudal: una recta que sube de 0 a 6 baldes por minuto en 3 minutos.');
    await d.shot(SHOTS.tiles, 0.8);
    // el jugador elige en cuántos pedazos partir y si mira los rectángulos por abajo o por arriba
    let k = 0;
    const measured = [];
    w.add(new Label('c12-sh', 'pedazos', A.x1 - 160, A.y0 + 22, {size: 15, z: 12, ch: BLUE}));
    const show = (n, above = false) => {
      w.removeWhere(o => o.id.startsWith('c12-rc'));
      const dt = 3 / n;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const t = i * dt, h = rate(above ? t + dt : t);
        sum += h * dt;
        if (h <= 0) continue;
        w.add(new Shape(`c12-rc${i}`, poly(`c12-rc${i}`, [[0, 0], [px(dt) - px(0), 0], [px(dt) - px(0), py(h) - py(0)], [0, py(h) - py(0)]], {ch: above ? BLUE : YELLOW, w: n > 10 ? 1.2 : 2}), px(t), py(0), {z: 12}));
      }
      if (!above && Math.abs(sum - riemann(rate, 3, n)) > 1e-9) console.error('[junta] la suma no coincide con riemann');
      w.add(new Label(`c12-s${k}`, `${n}, ${above ? 'por arriba' : 'por abajo'}:  ${dec(sum)}`, A.x1 - 160, A.y0 + 48 + k * 30, {size: 17, z: 12, ch: above ? BLUE : YELLOW}));
      d.describe(`Partiendo en ${n} pedazos, con los rectángulos ${above ? 'por arriba de la recta' : 'por debajo de la recta'}: cada uno es caudal por tiempo; juntos suman ${dec(sum)} baldes.`);
      d.evidence('accum', {n, above, s: +sum.toFixed(3)});
      measured.push({n, above, s: sum});
      k++;
    };
    show(3);
    for (;;) {
      const ready = measured.length >= 3 && measured.some(m => m.n >= 12);
      const opts = [6, 12, 30].filter(n => !measured.some(m => m.n === n && !m.above)).map(n => ({id: `b${n}`, text: `En ${n} pedazos, por abajo.`}));
      if (!measured.some(m => m.above)) opts.push({id: 'a12', text: 'En 12 pedazos, por arriba de la recta.'});
      if (ready) opts.push({id: 'done', text: 'Ya está: ya se ve adónde van.'});
      if (!opts.length || (opts.length === 1 && opts[0].id === 'done')) break;
      const pick = await d.choose(opts, {prompt: '¿En cuántos pedazos partís el tiempo ahora?'});
      if (pick === 'done') break;
      show(Number(pick.slice(1)), pick[0] === 'a');
      g.audio.tap(0.15, 1 + k * 0.1);
    }
    const c = await d.choose([
      {id: '9', text: '9: lo que hay debajo de la recta, un triángulo de 3 por 6, a la mitad.'},
      {id: '6', text: '6: el último caudal.'},
      {id: 'inf', text: 'Cada vez más, sin parar.'},
    ], {prompt: '¿A cuántos baldes se acercan las sumas?', evaluate: true});
    d.evidence('integral-predict', {answer: c});
    const lows = measured.filter(m => !m.above).map(m => m.s), highs = measured.filter(m => m.above).map(m => m.s);
    if (highs.length) await d.think(`Por abajo dieron ${lows.map(dec).join(', ')}; por arriba, ${highs.map(dec).join(', ')}: lo juntado queda entre las dos, y las dos se le acercan.`);
    await d.think(c === '9' ? 'Nueve: el triángulo bajo la recta, 3 · 6 ÷ 2.' : c === '6' ? `Seis es el caudal del final, por minuto, no lo juntado: las sumas de la pizarra ya pasaron el 6 (${dec(Math.max(...measured.map(m => m.s)))}). Lo juntado es lo que hay debajo de la recta: 3 · 6 ÷ 2 = 9.` : 'Las de abajo crecen, pero no sin parar: nunca pasan el área bajo la recta, el triángulo de 3 · 6 ÷ 2 = 9, y se le acercan.');
    await d.say('student', 'Balcón, si el caudal cambia, se parte el tiempo en pedazos chicos y se suma caudal por tiempo. Con pedazos cada vez más finos, la suma se acerca al área debajo del gráfico: 9 baldes. Eso se llama integral. Y es al revés de la derivada: una dice qué tan rápido, la otra cuánto se juntó.');
    await studentWrites(d, g, 'c12-int', 'juntado = área bajo el caudal = 9', A.x0 + 20, A.y1 - 4, {size: 18});
    g.flags.c12accum = true;
  },
};

// ——————————————————————————————————————————————
// 12.7 Por tramos
// ——————————————————————————————————————————————

export const tramos = {
  id: 'c12.tramos',
  title: 'Por tramos',
  setup(g) {
    clean(g, /^c12-/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Rampa', 'Mi precio por redibujar escalones: hasta 10, un trozo de tiza cada uno. Después del décimo, medio trozo por escalón.');
    const box = {x: A.x0 + 40, y: A.y0 + 20, w: 300, h: 200};
    const {px, py} = axes(w, 'c12-g', box, [0, 20], [0, 16], {xticks: [5, 10, 15, 20], yticks: [5, 10, 15], xname: 'escalones', yname: 'tiza'});
    const l1 = w.add(curve('c12-t1', x => x, [0, 10], px, py, [0, 16], {ch: WHITE, n: 4}));
    const l2 = w.add(curve('c12-t2', x => 10 + (x - 10) / 2, [10, 20], px, py, [0, 16], {ch: YELLOW, n: 4}));
    void l1; void l2;
    w.add(new Shape('c12-k', dot('c12-k', 5, BLUE), px(10), py(10), {z: 14}));
    d.describe('Un gráfico en dos tramos: hasta 10 escalones sube de a uno; desde el 10 sube a la mitad de inclinación, en amarillo.');
    await d.shot(SHOTS.tiles, 0.8);
    const c = await d.choose([
      {id: '13', text: '13: los primeros 10 a uno, los otros 6 a medio.'},
      {id: '16', text: '16: uno por escalón.'},
      {id: '8', text: '8: la mitad de 16.'},
    ], {prompt: '¿Cuánta tiza cobra por 16 escalones?', evaluate: true});
    d.evidence('piecewise-predict', {answer: c});
    w.add(new Shape('c12-q', dot('c12-q', 6, YELLOW), px(16), py(tariff(16)), {z: 15}));
    w.add(new Label('c12-ql', `16 → ${tariff(16)}`, px(16) - 10, py(tariff(16)) - 12, {size: 18, align: 'right', z: 15, ch: YELLOW}));
    await d.think(c === '13' ? 'Trece: diez por el primer tramo, tres por el segundo.' : `El primer tramo cuesta 10; los 6 escalones que siguen, medio cada uno: 3. Total, ${tariff(16)}.`);
    await d.say('student', 'Rampa, tu precio es una función por tramos: una regla hasta 10 y otra después. Un solo gráfico, dos reglas.');
    // la distancia al cero, también por tramos: la V
    const vb = {x: A.x0 + 385, y: A.y0 + 95, w: 110, h: 70};
    const v = axes(w, 'c12-vg', vb, [-4, 4], [0, 4.5], {xticks: [-4, 4], yticks: [4]});
    w.add(new Label('c12-vt', 'lejos del cero', vb.x + vb.w / 2, vb.y - 12, {size: 14, align: 'center', z: 12, ch: BLUE}));
    g.setCinematic(true);
    const vl = w.add(curve('c12-vl', x => -x, [-4, 0], v.px, v.py, [0, 4.5], {ch: WHITE, n: 4}));
    const vr = w.add(curve('c12-vr', x => x, [0, 4], v.px, v.py, [0, 4.5], {ch: YELLOW, n: 4}));
    vl.progress = 0; vr.progress = 0;
    await d.draw(vl, 0.5, {sound: false});
    await d.draw(vr, 0.5, {sound: false});
    w.add(new Label('c12-vll', '−x', v.px(-2) - 6, v.py(1) + 6, {size: 15, align: 'right', z: 13}));
    w.add(new Label('c12-vrl', 'x', v.px(2) + 8, v.py(1) + 6, {size: 15, z: 13, ch: YELLOW}));
    g.setCinematic(false);
    d.describe('Al costado, un gráfico chico en forma de V: lo lejos del cero de cada número. A la izquierda del cero, la regla −x, en blanco; a la derecha, x, en amarillo.');
    await d.say('student', 'Lo lejos del cero también va por tramos, como Recta y Cuña en la línea del depósito: +4 y −4 están igual de lejos. A la derecha del cero, x. A la izquierda, −x: con −4, −x es −(−4) = 4. No es negativo: es la distancia. Una V.');
    await studentWrites(d, g, 'c12-pw', 'hasta 10: x    después: 10 + (x − 10) ÷ 2', A.x0 + 20, A.y1 - 4, {size: 18});
    g.flags.c12piecewise = true;
  },
};

// ——————————————————————————————————————————————
// 12.8 Anticipar (cierre del juego)
// ——————————————————————————————————————————————

const NIGHTS = [[0, 1], [1, 2], [2, 4], [3, 8]];

export const final = {
  id: 'c12.anticipar',
  title: 'Anticipar',
  setup(g) {
    clean(g, /^c12-/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const p = w.get('punto');
    const s = w.get('student');
    const A = area();
    await d.shot(SHOTS.board, 1);
    // lo que está en juego: la escalera nueva de Balcón (la del tirante, 8.6), treinta escalones, todavía borroneada;
    // las noches 0 y 1 la Marea ya se llevó los escalones de abajo (fin de los caps. 10 y 11)
    g.flags.balconStair = true;
    g.flags.stairLost ??= 2;
    stair(g);
    // los tramos se buscan siempre por su id: al reponer escalones, el de abajo se rehace
    const grp = k => w.get(`stair-g${k}`);
    const groups = () => Array.from({length: 6}, (_, k) => grp(k));
    w.add(new Label('c12-stl', 'escalera de Balcón: 30', LAD.x + LAD.w / 2, GROUND + 26, {size: 16, align: 'center', z: 3, ch: YELLOW}));
    d.describe(`Al costado de la pizarra, la escalera nueva de Balcón, la del tirante: treinta escalones, todavía borroneados${g.flags.stairLost === 1 ? '; le falta el primer escalón' : g.flags.stairLost ? `; le faltan los ${g.flags.stairLost} de abajo` : ''}.`);
    await d.say('Mara', 'La Marea vuelve. Medí hasta qué altura llegó cada noche. La noche 0, 1 escalón; la noche 1, 2. La escalera nueva de Balcón tiene 30, y está a medio dibujar. ¿Llegamos a terminarla?');
    const box = {x: A.x0 + 40, y: A.y0 + 20, w: 300, h: 210};
    const {px, py} = axes(w, 'c12-g', box, [0, 6], [0, 40], {xticks: [1, 2, 3, 4, 5, 6], yticks: [10, 20, 30, 40], xname: 'noche'});
    const night = ([n, v]) => w.add(new Shape(`c12-n${n}`, dot(`c12-n${n}`, 6, BLUE), px(n), py(v), {z: 14}));
    NIGHTS.slice(0, 2).forEach(night);
    w.add(new Drawing('c12-top', Array.from({length: 12}, (_, i) => S([[px(i * 0.5), py(30)], [px(i * 0.5 + 0.25), py(30)]], seedOf('c12-top') + i, {w: 1.6, p: 0.7, ch: YELLOW, lift: false})), {z: 12}));
    w.add(new Label('c12-topl', 'escalera: 30', px(0) + 6, py(30) - 8, {size: 15, z: 13, ch: YELLOW}));
    d.describe('Dos puntos azules, las noches 0 y 1: 1 y 2. Una raya punteada amarilla en 30, la altura de la escalera.');
    await d.shot(SHOTS.tiles, 0.8);
    // Punto se adelanta: corre por donde cree que va la Marea, una recta que sube de a uno
    g.setCinematic(true);
    p.setMode('still');
    g.audio.punto('happy');
    const guess = n => 1 + n;
    const pline = w.add(curve('c12-pline', guess, [0, 6], px, py, [0, 40], {ch: YELLOW, n: 12}));
    pline.progress = 0;
    await d.all(
      d.draw(pline, 1.6, {sound: false}),
      d.tween(1.6, q => { const n = 6 * q; p.x = px(n); p.y = py(guess(n)) - 14; }, easeInOut),
    );
    g.setCinematic(false);
    d.describe('Punto se adelanta: corre por una recta amarilla que sube de a un escalón por noche, y llega a 7 en la noche 6.');
    d.evidence('punto-guess', {rule: 'suma 1'});
    await d.say('Mara', 'Esperá, Punto. Las noches 2 y 3 fueron 4 y 8.');
    g.setCinematic(true);
    for (const nv of NIGHTS.slice(2)) { const sh = night(nv); sh.fade = 0; await d.fadeTo(sh, 1, 0.4); }
    g.setCinematic(false);
    d.describe('Dos puntos azules más, 4 y 8: quedan por arriba de la recta de Punto.');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.3).catch(() => {});
    await d.think('Los puntos nuevos quedan por arriba de su recta. Punto la mira un rato.');
    g.setCinematic(true);
    await d.fadeTo(pline, 0, 0.8);
    w.remove('c12-pline');
    await zip(d, p, px(6) + 34, py(12), 0.5);
    g.setCinematic(false);
    d.describe('Punto borra su recta él mismo y se corre al costado del mapa, esperando.');
    d.evidence('punto-erase', {});
    await d.think('Con dos noches, 1 y 2, pasaban las dos: la recta que suma uno y la que duplica, como la de Punto en la carrera. Él eligió una antes de tiempo; las noches 2 y 3 la desmintieron.');
    const FAM = [
      {id: 'dbl', text: 'Duplica: la familia que despega', f: n => 2 ** n},
      {id: 'line', text: 'Suma lo mismo: una recta', f: n => 1 + 7 * n / 3},
      {id: 'wave', text: 'Va y vuelve: una ola', f: n => 4.5 - 3.5 * Math.cos(n * Math.PI / 3)},
    ];
    let fam = null;
    for (;;) {
      const id = await d.choose(FAM.map(x => ({id: x.id, text: x.text})), {prompt: '¿Qué familia sigue la Marea?'});
      fam = FAM.find(x => x.id === id);
      d.evidence('final-family', {id});
      w.remove('c12-fit');
      w.add(curve('c12-fit', fam.f, [0, 6], px, py, [0, 40], {ch: fam.id === 'dbl' ? YELLOW : WHITE, n: 60}));
      if (fam.id === 'dbl') break;
      d.describe('La curva elegida no pasa por todos los puntos azules.');
      await d.think(fam.id === 'line' ? 'Una recta no pasa por los cuatro: de 1 a 2 sube 1, de 4 a 8 sube 4. No suma lo mismo.' : 'Hasta ahora sólo sube, y cada vez más: no parece una ola.');
      FAM.splice(FAM.indexOf(fam), 1);
    }
    d.describe('La curva que duplica pasa por los cuatro puntos y sigue subiendo: cruza la raya del 30 entre la noche 4 y la 5.');
    // el jugador marca en el mapa la primera noche en que la Marea pasa los 30: es el plazo para terminar la escalera
    w.add(new Drawing('c12-pnt', [3, 4, 5, 6].map((n, k) => S([[px(n), py(30) - 7], [px(n), py(30) + 7]], seedOf('c12-pnt') + k, {w: 2.4, p: 0.95, ch: YELLOW, lift: false})), {z: 13}));
    await d.say('Mara', 'Si sigue duplicando, ¿hasta qué noche tenemos? Marcá en la raya del 30 la primera noche en que la Marea la pasa.');
    const c = await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá en la raya amarilla del 30 la noche en que la curva la pasa por primera vez.', 'Duplicando: la noche 4, 16; la noche 5, el doble.']);
      g.ui.setSpots([3, 4, 5, 6].map(n => rectSpot(`c12-pn${n}`, `La noche ${n}`, {x: px(n) - 14, y: py(30) - 16, w: 28, h: 32}, () => { if (ctl.alive()) resolve(String(n)); })));
    }));
    g.setHint(null);
    d.evidence('final-predict', {answer: c});
    w.add(new Shape('c12-pmark', dot('c12-pmark', 7, YELLOW), px(Number(c)), py(30), {z: 15}));
    d.describe(`Marcaste la noche ${c}.`);
    if (c === '3' || c === '4') await d.think(c === '3' ? 'La noche 3 llegó a 8: lejos del 30. Duplicando, la 4 llega a 16 y la 5 a 32: pasa en la 5. Mejor temprano que tarde.' : 'La noche 4 llega a 16: todavía no. La 5, 32: ahí pasa. Marqué temprano: mejor que tarde.');
    await d.say('student', 'Mara, con cuatro noches no se puede estar seguro: otra regla podría pasar por los mismos cuatro puntos y seguir distinto. Lo anotamos como suposición y miramos cada noche si se cumple.');
    await d.say('Mara', 'Y mientras, redibujamos lo que todavía no se entiende: lo que entendimos, la Marea no lo borra.');
    // la noche 4 pone a prueba la suposición
    await d.say('Mara', 'Noche 4.');
    g.setCinematic(true);
    const n4 = w.add(new Shape('c12-n4', dot('c12-n4', 6, BLUE), px(4), py(16), {z: 15, fade: 0}));
    await d.fadeTo(n4, 1, 0.6);
    g.setCinematic(false);
    d.describe('Un punto azul nuevo: la noche 4 la Marea llegó a 16, justo sobre la curva que duplica.');
    d.evidence('final-check', {night: 4, v: 16});
    await d.think('Dieciséis, sobre la curva. La suposición aguantó una noche más: no es una prueba, pero ahora confiamos un poco más.');
    // el jugador repasa la escalera tramo por tramo; con el plazo de la noche 6, esta noche sólo alcanza la mitad
    const late = c === '6';
    const repass = (limit, nightLabel) => d.interact(ctl => new Promise(resolve => {
      let done = 0;
      g.setHint(() => ['Tocá cada tramo borroneado de la escalera para repasarlo con tiza.']);
      const refresh = () => g.ui.setSpots(groups().map((st, k) => ({st, k})).filter(({st}) => st.fade < 1).map(({k}) => rectSpot(`c12-rep${k}`, `Repasar el tramo ${k + 1} de la escalera`, {x: LAD.x - 10, y: GROUND - (k + 1) * LAD.h / 6, w: LAD.w + 20, h: LAD.h / 6}, async () => {
        if (!ctl.alive() || grp(k).fade >= 1) return;
        g.ui.setSpots([]);
        if (k === 0 && g.flags.stairLost) restoreStair(g);
        const st = grp(k);
        st.fade = 1;
        st.progress = 0;
        try { await d.draw(st, 0.5); } catch { return; }
        done++;
        w.remove('c12-repl');
        w.add(new Label('c12-repl', `repasados: ${groups().filter(x => x.fade >= 1).length * 5} de 30`, LAD.x + LAD.w + 16, GROUND - LAD.h - 12, {size: 16, z: 4, ch: YELLOW}));
        d.describe(`Tramo repasado. Van ${groups().filter(x => x.fade >= 1).length * 5} escalones de 30.`);
        if (done >= limit || groups().every(x => x.fade >= 1)) { g.setHint(null); resolve(); } else refresh();
      })));
      refresh();
      void nightLabel;
    }));
    await d.shot(SHOTS.board, 0.8);
    if (late) {
      await d.say('Mara', 'Hasta la noche 6, entonces. Esta noche repasamos la mitad.');
      await repass(3, 4);
    } else {
      await d.say('Mara', 'Entonces la terminamos esta noche, antes de la noche 5. ¡A trabajar!');
      await repass(6, 4);
    }
    // la Marea pasa de verdad: una franja que cruza la escalera y las Terrazas; lo repasado resiste
    const sweep = async (night, label) => {
      g.setCinematic(true);
      await d.shot({x: 13500, y: GROUND - 560, w: 1700, h: 640}, 1);
      const band = w.add(mareaBand(w, 13300));
      band.strength = 0.85;
      band.width = 300;
      g.audio.marea?.(5);
      g.camera.shake = 0.3;
      d.describe(label);
      const weak = groups().filter(st => st.fade < 1);
      await d.tween(2.6, q => {
        band.x = lerp(13300, 15300, q);
        for (const st of weak) if (band.x > LAD.x + LAD.w / 2) st.fade = Math.max(0, st.fade - 0.05);
      });
      w.remove('marea-band');
      for (const st of weak) st.fade = 0;
      g.setCinematic(false);
      void night;
      return weak.length;
    };
    if (late) {
      const lost = await sweep(5, 'Noche 5. Pasa la Marea: una franja ancha de borrador cruza la escalera y las Terrazas. Llega a 32: se lleva los tramos que faltaban repasar.');
      d.evidence('final-late', {lost});
      await d.think('La noche 5 llegó a 32: ya pasaba los 30. Marqué la 6 y llegamos tarde con la mitad. Lo repasado resistió; lo otro se lo llevó.');
      await d.say('Mara', 'Lo que repasamos aguantó. Rehagamos lo que se llevó antes de la noche 6: si duplica, llega a 64.');
      groups().filter(st => st.fade < 1).forEach(st => { st.fade = 0.22; });
      await repass(6, 6);
      await sweep(6, 'Noche 6. La Marea grande, más alta todavía, cruza la escalera y las Terrazas. La escalera, entera y repasada, resiste.');
    } else {
      await sweep(5, 'Noche 5. Pasa la Marea grande: una franja ancha de borrador cruza la escalera y las Terrazas, más alta que todo. La escalera, repasada a tiempo, resiste; la pizarra con sus cuentas, también.');
    }
    g.flags.stairDone = true;
    await d.say('Mara', 'Llegamos. La escalera sigue ahí, y lo que entendimos también.');
    await d.shot(SHOTS.board, 1);
    // Punto corre por su gráfico, un paso adelante
    p.setMode('still');
    d.describe('Punto corre por la curva, desde la noche 0 hasta la 5, un paso adelante.');
    await d.tween(2.6, q => { const n = 5 * q; p.x = px(n); p.y = py(Math.min(40, 2 ** n)) - 14; }, easeInOut).catch(() => {});
    g.audio.punto('happy');
    // la pregunta del cap. 1: el nombre
    await d.say('student', 'Punto, el primer día te dije que te iba a llamar así hasta que me dijeras cómo te llamás. ¿Y?');
    g.setCinematic(true);
    // sube arriba de la pizarra y dibuja en el aire, saliendo de él
    const nx = p.x + 40, ny = A.y0 - 64;
    await zip(d, p, nx - 34, ny + 16, 0.6);
    const ring = Array.from({length: 11}, (_, i) => [nx + Math.cos(i / 10 * Math.PI * 2) * 6, ny + Math.sin(i / 10 * Math.PI * 2) * 6]);
    const name = w.add(new Drawing('c12-name', [
      S(ring, seedOf('c12-name'), {w: 4, p: 1, ch: YELLOW}),
      S([[nx + 14, ny - 2], [nx + 78, ny - 14]], seedOf('c12-name') + 1, {w: 3.2, p: 0.95, ch: YELLOW}),
      S([[nx + 78, ny - 14], [nx + 62, ny - 24]], seedOf('c12-name') + 2, {w: 3.2, p: 0.95, ch: YELLOW}),
      S([[nx + 78, ny - 14], [nx + 64, ny - 2]], seedOf('c12-name') + 3, {w: 3.2, p: 0.95, ch: YELLOW}),
      S(Array.from({length: 16}, (_, i) => [nx + 92 + i * 6, ny - 14 - (i * i) * 0.45]), seedOf('c12-name') + 4, {w: 3.2, p: 0.95, ch: YELLOW}),
    ], {z: 16, progress: 0}));
    await d.draw(name, 2.2, {sound: false});
    g.setCinematic(false);
    d.describe('Punto dibuja en el aire: un punto, que se estira en una flecha, que se dobla en una curva que sube.');
    d.evidence('punto-name', {});
    await d.say('student', 'Un punto, una flecha, una curva. Te sigo diciendo Punto, entonces: es como empezaste. Pero ya sé que no sos sólo un punto.');
    await pulse(d, p, 2, 0.4).catch(() => {});
    // la última imagen: la Ronda baila en las Terrazas, como el primer día, y Punto se suma
    const dance = {cx: 15080, cy: GROUND - 60, r: 80};
    RONDA_IDS.forEach((id, i) => { const r = rondaDot(w, i); r.x = dance.cx + Math.cos(i / 12 * Math.PI * 2) * dance.r; r.y = dance.cy; r.fade = 0; });
    rondaDance(w, {speed: 0.5, ...dance});
    await d.shot({x: 14000, y: GROUND - 520, w: 1500, h: 600}, 1.6);
    await d.all(...RONDA_IDS.map(id => d.fadeTo(w.get(id), 1, 0.8)));
    d.describe('En las Terrazas, la Ronda baila en ronda, como el primer día: doce puntos blancos, y el más chico se atrasa y alcanza.');
    g.audio.punto('happy');
    await zip(d, p, dance.cx + dance.r + 24, dance.cy - 20, 0.9).catch(() => {});
    rondaDance(w, {speed: 0.5, ...dance, ids: [...RONDA_IDS, 'punto']});
    d.describe('Punto baja y se suma a la ronda.');
    await d.think('La Ronda baila otra vez, como el primer día. Punto se suma a la vuelta, un paso adelante.').catch(() => {});
    // el estudiante se acerca a la Ronda: la puerta aparece con todos en cuadro
    g.setCinematic(true);
    await d.walk(s, dance.cx - dance.r - 50, GROUND, 320).catch(() => {});
    g.setCinematic(false);
    // la puerta del primer día: volver o quedarse
    const DX = 15890;
    const door = w.add(new Drawing('c12-door', art.doorFrame('c12-door', DX, GROUND, 150, 270), {z: 2, fade: 0.45}));
    const glow = w.add(new Drawing('c12-doorl', art.doorLight('c12-doorl', DX, GROUND, 150, 270), {z: 1, progress: 0}));
    await d.shot({x: 14820, y: GROUND - 440, w: 1200, h: 500}, 1.2);
    await d.all(d.fadeTo(door, 1, 1.2), d.draw(glow, 1.4, {sound: false}));
    d.describe('Al costado de las Terrazas, la puerta del primer día, que se veía apenas, termina de dibujarse; del otro lado hay luz.');
    await d.think('La puerta del primer día. Se fue dibujando de a poco, cada vez que algo se entendía. Aquel día no había vuelta; ahora sí. Del otro lado está todo lo de antes.');
    const door1 = await d.choose([
      {id: 'back', text: 'Volver por la puerta y dejarla abierta.'},
      {id: 'stay', text: 'Quedarte un rato más: todavía hay cosas que no entendés.'},
    ], {prompt: '¿Volvés o te quedás?'});
    d.evidence('final-door', {answer: door1});
    if (door1 === 'back') {
      await d.say('student', 'Mara, vuelvo por la puerta del primer día. La dejo abierta.');
      await d.say('Mara', 'Andá. Lo que entendiste, la Marea no lo borra.');
      g.setCinematic(true);
      rondaDance(w, {speed: 0.5, ...dance});
      await zip(d, p, DX - 30, GROUND - 60, 0.8).catch(() => {});
      d.describe('Punto se adelanta y llega primero a la puerta.');
      await d.walk(s, DX - 70, GROUND, 320).catch(() => {});
      g.setCinematic(false);
      await d.say('student', 'Punto, llegaste antes, como siempre. Quedate con la Ronda: paso y la dejo abierta, por si quiero volver a entrar.');
      g.audio.punto('happy');
      await pulse(d, p, 2, 0.4).catch(() => {});
      d.describe('El estudiante cruza la puerta. Punto se queda en el umbral, del lado de las Terrazas, y vuelve a la Ronda. La luz queda prendida.');
      g.setCinematic(true);
      await d.fadeTo(s, 0, 1).catch(() => {});
      await zip(d, p, dance.cx + dance.r + 24, dance.cy - 20, 0.9).catch(() => {});
      rondaDance(w, {speed: 0.5, ...dance, ids: [...RONDA_IDS, 'punto']});
      g.setCinematic(false);
    } else {
      d.describe('El estudiante se queda mirando bailar a la Ronda. La puerta sigue ahí, con su luz.');
      await d.say('student', 'Me quedo un rato más. La puerta no se va.');
      g.audio.punto('happy');
      await pulse(d, p, 2, 0.4).catch(() => {});
    }
    if (!replay) writeJournal12(g);
    g.flags.c12final = true;
    g.flags.gameDone = true;
  },
};

function writeJournal12(g) {
  // sólo lo de este capítulo: hay tipos de evidencia con el mismo nombre en otros (count, cut, scale…)
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1) && (!e.seg || e.seg.startsWith('c12.')));
  const first = k => ev.find(e => e.kind === k);
  const seen = [];
  const fam = ev.filter(e => e.kind === 'family-try');
  if (fam.length) { const bad = fam.filter(e => !e.ok).length; seen.push(bad ? `Uniste cada forma con su regla; ${bad === 1 ? 'una vez' : `${bad} veces`} elegiste primero una regla que no era.` : 'Uniste cada forma con su regla sin errar ninguna.'); }
  const jp = first('jump-predict');
  if (jp) seen.push(jp.answer === '3' ? 'Anticipaste el punto más alto del salto en la mitad, a los 3.' : 'Pensaste el punto más alto en otro lado; el salto es igual de los dos lados: a los 3.');
  const ip = first('inverse-predict');
  if (ip) seen.push(ip.answer === 'right' ? 'Deshiciste «el doble más uno» en el orden contrario.' : 'Para deshacer «el doble más uno» probaste otro orden; se deshace al revés: menos uno, la mitad.');
  const bp = first('box-predict');
  if (bp) seen.push(bp.answer === '1' ? 'En la caja de Cornisa leíste el máximo en x = 1: 16.' : bp.answer === '1.5' ? 'En la caja de Cornisa buscaste el máximo en la mitad, como en el salto; la caja no es una U: el máximo está en x = 1.' : 'En la caja de Cornisa elegiste el corte más grande; con 3 no tiene fondo: el máximo está en x = 1.');
  const dp = first('derivative-predict');
  if (dp) seen.push(dp.answer === '4' ? 'Viste que las velocidades de tramos cada vez más cortos se acercan a 4.' : dp.answer === '3.99' ? 'Te quedaste con la última velocidad medida; con tramos más cortos sigue cambiando y se acerca a 4.' : 'Las velocidades de tramos más cortos se acercaban a 4, aunque con tramo cero no se pueda dividir.');
  const ip2 = first('integral-predict');
  if (ip2) seen.push(ip2.answer === '9' ? 'Viste que las sumas se acercan al área bajo el caudal: 9.' : 'Las sumas de rectángulos se acercaban a 9, el área bajo el caudal.');
  const fp = first('final-predict');
  if (fp) seen.push(fp.answer === '5' ? 'Marcaste la noche 5 como plazo y la escalera de Balcón llegó entera a la Marea grande.' : fp.answer === '6' ? 'Marcaste la noche 6 como plazo; la noche 5 ya pasaba los 30 y la Marea se llevó lo que faltaba repasar. Lo repasado resistió, y se rehízo antes de la 6.' : 'Marcaste una noche temprana como plazo; duplicando, la Marea pasa los 30 en la noche 5, y la escalera llegó entera.');
  const fd = first('final-door');
  if (fd) seen.push(fd.answer === 'back' ? 'Al final volviste por la puerta del primer día y la dejaste abierta; Punto llegó antes y se quedó con la Ronda.' : 'Al final te quedaste un rato más con la Ronda; la puerta sigue ahí, abierta.');
  const entry = {
    id: 'c12',
    title: 'Anticipar',
    abbr: 'Reconocer la familia, ajustar las perillas, leer el gráfico: así se anticipa.',
    body: [
      'Las reglas se agrupan en familias que se reconocen por su forma: rectas, curvas que despegan, U (simétricas: iguales de los dos lados de su eje; y = a · x · x, con a positiva más grande, más angosta), olas, curvas que suben cada vez más despacio y curvas partidas. Donde el gráfico se interrumpe hay una discontinuidad; una raya a la que la curva se acerca tanto como se quiera es una asíntota (la de 1 ÷ (x − 2), en el 2, no se toca nunca porque ahí no hay valor; y con x muy grande se acerca a 0 tanto como se quiera sin llegar: la raya acostada del 0 también es asíntota). Los parámetros eligen cuál de la familia: en y = a · x + b, b es dónde empieza y a cuánto sube por paso.',
      'Un gráfico se lee: los ceros, dónde crece y dónde decrece, el máximo; también en uno que no es una U, como la caja de Cornisa, x · (6 − 2x)², un polinomio de grado 3, que como caja sólo tiene sentido con el corte entre 0 y 3. Las reglas se encadenan, y el orden importa; algunas se deshacen (en el orden contrario) y otras sólo si se sabe más (x · x, si se conoce el signo). Con x desde 0, el gráfico de la raíz es el de x · x reflejado sobre la diagonal: (a, b) pasa a (b, a), como (2, 4) y (4, 2).',
      'La tasa de cambio en un tramo es cuánto cambió dividido cuánto pasó; con tramos cada vez más cortos se acerca a la derivada. Juntar lo que entra de a poco es sumar rectángulos cada vez más finos: se acerca al área bajo el gráfico, la integral.',
      'Hay reglas por tramos: una hasta un lugar y otra después, como el precio de Rampa o la distancia al cero, |x|: x a la derecha del cero y −x a la izquierda, que ahí da positivo. Con todo eso se anticipa, suponiendo que la regla sigue; y cuando llegan datos nuevos, se revisa.',
    ],
    seen,
    moments: [
      {id: 'c12.salto', label: 'Desplegar: el salto de Punto'},
    ],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora (≡)');
  g.saveNow();
}

export {lerp, rectSpot};
