// Capítulo 10 — Vueltas y flechas (10.1 a 10.4): la rueda del pozo, alto y costado, lo que se repite y la rampa.

import {Drawing, Label, Shape} from '../engine/world.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {pulse, rectSpot, wordSpot} from '../acting.js';
import {TAU, point, heights, slopeRatio} from '../logic/turns.js';
import {SHOTS, area, base, boardCast, clean, poly, S, seedOf, WHITE, YELLOW, BLUE} from '../ch9/common.js';
import {dot} from '../ch9/common.js';
import {studentWrites} from '../ch7/scenes-a.js';

const dec = v => String(v).replace('.', ',');

/** Un arco de circunferencia (centro cx, cy; radio r) de a0 a a1, con la parada hacia arriba (ángulos contra el reloj). */
function arcPts(cx, cy, r, a0, a1, n = 24) {
  return Array.from({length: n + 1}, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy - Math.sin(a) * r]; });
}

function wheel(w, id, cx, cy, r) {
  const list = [S(arcPts(cx, cy, r, 0, TAU, 48), seedOf(id), {w: 2.6, p: 0.9})];
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; list.push(S([[cx, cy], [cx + Math.cos(a) * r, cy - Math.sin(a) * r]], seedOf(id) + 10 + k, {w: 1.6, p: 0.6, lift: false})); }
  w.add(new Drawing(id, list, {z: 12}));
  w.add(new Shape(`${id}-c`, dot(`${id}-c`, 4, WHITE), cx, cy, {z: 13}));
}

// ——————————————————————————————————————————————
// 10.1 La rueda del pozo
// ——————————————————————————————————————————————

