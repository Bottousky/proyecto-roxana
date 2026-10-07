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
        w.add(new Label(`c10-sn${n}`, String(n), cx + Math.cos(n - 0.5) * (R + 24), cy - Math.sin(n - 0.5) * (R + 24) + 7, {size: 18, align: 'center', z: 14, ch: YELLOW}));
        await d.draw(arc, 0.3, {sound: false});
      }
    }
    const gap = w.add(new Drawing('c10-gap', [S(arcPts(cx, cy, R + 4, 6, TAU, 6), seedOf('c10-gap'), {w: 5, p: 0.95, ch: BLUE})], {z: 14, progress: 0}));
    await d.draw(gap, 0.4, {sound: false});
    d.describe('Seis pedazos amarillos y un hueco azul chiquito, menos de un tercio de pedazo.');
    if (guess === '6') {
      // el hexágono del compás: el rayo entra seis veces justo, pero derecho, por adentro
      const hex = Array.from({length: 7}, (_, k) => [cx + Math.cos(k * Math.PI / 3) * R, cy - Math.sin(k * Math.PI / 3) * R]);
      const hx = w.add(new Drawing('c10-hex', [S(hex, seedOf('c10-hex'), {w: 2, p: 0.8, ch: BLUE})], {z: 13, progress: 0}));
      await d.draw(hx, 0.6, {sound: false});
      d.describe('Adentro de la rueda, un hexágono azul: seis rayos derechos, de punta a punta, cierran justo.');
      await d.think('Con el compás, el rayo entra seis veces justo, pero derecho, de punta a punta por adentro: el hexágono azul. La soga va por el borde, que es más largo: por eso queda un hueco.');
    } else await d.think(guess === '6+' ? 'Seis enteros y un pedacito.' : 'Los rayos dibujados adentro no miden el borde: alrededor entran seis y un pedacito.');
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
    // la altura de la manija hasta la regla; el alto (parado) y el costado (acostado, desde el centro)
    const setLevel = deg => {
      const p = point(1, deg);
      const hx = cx + p.x * R, hy = cy - p.y * R;
      w.remove('c10-lv');
      w.add(new Drawing('c10-lv', [
        S([[hx, hy], [rx, hy]], seedOf(`c10-lv${deg}`), {w: 1.6, p: 0.8, ch: YELLOW, lift: false}),
        S([[hx, cy], [hx, hy]], seedOf(`c10-al${deg}`), {w: 2.4, p: 0.9, ch: YELLOW, lift: false}),
        ...(Math.abs(p.x) > 0.01 ? [S([[cx, cy + 3], [hx, cy + 3]], seedOf(`c10-co${deg}`), {w: 3.4, p: 0.95, ch: YELLOW, lift: false})] : []),
      ], {z: 13}));
    };
    d.describe('La rueda con la manija amarilla a la derecha, a la altura del centro. Al costado, una regla de −1 a 1 rayo.');
    const TX = A.x1 - 175;
    const col = (id, y, cells, opts = {}) => cells.forEach((t, i) => w.add(new Label(`${id}-${i}`, t, TX + [0, 62, 122][i], y, {size: 19, z: 12, ...opts})));
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
      rows.push({deg, y: p.y, x: p.x});
      const r2 = v => dec(Math.round(v * 100) / 100);
      if (rows.length === 1) col('c10-rowh', A.y0 + 22, ['giro', 'alto', 'costado'], {size: 15, ch: BLUE});
      col(`c10-row${deg}`, A.y0 + 22 + rows.length * 28, [`${deg}°`, r2(p.y), r2(p.x)]);
      d.describe(`Girada ${deg}°, la manija queda a ${r2(p.y)} rayo sobre el centro y a ${r2(p.x)} rayo al costado.`);
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
    const h30 = [cx + p30.x * R, cy - p30.y * R], m30 = [cx + p30.x * R, cy + p30.y * R];
    w.add(new Shape('c10-m30', dot('c10-m30', 5, WHITE), h30[0], h30[1], {z: 15}));
    w.add(new Label('c10-m30l', '30°', h30[0] - 30, h30[1] - 8, {size: 16, align: 'center', z: 15}));
    w.add(new Shape('c10-m30r', dot('c10-m30r', 5, BLUE), m30[0], m30[1], {z: 15}));
    w.add(new Label('c10-m30rl', '−30°', m30[0] - 34, m30[1] + 20, {size: 16, align: 'center', z: 15, ch: BLUE}));
    await d.wait(0.4);
    const tri = w.add(new Drawing('c10-tri', [S([[cx, cy], h30, m30, [cx, cy]], seedOf('c10-tri'), {w: 2.4, p: 0.9, ch: BLUE})], {z: 14, progress: 0}));
    await d.draw(tri, 0.8, {sound: false});
    g.setCinematic(false);
    d.describe('La manija marcada en los 30° y su reflejo en −30°. Desde el centro, un triángulo azul con esos dos puntos: sus tres lados son iguales.');
    await d.say('student', 'Balcón: en el centro, 30 y 30 hacen 60°. Los dos lados que salen del centro son rayos, iguales, así que las otras dos esquinas son iguales y suman 120°: 60 cada una.');
    await d.say('student', 'Tres esquinas de 60°: los tres lados miden un rayo. El lado parado va de la manija a su reflejo, y la línea del centro lo corta por la mitad: la manija está a medio rayo de altura.');
    // el costado: del centro al pie de la manija; rayo, alto y costado son el tirante
    g.setCinematic(true);
    const leg = w.add(new Drawing('c10-leg', [
      S([[cx, cy + 3], [h30[0], cy + 3]], seedOf('c10-leg'), {w: 4, p: 0.95, ch: YELLOW}),
      S([[h30[0], cy], h30], seedOf('c10-leg2'), {w: 3.4, p: 0.95, ch: YELLOW}),
      S([[h30[0] - 9, cy], [h30[0] - 9, cy - 9], [h30[0], cy - 9]], seedOf('c10-sq'), {w: 1.6, p: 0.8, lift: false}),
    ], {z: 15, progress: 0}));
    await d.draw(leg, 0.7, {sound: false});
    g.setCinematic(false);
    d.describe('Del centro al pie de la manija, el costado; del pie a la manija, el alto, los dos en amarillo, con esquina recta.');
    await d.say('student', 'Del centro al pie de la manija va el costado: 0,87 a los 30°. Rayo, alto y costado forman un triángulo con esquina recta, como el tirante: alto² + costado² = 1.');
    await studentWrites(d, g, 'c10-pyt', '0,5² + 0,87² ≈ 1', A.x1 - 190, A.y0 + 196, {size: 21});
    await d.say('student', '0,5 · 0,5 + 0,87 · 0,87 da 1,0069: casi 1, porque 0,87 está redondeado. A la altura de la manija, en la rueda de un rayo, se le dice seno del ángulo; al costado, coseno. A la izquierda del centro, el costado es negativo.');
    await studentWrites(d, g, 'c10-sin', 'sen 30° = 0,5    cos 30° ≈ 0,87', A.x0 + 20, A.y1 - 8, {size: 22});
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
    // una vuelta por vez: la pregunta por los 390° llega antes de dibujar la segunda
    const oneTurn = () => d.interact(ctl => new Promise(resolve => {
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
        g.setHint(null);
        resolve();
      }, {label: 'Agregar las alturas de una vuelta más'})]);
      refresh();
    }));
    await oneTurn();
    const c = await d.choose([
      {id: 'half', text: '0,5: como a los 30°.'},
      {id: 'more', text: 'Más que 1: siguió girando.'},
      {id: 'unknown', text: 'No se sabe: todavía no la pusimos.'},
    ], {prompt: 'Girada 390°, una vuelta y 30° más, ¿a qué altura va a quedar la manija?', evaluate: true});
    d.evidence('period-predict', {answer: c});
    await oneTurn();
    await d.think(c === 'half' ? '390 es una vuelta y 30 más: misma altura que a los 30°.' : c === 'unknown' ? 'No estaba puesta, pero se podía saber: una vuelta entera, 360°, deja la manija donde estaba. 390° son una vuelta y 30°: medio rayo, como a los 30°.' : 'Seguir girando no la sube más que el rayo: 390° es una vuelta entera, 360°, y 30° más. La manija está donde estaba a los 30°: medio rayo.');
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
    // la tabla es el lado largo, enfrente de la esquina recta; el ángulo, al pie, entre el piso y la tabla
    const draw = (id, x, y, len, deg = 30, rise = dec(len * slopeRatio(30)), angleLabel = false) => {
      const p = point(len * U, deg);
      const a = deg * Math.PI / 180;
      w.add(new Drawing(id, [
        S([[x, y], [x + p.x, y], [x + p.x, y - p.y], [x, y]], seedOf(id), {w: 2.6, p: 0.9}),
        S(Array.from({length: 9}, (_, i) => [x + Math.cos(a * i / 8) * 15, y - Math.sin(a * i / 8) * 15]), seedOf(id) + 7, {w: 1.6, p: 0.8, ch: BLUE, lift: false}),
        S([[x + p.x - 8, y], [x + p.x - 8, y - 8], [x + p.x, y - 8]], seedOf(id) + 8, {w: 1.4, p: 0.8, lift: false}),
      ], {z: 12}));
      if (deg > 45) w.add(new Label(`${id}l`, `largo ${len}`, x + p.x / 2 - 10, y - p.y / 2 + 4, {size: 15, align: 'right', z: 12}));
      else w.add(new Label(`${id}l`, `largo ${len}`, x + p.x / 2 - 20, y - p.y / 2 - 10, {size: 15, align: 'center', z: 12}));
      w.add(new Label(`${id}h`, `sube ${rise}`, x + p.x + 8, y - p.y / 2 + 6, {size: 15, z: 12, ch: YELLOW}));
      if (angleLabel) w.add(new Label(`${id}a`, `${deg}°`, x + 14, y + 17, {size: 14, align: 'center', z: 12, ch: BLUE}));
    };
    draw('c10-r2', A.x0 + 20, A.y0 + 90, 2, 30, '1', true);
    draw('c10-r4', A.x0 + 20, A.y0 + 220, 4, 30, '2', true);
    d.describe('Dos rampas dibujadas con la misma inclinación, 30° entre el piso y la tabla, y esquina recta abajo a la derecha: la de largo 2 sube 1; la de largo 4 sube 2. El largo es el de la tabla, no lo que ocupa en el piso.');
    const c = await d.choose([
      {id: '3', text: 'Sube 3: la mitad del largo, como las otras.'},
      {id: '4', text: 'Sube 4: dos más que la de 4.'},
      {id: 'measure', text: 'Hay que construirla y medir.'},
    ], {prompt: 'La rampa de largo 6, con la misma inclinación, ¿cuánto sube?', evaluate: true});
    d.evidence('ratio-predict', {answer: c});
    await d.shot(SHOTS.tiles, 0.8);
    draw('c10-r6', A.x0 + 230, A.y0 + 230, 6, 30, '3', true);
    d.describe('La rampa de largo 6, con la misma inclinación: sube 3.');
    await d.think(c === '3' ? 'Tres: las rampas son semejantes, como las copias de Cornisa. Alto ÷ largo no cambia: 1/2.' : c === '4' ? 'No se suma: se multiplica. Las rampas son semejantes; alto ÷ largo es siempre 1/2. Con largo 6, sube 3.' : 'No hace falta medir: las rampas son semejantes, y alto ÷ largo es siempre 1/2. Con largo 6, sube 3.');
    await d.say('student', 'Rampa: ¿semejantes por tener el mismo ángulo? En la ventana de Cornisa no alcanzaba. Pero en un triángulo sí: con la esquina recta y la misma inclinación, la forma queda fija. La ventana tenía cuatro lados.');
    await d.say('student', 'Con la misma inclinación, alto ÷ largo de la tabla es siempre el mismo número, y es el seno del ángulo del piso: sen 30° = 0,5.');
    await studentWrites(d, g, 'c10-ramp', 'sube = largo · sen 30° = 6 · 0,5 = 3', A.x0 + 20, A.y0 + 30, {size: 22});
    d.evidence('ratio', {ratio: slopeRatio(30)});
    // otro ángulo: acá «la mitad» ya no sirve y hace falta la tabla de la rueda
    await d.say('Rampa', 'Para la cuesta del pozo quiero una empinada: 60°, con una tabla de largo 4. ¿Cuánto sube esa?');
    const c60 = await d.choose([
      {id: 'sin', text: 'Unos 3,5: 4 · sen 60°, y sen 60° es 0,87.'},
      {id: 'half', text: 'Sube 2: la mitad del largo, como las otras.'},
      {id: 'double', text: 'Sube 4: el doble de ángulo, el doble de alto.'},
    ], {prompt: 'La rampa de 60° y largo 4, ¿cuánto sube?', evaluate: true});
    d.evidence('ratio60-predict', {answer: c60});
    g.setCinematic(true);
    for (const id of ['c10-r2', 'c10-r4']) for (const k of ['', 'l', 'h', 'a']) w.remove(id + k);
    g.setCinematic(false);
    draw('c10-r60', A.x0 + 40, A.y0 + 235, 4, 60, '≈ 3,5', true);
    d.describe('Las rampas chicas se borran. Una rampa de 60° y largo 4: sube casi 3 y medio.');
    await d.think(c60 === 'sin' ? 'Con la tabla de la rueda: a 60°, la manija sube 0,87 de rayo. 4 · 0,87 ≈ 3,5.' : c60 === 'half' ? 'La mitad era el seno de 30°. A 60° la tabla de la rueda dice 0,87: 4 · 0,87 ≈ 3,5.' : 'Con el doble de ángulo no sube el doble: subiría 4, todo el largo de la tabla, y sería una pared. La tabla de la rueda dice 0,87: 4 · 0,87 ≈ 3,5.');
    await studentWrites(d, g, 'c10-ramp60', 'sube = 4 · sen 60° ≈ 4 · 0,87 ≈ 3,5', A.x0 + 20, A.y0 + 62, {size: 22});
    await d.say('student', 'Rampa: con la tabla de la rueda sabés cuánto sube una rampa de cualquier inclinación, sin construirla.');
    d.evidence('ratio60', {rise: +(4 * Math.sin(Math.PI / 3)).toFixed(2)});
    g.flags.c10ramp = true;
  },
};

export {lerp, pulse, rectSpot, Label};
