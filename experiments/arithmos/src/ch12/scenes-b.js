// Capítulo 12 — Anticipar (12.5 a 12.8): qué tan rápido, lo que se junta, por tramos y anticipar (cierre).

import {lerp, easeInOut} from '../engine/rng.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {jump, avgRate, riemann, tariff} from '../logic/anticipate.js';
import {Drawing, Label, Shape, SHOTS, area, boardCast, clean, poly, dot, S, seedOf, WHITE, YELLOW, BLUE, dec, axes, curve} from './common.js';
import {studentWrites} from '../ch7/scenes-a.js';

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
    const H = [1, 0.5, 0.1, 0.01];
    let k = 0;
    const show = h => {
      const r = avgRate(jump, 1, h);
      w.remove('c12-sec');
      const x0 = 0.2, x1 = 2.6;
      w.add(new Drawing('c12-sec', [S([[px(x0), py(jump(1) + r * (x0 - 1))], [px(x1), py(jump(1) + r * (x1 - 1))]], seedOf(`c12-sec${h}`), {w: 2.2, p: 0.9, ch: BLUE})], {z: 14}));
      w.add(new Label(`c12-r${k}`, `del 1 al ${dec(1 + h)}:  ${dec(r)}`, A.x1 - 150, A.y0 + 40 + k * 32, {size: 19, z: 12}));
      d.describe(`Del segundo 1 al ${dec(1 + h)}, subió a ${dec(r)} por segundo en promedio. La recta azul pasa por los dos puntos.`);
      d.evidence('rate', {h, r: +r.toFixed(3)});
    };
    show(H[0]);
    k++;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá «tramo más corto»: el segundo punto se acerca al 1 y la recta azul gira.']);
      const refresh = () => g.ui.setSpots([wordSpot('c12-short', 'tramo más corto', A.x1 - 80, A.y1 - 26, () => {
        if (!ctl.alive()) return;
        show(H[k]);
        k++;
        g.audio.tap(0.15, 1.2 + k * 0.1);
        if (k >= H.length) { g.ui.setSpots([]); g.setHint(null); resolve(); } else refresh();
      }, {label: 'Achicar el tramo'})]);
      refresh();
    }));
    const c = await d.choose([
      {id: '4', text: 'A 4: cada vez más cerca.'},
      {id: '3.99', text: 'A 3,99: es el último que dio.'},
      {id: 'none', text: 'A nada: con tramo cero no se puede dividir.'},
    ], {prompt: '¿A qué número se acercan?', evaluate: true});
    d.evidence('derivative-predict', {answer: c});
    await d.think(c === '4' ? 'Cuatro. Con tramo cero no se divide, pero los tramos cada vez más cortos se acercan a 4.' : c === '3.99' ? 'Con un tramo más corto daría 3,999, y después 3,9999: se acercan a 4.' : 'Con tramo cero no se puede dividir, es cierto. Pero los tramos cada vez más cortos se acercan a un número: 4.');
    await d.say('student', 'Cornisa, justo al segundo 1, Punto sube a 4 por segundo. Ese número al que se acercan las velocidades de tramos cada vez más cortos se llama derivada. La recta azul del final pasa por dos puntos muy cercanos; la recta que tiene justo inclinación 4 en el segundo 1 se llama tangente.');
    await studentWrites(d, g, 'c12-der', 'velocidad en t = 1:  3 → 3,5 → 3,9 → 3,99 → 4', A.x0 + 20, A.y1 - 4, {size: 17});
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
    const N = [3, 6, 30];
    let k = 0;
    const show = n => {
      w.removeWhere(o => o.id.startsWith('c12-rc'));
      const dt = 3 / n;
      for (let i = 0; i < n; i++) {
        const t = i * dt, h = rate(t);
        if (h <= 0) continue;
        w.add(new Shape(`c12-rc${i}`, poly(`c12-rc${i}`, [[0, 0], [px(dt) - px(0), 0], [px(dt) - px(0), py(h) - py(0)], [0, py(h) - py(0)]], {ch: YELLOW, w: n > 10 ? 1.2 : 2}), px(t), py(0), {z: 12}));
      }
      const s = riemann(rate, 3, n);
      w.add(new Label(`c12-s${k}`, `${n} pedazos:  ${dec(s)}`, A.x1 - 150, A.y0 + 40 + k * 32, {size: 19, z: 12}));
      d.describe(`Partiendo en ${n} pedazos, cada rectángulo es caudal por tiempo; juntos suman ${dec(s)} baldes.`);
      d.evidence('accum', {n, s: +s.toFixed(3)});
    };
    show(N[0]);
    k++;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá «más fino»: los rectángulos se angostan y se pegan más a la recta.']);
      const refresh = () => g.ui.setSpots([wordSpot('c12-fine', 'más fino', A.x1 - 70, A.y1 - 26, () => {
        if (!ctl.alive()) return;
        show(N[k]);
        k++;
        g.audio.tap(0.15, 1 + k * 0.1);
        if (k >= N.length) { g.ui.setSpots([]); g.setHint(null); resolve(); } else refresh();
      }, {label: 'Partir el tiempo en más pedazos'})]);
      refresh();
    }));
    const c = await d.choose([
      {id: '9', text: '9: lo que hay debajo de la recta, un triángulo de 3 por 6, a la mitad.'},
      {id: '6', text: '6: el último caudal.'},
      {id: 'inf', text: 'Cada vez más, sin parar.'},
    ], {prompt: '¿A cuántos baldes se acercan las sumas?', evaluate: true});
    d.evidence('integral-predict', {answer: c});
    await d.think(c === '9' ? 'Nueve: el triángulo bajo la recta, 3 · 6 ÷ 2.' : c === '6' ? 'Seis es el caudal del final, por minuto. Lo juntado es lo que hay debajo de la recta: 3 · 6 ÷ 2 = 9.' : 'Crecen, pero no sin parar: nunca pasan el área bajo la recta, el triángulo de 3 · 6 ÷ 2 = 9, y se le acercan.');
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
    await d.say('student', 'Lo lejos del cero también va por tramos, como Recta y Cuña en la línea de la ladera: +4 y −4 están igual de lejos. A la derecha del cero, x. A la izquierda, −x: con −4, −x es −(−4) = 4. No es negativo: es la distancia. Una V.');
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
    await d.say('Mara', 'La Marea vuelve. Medí hasta qué altura llegó cada noche: 1, 2, 4 y 8 escalones. La escalera de las Terrazas tiene 30. ¿Llegamos a terminar de redibujar?');
    const box = {x: A.x0 + 40, y: A.y0 + 20, w: 300, h: 210};
    const {px, py} = axes(w, 'c12-g', box, [0, 6], [0, 40], {xticks: [1, 2, 3, 4, 5, 6], yticks: [10, 20, 30, 40], xname: 'noche'});
    for (const [n, v] of NIGHTS) w.add(new Shape(`c12-n${n}`, dot(`c12-n${n}`, 6, BLUE), px(n), py(v), {z: 14}));
    w.add(new Drawing('c12-top', Array.from({length: 12}, (_, i) => S([[px(i * 0.5), py(30)], [px(i * 0.5 + 0.25), py(30)]], seedOf('c12-top') + i, {w: 1.6, p: 0.7, ch: YELLOW, lift: false})), {z: 12}));
    w.add(new Label('c12-topl', 'escalera: 30', px(0) + 6, py(30) - 8, {size: 15, z: 13, ch: YELLOW}));
    d.describe('Cuatro puntos azules, las noches 0 a 3: 1, 2, 4 y 8. Una raya punteada amarilla en 30, la altura de la escalera.');
    await d.shot(SHOTS.tiles, 0.8);
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
    const c = await d.choose([
      {id: '5', text: 'En la noche 5: 32 pasa los 30.'},
      {id: '4', text: 'En la noche 4: 16.'},
      {id: '15', text: 'En la noche 15, sumando de a dos.'},
    ], {prompt: 'Si sigue duplicando, ¿en qué noche pasa la escalera?', evaluate: true});
    d.evidence('final-predict', {answer: c});
    await d.think(c === '5' ? 'La quinta: 16 todavía no, 32 sí.' : c === '4' ? 'La cuarta llega a 16: todavía no. La quinta, 32: ahí pasa.' : 'Duplica, no suma: la cuarta 16, la quinta 32. Hay que apurarse.');
    await d.say('student', 'Mara, con cuatro noches no se puede estar seguro: otra regla podría pasar por los mismos cuatro puntos y seguir distinto. Si sigue duplicando, tenemos hasta la quinta. Lo anotamos como suposición y miramos cada noche si se cumple.');
    await d.say('Mara', 'Y mientras, redibujamos lo que todavía no se entiende: lo que entendimos, la Marea no lo borra.');
    // la cuarta noche pone a prueba la suposición
    await d.say('Mara', 'Cuarta noche.');
    g.setCinematic(true);
    const n4 = w.add(new Shape('c12-n4', dot('c12-n4', 6, BLUE), px(4), py(16), {z: 15, fade: 0}));
    await d.fadeTo(n4, 1, 0.6);
    g.setCinematic(false);
    d.describe('Un punto azul nuevo: la cuarta noche la Marea llegó a 16, justo sobre la curva que duplica.');
    d.evidence('final-check', {night: 4, v: 16});
    await d.think('Dieciséis, sobre la curva. La suposición aguantó una noche más: no es una prueba, pero ahora confiamos un poco más. La quinta pasa los 30.');
    await d.say('Mara', 'Entonces redibujamos la escalera esta noche, antes de la quinta. ¡A trabajar!');
    // la quinta noche: la Marea grande pasa y la escalera, redibujada a tiempo, resiste
    g.setCinematic(true);
    await d.shot(SHOTS.board, 1.2);
    d.describe('Quinta noche. Pasa la Marea grande, una brisa de borrador sobre las Terrazas, más alta que la escalera. La escalera, redibujada a tiempo, resiste; la pizarra con sus cuentas, también.');
    g.audio.marea?.(5);
    g.camera.shake = 0.3;
    await d.wait(2.2);
    g.setCinematic(false);
    await d.say('Mara', 'Llegamos. La escalera sigue ahí, y lo que entendimos también.');
    // Punto corre por su gráfico mientras se dice su viaje
    p.setMode('still');
    const run = d.tween(3.2, q => { const n = 5 * q; p.x = px(n); p.y = py(Math.min(40, 2 ** n)) - 14; }, easeInOut);
    d.describe('Punto corre por la curva, desde la primera noche hasta la quinta, un paso adelante.');
    await d.say('student', 'Punto, al principio eras un punto que contaba. Después tuviste un lado para ir, una flecha. Ahora corrés por un gráfico, un paso adelante.');
    await run.catch(() => {});
    g.audio.punto('happy');
    await pulse(d, p, 2, 0.4).catch(() => {});
    follow(p, s);
    if (!replay) writeJournal12(g);
    g.flags.c12final = true;
    g.flags.gameDone = true;
  },
};

