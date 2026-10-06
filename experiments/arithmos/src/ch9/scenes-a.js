// Capítulo 9 — Depende (9.1 a 9.4): flechas, la máquina de Mara, puntos que se paran y la recta parada.

import {lerp, easeInOut} from '../engine/rng.js';
import {zip, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {isFunction, inverse, rulesMatching, RULES, verticalHits, SHAPES} from '../logic/functions.js';
import {GROUND, SHOTS, area, base, boardCast, clean, poly, arrow, dot, Drawing, Label, Shape, S, seedOf, WHITE, YELLOW, BLUE} from './common.js';
import {studentWrites} from '../ch7/scenes-a.js';

const SOMBRA = [[8, 4], [10, 2], [12, 1], [14, 2], [16, 4]];

// ——————————————————————————————————————————————
// 9.1 Flechas
// ——————————————————————————————————————————————

export const flechas = {
  id: 'c9.flechas',
  title: 'Flechas',
  setup(g) {
    g.world.clear();
    base(g);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', 'Con la tabla de ayer sé qué largo tiene mi sombra a cada hora. Un viajero me preguntó la hora y le dije sólo el largo: «mi sombra mide 2». No supo qué contestar.');
    const HX = A.x0 + 70, SX = A.x0 + 320;
    const hy = i => A.y0 + 40 + i * 44;
    const SH = [1, 2, 4], sy = i => A.y0 + 80 + i * 70;
    w.add(new Label('c9-hh', 'hora', HX, A.y0 + 16, {size: 20, align: 'center', z: 12, ch: BLUE}));
    w.add(new Label('c9-sh', 'sombra', SX, A.y0 + 16, {size: 20, align: 'center', z: 12, ch: BLUE}));
    SOMBRA.forEach(([h], i) => w.add(new Label(`c9-h${h}`, `${h} h`, HX, hy(i) + 8, {size: 24, align: 'center', z: 12})));
    SH.forEach((v, i) => w.add(new Label(`c9-s${v}`, String(v), SX, sy(i) + 8, {size: 26, align: 'center', z: 12})));
    d.describe('En la pizarra, dos columnas: a la izquierda las horas 8, 10, 12, 14 y 16; a la derecha las sombras 1, 2 y 4.');
    await d.shot(SHOTS.tiles, 0.8);
    // el jugador une cada hora con su sombra
    const done = new Set();
    let sel = null;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => [sel == null ? 'Tocá una hora y después la sombra que tenía Cornisa a esa hora (la tabla de ayer).' : `Ahora tocá la sombra de las ${sel}.`]);
      const refresh = () => g.ui.setSpots([
        ...SOMBRA.filter(([h]) => !done.has(h)).map(([h]) => rectSpot(`c9-ph${h}`, `Las ${h}`, {x: HX - 34, y: hy(SOMBRA.findIndex(r => r[0] === h)) - 20, w: 68, h: 40}, () => pickH(h), {selected: sel === h})),
        ...(sel == null ? [] : SH.map((v, i) => rectSpot(`c9-ps${v}`, `Sombra ${v}`, {x: SX - 30, y: sy(i) - 20, w: 60, h: 40}, () => pickS(v)))),
      ]);
      const pickH = h => { if (!busy && ctl.alive()) { sel = sel === h ? null : h; refresh(); } };
      const pickS = async v => {
        if (busy || !ctl.alive() || sel == null) return;
        const want = SOMBRA.find(r => r[0] === sel)[1];
        d.evidence('map-arrow', {h: sel, s: v, ok: v === want});
        if (v !== want) { g.note(`En la tabla, a las ${sel} la sombra medía ${want}.`); return; }
        busy = true;
        g.ui.setSpots([]);
        const i = SOMBRA.findIndex(r => r[0] === sel);
        const a = w.add(arrow(`c9-a${sel}`, HX + 36, hy(i), SX - 26, sy(SH.indexOf(v))));
        done.add(sel);
        sel = null;
        try { await d.draw(a, 0.4, {sound: false}); } catch { return; }
        g.audio.tap(0.15, 1.2 + done.size * 0.08);
        busy = false;
        if (done.size === SOMBRA.length) { g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    d.describe('De cada hora sale una sola flecha. A la sombra 2 llegan dos flechas, de las 10 y de las 14; a la 4, de las 8 y de las 16.');
    await d.think('De cada hora sale una flecha, y una sola.');
    const c = await d.choose([
      {id: '10', text: 'Las 10.'},
      {id: 'both', text: 'Las 10 o las 14: con el largo solo no se sabe.'},
      {id: '12', text: 'Las 12.'},
    ], {prompt: 'Cornisa dice sólo el largo: «mi sombra mide 2». ¿Qué hora es?', evaluate: true});
    d.evidence('inverse-predict', {answer: c});
    // dar vuelta las flechas
    g.setCinematic(true);
    for (const [h] of SOMBRA) w.remove(`c9-a${h}`);
    const back = SOMBRA.map(([h, v], i) => w.add(arrow(`c9-b${h}`, SX - 26, sy(SH.indexOf(v)), HX + 36, hy(i), YELLOW)));
    await d.all(...back.map(b => d.draw(b, 0.5, {sound: false})));
    g.setCinematic(false);
    d.describe('Las flechas, dadas vuelta y en amarillo: del 2 salen dos, a las 10 y a las 14; del 4, dos; del 1, una.');
    if (c !== 'both') await d.think(c === '10' ? 'Las 10 o las 14: del 2 salen dos flechas.' : 'A las 12 la sombra mide 1. Con 2, son las 10 o las 14.');
    const fn = isFunction(SOMBRA), inv = isFunction(inverse(SOMBRA));
    if (!fn.ok || inv.ok) console.error('[flechas] la tabla no da función de ida y relación de vuelta');
    await d.say('student', 'Cornisa: a cada hora le toca un solo largo de sombra: el largo es función de la hora. Al revés no: al largo 2 le tocan dos horas. Eso es una relación (une entradas con salidas), pero no una función. Si además decís para qué lado apunta, ahí sí se distinguen: pero esa ya es otra entrada.');
    await studentWrites(d, g, 'c9-def', 'función: a cada entrada, una sola salida', A.x0 + 20, A.y1 - 8, {size: 22});
    d.evidence('function', {fn: fn.ok, inverse: inv.ok, bad: inv.bad});
    g.flags.c9fn = true;
  },
};

// ——————————————————————————————————————————————
// 9.2 La máquina de Mara
// ——————————————————————————————————————————————

function machine(id, x, y, wd, h, ch = WHITE) {
  return new Shape(id, [
    ...poly(`${id}b`, [[0, 0], [wd, 0], [wd, h], [0, h]], {ch, w: 3}),
    ...poly(`${id}i`, [[-30, h / 2 - 12], [0, h / 2 - 12], [0, h / 2 + 12], [-30, h / 2 + 12]], {ch, closed: false, w: 2}),
    ...poly(`${id}o`, [[wd + 30, h / 2 - 12], [wd, h / 2 - 12], [wd, h / 2 + 12], [wd + 30, h / 2 + 12]], {ch, closed: false, w: 2}),
  ], x, y, {z: 12});
}

export const maquina = {
  id: 'c9.maquina',
  title: 'La máquina de Mara',
  setup(g) {
    clean(g, /^c9-/);
    boardCast(g, 0);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const s = w.get('student');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Mara', 'Hice una máquina para las cuentas de los escalones: le doy un número, lo da vuelta adentro y sale otro. Adiviná qué hace.');
    const mx = A.x0 + 170, my = A.y0 + 40, mw = 140, mh = 90;
    w.add(machine('c9-m', mx, my, mw, mh));
    w.add(new Label('c9-ml', '?', mx + mw / 2, my + mh / 2 + 12, {size: 40, align: 'center', z: 12, ch: YELLOW}));
    w.add(new Label('c9-in', 'entra:', A.x0 + 20, A.y1 - 52, {size: 18, z: 12, ch: BLUE}));
    await d.shot(SHOTS.tiles, 0.8);
    const rule = RULES.double1;
    const seen = [];
    const feed = async x => {
      const t = w.add(new Label(`c9-t${seen.length}`, String(x), mx - 60, my + mh / 2 + 10, {size: 28, align: 'center', z: 14}));
      await d.tween(0.4, q => { t.x = lerp(mx - 60, mx + mw / 2, q); t.fade = 1 - q; });
      w.remove(t.id);
      g.audio.tap(0.2, 0.9);
      const y = rule.f(x);
      const o = w.add(new Label(`c9-o${seen.length}`, String(y), mx + mw / 2, my + mh / 2 + 10, {size: 28, align: 'center', z: 14, fade: 0}));
      await d.tween(0.4, q => { o.x = lerp(mx + mw / 2, mx + mw + 60, q); o.fade = q; });
      w.remove(o.id);
      seen.push([x, y]);
      w.add(new Label(`c9-r${seen.length}`, `${x} → ${y}`, A.x0 + 20, A.y0 + 30 + (seen.length - 1) * 32, {size: 24, z: 12}));
      d.describe(`Entra ${x} y sale ${y}.`);
      d.evidence('machine', {x, y});
    };
    const INS = [1, 2, 3, 5];
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá un número: entra en la máquina y se anota lo que sale. Probá dos o tres.']);
      const refresh = () => g.ui.setSpots(INS.filter(x => !seen.some(r => r[0] === x)).map(x => wordSpot(`c9-x${x}`, String(x), A.x0 + 110 + INS.indexOf(x) * 100, A.y1 - 40, () => go(x), {label: `Darle el ${x} a la máquina`})));
      const go = async x => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        try { await feed(x); } catch { return; }
        busy = false;
        if (seen.length >= 3) { g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    const left = rulesMatching(seen);
    const c = await d.choose([
      {id: '21', text: '21.'},
      {id: '20', text: '20: el doble.'},
      {id: '13', text: '13: siempre suma lo mismo.'},
    ], {prompt: 'Si entra 10, ¿qué sale?', evaluate: true});
    d.evidence('rule-predict', {answer: c, matching: left});
    await feed(10);
    await d.think('Veintiuno: el doble más uno. Coincide, pero coincidir no prueba la regla: otra regla rara podría dar lo mismo con estos números y otra cosa con el 5.');
    await d.say('Mara', 'La hice yo: es el doble más uno. Ustedes la adivinaron bien, y el 10 no la desmintió.');
    w.get('c9-ml').text = '× 2 + 1';
    w.get('c9-ml').size = 28;
    await d.say('student', 'Mara: tu máquina hace «el doble más uno». Con el mismo número, siempre sale lo mismo.');
    // la máquina de Punto
    await d.say('Mara', 'Punto también hizo una.');
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, mx + mw / 2, my + mh + 40, 0.4);
    g.setCinematic(false);
    const outs = [7, 9];
    let k = 0;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Dale el 3 a la máquina de Punto, dos veces.']);
      const refresh = () => g.ui.setSpots([wordSpot('c9-p3', k ? 'otra vez 3' : '3', A.x0 + 210, A.y1 - 40, async () => {
        if (!ctl.alive()) return;
        g.ui.setSpots([]);
        const y = outs[k++];
        const o = w.add(new Label(`c9-po${k}`, `3 → ${y}`, A.x1 - 120, A.y0 + 30 + (k - 1) * 32, {size: 24, z: 12, ch: YELLOW}));
        o.reveal = 0;
        try { await d.draw(o, 0.4, {key: 'reveal', sound: false}); } catch { return; }
        g.audio.punto(k === 1 ? 'happy' : 'question');
        d.describe(`La máquina de Punto: entra 3, sale ${y}.`);
        d.evidence('punto-machine', {y});
        if (k >= 2) { g.setHint(null); resolve(); } else refresh();
      }, {label: k ? 'Darle otra vez el 3 a la máquina de Punto' : 'Darle el 3 a la máquina de Punto'})]);
      refresh();
    }));
    await pulse(d, p, 1, 0.3);
    await d.say('student', 'Punto, el mismo 3 dio 7 y después 9. Con tu máquina no puedo anticipar nada: no es una función.');
    g.audio.punto('sad');
    await d.think('Punto mira su máquina un rato. Después tacha la ruedita que giraba sola.');
    g.audio.punto('happy');
    follow(p, s);
    d.evidence('rule', {rule: 'double1', seen});
    g.flags.c9machine = true;
  },
};

