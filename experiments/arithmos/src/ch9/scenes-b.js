// Capítulo 9 — Depende (9.5 a 9.8): dónde se puede, lo que sale, tres maneras y lo que vuelve.

import {lerp} from '../engine/rng.js';
import {pulse, rectSpot, wordSpot} from '../acting.js';
import {domainOf, imageOf} from '../logic/functions.js';
import {SHOTS, area, boardCast, clean, poly, dot, Drawing, Label, Shape, S, seedOf, WHITE, YELLOW, BLUE} from './common.js';
import {studentWrites} from '../ch7/scenes-a.js';

const sg = n => (n < 0 ? `−${-n}` : String(n));

/** La máquina de Mara (caja con entrada y salida), con su cartel. */
function machine(w, id, x, y, wd, h, label) {
  w.add(new Shape(id, [
    ...poly(`${id}b`, [[0, 0], [wd, 0], [wd, h], [0, h]], {w: 3}),
    ...poly(`${id}i`, [[-30, h / 2 - 12], [0, h / 2 - 12], [0, h / 2 + 12], [-30, h / 2 + 12]], {closed: false, w: 2}),
    ...poly(`${id}o`, [[wd + 30, h / 2 - 12], [wd, h / 2 - 12], [wd, h / 2 + 12], [wd + 30, h / 2 + 12]], {closed: false, w: 2}),
  ], x, y, {z: 12}));
  w.add(new Label(`${id}l`, label, x + wd / 2, y + h / 2 + 10, {size: 26, align: 'center', z: 12, ch: YELLOW}));
}

/** Pasa un número por la máquina; devuelve el texto de salida (o null si se traba). */
async function feed(d, g, {x, y, wd, h}, input, out, k) {
  const w = g.world;
  const t = w.add(new Label(`c9-ft${k}`, sg(input), x - 60, y + h / 2 + 10, {size: 26, align: 'center', z: 14}));
  await d.tween(0.4, q => { t.x = lerp(x - 60, x + wd / 2, q); t.fade = 1 - q; });
  w.remove(t.id);
  if (out == null) {
    const m = w.get('c9-m');
    const x0 = m.x;
    g.audio.punto('no');
    await d.tween(0.5, q => { m.x = x0 + Math.sin(q * Math.PI * 8) * 5 * (1 - q); });
    m.x = x0;
    return null;
  }
  g.audio.tap(0.2, 0.9);
  const o = w.add(new Label(`c9-fo${k}`, out, x + wd / 2, y + h / 2 + 10, {size: 26, align: 'center', z: 14, fade: 0}));
  await d.tween(0.4, q => { o.x = lerp(x + wd / 2, x + wd + 60, q); o.fade = q; });
  w.remove(o.id);
  return out;
}

// ——————————————————————————————————————————————
// 9.5 Dónde se puede
// ——————————————————————————————————————————————