function writeJournal12(g) {
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const first = k => ev.find(e => e.kind === k);
  const seen = [];
  const fam = ev.filter(e => e.kind === 'family-try');
  if (fam.length) { const bad = fam.filter(e => !e.ok).length; seen.push(bad ? `Reconociste las seis formas; ${bad === 1 ? 'una' : bad} la${bad === 1 ? '' : 's'} probaste en otra familia primero.` : 'Reconociste las seis formas de entrada.'); }
  const jp = first('jump-predict');
  if (jp) seen.push(jp.answer === '3' ? 'Anticipaste el punto más alto del salto en la mitad, a los 3.' : 'Pensaste el punto más alto en otro lado; el salto es igual de los dos lados: a los 3.');
  const ip = first('inverse-predict');
  if (ip) seen.push(ip.answer === 'right' ? 'Deshiciste «el doble más uno» en el orden contrario.' : 'Para deshacer «el doble más uno» probaste otro orden; se deshace al revés: menos uno, la mitad.');
  const dp = first('derivative-predict');
  if (dp) seen.push(dp.answer === '4' ? 'Viste que las velocidades de tramos cada vez más cortos se acercan a 4.' : 'Las velocidades de tramos más cortos se acercaban a 4, aunque con tramo cero no se pueda dividir.');
  const ip2 = first('integral-predict');
  if (ip2) seen.push(ip2.answer === '9' ? 'Viste que las sumas se acercan al área bajo el caudal: 9.' : 'Las sumas de rectángulos se acercaban a 9, el área bajo el caudal.');
  const fp = first('final-predict');
  if (fp) seen.push(fp.answer === '5' ? 'Anticipaste la noche 5 para la Marea.' : 'Para la Marea pensaste otra noche; duplicando, pasa la escalera en la quinta.');
  const entry = {
    id: 'c12',
    title: 'Anticipar',
    abbr: 'Reconocer la familia, ajustar las perillas, leer el gráfico: así se anticipa.',
    body: [
      'Las reglas se agrupan en familias que se reconocen por su forma: rectas, curvas que despegan, U, olas, curvas que suben cada vez más despacio y curvas cortadas. Donde una curva se corta hay una discontinuidad; la raya a la que se pega sin tocarla es una asíntota. Los parámetros eligen cuál de la familia: en y = a · x + b, b es dónde empieza y a cuánto sube por paso.',
      'Un gráfico se lee: los ceros, dónde crece y dónde decrece, el máximo. Las reglas se encadenan, y el orden importa; algunas se deshacen (en el orden contrario) y otras sólo si se sabe más (x · x, si se conoce el signo). Con x desde 0, el gráfico de la raíz es el de x · x reflejado sobre la diagonal: (a, b) pasa a (b, a).',
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