export const rueda = {
  id: 'c10.rueda',
  title: 'La rueda del pozo',
  setup(g) {
    g.world.clear();
    base(g);
    boardCast(g, 3);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Balcón', 'La rueda del pozo perdió la soga. Tengo pedazos del largo del rayo de la rueda, de la punta al centro. ¿Cuántos hacen falta para dar toda la vuelta?');
    const R = 70, cx = A.x0 + 150, cy = A.y0 + 130;
    wheel(w, 'c10-w', cx, cy, R);
    w.add(new Drawing('c10-ray', [S([[cx, cy], [cx + R, cy]], seedOf('c10-ray'), {w: 4, p: 0.95, ch: YELLOW})], {z: 13}));
    w.add(new Label('c10-rl', 'un rayo', cx + R / 2, cy + 22, {size: 16, align: 'center', z: 13, ch: YELLOW}));
    d.describe('Una rueda dibujada, con un rayo en amarillo, del centro al borde. Cada pedazo de soga mide lo mismo que ese rayo.');
    const guess = await d.choose([
      {id: '6', text: 'Seis justos.'},
      {id: '6+', text: 'Seis y un poco más.'},
      {id: '3', text: 'Cuatro, como los cuatro rayos dibujados.'},
    ], {prompt: '¿Cuántos pedazos del largo del rayo entran alrededor de la rueda?', evaluate: true});
    d.evidence('radian-predict', {answer: guess});
    await d.shot(SHOTS.tiles, 0.8);
    let n = 0;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá «otro pedazo»: se apoya sobre el borde, a continuación del anterior. Cuando no entre uno entero, tocá «ya está».']);
      const refresh = () => g.ui.setSpots([
        wordSpot('c10-more', 'otro pedazo', A.x1 - 80, A.y0 + 80, () => more(), {label: 'Poner otro pedazo de soga sobre el borde'}),
        ...(n >= 1 ? [wordSpot('c10-done', 'ya está', A.x1 - 80, A.y0 + 170, () => { if (!busy && ctl.alive()) { g.ui.setSpots([]); g.setHint(null); resolve(); } }, {label: 'Dejar de poner pedazos'})] : []),
      ]);
      const more = async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        const a0 = n, a1 = n + 1;
        n++;
        const over = a1 > TAU;
        const arc = w.add(new Drawing(`c10-s${n}`, [S(arcPts(cx, cy, R + 4, a0, a1, 20), seedOf(`c10-s${n}`), {w: 5, p: 0.95, ch: over ? BLUE : YELLOW})], {z: 14, progress: 0}));
        w.add(new Label(`c10-sn${n}`, String(n), cx + Math.cos(a0 + 0.5) * (R + 24), cy - Math.sin(a0 + 0.5) * (R + 24) + 7, {size: 18, align: 'center', z: 14, ch: over ? BLUE : YELLOW}));
        try { await d.draw(arc, 0.5, {sound: false}); } catch { return; }
        g.audio.tap(0.2, 1.1 + n * 0.06);
        d.evidence('radian-piece', {n, over});
        if (over) {
          d.describe('El séptimo pedazo se pasa: pisa al primero.');
          g.note('El séptimo se pasa: pisa al primero. Seis enteros y un pedacito.');
          g.setCinematic(true);
          await d.fadeTo(arc, 0, 0.6);
          w.remove(arc.id);
          w.remove(`c10-sn${n}`);
          n--;
          g.setCinematic(false);
        } else d.describe(`${n} ${n === 1 ? 'pedazo' : 'pedazos'} sobre el borde.`);
        busy = false;
        if (n >= 6 && over) { g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    if (n < 6) {
      await d.say('Balcón', 'Todavía queda rueda sin soga.');
      while (n < 6) {
        n++;
        const arc = w.add(new Drawing(`c10-s${n}`, [S(arcPts(cx, cy, R + 4, n - 1, n, 20), seedOf(`c10-s${n}`), {w: 5, p: 0.95, ch: YELLOW})], {z: 14, progress: 0}));
        await d.draw(arc, 0.3, {sound: false});
      }
    }
    const gap = w.add(new Drawing('c10-gap', [S(arcPts(cx, cy, R + 4, 6, TAU, 6), seedOf('c10-gap'), {w: 5, p: 0.95, ch: BLUE})], {z: 14, progress: 0}));
    await d.draw(gap, 0.4, {sound: false});
    d.describe('Seis pedazos amarillos y un hueco azul chiquito, menos de un tercio de pedazo.');
    await d.think(guess === '6+' ? 'Seis enteros y un pedacito.' : guess === '6' ? 'Seis no alcanzan: queda un hueco. Seis y un pedacito.' : 'Los rayos dibujados adentro no miden el borde: alrededor entran seis y un pedacito.');
    await d.say('student', 'Balcón: una vuelta entera son 6 rayos y un poco más: 6,28… Se lo llama 2π. Media vuelta, π, unos 3,14 rayos: por eso el borde entero es π veces el diámetro, que son dos rayos. Se sabe que π no es una fracción, aunque probarlo es más difícil que lo de √2.');
    await studentWrites(d, g, 'c10-2pi', '360° = 2π radianes (≈ 6,28 rayos de borde)', A.x0 + 20, A.y1 - 10, {size: 20});
    await d.think('Medir un giro por cuántos rayos recorre el borde: eso es medir en radianes. Sirve para cualquier rueda: con una más grande, los pedazos también son más largos.');
    d.evidence('radian', {pieces: 6, tau: +TAU.toFixed(3)});
    g.flags.c10radian = true;
  },
};

// ——————————————————————————————————————————————
// 10.2 Alto y costado
// ——————————————————————————————————————————————

export const alto = {
  id: 'c10.alto',
  title: 'Alto y costado',
  setup(g) {
    clean(g, /^c10-/);
    boardCast(g, 3);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Balcón', 'Ato el balde a la manija de la rueda. Si giro la rueda, ¿a qué altura queda la manija?');
    const R = 90, cx = A.x0 + 120, cy = A.y0 + 140;
    wheel(w, 'c10-w', cx, cy, R);
    // regla al costado: de −1 a 1 rayo
    const rx = cx + R + 40;
    const ticks = [S([[rx, cy - R], [rx, cy + R]], seedOf('c10-rule'), {w: 2.2, p: 0.9, ch: BLUE})];
    for (let k = -10; k <= 10; k++) ticks.push(S([[rx - (k % 5 === 0 ? 10 : 5), cy - k * R / 10], [rx, cy - k * R / 10]], seedOf('c10-rt') + k + 20, {w: 1.4, p: 0.7, ch: BLUE, lift: false}));
    w.add(new Drawing('c10-rule', ticks, {z: 12}));
    for (const k of [-1, 0, 1]) w.add(new Label(`c10-rl${k}`, k === 0 ? '0' : k > 0 ? '1' : '−1', rx + 8, cy - k * R + 6, {size: 16, z: 12, ch: BLUE}));
    const handle = w.add(new Shape('c10-h', dot('c10-h', 7), cx + R, cy, {z: 15}));
    const level = w.add(new Drawing('c10-lv', [], {z: 13}));
    void level;
    const setLevel = deg => {
      const p = point(1, deg);
      w.remove('c10-lv');
      w.add(new Drawing('c10-lv', [S([[cx + p.x * R, cy - p.y * R], [rx, cy - p.y * R]], seedOf(`c10-lv${deg}`), {w: 1.6, p: 0.8, ch: YELLOW, lift: false})], {z: 13}));
    };
    d.describe('La rueda con la manija amarilla a la derecha, a la altura del centro. Al costado, una regla de −1 a 1 rayo.');
    const g30 = await d.choose([
      {id: 'half', text: 'A medio rayo.'},
      {id: 'third', text: 'A un tercio de rayo: 30 es un tercio de 90.'},
      {id: 'unknown', text: 'No se puede saber sin medir.'},
    ], {prompt: 'Si la rueda gira 30°, ¿a qué altura sobre el centro queda la manija?', evaluate: true});
    d.evidence('sin30-predict', {answer: g30});
    await d.shot(SHOTS.tiles, 0.8);
    let deg = 0;
    const rows = [];
    const turn = async () => {
      const d0 = deg, d1 = deg + 30;
      await d.tween(0.6, q => { const a = (d0 + (d1 - d0) * q) * Math.PI / 180; handle.x = cx + Math.cos(a) * R; handle.y = cy - Math.sin(a) * R; }, easeInOut);
      deg = d1;
      setLevel(deg);
      const p = point(1, deg);
      rows.push({deg, y: p.y});
      w.add(new Label(`c10-row${deg}`, `${deg}°  →  ${dec(Math.round(p.y * 100) / 100)}`, A.x1 - 150, A.y0 + 30 + (rows.length - 1) * 30, {size: 21, z: 12}));
      d.describe(`Girada ${deg}°, la manija queda a ${dec(Math.round(p.y * 100) / 100)} rayo sobre el centro.`);
      d.evidence('height', {deg, y: p.y});
    };
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá «girar 30°» y leé la altura en la regla.']);
      const refresh = () => g.ui.setSpots([wordSpot('c10-turn', 'girar 30°', A.x1 - 80, A.y1 - 30, async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        try { await turn(); } catch { return; }
        busy = false;
        if (deg >= 90) { g.setHint(null); resolve(); } else refresh();
      }, {label: 'Girar la rueda 30 grados'})]);
      refresh();
    }));
    await d.think(g30 === 'half' ? 'Medio rayo justo.' : 'A 30° la manija sube medio rayo, no un tercio: la altura no crece parejo con el giro.');
    // por qué medio: la mitad de un triángulo equilátero
    g.setCinematic(true);
    const p30 = point(1, 30);
    const tri = w.add(new Drawing('c10-tri', [S([[cx, cy], [cx + p30.x * R, cy - p30.y * R], [cx + p30.x * R, cy + p30.y * R], [cx, cy]], seedOf('c10-tri'), {w: 2.4, p: 0.9, ch: BLUE})], {z: 14, progress: 0}));
    await d.draw(tri, 0.8, {sound: false});
    g.setCinematic(false);
    d.describe('Desde el centro, un triángulo azul con la manija de los 30° arriba y su reflejo abajo: sus tres lados son iguales.');
    await d.say('student', 'Balcón: con la manija a 30° y su reflejo a −30°, el triángulo tiene tres ángulos de 60°: los tres lados miden un rayo. La altura es la mitad de ese lado: medio rayo.');
    await d.say('student', 'Con la rueda de un rayo, a la altura de la manija se le dice seno del ángulo; al costado, coseno. Y como en el tirante, alto² + costado² = 1.');
    await studentWrites(d, g, 'c10-sin', 'sen 30° = 0,5    sen 90° = 1', A.x0 + 20, A.y1 - 8, {size: 22});
    d.evidence('sine', {rows});
    g.flags.c10sine = true;
  },
};