export const dominio = {
  id: 'c9.dominio',
  title: 'Dónde se puede',
  setup(g) {
    clean(g, /^c9-/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Rampa', 'Le pedí a Mara una máquina para mi reparto: entra cuántos vienen, sale lo que le toca a cada uno. 1 ÷ (x − 2), como en la escalera.');
    const M = {x: A.x0 + 190, y: A.y0 + 40, wd: 150, h: 90};
    machine(w, 'c9-m', M.x, M.y, M.wd, M.h, '1 ÷ (x − 2)');
    w.add(new Label('c9-in', 'entra:', A.x0 + 20, A.y1 - 52, {size: 18, z: 12, ch: BLUE}));
    await d.shot(SHOTS.tiles, 0.8);
    const f = x => 1 / (x - 2);
    const text = x => { const q = x - 2; return q === 0 ? null : q === 1 ? '1' : q === -1 ? '−1' : q > 0 ? `1/${q}` : `−1/${-q}`; };
    const INS = [-1, 0, 2, 3, 5];
    const tried = [];
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá un número para darle a la máquina. Buscá si hay alguno con el que no pueda.']);
      const refresh = () => g.ui.setSpots(INS.filter(x => !tried.includes(x)).map(x => wordSpot(`c9-x${x}`, sg(x), A.x0 + 110 + INS.indexOf(x) * 90, A.y1 - 40, () => go(x), {label: `Darle el ${sg(x)} a la máquina`})));
      const go = async x => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        tried.push(x);
        let out;
        try { out = await feed(d, g, M, x, text(x), tried.length); } catch { return; }
        w.add(new Label(`c9-r${x}`, out == null ? `${sg(x)} → se traba` : `${sg(x)} → ${out}`, A.x0 + 20, A.y0 + 30 + (tried.length - 1) * 30, {size: 22, z: 12, ch: out == null ? YELLOW : undefined}));
        d.describe(out == null ? `Con ${sg(x)}, la máquina se traba: abajo queda cero.` : `Entra ${sg(x)} y sale ${out}.`);
        d.evidence('domain-try', {x, out});
        busy = false;
        if (tried.includes(2) && tried.length >= 3) { g.setHint(null); resolve(); }
        else if (tried.length >= 4) { g.setHint(null); resolve(); }
        else refresh();
      };
      refresh();
    }));
    if (!tried.includes(2)) {
      await d.say('Rampa', '¿Y con 2?');
      tried.push(2);
      await feed(d, g, M, 2, null, tried.length);
      w.add(new Label('c9-r2', '2 → se traba', A.x0 + 20, A.y0 + 30 + (tried.length - 1) * 30, {size: 22, z: 12, ch: YELLOW}));
    }
    await d.think('Con 2 se traba: abajo queda cero. Con todos los demás sale algo, aunque sea negativo.');
    const c = await d.choose([
      {id: 'int', text: 'Enteros mayores que 2: tiene que venir gente, y más de dos.'},
      {id: 'not2', text: 'Cualquier número menos el 2, como la máquina.'},
      {id: 'all', text: 'Cualquier número.'},
    ], {prompt: 'Para el reparto de Rampa, ¿qué entradas tienen sentido?', evaluate: true});
    d.evidence('domain-story', {answer: c});
    if (c !== 'int') await d.think(c === 'not2' ? 'La máquina acepta −1 o 0, pero no vienen −1 personas ni cero. Para el reparto, enteros mayores que 2.' : 'Con 2 la máquina ni siquiera anda. Y para el reparto, sólo enteros mayores que 2.');
    const dom = domainOf(f, INS);
    await d.say('student', 'Rampa, las entradas con las que se puede se llaman el dominio. El de la cuenta es todo menos el 2; el de tu reparto, 3, 4, 5… Depende de qué cuenta la máquina.');
    await studentWrites(d, g, 'c9-dom', 'dominio: cuenta x ≠ 2;  reparto 3, 4, 5, …', A.x0 + 20, A.y1 - 8, {size: 20});
    d.evidence('domain', {dom});
    g.flags.c9domain = true;
  },
};

// ——————————————————————————————————————————————
// 9.6 Lo que sale
// ——————————————————————————————————————————————