// ——————————————————————————————————————————————
// 9.3 Puntos que se paran
// ——————————————————————————————————————————————

export const puntos = {
  id: 'c9.puntos',
  title: 'Puntos que se paran',
  moment: 'Puntos que se paran',
  setup(g) {
    clean(g, /^c9-/);
    boardCast(g, 2);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const s = w.get('student');
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Cornisa', 'La tabla me sirve, pero quisiera verla de un vistazo.');
    await d.say('student', 'En el mapa de Mara: la hora por la recta acostada, la sombra por la parada.');
    const gx = A.x0 + 70, gy = A.y0 + 24, UX = 80, UY = 46;
    const px = h => gx + (h - 8) / 2 * UX, py = v => gy + (4 - v) * UY;
    const lines = [];
    for (let h = 8; h <= 16; h += 2) lines.push(S([[px(h), py(4) - 6], [px(h), py(0) + 6]], seedOf('c9-gx') + h, {w: 1.4, p: 0.45, lift: false}));
    for (let v = 0; v <= 4; v++) lines.push(S([[px(8) - 6, py(v)], [px(16) + 6, py(v)]], seedOf('c9-gy') + v, {w: v === 0 ? 2.6 : 1.4, p: v === 0 ? 0.95 : 0.45, lift: false}));
    w.add(new Drawing('c9-grid', lines, {z: 11}));
    for (let h = 8; h <= 16; h += 2) w.add(new Label(`c9-gxl${h}`, `${h}`, px(h), py(0) + 24, {size: 20, align: 'center', z: 12, ch: BLUE}));
    for (let v = 1; v <= 4; v++) w.add(new Label(`c9-gyl${v}`, String(v), px(8) - 14, py(v) + 7, {size: 20, align: 'right', z: 12, ch: BLUE}));
    w.add(new Label('c9-tab', '8→4  10→2  12→1  14→2  16→4', A.x0 + 20, A.y1 - 4, {size: 17, z: 12}));
    d.describe('Un mapa con las horas 8, 10, 12, 14 y 16 sobre la recta acostada y las sombras de 0 a 4 sobre la parada. Abajo, la tabla.');
    await d.shot(SHOTS.tiles, 0.8);
    const placed = new Set();
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Para cada hora de la tabla, tocá el cruce de esa hora con su sombra.']);
      const refresh = () => {
        const spots = [];
        for (let h = 8; h <= 16; h += 2) for (let v = 0; v <= 4; v++) {
          if (placed.has(h)) continue;
          spots.push(rectSpot(`c9-pt${h}_${v}`, `A las ${h}, sombra ${v}`, {x: px(h) - 20, y: py(v) - 16, w: 40, h: 32}, () => put(h, v)));
        }
        g.ui.setSpots(spots);
      };
      const put = (h, v) => {
        if (!ctl.alive()) return;
        const want = SOMBRA.find(r => r[0] === h)[1];
        d.evidence('plot', {h, v, ok: v === want});
        if (v !== want) { g.note(`A las ${h} la sombra mide ${want}, no ${v}.`); return; }
        placed.add(h);
        w.add(new Shape(`c9-d${h}`, dot(`c9-d${h}`), px(h), py(v), {z: 14}));
        g.audio.tap(0.2, 1 + v * 0.1);
        if (placed.size === 5) { g.ui.setSpots([]); g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    d.describe('Cinco puntos amarillos: altos a las 8 y a las 16, bajos al mediodía.');
    // Punto quiere adornarlo
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, px(12), py(4) - 30, 0.4);
    const wav = [];
    for (let i = 0; i <= 40; i++) { const t = i / 40; wav.push([px(8) + t * (px(16) - px(8)), py(2.5) + Math.sin(t * Math.PI * 6) * 30]); }
    const deco = w.add(new Drawing('c9-deco', [S(wav, seedOf('c9-deco'), {w: 2.6, p: 0.9, ch: YELLOW})], {z: 13, progress: 0}));
    await d.draw(deco, 0.9, {sound: false});
    d.describe('Punto dibuja una línea ondulada, linda, que no sigue los puntos: no sale de la tabla.');
    g.audio.punto('happy');
    g.setCinematic(false);
    await d.say('student', 'Punto, es linda, pero ¿a qué hora es esa ola? No sale de la tabla.');
    g.setCinematic(true);
    d.describe('Pasa una brisa de borrador: la ola de Punto se deshace. Los cinco puntos quedan.');
    g.audio.erase(1.2, 0.5);
    g.camera.shake = 0.15;
    await d.fadeTo(deco, 0, 1.2);
    w.remove('c9-deco');
    follow(p, s);
    g.setCinematic(false);
    const j = await d.choose([
      {id: 'join', text: 'Unirlos: entre las 8 y las 10 también hay sombra.'},
      {id: 'loose', text: 'Dejarlos sueltos: sólo medimos esas horas.'},
      {id: 'pretty', text: 'Unirlos con una curva linda, como la de Punto.'},
    ], {prompt: '¿Los puntos se unen?', evaluate: true});
    d.evidence('join-predict', {answer: j});
    const line = w.add(new Drawing('c9-line', [S(SOMBRA.map(([h, v]) => [px(h), py(v)]), seedOf('c9-line'), {w: 2.4, p: 0.9, ch: YELLOW})], {z: 13, progress: 0}));
    await d.draw(line, 0.8, {sound: false});
    await d.think(j === 'join' ? 'A cada momento hay una sombra: se puede unir. La línea dice lo que suponemos entre medición y medición.' : j === 'loose' ? 'Entre las 8 y las 10 Cornisa sigue teniendo sombra: se puede unir. Pero la línea es una suposición: lo medido son los puntos.' : 'Unir sí, pero sin inventar: por los puntos. Lo de en medio es una suposición, no una medición.');
    await d.say('Cornisa', 'Entonces a las 9 mi sombra es… más o menos 3. Casi, porque no lo medí.');
    // las visitas por día: no se unen
    await d.say('Mara', 'Yo anoto cuántas familias vienen cada día al depósito: lunes 3, martes 5, miércoles 4.');
    const c = await d.choose([
      {id: 'loose', text: 'Sueltos: no hay «lunes y medio».'},
      {id: 'join', text: 'Unidos, como los de Cornisa.'},
    ], {prompt: '¿Esos puntos se unen?', evaluate: true});
    d.evidence('join-discrete', {answer: c});
    await d.say('student', c === 'loose' ? 'Mara: entre el lunes y el martes no hay un día a medias: la entrada se cuenta de a uno. Los puntos van sueltos.' : 'Mara: entre el lunes y el martes no hay un día a medias, ni media familia: si unimos, la línea dice cosas que no existen. Sueltos.');
    w.remove('c9-tab');
    await studentWrites(d, g, 'c9-gr', 'un gráfico se lee: cada punto dice algo', A.x0 + 20, A.y1 - 4, {size: 18});
    g.flags.c9graph = true;
  },
};

// ——————————————————————————————————————————————
// 9.4 La recta parada
// ——————————————————————————————————————————————

export const recta = {
  id: 'c9.recta',
  title: 'La recta parada',
  setup(g) {
    clean(g, /^c9-/);
    boardCast(g, 3);
    g.camera.go(SHOTS.board);
  },
  async play(d, g) {
    const w = g.world;
    const A = area();
    await d.shot(SHOTS.board, 1);
    await d.say('Balcón', 'Encontré estos dibujos en el depósito. Mara dice que alguno es el gráfico de una de sus máquinas. ¿Cuáles pueden serlo?');
    const K = 17;
    const cells = [
      {id: 'line', x: A.x0 + 130, y: A.y0 + 70},
      {id: 'circle', x: A.x0 + 370, y: A.y0 + 70},
      {id: 'parabola', x: A.x0 + 130, y: A.y0 + 196},
      {id: 'sideways', x: A.x0 + 370, y: A.y0 + 196},
    ];
    for (const c of cells) {
      const pts = SHAPES[c.id].map(([x, y]) => [c.x + x * K, c.y - y * K]);
      const list = [S(pts, seedOf(`c9-${c.id}`), {w: 2.6, p: 0.9})];
      w.add(new Drawing(`c9-f${c.id}`, list, {z: 12}));
      w.add(new Drawing(`c9-ax${c.id}`, [S([[c.x - 3.2 * K, c.y], [c.x + 3.2 * K, c.y]], seedOf(`c9-ax${c.id}`), {w: 1.2, p: 0.35, lift: false})], {z: 11}));
    }
    d.describe('Cuatro dibujos: una recta inclinada, un círculo, una curva en forma de U y la misma U acostada.');
    await d.say('student', 'Si fuera el gráfico de una máquina, a cada entrada, sobre la recta acostada, le tocaría una sola altura. Una recta parada no puede cortarlo dos veces.');
    await d.shot(SHOTS.tiles, 0.8);
    const done = {};
    let sel = null;
    const truth = id => id === 'line' || id === 'parabola';
    const xs = Array.from({length: 25}, (_, i) => -3 + i * 0.25);
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => [sel ? '¿Es el gráfico de una función? Elegí, y la recta parada lo recorre para comprobarlo.' : 'Tocá un dibujo.']);
      const refresh = () => {
        if (!sel) g.ui.setSpots(cells.filter(c => !(c.id in done)).map(c => rectSpot(`c9-c${c.id}`, `El dibujo ${({line: 'de la recta', circle: 'del círculo', parabola: 'de la U', sideways: 'de la U acostada'})[c.id]}`, {x: c.x - 56, y: c.y - 56, w: 112, h: 112}, () => { if (!busy && ctl.alive()) { sel = c; refresh(); } })));
        else g.ui.setSpots([
          wordSpot('c9-yes', 'es función', A.x0 + 250, A.y0 + 132, () => judge(true), {label: 'Decir que es el gráfico de una función'}),
          wordSpot('c9-no', 'no es', A.x0 + 250, A.y0 + 196, () => judge(false), {label: 'Decir que no es el gráfico de una función'}),
        ]);
      };
      const judge = async yes => {
        if (busy || !ctl.alive() || !sel) return;
        busy = true;
        g.ui.setSpots([]);
        const c = sel;
        d.evidence('vertical-predict', {shape: c.id, said: yes, truth: truth(c.id)});
        // la recta parada recorre el dibujo
        w.remove('c9-bar');
        const hits = verticalHits(SHAPES[c.id], xs);
        const worst = hits.reduce((m, h) => (h.hits > m.hits ? h : m), hits[0]);
        const marks = [];
        try {
          await d.tween(1.2, q => {
            const x = -3 + q * 6;
            w.remove('c9-bar');
            w.add(new Drawing('c9-bar', [S([[c.x + x * K, c.y - 3.3 * K], [c.x + x * K, c.y + 3.3 * K]], seedOf('c9-bar'), {w: 2.2, p: 0.9, ch: BLUE})], {z: 15}));
          });
          // donde más corta, se marcan los cortes
          const ys = SHAPES[c.id].filter(pt => Math.abs(pt[0] - worst.x) < 0.12).map(pt => pt[1]);
          const uniq = [];
          for (const y of ys.sort((a, b) => a - b)) if (!uniq.length || y - uniq[uniq.length - 1] > 0.6) uniq.push(y);
          w.remove('c9-bar');
          w.add(new Drawing('c9-bar', [S([[c.x + worst.x * K, c.y - 3.3 * K], [c.x + worst.x * K, c.y + 3.3 * K]], seedOf('c9-bar'), {w: 2.2, p: 0.9, ch: BLUE})], {z: 15}));
          uniq.forEach((y, i) => marks.push(w.add(new Shape(`c9-hit${i}`, poly(`c9-hit${i}`, Array.from({length: 8}, (_, k) => [Math.cos(k / 8 * Math.PI * 2) * 6, Math.sin(k / 8 * Math.PI * 2) * 6]), {ch: YELLOW, w: 3}), c.x + worst.x * K, c.y - y * K, {z: 16}))));
          d.describe(worst.hits > 1 ? `La recta parada corta el dibujo en ${worst.hits} lugares a la vez.` : 'La recta parada corta el dibujo en un solo lugar, en cualquier posición.');
          await d.wait(0.9);
        } catch { return; }
        const ok = yes === truth(c.id);
        done[c.id] = truth(c.id);
        w.add(new Label(`c9-cl${c.id}`, truth(c.id) ? 'función' : 'no es función', c.x, c.y + 3.6 * K + 4, {size: 16, align: 'center', z: 12, ch: YELLOW}));
        if (!ok) g.note(truth(c.id) ? 'Una sola altura para cada entrada: sí es función.' : 'Hay entradas con dos alturas: no es función.');
        else g.audio.tap(0.2, 1.5);
        w.remove('c9-bar');
        for (const m of marks) w.remove(m.id);
        sel = null;
        busy = false;
        if (Object.keys(done).length === 4) { g.setHint(null); resolve(); } else refresh();
      };
      refresh();
    }));
    await d.say('student', 'Balcón: la recta y la U pueden ser gráficos de máquinas. El círculo y la U acostada no: hay entradas con dos alturas.');
    await d.think('La recta parada sirve con la entrada sobre la recta acostada. Y dice si puede ser una función, no cuál.');
    d.evidence('vertical', {done});
    g.flags.c9vertical = true;
  },
};

export {GROUND, easeInOut, inverse};