// ——————————————————————————————————————————————
// 10.3 Lo que se repite (momento)
// ——————————————————————————————————————————————

export const repite = {
  id: 'c10.repite',
  title: 'Lo que se repite',
  moment: 'Lo que se repite',
  setup(g) {
    clean(g, /^c10-/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', '¿Y si la rueda sigue girando? Pongamos las alturas en el mapa, como mi sombra.');
    const gx = A.x0 + 40, gy = A.y0 + 120, UX = 0.62, UY = 70;
    const px = deg => gx + deg * UX, py = v => gy - v * UY;
    w.add(new Drawing('c10-ax', [
      S([[gx, gy], [px(720) + 10, gy]], seedOf('c10-ax'), {w: 2.2, p: 0.9}),
      S([[gx, py(1.2)], [gx, py(-1.2)]], seedOf('c10-ay'), {w: 2.2, p: 0.9}),
    ], {z: 11}));
    for (const v of [1, -1]) w.add(new Label(`c10-yl${v}`, v > 0 ? '1' : '−1', gx - 10, py(v) + 6, {size: 16, align: 'right', z: 12, ch: BLUE}));
    for (const deg of [180, 360, 540, 720]) w.add(new Label(`c10-xl${deg}`, `${deg}°`, px(deg), gy + 22, {size: 15, align: 'center', z: 12, ch: BLUE}));
    await d.shot(SHOTS.tiles, 0.8);
    const all = heights(1, 30, 720);
    let turns = 0;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá «una vuelta más»: se ponen las alturas de toda una vuelta, de a 30°.']);
      const refresh = () => g.ui.setSpots([wordSpot('c10-turn', 'una vuelta más', A.x1 - 80, A.y1 - 26, async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        const part = all.filter(r => r.deg >= turns * 360 && r.deg <= (turns + 1) * 360);
        try {
          for (const r of part) {
            if (!w.has(`c10-p${r.deg}`)) w.add(new Shape(`c10-p${r.deg}`, dot(`c10-p${r.deg}`, 4), px(r.deg), py(r.y), {z: 14}));
            g.audio.tap(0.08, 1 + r.y * 0.3);
            await d.wait(0.06);
          }
          const line = w.add(new Drawing(`c10-l${turns}`, [S(heights(1, 5, 360).map(r => [px(r.deg + turns * 360), py(r.y)]), seedOf(`c10-l${turns}`), {w: 2.2, p: 0.85, ch: YELLOW})], {z: 13, progress: 0}));
          await d.draw(line, 0.6, {sound: false});
        } catch { return; }
        turns++;
        d.describe(turns === 1 ? 'Una vuelta: la altura sube hasta 1 a los 90°, baja hasta −1 a los 270° y vuelve a 0.' : 'La segunda vuelta dibuja exactamente la misma ola que la primera.');
        busy = false;
        if (turns >= 2) { g.setHint(null); resolve(); } else refresh();
      }, {label: 'Agregar las alturas de una vuelta más'})]);
      refresh();
    }));
    const c = await d.choose([
      {id: 'half', text: '0,5: como a los 30°.'},
      {id: 'more', text: 'Más que 1: siguió girando.'},
      {id: 'unknown', text: 'No se sabe: no la pusimos.'},
    ], {prompt: 'Girada 390°, ¿a qué altura queda la manija?', evaluate: true});
    d.evidence('period-predict', {answer: c});
    await d.think(c === 'half' ? '390 es una vuelta y 30 más: misma altura que a los 30°.' : '390° es una vuelta entera, 360°, y 30° más: la manija está donde estaba a los 30°. Medio rayo.');
    await d.say('student', 'Cornisa: la ola se repite cada vuelta, cada 360° o 2π. Se parece a tu sombra en que vuelve, pero no es la misma regla: tu sombra no se hace negativa ni sube y baja así.');
    await studentWrites(d, g, 'c10-per', 'sen(x + 360°) = sen x', A.x0 + 20, A.y1 - 8, {size: 22});
    d.evidence('period', {turns});
    g.flags.c10period = true;
  },
};