export const imagen = {
  id: 'c9.imagen',
  title: 'Lo que sale',
  setup(g) {
    clean(g, /^c9-/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Esta máquina hace «por sí mismo»: x · x. Oval me pidió que le saque un −4 para una cuenta. ¿Qué le doy?');
    const M = {x: A.x0 + 200, y: A.y0 + 30, wd: 130, h: 80};
    machine(w, 'c9-m', M.x, M.y, M.wd, M.h, 'x · x');
    w.add(new Label('c9-in', 'entra:', A.x0 + 120, A.y1 - 86, {size: 18, z: 12, ch: BLUE}));
    await d.shot(SHOTS.tiles, 0.8);
    const INS = [-3, -2, -1, 0, 1, 2, 3];
    const pos = x => { const i = INS.indexOf(x); return [A.x0 + 190 + (i % 4) * 88, A.y1 - (i < 4 ? 92 : 16)]; };
    const tried = [];
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá números para dárselos a la máquina. ¿Alguno da −4?']);
      const refresh = () => g.ui.setSpots([
        ...INS.filter(x => !tried.includes(x)).map(x => wordSpot(`c9-x${x}`, sg(x), ...pos(x), () => go(x), {label: `Darle el ${sg(x)} a la máquina`})),
        ...(tried.length >= 4 ? [wordSpot('c9-enough', 'ya probé', A.x1 - 50, A.y0 + 100, () => { if (!busy && ctl.alive()) { g.ui.setSpots([]); g.setHint(null); resolve(); } }, {label: 'Dejar de probar'})] : []),
      ]);
      const go = async x => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        tried.push(x);
        let out;
        try { out = await feed(d, g, M, x, String(x * x), tried.length); } catch { return; }
        w.add(new Label(`c9-r${x}`, `${sg(x)} → ${out}`, A.x0 + 20, A.y0 + 30 + (tried.length - 1) * 28, {size: 22, z: 12}));
        d.describe(`Entra ${sg(x)} y sale ${out}.`);
        d.evidence('image-try', {x, y: x * x});
        busy = false;
        if (tried.length >= INS.length) { g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    const c = await d.choose([
      {id: 'never', text: 'No: un número de la recta, por sí mismo, nunca da negativo.'},
      {id: 'other', text: 'Sí, con algún número que no probé.'},
      {id: 'm2', text: 'Sí: con −2, que es negativo.'},
    ], {prompt: '¿Puede salir −4?', evaluate: true});
    d.evidence('image-predict', {answer: c});
    if (c === 'm2') await d.think('(−2) · (−2) da 4, no −4: menos por menos es más, como en el cap. 4.');
    if (c === 'other') await d.think('Positivo por positivo, positivo; negativo por negativo, positivo; cero por cero, cero. No hay número de la recta que falte probar.');
    const img = imageOf(x => x * x, INS);
    await d.say('student', 'Mara, lo que puede salir se llama la imagen. Con los números que probamos salió 0, 1, 4 o 9; con todos, sale cualquier número de 0 para arriba (√2 · √2 = 2), nunca uno negativo. El −4 no está, con los números de la recta.');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.3);
    await studentWrites(d, g, 'c9-img', 'imagen de x · x, en la recta: 0 y los positivos', A.x0 + 20, A.y1 - 8, {size: 20});
    d.evidence('image', {img});
    g.flags.c9image = true;
  },
};

// ——————————————————————————————————————————————
// 9.7 Tres maneras
// ——————————————————————————————————————————————

export const maneras = {
  id: 'c9.maneras',
  title: 'Tres maneras',
  setup(g) {
    clean(g, /^c9-/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Dibujé las escaleras de la otra vez: la mía, diez por día, y la de Punto, el doble cada día. Y una tercera que me trajo Peldaño. Se me mezclaron los carteles.');
    const gx = A.x0 + 30, gy = A.y0 + 20, UX = 46, UY = 2.7;
    const px = t => gx + t * UX, py = v => gy + (70 - v) * UY;
    const axes = [S([[px(0), py(0)], [px(6) + 10, py(0)]], seedOf('c9-ax'), {w: 2.4, p: 0.9}), S([[px(0), py(0)], [px(0), py(70)]], seedOf('c9-ay'), {w: 2.4, p: 0.9})];
    w.add(new Drawing('c9-axes', axes, {z: 11}));
    for (let t = 0; t <= 6; t++) w.add(new Label(`c9-tx${t}`, String(t), px(t), py(0) + 20, {size: 16, align: 'center', z: 12, ch: BLUE}));
    w.add(new Label('c9-tl', 'día', px(6) + 18, py(0) + 20, {size: 16, z: 12, ch: BLUE}));
    for (const v of [10, 30, 50, 70]) w.add(new Label(`c9-ty${v}`, String(v), px(0) - 16, py(v) + 5, {size: 14, align: 'right', z: 12, ch: BLUE}));
    const fns = {
      A: {f: t => 1 + 10 * t, ch: WHITE, expr: '1 + 10 · d'},
      B: {f: t => 10 + t, ch: BLUE, expr: '10 + d'},
      C: {f: t => 2 ** t, ch: YELLOW, expr: '2ᵈ'},
    };
    for (const [k, fn] of Object.entries(fns)) {
      // se cuentan por día: sólo los puntos, sin unir
      for (let t = 0; t <= 6; t++) if (fn.f(t) <= 70) w.add(new Shape(`c9-gd${k}${t}`, dot(`c9-gd${k}${t}`, 5, fn.ch), px(t), py(fn.f(t)), {z: 13}));
    }
    const lab = {A: [px(2) - 30, py(21)], B: [px(6) + 12, py(16)], C: [px(5.5) + 10, py(45)]};
    for (const k of Object.keys(fns)) w.add(new Label(`c9-gl${k}`, k, lab[k][0], lab[k][1], {size: 24, z: 14, ch: fns[k].ch, weight: 700}));
    d.describe('Tres gráficos de puntos, uno por día, en el mismo mapa: A sube de a diez; B empieza en 10 y casi no sube; C empieza en 1, junto con A, va bajito y después se dispara.');
    await d.shot(SHOTS.tiles, 0.8);
    const EX = [{id: 'A', text: '1 + 10 · d'}, {id: 'C', text: '2ᵈ'}];
    const done = new Set();
    let sel = null;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => [sel ? `¿Qué gráfico es ${sel.text}? Tocá su letra.` : 'Tocá un cartel de la derecha y después la letra del gráfico que le corresponde.']);
      const refresh = () => g.ui.setSpots([
        ...EX.filter(e => !done.has(e.id)).map((e, i) => wordSpot(`c9-e${e.id}`, e.text, A.x1 - 70, A.y0 + 60 + EX.indexOf(e) * 80, () => { if (ctl.alive()) { sel = sel === e ? null : e; refresh(); } }, {label: `Cartel ${e.text}`, selected: sel === e})),
        ...(sel ? Object.keys(fns).map(k => rectSpot(`c9-l${k}`, `El gráfico ${k}`, {x: lab[k][0] - 14, y: lab[k][1] - 28, w: 44, h: 40}, () => pick(k))) : []),
      ]);
      const pick = k => {
        if (!ctl.alive() || !sel) return;
        d.evidence('match', {expr: sel.id, graph: k, ok: k === sel.id});
        if (k !== sel.id) {
          const f = fns[k].f;
          g.note(`En ${k}, el día 0 hay ${f(0)} y el día 1, ${f(1)}. Con ${sel.text}, el día 0 da ${fns[sel.id].f(0)} y el día 1, ${fns[sel.id].f(1)}.`);
          return;
        }
        done.add(sel.id);
        w.add(new Label(`c9-ex${k}`, `${k}: ${sel.text}`, A.x0 + 340, A.y0 + 66 + EX.findIndex(e => e.id === k) * 80, {size: 20, z: 14, ch: fns[k].ch}));
        g.audio.tap(0.2, 1.4);
        sel = null;
        if (done.size === EX.length) { g.ui.setSpots([]); g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    d.describe('A es la escalera de Mara, 1 + 10 · d; C, la de Punto, 2 elevado a d. B era la de Peldaño.');
    await d.say('student', 'Mara, con la cuenta se calcula cualquier día; con la tabla se leen algunos; con el gráfico se ve de un vistazo: los puntos de A suben lo mismo cada día y los de C despegan. Las dos empiezan en 1; el día 6, la de Punto pasa a la de Mara: 64 contra 61, como vimos. Y como se cuentan por día, lo que se lee son los puntos.');
    await d.say('Peldaño', 'Y la mía, la B, es diez más uno por día: 10 + d.');
    d.evidence('three-ways', {done: [...done]});
    g.flags.c9ways = true;
  },
};

// ——————————————————————————————————————————————
// 9.8 Lo que vuelve
// ——————————————————————————————————————————————

const DAY = [[8, 4], [10, 2], [12, 1], [14, 2], [16, 4]];

export const vuelve = {
  id: 'c9.vuelve',
  title: 'Lo que vuelve',
  setup(g) {
    clean(g, /^c9-/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const p = w.get('punto');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', 'Seguí midiendo, varios días. Miren.');
    // el tiempo a escala: cada día ocupa sus 24 horas, también las que no se midieron
    const gx = A.x0 + 24, gy = A.y0 + 40, HX = 8, UY = 34;
    const px = (day, h) => gx + (day * 24 + h - 7) * HX, py = v => gy + (4 - v) * UY;
    w.add(new Drawing('c9-base', [S([[gx - 6, py(0)], [px(2, 17), py(0)]], seedOf('c9-base'), {w: 2.4, p: 0.9})], {z: 11}));
    for (const v of [1, 2, 4]) w.add(new Label(`c9-vy${v}`, String(v), gx - 8, py(v) + 6, {size: 16, align: 'right', z: 12, ch: BLUE}));
    // las horas del día 1, para poder leer «a las 10» en el gráfico
    for (const h of [8, 12, 16]) w.add(new Label(`c9-vh${h}`, String(h), px(0, h), py(0) - 6, {size: 14, align: 'center', z: 12, ch: BLUE}));
    w.add(new Drawing('c9-vt', [8, 10, 12, 14, 16].map((h, i) => S([[px(0, h), py(0) - 3], [px(0, h), py(0) + 3]], seedOf('c9-vt') + i, {w: 1.6, p: 0.7, ch: BLUE, lift: false})), {z: 12}));
    const drawDay = async k => {
      const line = w.add(new Drawing(`c9-v${k}`, [S(DAY.map(([h, v]) => [px(k, h), py(v)]), seedOf(`c9-v${k}`), {w: 2.4, p: 0.9, ch: YELLOW})], {z: 13, progress: 0}));
      DAY.forEach(([h, v]) => w.add(new Shape(`c9-vd${k}${h}`, dot(`c9-vd${k}${h}`, 4), px(k, h), py(v), {z: 14})));
      w.add(new Label(`c9-vl${k}`, `día ${k + 1}`, px(k, 12), py(0) + 22, {size: 17, align: 'center', z: 12, ch: BLUE}));
      // las horas medidas de ese día, y la noche que sigue (de 20 a 6, sin sol; de 16 a 20 y de 6 a 8 hay sombra pero no se midió)
      if (k > 0) w.add(new Drawing(`c9-vt${k}`, [8, 10, 12, 14, 16].map((h, i) => S([[px(k, h), py(0) - 3], [px(k, h), py(0) + 3]], seedOf(`c9-vt${k}`) + i, {w: 1.6, p: 0.7, ch: BLUE, lift: false})), {z: 12}));
      if (k < 2) {
        w.add(new Drawing(`c9-vnb${k}`, [S([[px(k, 20), py(0) + 6], [px(k, 20), py(0) + 12], [px(k, 30), py(0) + 12], [px(k, 30), py(0) + 6]], seedOf(`c9-vnb${k}`), {w: 1.4, p: 0.6, ch: BLUE, lift: false})], {z: 12, fade: 0.7}));
        w.add(new Label(`c9-vn${k}`, 'noche', px(k, 25), py(0) + 30, {size: 14, align: 'center', z: 12, ch: BLUE, fade: 0.7}));
      }
      await d.draw(line, 0.6, {sound: false});
    };
    await drawDay(0);
    d.describe(`El día 1, dibujado: ${DAY.map(([h, v]) => `a las ${h}, ${v}`).join('; ')}. Una ve.`);
    await d.shot(SHOTS.tiles, 0.8);
    // primero se anticipa, después se mira lo medido
    const c = await d.choose([
      {id: '2', text: '2, como el día 1 a las 10: el sol hace el mismo recorrido.'},
      {id: 'unknown', text: 'No se puede saber: es otro día.'},
      {id: 'more', text: 'Más: cada día crece.'},
    ], {prompt: 'El día 2, a las 10, ¿cuánto habrá medido la sombra de Cornisa?', evaluate: true});
    d.evidence('periodic-predict', {answer: c});
    let k = 1;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => [k === 1 ? 'Tocá «otro día»: aparece lo que midió el día 2.' : 'Tocá «otro día» para ver uno más.']);
      const refresh = () => g.ui.setSpots([wordSpot('c9-next', 'otro día', A.x1 - 70, A.y1 - 30, async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        try { await drawDay(k); } catch { return; }
        d.describe(`El día ${k + 1}, medido: la misma ve, de 4 a 1 y de vuelta a 4.`);
        k++;
        busy = false;
        if (k === 2) {
          // el jugador mira él mismo el punto de las 10 del día 2
          try { await d.say('Cornisa', 'Fijate el día 2: ¿cuánto midió a las 10? Tocá ese punto.'); } catch { return; }
          g.setHint(() => ['Tocá el punto de las 10 del día 2: el segundo punto de esa ve.']);
          const at10 = DAY.find(([h]) => h === 10);
          g.ui.setSpots([rectSpot('c9-d2at10', 'El punto de las 10 del día 2', {x: px(1, 10) - 16, y: py(at10[1]) - 16, w: 32, h: 32}, () => {
            if (!ctl.alive()) return;
            w.add(new Label('c9-d2v', String(at10[1]), px(1, 10) - 14, py(at10[1]) + 4, {size: 18, align: 'right', z: 15, ch: YELLOW}));
            d.describe(`El día 2 a las 10, la sombra midió ${at10[1]}.`);
            d.evidence('periodic-check', {v: at10[1]});
            g.setHint(() => ['Tocá «otro día» para ver uno más.']);
            refresh();
          })]);
          return;
        }
        if (k >= 3) { g.setHint(null); resolve(); } else refresh();
      }, {label: 'Ver lo que midió Cornisa otro día'})]);
      refresh();
    }));
    await d.think(c === '2' ? 'Dos, como dijiste: la misma ve.' : c === 'more' ? 'No creció: el día 2 a las 10 midió 2, como el primero. La misma ve.' : 'Con un solo día no se sabe seguro. Se anticipa con lo que sabemos del sol, y después se mide: dio 2.');
    await d.think('Entre las 16 de un día y las 8 del otro no medimos: de noche no hay sombra, ahí no está definida; al atardecer sí hay, pero no está en la tabla. En el dibujo cada día ocupa sus 24 horas: la ve vuelve cada 24 horas, aunque se mida sólo de 8 a 16.');
    const c2 = await d.choose([
      {id: '4', text: 'Unos 4, como los días medidos a las 8, si el sol sigue igual.'},
      {id: 'unknown', text: 'No se puede saber: falta medirlo.'},
      {id: 'more', text: 'Más que 4: con los días, la sombra crece.'},
    ], {prompt: 'Dentro de diez días, a las 8, ¿cuánto va a medir?', evaluate: true});
    d.evidence('periodic-transfer', {answer: c2});
    await d.say('student', c2 === '4' ? 'Cornisa, si el sol sigue haciendo el mismo recorrido, unos 4. No es una medición: es anticipar. En diez días lo medimos y vemos.' : c2 === 'more' ? 'Cornisa, los días medidos no crecieron: repitieron la ve. Si el sol sigue igual, unos 4. Es anticipar, no medir: en diez días lo medimos y vemos.' : 'Cornisa, medido no está. Anticipado sí, suponiendo que el sol repite su recorrido: unos 4. En diez días lo medimos y vemos.');
    await d.think('Lo que se repite se puede anticipar, mientras el sol dé la misma vuelta. En invierno la ve cambia mucho: a la misma hora, la sombra es varias veces más larga.');
    if (!replay) writeJournal9(g);
    await d.say('Mara', 'Vueltas que se repiten… El sol da vueltas, la rueda del pozo da vueltas. Para eso hay que medir ángulos de otra manera.');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.3).catch(() => {});
    g.flags.c9periodic = true;
  },
};

