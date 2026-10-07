// Capítulo 11 — Lo que pasa a veces (11.5 a 11.8): contar sin contar, dos dados, juntas no es causa, anticipar.

import {Drawing, Label, Shape} from '../engine/world.js';
import {pulse, rectSpot, wordSpot} from '../acting.js';
import {outfits, diceSums, rollTwo} from '../logic/chance.js';
import {SHOTS, area, boardCast, clean, poly, dot, S, seedOf, WHITE, YELLOW, BLUE} from '../ch9/common.js';
import {studentWrites} from '../ch7/scenes-a.js';

// ——————————————————————————————————————————————
// 11.5 Contar sin contar
// ——————————————————————————————————————————————

export const contar = {
  id: 'c11.contar',
  title: 'Contar sin contar',
  setup(g) {
    clean(g, /^c11-/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', 'Para la fiesta de la escalera tengo 3 sombreros y 2 bufandas. ¿De cuántas maneras distintas me puedo vestir?');
    const HATS = ['hongo', 'paja', 'copa'], SCARVES = ['roja', 'azul'];
    const rx = A.x0 + 30, ry = A.y0 + 130;
    w.add(new Shape('c11-root', dot('c11-root', 6, WHITE), rx, ry, {z: 13}));
    const hy = i => A.y0 + 50 + i * 80, hx = A.x0 + 150, sx = A.x0 + 290;
    HATS.forEach((h, i) => w.add(new Label(`c11-h${i}`, h, hx, hy(i) + 6, {size: 20, align: 'center', z: 13})));
    d.describe('Un árbol empieza a la izquierda; a su derecha, los tres sombreros: hongo, paja y copa.');
    await d.shot(SHOTS.tiles, 0.8);
    const opened = new Set();
    let leaves = 0;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá cada sombrero: le salen las ramas de las bufandas que se pueden usar con él.']);
      const refresh = () => g.ui.setSpots(HATS.map((h, i) => i).filter(i => !opened.has(i)).map(i => rectSpot(`c11-oh${i}`, `Abrir las ramas del sombrero ${HATS[i]}`, {x: hx - 40, y: hy(i) - 20, w: 80, h: 40}, () => open(i))));
      const open = async i => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        opened.add(i);
        const br = w.add(new Drawing(`c11-br${i}`, [S([[rx + 6, ry], [hx - 36, hy(i)]], seedOf(`c11-br${i}`), {w: 2, p: 0.8})], {z: 12, progress: 0}));
        try {
          await d.draw(br, 0.3, {sound: false});
          for (const [j, sc] of SCARVES.entries()) {
            const ly = hy(i) - 16 + j * 32;
            const b2 = w.add(new Drawing(`c11-bs${i}${j}`, [S([[hx + 36, hy(i)], [sx - 30, ly]], seedOf(`c11-bs${i}${j}`), {w: 2, p: 0.8, ch: sc === 'azul' ? BLUE : YELLOW})], {z: 12, progress: 0}));
            await d.draw(b2, 0.25, {sound: false});
            leaves++;
            w.add(new Label(`c11-l${i}${j}`, `${HATS[i]} + ${sc}`, sx - 24, ly + 6, {size: 15, z: 13, ch: sc === 'azul' ? BLUE : YELLOW}));
          }
        } catch { return; }
        g.audio.tap(0.2, 1 + leaves * 0.08);
        d.describe(`El sombrero ${HATS[i]} se abre en dos ramas, una por bufanda. Van ${leaves} maneras.`);
        busy = false;
        if (opened.size === 3) { g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    await d.think('Cada sombrero se abre en dos: 3 veces 2, seis maneras.');
    const c = await d.choose([
      {id: '24', text: '24: cada una de las 6 se abre en 4.'},
      {id: '10', text: '10: seis y cuatro más.'},
      {id: '9', text: '9: tres más dos más cuatro.'},
    ], {prompt: 'Si además tiene 4 pares de botas, ¿cuántas maneras?', evaluate: true});
    d.evidence('count-predict', {answer: c});
    await d.think(c === '24' ? 'Veinticuatro: 3 · 2 · 4.' : 'Cada una de las seis maneras se abre en cuatro, una por bota: 6 · 4 = 24. Se multiplica, no se suma.');
    await d.say('student', 'Cornisa, cuando se elige una cosa de cada grupo, las maneras se multiplican: 3 · 2 = 6, y con las botas, 6 · 4 = 24. No hace falta dibujar todas.');
    await studentWrites(d, g, 'c11-ct', `3 · 2 = ${outfits(3, 2)}    3 · 2 · 4 = ${outfits(3, 2, 4)}`, A.x0 + 20, A.y1 - 8, {size: 22});
    d.evidence('count', {six: outfits(3, 2), more: outfits(3, 2, 4)});
    g.flags.c11count = true;
  },
};

// ——————————————————————————————————————————————
// 11.6 Dos dados (momento)
// ——————————————————————————————————————————————

export const dados = {
  id: 'c11.dados',
  title: 'Dos dados',
  moment: 'Dos dados',
  setup(g) {
    clean(g, /^c11-/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Rampa', 'En la fiesta se juega con dos dados: gana el que acierta la suma. Yo voy siempre al 12, que es el más grande.');
    const pre = await d.choose([
      {id: '7', text: 'El 7 sale más seguido.'},
      {id: '12', text: 'El 12: es el más grande.'},
      {id: 'same', text: 'Todas las sumas salen igual de seguido.'},
    ], {prompt: '¿Qué suma sale más seguido, el 7 o el 12?', evaluate: true});
    d.evidence('dice-predict', {answer: pre});
    // la grilla de los 36 pares
    const C = 30, gx = A.x0 + 40, gy = A.y0 + 30;
    const cells = [];
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
      const x = gx + (b - 1) * C, y = gy + (a - 1) * C;
      cells.push({a, b, x, y});
      w.add(new Label(`c11-g${a}${b}`, String(a + b), x + C / 2, y + C / 2 + 6, {size: 16, align: 'center', z: 12}));
    }
    const lines = [];
    for (let i = 0; i <= 6; i++) {
      lines.push(S([[gx, gy + i * C], [gx + 6 * C, gy + i * C]], seedOf('c11-gh') + i, {w: 1.2, p: 0.5, lift: false}));
      lines.push(S([[gx + i * C, gy], [gx + i * C, gy + 6 * C]], seedOf('c11-gv') + i, {w: 1.2, p: 0.5, lift: false}));
    }
    w.add(new Drawing('c11-grid', lines, {z: 11}));
    for (let i = 1; i <= 6; i++) {
      w.add(new Label(`c11-ga${i}`, String(i), gx - 10, gy + (i - 1) * C + C / 2 + 6, {size: 15, align: 'right', z: 12, ch: BLUE}));
      w.add(new Label(`c11-gb${i}`, String(i), gx + (i - 1) * C + C / 2, gy - 6, {size: 15, align: 'center', z: 12, ch: BLUE}));
    }
    d.describe('Una tabla de 6 por 6: cada casillero es un par de dados, con su suma escrita adentro.');
    await d.shot(SHOTS.tiles, 0.8);
    const marked = new Set();
    const mark = (sum, ch) => {
      for (const c of cells.filter(c => c.a + c.b === sum)) w.add(new Shape(`c11-m${sum}-${c.a}${c.b}`, poly(`c11-m${sum}-${c.a}${c.b}`, [[3, 3], [C - 3, 3], [C - 3, C - 3], [3, C - 3]], {ch, w: 2.6}), c.x, c.y, {z: 13}));
    };
    const sums = diceSums();
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Marcá todos los pares que suman 7 y todos los que suman 12.']);
      const refresh = () => g.ui.setSpots([
        ...(marked.has(7) ? [] : [wordSpot('c11-s7', 'marcar los 7', A.x1 - 70, A.y0 + 50, () => go(7), {label: 'Marcar los pares que suman 7'})]),
        ...(marked.has(12) ? [] : [wordSpot('c11-s12', 'marcar los 12', A.x1 - 70, A.y0 + 130, () => go(12), {label: 'Marcar los pares que suman 12'})]),
      ]);
      const go = sum => {
        if (!ctl.alive()) return;
        marked.add(sum);
        mark(sum, sum === 7 ? YELLOW : BLUE);
        g.audio.tap(0.2, sum === 7 ? 1.4 : 0.9);
        d.describe(`Los pares que suman ${sum}: ${sums[sum]} ${sums[sum] === 1 ? 'casillero' : 'casilleros'} de 36.`);
        d.evidence('dice-mark', {sum, n: sums[sum]});
        if (marked.size === 2) { g.ui.setSpots([]); g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    await d.say('student', `Rampa, el 7 sale de ${sums[7]} maneras de 36; el 12, de una sola, con dos seises. Contamos cuál dado es cuál: 1 y 6 no es lo mismo que 6 y 1. Si los dados son parejos, los 36 pares salen igual de seguido, y el 7 tiene ${sums[7]}/36 de probabilidad y el 12, 1/36.`);
    await d.say('Rampa', 'En la tabla, sí. ¿Y tirando de verdad?');
    const r = rollTwo(360);
    const n7 = r.filter(x => x === 7).length, n12 = r.filter(x => x === 12).length;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Tocá «tirar 360 veces».']);
      g.ui.setSpots([wordSpot('c11-roll', 'tirar 360 veces', A.x1 - 70, A.y0 + 200, () => { if (ctl.alive()) { g.ui.setSpots([]); g.setHint(null); resolve(); } }, {label: 'Tirar los dos dados 360 veces'})]);
    }));
    const bx = A.x0 + 260;
    w.add(new Shape('c11-r7', poly('c11-r7', [[0, 0], [30, 0], [30, -n7 * 1.8], [0, -n7 * 1.8]], {ch: YELLOW, hatch: 6}), bx, A.y0 + 250, {z: 13}));
    w.add(new Shape('c11-r12', poly('c11-r12', [[0, 0], [30, 0], [30, -Math.max(2, n12 * 1.8)], [0, -Math.max(2, n12 * 1.8)]], {ch: BLUE, hatch: 6}), bx + 50, A.y0 + 250, {z: 13}));
    w.add(new Label('c11-r7l', `7: ${n7}`, bx + 15, A.y0 + 250 - n7 * 1.8 - 8, {size: 16, align: 'center', z: 14, ch: YELLOW}));
    w.add(new Label('c11-r12l', `12: ${n12}`, bx + 65, A.y0 + 250 - Math.max(2, n12 * 1.8) - 8, {size: 16, align: 'center', z: 14, ch: BLUE}));
    d.describe(`De 360 tiradas, salió 7 unas ${n7} veces y 12 unas ${n12}.`);
    d.evidence('dice-roll', {n7, n12});
    await d.think(`Contando, el 7 debería salir cerca de 60 veces de 360 y el 12, cerca de 10. Salieron ${n7} y ${n12}: cerca, no exacto.`);
    await d.say('Rampa', 'Me paso al 7. Aunque el 12 puede salir igual: no es imposible, es raro.');
    g.flags.c11dice = true;
  },
};

// ——————————————————————————————————————————————
// 11.7 Juntas no es causa
// ——————————————————————————————————————————————

const DAYS = [
  // dentro del mismo viento, el día de más polvo no borra más: lo que cambia los borrones es el viento
  {dust: 2, erase: 2, wind: 'poco'},
  {dust: 3, erase: 1, wind: 'poco'},
  {dust: 4, erase: 4, wind: 'bastante'},
  {dust: 5, erase: 3, wind: 'bastante'},
  {dust: 7, erase: 6, wind: 'mucho'},
  {dust: 8, erase: 5, wind: 'mucho'},
];

export const causa = {
  id: 'c11.causa',
  title: 'Juntas no es causa',
  setup(g) {
    clean(g, /^c11-/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Anoté seis días: cuánto polvo de tiza había a la mañana y cuántos renglones borró la Marea a la noche.');
    const gx = A.x0 + 40, gy = A.y0 + 220, U = 22;
    w.add(new Drawing('c11-ax', [S([[gx, gy], [gx + 9 * U, gy]], seedOf('c11-ax'), {w: 2, p: 0.9}), S([[gx, gy], [gx, gy - 9 * U]], seedOf('c11-ay'), {w: 2, p: 0.9})], {z: 11}));
    w.add(new Label('c11-axl', 'polvo →', gx + 9 * U - 40, gy + 22, {size: 17, z: 12, ch: BLUE}));
    w.add(new Label('c11-ayl', 'borrones ↑', gx + 6, gy - 9 * U - 4, {size: 17, z: 12, ch: BLUE}));
    DAYS.forEach((r, i) => w.add(new Shape(`c11-pt${i}`, dot(`c11-pt${i}`, 5), gx + r.dust * U, gy - r.erase * U, {z: 13})));
    d.describe('Seis puntos: en general, los días con más polvo tienen más borrones. Los puntos suben juntos.');
    await d.shot(SHOTS.tiles, 0.8);
    const c = await d.choose([
      {id: 'yes', text: 'Sí: van juntos, el polvo hace borrar a la Marea.'},
      {id: 'maybe', text: 'No se sabe: puede haber algo que cause las dos cosas.'},
      {id: 'luck', text: 'No: es pura casualidad.'},
    ], {prompt: '¿El polvo hace que la Marea borre más?', evaluate: true});
    d.evidence('cause-predict', {answer: c});
    await d.shot(SHOTS.tiles, 0.8);
    await d.say('Mara', 'Me olvidaba: también anoté el viento.');
    DAYS.forEach((r, i) => {
      const ch = r.wind === 'mucho' ? YELLOW : r.wind === 'bastante' ? WHITE : BLUE;
      w.add(new Label(`c11-wl${i}`, r.wind, gx + r.dust * U + 10, gy - r.erase * U - 8, {size: 14, z: 14, ch}));
    });
    d.describe('Al lado de cada punto, el viento de ese día: los días de mucho viento son los de más polvo y más borrones.');
    await d.think('Mirando de a pares con el mismo viento: con poco viento, el día de más polvo borró menos; con bastante, también; con mucho, también. Dentro del mismo viento, más polvo no trajo más borrones.');
    await d.say('student', 'Mara, que dos cosas suban juntas no dice que una cause la otra. Con estos seis días, el que acompaña a los borrones parece el viento, no el polvo. Pero son pocos días: para estar más seguros, habría que anotar muchos más.');
    await studentWrites(d, g, 'c11-cz', 'juntas ≠ una causa la otra', A.x0 + 250, A.y0 + 40, {size: 22});
    g.audio.punto('question');
    await pulse(d, p, 1, 0.3).catch(() => {});
    g.flags.c11cause = true;
  },
};

// ——————————————————————————————————————————————
// 11.8 Anticipar
// ——————————————————————————————————————————————

export const anticipar = {
  id: 'c11.anticipar',
  title: 'Anticipar',
  setup(g) {
    clean(g, /^c11-/);
    boardCast(g, 3);
    g.camera.go(SHOTS.board);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const p = w.get('punto');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Balcón', 'La escalera de Mara crece de a 10, la de Punto se duplica, la rueda vuelve, el balde a veces sí y a veces no. ¿Con todo eso se puede saber qué viene?');
    const ITEMS = [
      {id: 'add', text: 'escalera de Mara', kind: 'sure'},
      {id: 'dbl', text: 'escalera de Punto', kind: 'sure'},
      {id: 'wheel', text: 'altura de la rueda', kind: 'sure'},
      {id: 'bucket', text: 'el próximo balde', kind: 'chance'},
    ];
    ITEMS.forEach((it, i) => w.add(new Label(`c11-it${i}`, it.text, A.x0 + 30, A.y0 + 50 + i * 50, {size: 22, z: 12})));
    await d.shot(SHOTS.tiles, 0.8);
    const done = {};
    let sel = null;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => [sel ? `¿«${sel.text}» se puede anticipar exacto, o sólo qué es más probable?` : 'Tocá cada cosa y decidí si se puede anticipar exacto.']);
      const refresh = () => {
        if (!sel) g.ui.setSpots(ITEMS.filter(it => !(it.id in done)).map(it => rectSpot(`c11-s${it.id}`, it.text, {x: A.x0 + 20, y: A.y0 + 26 + ITEMS.indexOf(it) * 50, w: 220, h: 36}, () => { if (ctl.alive()) { sel = it; refresh(); } })));
        else g.ui.setSpots([
          wordSpot('c11-sure', 'exacto', A.x1 - 80, A.y0 + 60, () => judge('sure'), {label: 'Se puede anticipar exacto'}),
          wordSpot('c11-chance', 'sólo lo probable', A.x1 - 80, A.y0 + 150, () => judge('chance'), {label: 'Sólo se puede decir qué es más probable'}),
        ]);
      };
      const judge = k => {
        if (!ctl.alive() || !sel) return;
        const it = sel;
        d.evidence('anticipate', {item: it.id, said: k, truth: it.kind});
        if (k !== it.kind) g.note(it.kind === 'sure' ? 'Tiene una regla que no cambia: se puede calcular exacto.' : 'Del balde sólo sabemos qué parte sube llena con muchos: el próximo, no.');
        done[it.id] = it.kind;
        w.add(new Label(`c11-k${it.id}`, it.kind === 'sure' ? 'exacto' : 'probable', A.x0 + 270, A.y0 + 50 + ITEMS.indexOf(it) * 50, {size: 20, z: 12, ch: it.kind === 'sure' ? YELLOW : BLUE}));
        g.audio.tap(0.2, 1.3);
        sel = null;
        if (Object.keys(done).length === ITEMS.length) { g.ui.setSpots([]); g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    await d.say('student', 'Balcón, lo que tiene una regla fija se anticipa exacto, con una cuenta. Lo que pasa a veces, no caso por caso; pero con muchos casos, se sabe más o menos qué parte va a pasar.');
    if (!replay) writeJournal11(g);
    await d.say('Mara', 'Las reglas que vimos son todas distintas: sumar, duplicar, volver… ¿Y si las pusiéramos juntas, para elegir la que sirve cada vez?');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.3).catch(() => {});
    g.flags.c11anticipate = true;
  },
};

function writeJournal11(g) {
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const first = k => ev.find(e => e.kind === k);
  const seen = [];
  const fp = first('freq-predict');
  if (fp) seen.push(fp.answer === 'about' ? 'Anticipaste que con muchos baldes subirían llenos cerca de dos de cada tres.' : fp.answer === 'exact' ? 'Esperabas exactamente dos de cada tres; con muchos baldes se acercó, sin clavarse.' : 'Pensaste que no se podía decir nada; caso por caso no, pero con muchos baldes la parte llena se acomodó cerca de dos tercios.');
  const sp = first('summary-pick');
  if (sp) seen.push(sp.answer === 'mean' ? 'Elegiste el promedio, 10; ninguna familia tiene 10: lo arrastra la Ronda.' : 'Para una familia común elegiste el del medio, 4 (la mediana).');
  const sk = first('spread-pick');
  if (sk) seen.push(sk.answer === 'A' ? 'Para tener por lo menos 4 llamaste al ayudante parejo.' : 'Para tener por lo menos 4 pensaste en el otro; con el mismo promedio, el desparejo a veces hace 1.');
  const gp = first('graph-predict');
  if (gp) seen.push(gp.answer === 'check' ? 'Miraste dónde empezaba el eje del gráfico de Punto.' : 'El gráfico de Punto te pareció decir otra cosa; desde cero, 104 y 100 son casi iguales.');
  const cp = first('count-predict');
  if (cp) seen.push(cp.answer === '24' ? 'Con 4 botas multiplicaste: 24 maneras.' : 'Con 4 botas sumaste; se multiplica: 24 maneras.');
  const dp = first('dice-predict');
  if (dp) seen.push(dp.answer === '7' ? 'Anticipaste que el 7 sale más que el 12: 6 maneras contra 1.' : 'Pensaste en el 12 o en que todas salen igual; el 7 sale de 6 maneras y el 12 de una.');
  const cz = first('cause-predict');
  if (cz) seen.push(cz.answer === 'maybe' ? 'Sospechaste una tercera cosa detrás de las dos: el viento parecía acompañar a los borrones.' : cz.answer === 'yes' ? 'Pensaste que el polvo hacía borrar a la Marea; con el mismo viento, más polvo no trajo más borrones.' : 'Pensaste que era casualidad; en seis días suben juntas, pero con el mismo viento el polvo no hace la diferencia.');
  const entry = {
    id: 'c11',
    title: 'Lo que pasa a veces',
    abbr: 'Lo que pasa a veces no se anticipa caso por caso, pero se puede contar.',
    body: [
      'Con muchos casos, la parte de veces que algo pasa se acomoda cerca de un número (2 de cada 3 baldes llenos). Es algo que se observa, no una garantía: del próximo caso dice qué es más probable, no qué va a pasar.',
      'Un número resume muchos datos y siempre esconde algo: el promedio reparte todo y uno muy grande lo arrastra; la mediana, el del medio, no. El rango dice qué tan desparejos son. En un gráfico de barras, hay que mirar dónde empieza el eje.',
      'Cuando se elige una cosa de cada grupo, las maneras se multiplican (3 · 2 · 4 = 24). Con casos igual de posibles, la probabilidad es casos que sirven sobre casos posibles: el 7 con dos dados, 6/36; el 12, 1/36.',
      'Que dos cosas suban juntas no dice que una cause la otra: puede haber una tercera, como el viento.',
    ],
    seen,
    moments: [
      {id: 'c11.dados', label: 'Desplegar: dos dados'},
    ],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora (≡)');
  g.saveNow();
}