// ——————————————————————————————————————————————
// 10.4 La rampa
// ——————————————————————————————————————————————

export const rampa = {
  id: 'c10.rampa',
  title: 'La rampa',
  setup(g) {
    clean(g, /^c10-/);
    boardCast(g, 1);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Rampa', 'Mis rampas de carga tienen todas la misma inclinación: 30°. Una corta, de 2 tablones de largo, sube 1. La larga, de 4, sube 2. Quiero una de 6: ¿cuánto va a subir?');
    const U = 26;
    const draw = (id, x, y, len) => {
      const p = point(len * U, 30);
      w.add(new Drawing(id, [S([[x, y], [x + p.x, y], [x + p.x, y - p.y], [x, y]], seedOf(id), {w: 2.6, p: 0.9})], {z: 12}));
      w.add(new Label(`${id}l`, `largo ${len}`, x + p.x / 2 - 18, y - p.y / 2 - 10, {size: 15, align: 'center', z: 12}));
      w.add(new Label(`${id}h`, `sube ${dec(len * slopeRatio(30))}`, x + p.x + 8, y - p.y / 2 + 6, {size: 15, z: 12, ch: YELLOW}));
    };
    draw('c10-r2', A.x0 + 20, A.y0 + 90, 2);
    draw('c10-r4', A.x0 + 20, A.y0 + 220, 4);
    d.describe('Dos rampas dibujadas con la misma inclinación: la de largo 2 sube 1; la de largo 4 sube 2.');
    const c = await d.choose([
      {id: '3', text: 'Sube 3: la mitad del largo, como las otras.'},
      {id: '4', text: 'Sube 4: dos más que la de 4.'},
      {id: 'measure', text: 'Hay que construirla y medir.'},
    ], {prompt: 'La rampa de largo 6, con la misma inclinación, ¿cuánto sube?', evaluate: true});
    d.evidence('ratio-predict', {answer: c});
    await d.shot(SHOTS.tiles, 0.8);
    draw('c10-r6', A.x0 + 230, A.y0 + 230, 6);
    d.describe('La rampa de largo 6, con la misma inclinación: sube 3.');
    await d.think(c === '3' ? 'Tres: las rampas son semejantes, como las copias de Cornisa. Alto ÷ largo no cambia: 1/2.' : c === '4' ? 'No se suma: se multiplica. Las rampas son semejantes; alto ÷ largo es siempre 1/2. Con largo 6, sube 3.' : 'No hace falta medir: las rampas son semejantes, y alto ÷ largo es siempre 1/2. Con largo 6, sube 3.');
    await d.say('student', 'Rampa: con la misma inclinación, alto ÷ largo es siempre el mismo número, y es el seno del ángulo: sen 30° = 0,5. Con la tabla de la rueda, sabés cuánto sube cualquier rampa sin construirla.');
    await studentWrites(d, g, 'c10-ramp', 'sube = largo · sen 30° = 6 · 0,5 = 3', A.x0 + 20, A.y0 + 30, {size: 22});
    d.evidence('ratio', {ratio: slopeRatio(30)});
    g.flags.c10ramp = true;
  },
};

export {lerp, pulse, rectSpot, Label};