function writeJournal9(g) {
  // sólo lo de este capítulo: hay tipos de evidencia con el mismo nombre en otros (count, cut, scale…)
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1) && (!e.seg || e.seg.startsWith('c9.')));
  const first = k => ev.find(e => e.kind === k);
  const seen = [];
  const ip = first('inverse-predict');
  if (ip) seen.push(ip.answer === 'both' ? 'Con la sombra 2 dijiste «las 10 o las 14»: la hora no depende sólo de la sombra.' : 'Con la sombra 2 elegiste una sola hora; dando vuelta las flechas, del 2 salían dos: las 10 y las 14.');
  const rt = ev.filter(e => e.kind === 'rule-try');
  const rules = [...new Set(rt.map(e => e.rule))];
  if (rt.length) seen.push(rt.length === 1 ? `Armaste la regla de Mara a la primera: ${rt[0].rule}.` : `Probaste ${rules.length} reglas (${rules.join(', ')}); las que no eran fallaban en algún renglón anotado.`);
  const rp = first('rule-predict');
  if (rp) seen.push(rp.answer === '21' ? 'Con tu regla anticipaste que con 10 salía 21.' : rp.answer === '20' ? 'Con 10 dijiste 20: faltó el + 1 de la regla; salió 21.' : 'Con 10 dijiste 13, sumando lo mismo que entre renglones; la regla da 21.');
  const jp = first('join-predict');
  if (jp) seen.push(jp.answer === 'join' ? 'Uniste los puntos de la sombra: entre medición y medición también hay sombra.' : jp.answer === 'loose' ? 'Pensaste dejar los puntos sueltos; entre las 8 y las 10 también hay sombra, así que se unen (suponiendo).' : 'Quisiste una curva linda; se une por los puntos, sin inventar.');
  const jd = first('join-discrete');
  if (jd) seen.push(jd.answer === 'loose' ? 'Las familias por día quedaron sueltas: no hay «lunes y medio».' : 'Quisiste unir las familias por día; no hay «lunes y medio»: van sueltas.');
  const vp = ev.filter(e => e.kind === 'vertical-predict');
  if (vp.length) {
    const ok = vp.filter(e => e.said === e.truth).length, still = vp.filter(e => !e.moves).length;
    seen.push(`Con la recta parada acertaste ${ok} de ${vp.length} dibujos${still ? `; en ${still === 1 ? 'uno' : still} decidiste sin moverla` : ', y la moviste antes de decidir'}.`);
  }
  const ds = first('domain-story');
  if (ds) seen.push(ds.answer === 'int' ? 'Para el reparto de Rampa elegiste los enteros mayores que 2.' : 'Para el reparto de Rampa pensaste en más números; tiene sentido con enteros mayores que 2, aunque la cuenta acepte todos menos el 2.');
  const im = first('image-predict');
  if (im) seen.push(im.answer === 'never' ? 'Viste que x · x, con números de la recta, nunca da negativo.' : 'Pensaste que x · x podía dar −4; con números de la recta, nunca da negativo.');
  const pp = first('periodic-predict');
  if (pp) seen.push(pp.answer === '2' ? 'Antes de verlo, anticipaste que el día 2 a las 10 la sombra mediría 2.' : pp.answer === 'more' ? 'Pensaste que la sombra crecía cada día; el día 2 a las 10 midió 2, como el primero.' : 'Dijiste que mañana no se podía saber; el día 2 repitió la ve: a las 10, 2.');
  const pt = first('periodic-transfer');
  if (pt) seen.push(pt.answer === '4' ? 'Para dentro de diez días a las 8 dijiste 4, si el sol sigue dando la misma vuelta.' : pt.answer === 'more' ? 'Para dentro de diez días a las 8 pensaste que la sombra crecía; los días medidos repetían la ve: 4, mientras el sol dé la misma vuelta.' : 'Para dentro de diez días a las 8 dijiste que no se podía saber; lo que se repite se anticipa: 4, mientras el sol dé la misma vuelta.');
  const entry = {
    id: 'c9',
    title: 'Depende',
    abbr: 'Una función le asigna a cada entrada una sola salida; se puede decir con flechas, tablas, gráficos o cuentas.',
    body: [
      'Una función le asigna a cada entrada una sola salida: el largo de la sombra depende de la hora. Al revés no siempre: con el largo 2 pueden ser las 10 o las 14. Eso es una relación, pero no una función.',
      'Una regla se adivina con casos; un caso nuevo puede mostrar que está mal, pero si coincide no la prueba (otra regla podría coincidir ahí). Una relación une entradas con salidas; es función si a cada entrada le toca una sola. Una máquina que con el mismo número da distinto no es una función.',
      'Un gráfico se lee: cada punto dice algo. Se unen los puntos cuando entre medio también hay valores (y es una suposición); no se unen cuando no hay nada entre medio. Si una recta parada corta un dibujo dos veces, no es el gráfico de una función.',
      'El dominio son las entradas con las que se puede: 1 ÷ (x − 2), todo menos el 2; el reparto, enteros mayores que 2. La imagen es lo que puede salir: con números de la recta, x · x da 0 o positivos. Una misma función se dice con una cuenta, una tabla o un gráfico; lo que se repite se puede anticipar.',
    ],
    seen,
    moments: [
      {id: 'c9.puntos', label: 'Desplegar: puntos que se paran'},
    ],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora (≡)');
  g.saveNow();
}
