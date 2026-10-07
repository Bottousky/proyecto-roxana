// Capítulo 4 — Veces (4.4 a 4.7): repartir, medir, entre nadie y partir el rectángulo.

import {Drawing, Label, Shape} from '../engine/world.js';
import {YELLOW} from '../engine/chalk.js';
import {lerp, easeInOut} from '../engine/rng.js';
import {zip, hop, pulse, follow, spotOf, rectSpot, wordSpot} from '../acting.js';
import {share, measure, split} from '../logic/times.js';
import {GROUND, BOARD, boardTop, FAMILIES, SHOTS, base, cast, family, familiesHome, clearSigns, item, art, art4} from './common.js';
import {boardNotes} from './scenes-a.js';

const WORDS = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce'];

/** Dónde se para cada familia para recibir su parte. */
const FX = k => 13200 + k * 160;
/** El k-ésimo atado que recibe una familia. */
const placeOf = (k, i) => [FX(k) - 62 + (i % 2) * 44, GROUND - 26 - Math.floor(i / 2) * 50];
/** El montón, delante de la pizarra. */
const pileOf = i => [BOARD.x - 150 + (i % 7) * 48, GROUND - 26 - Math.floor(i / 7) * 50];

/** Algo escrito en la pizarra (renglón `row`). */
function boardLine(w, id, text, row, {size = 34, reveal = 1} = {}) {
  const l = w.ensure(id, () => new Label(id, text, BOARD.x - BOARD.w / 2 + 30, boardTop() + 56 + row * 50, {size, z: 9, reveal}));
  l.text = text;
  return l;
}

async function writeLine(d, g, id, text, row, opts) {
  const s = g.world.get('student');
  const l = boardLine(g.world, id, text, row, {...opts, reveal: 0});
  l.reveal = 0;
  g.setCinematic(true);
  s.face(1);
  await d.walk(s, BOARD.x - BOARD.w / 2 - 40, GROUND, 240);
  s.setPose('write', 0.3);
  await d.draw(l, Math.min(1.4, 0.3 + text.length * 0.04), {key: 'reveal'});
  s.setPose('idle', 0.4);
  g.setCinematic(false);
  return l;
}

function shareCast(g) {
  const w = g.world;
  cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
  FAMILIES.forEach((f, k) => family(w, k, FX(k), GROUND, {facing: -0.5}));
}

// ——————————————————————————————————————————————
// 4.4 Repartir
// ——————————————————————————————————————————————

export const repartir = {
  id: 'c4.repartir',
  title: 'Repartir',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(g9|stretch-|pmore|flip-|sh-|rest-|bl-)/.test(o.id));
    clearSigns(w);
    boardNotes(g, 3);
    shareCast(g);
    const sc = g.scratch('c4.repartir');
    const given = sc.given || [0, 0, 0, 0];
    let n = 0;
    given.forEach((c, k) => { for (let i = 0; i < c; i++) item(w, 1, ...placeOf(k, i), `sh-${n++}`).z = 15; });
    for (let i = 0; n < 14; i++) item(w, 1, ...pileOf(i), `sh-${n++}`).z = 15;
    g.camera.go(SHOTS.share);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const sc = g.scratch();
    sc.given ??= [0, 0, 0, 0];
    const given = sc.given;
    await d.shot(SHOTS.share, 1);
    if (!sc.guess) {
      d.describe('Las cuatro familias bajaron con la cosecha: catorce atados, en un montón delante de la pizarra.');
      await d.say('Mara', 'Las Terrazas juntaron la cosecha: catorce atados. Bajaron las cuatro familias para repartirla.');
      await d.say('Balcón', 'Igual para todas, ¿eh? Que nadie reciba más que otra.');
      sc.guess = await d.choose([
        {id: '3r2', text: 'Tres cada una, y sobran dos.'},
        {id: '4', text: 'Cuatro cada una.'},
        {id: '3', text: 'Tres cada una.'},
        {id: 'cant', text: 'No se sabe hasta repartir.'},
      ], {prompt: 'Catorce atados entre cuatro familias, igual para todas. ¿Cuánto le toca a cada una?', evaluate: true});
      d.evidence('predict-share', {answer: sc.guess});
      g.saveNow();
      await d.say('Balcón', 'De a uno, por vueltas. Nadie recibe el segundo hasta que todas tengan el primero.');
    }
    const pile = () => w.objects.filter(o => o.id.startsWith('sh-') && o.owner == null && o.y > GROUND - 120 && o.x < BOARD.x + BOARD.w / 2).sort((a, b) => b.x - a.x);
    const total = () => given.reduce((a, b) => a + b, 0);
    const give = async k => {
      const o = pile()[0];
      if (!o) return;
      o.owner = k;
      await hop(d, o, ...placeOf(k, given[k]), {g, h: 90, dur: 0.45});
      given[k]++;
      g.saveNow();
    };
    // marca de dueño para los que ya están repartidos
    {
      let n = 0;
      given.forEach((c, k) => { for (let i = 0; i < c; i++) { const o = w.get(`sh-${n++}`); if (o) o.owner = k; } });
    }
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá a una familia para darle el próximo atado del montón.', 'Por vueltas: primero uno a cada una; después, el segundo.', 'Cuando quedan menos atados que familias, ya no alcanza para otra vuelta.']);
      const refresh = () => {
        const spots = FAMILIES.map((f, k) => spotOf(w.get(f.id), `Familia ${f.name}: tiene ${given[k] === 1 ? 'un atado' : `${given[k]} atados`}`, () => pick(k)));
        if (Math.min(...given) >= 1 && Math.min(...given) === Math.max(...given) && 14 - total() >= 4) spots.push(wordSpot('vuelta', 'dar otra vuelta: uno a cada una', BOARD.x + 40, GROUND - 120, () => round()));
        g.ui.setSpots(spots);
      };
      const pick = async k => {
        if (busy || !ctl.alive()) return;
        if (given[k] > Math.min(...given)) {
          busy = true;
          d.evidence('unfair', {family: FAMILIES[k].id});
          try { await d.say(FAMILIES[k].name, '¡A mí ya me tocó en esta vuelta! Primero a las demás.'); } catch { return; }
          busy = false;
          return refresh();
        }
        busy = true;
        try { await give(k); } catch { return; }
        busy = false;
        if (14 - total() < 4 && Math.min(...given) === Math.max(...given)) resolve();
        else refresh();
      };
      const round = async () => {
        if (busy || !ctl.alive() || Math.min(...given) !== Math.max(...given)) return;
        busy = true;
        d.evidence('share-round');
        try { for (let k = 0; k < 4; k++) await give(k); } catch { return; }
        busy = false;
        if (14 - total() < 4) resolve();
        else refresh();
      };
      if (14 - total() < 4) resolve();
      else refresh();
    }));
    g.setHint(null);
    const r = share(14, 4);
    // los que sobran
    const opts = [
      {id: 'two', text: 'Dárselos a dos familias.'},
      {id: 'split', text: 'Partirlos en pedazos.'},
      {id: 'aside', text: 'Dejarlos aparte: sobran.'},
    ];
    for (;;) {
      const c = await d.choose(opts, {prompt: `Cada familia tiene ${WORDS[r.each - 1]}. Quedan dos atados y son cuatro familias.`, evaluate: true});
      d.evidence('rest', {choice: c});
      if (c === 'aside') break;
      if (c === 'two') {
        g.setCinematic(true);
        const left = pile();
        await d.all(hop(d, left[0], ...placeOf(0, 3), {g, h: 80}), hop(d, left[1], ...placeOf(1, 3), {g, h: 80, sound: null}));
        g.setCinematic(false);
        await d.say('Cornisa', '¿Y por qué Peldaño y Rampa tienen cuatro y nosotras tres?');
        await d.say('Balcón', 'Así no es igual para todas.');
        g.setCinematic(true);
        await d.all(hop(d, left[0], ...pileOf(0), {g, h: 80}), hop(d, left[1], ...pileOf(1), {g, h: 80, sound: null}));
        g.setCinematic(false);
      } else {
        g.flags.c4split = true;
        await d.say('Mara', 'Se puede… pero un atado partido ya no es un atado entero. Eso es otra pregunta. Guardala.');
      }
      opts.splice(opts.findIndex(o => o.id === c), 1);
    }
    g.setCinematic(true);
    const left = pile();
    // guarda: lo que se ve tiene que coincidir con la cuenta
    if (left.length !== r.rest) console.error(`[reparto] quedan ${left.length} atados en el montón y la cuenta dice ${r.rest}`);
    left.forEach((o, i) => { o.id.startsWith('sh-') && (o.owner = 'rest'); hop(d, o, BOARD.x + 160 + i * 46, GROUND - 26, {g, h: 40, sound: null}).catch(() => {}); });
    await d.wait(0.5);
    const rl = w.add(new Label('rest-l', 'sobran 2', BOARD.x + 140, GROUND - 70, {size: 26, z: 9, reveal: 0}));
    await d.draw(rl, 0.5, {key: 'reveal', sound: false});
    g.setCinematic(false);
    const g0 = sc.guess;
    await d.think(g0 === '3r2' ? 'Tres cada una, y sobran dos.'
      : g0 === '4' ? 'Cuatro no: para cuatro cada una harían falta dieciséis.'
        : g0 === '3' ? 'Tres, sí. Y dos que sobran: también hay que decirlo.'
          : 'Repartiendo se supo: tres cada una, y sobran dos.');
    await d.shot(SHOTS.boardWide, 0.8);
    await writeLine(d, g, 'bl-1', '14 = 4 × 3 + 2', 0);
    await writeLine(d, g, 'bl-2', '14 ÷ 4 → 3 cada una; sobran 2', 1, {size: 30});
    d.evidence('share', r);
    g.flags.c4share = true;
  },
};

// ——————————————————————————————————————————————
// 4.5 Medir
// ——————————————————————————————————————————————

const bagPos = k => [13260 + k * 120, GROUND - 40];

export const medir = {
  id: 'c4.medir',
  title: 'Medir',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(sh-|rest-|bl-|bag|ms-)/.test(o.id));
    clearSigns(w);
    boardNotes(g, 3);
    shareCast(g);
    const sc = g.scratch('c4.medir');
    const bags = sc.bags || 0;
    for (let i = 0; i < 12 - bags * 3; i++) item(w, 1, ...pileOf(i), `ms-${i}`).z = 15;
    for (let k = 0; k < bags; k++) bagShape(w, k, false, 3);
    familiesHome(g);
    family(w, 0, 13780, GROUND, {facing: 0.6});
    g.camera.go(SHOTS.share);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const sc = g.scratch();
    sc.bags ??= 0;
    await d.shot(SHOTS.share, 1);
    if (!sc.guess) {
      await d.say('Peldaño', 'Mara, con la cosecha te pagamos lo que te debíamos: tres atados cada familia.');
      await d.say('Mara', 'Doce atados. Los tengo que llevar al depósito en bolsas de tres.');
      sc.guess = await d.choose([
        {id: '4', text: 'Cuatro bolsas.'},
        {id: '3', text: 'Tres bolsas.'},
        {id: '9', text: 'Nueve bolsas.'},
        {id: '36', text: 'Treinta y seis bolsas.'},
      ], {prompt: '¿Cuántas bolsas de tres se llenan con doce atados?', evaluate: true});
      d.evidence('predict-measure', {answer: sc.guess});
      g.saveNow();
    }
    const pile = () => w.objects.filter(o => o.id.startsWith('ms-')).sort((a, b) => b.x - a.x);
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá el montón para llenar una bolsa con tres atados.']);
      const refresh = () => g.ui.setSpots([rectSpot('ms-pile', `Montón de atados (${pile().length}): llenar una bolsa de tres`, {x: BOARD.x - 180, y: GROUND - 100, w: 360, h: 100}, () => fill())]);
      const fill = async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        const k = sc.bags;
        const b = bagShape(w, k, true, 0);
        b.progress = 0;
        try {
          await d.tween(0.3, q => { b.progress = q; });
          const three = pile().slice(0, 3);
          await d.all(...three.map((o, i) => hop(d, o, bagPos(k)[0], bagPos(k)[1] - 10, {g, h: 100, dur: 0.5 + i * 0.08, sound: i ? null : 'tap'})));
          for (const o of three) w.remove(o.id);
          bagShape(w, k, false, 3);
          g.audio.tap(0.2, 1.2 + k * 0.1);
        } catch { return; }
        sc.bags = k + 1;
        g.saveNow();
        d.evidence('bag', {n: sc.bags});
        busy = false;
        if (!pile().length) resolve();
        else refresh();
      };
      if (!pile().length) resolve();
      else refresh();
    }));
    g.setHint(null);
    const r = measure(12, 3);
    if (sc.bags !== r.bags || pile().length !== r.rest) console.error(`[medida] ${sc.bags} bolsas y ${pile().length} sueltos; la cuenta dice ${r.bags} y ${r.rest}`);
    await d.think(sc.guess === '4' ? 'Cuatro bolsas.' : `Cuatro bolsas, no ${{3: 'tres', 9: 'nueve', 36: 'treinta y seis'}[sc.guess]}: cada bolsa se lleva tres.`);
    await d.say('student', 'Recién repartimos: cada familia, tres. Ahora medimos: bolsas de tres, cuatro bolsas.');
    await d.think('Dos preguntas distintas. Las dos se contestan con 4 × 3 = 12.');
    await d.shot(SHOTS.boardWide, 0.8);
    await writeLine(d, g, 'bl-3', '12 ÷ 3 = 4, porque 4 × 3 = 12', 0, {size: 30});
    // transferencia: bolsas de cuatro
    await d.shot(SHOTS.share, 0.8);
    const t = await d.choose([
      {id: '3', text: 'Tres.'}, {id: '4', text: 'Cuatro.'}, {id: '8', text: 'Ocho.'}, {id: '48', text: 'Cuarenta y ocho.'},
    ], {prompt: 'Con los mismos doce atados, ¿cuántas bolsas de cuatro se llenan?', evaluate: true});
    d.evidence('measure-transfer', {answer: t});
    g.setCinematic(true);
    d.describe('Las bolsas se vacían y se vuelven a llenar de a cuatro: quedan tres bolsas.');
    g.audio.erase(0.5, 0.3);
    for (let k = 0; k < 4; k++) w.remove(`bag${k}`);
    for (let k = 0; k < 4; k++) w.remove(`bagn${k}`);
    for (let k = 0; k < 3; k++) {
      const b = bagShape(w, k, false, 4);
      b.progress = 0;
      await d.tween(0.35, q => { b.progress = q; });
    }
    g.setCinematic(false);
    await d.think(t === '3' ? 'Tres bolsas de cuatro.' : 'Tres bolsas de cuatro: doce otra vez, agrupado de otra manera.');
    await d.shot(SHOTS.boardWide, 0.8);
    await writeLine(d, g, 'bl-4', '12 ÷ 4 = 3, porque 3 × 4 = 12', 1, {size: 30});
    d.evidence('measure', r);
    g.flags.c4measure = true;
  },
};

function bagShape(w, k, open, n) {
  const [x, y] = bagPos(k);
  const b = w.add(new Shape(`bag${k}`, art4.bag(`bag${k}-${open ? 'o' : 'c'}`, open), x, y, {z: 14}));
  if (!open && n !== null) w.add(new Label(`bagn${k}`, String(n), x, y + 12, {size: 26, align: 'center', z: 16}));
  return b;
}

// ——————————————————————————————————————————————
// 4.6 Entre nadie
// ——————————————————————————————————————————————

export const nadie = {
  id: 'c4.nadie',
  title: 'Entre nadie',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(ms-|bag|bl-|nz-)/.test(o.id));
    clearSigns(w);
    boardNotes(g, 3);
    cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
    familiesHome(g);
    family(w, 3, BOARD.x - BOARD.w / 2 - 330, GROUND, {facing: 0.6});
    for (let i = 0; i < 6; i++) item(w, 1, ...pileOf(i), `nz-${i}`).z = 15;
    g.camera.go(SHOTS.share);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const sc = g.scratch();
    await d.shot(SHOTS.share, 1);
    await d.say('Mara', 'Estos seis atados los guardo para repartir en la próxima cosecha.');
    await d.say('Balcón', '¿Y si para entonces las Terrazas quedan vacías, como la escalera que se llevaba la Marea? ¿A quién le tocan?');
    const a = await d.choose([
      {id: '0', text: 'A cada una le tocan cero.'},
      {id: '6', text: 'A cada una le tocan seis.'},
      {id: 'none', text: 'No hay a quién darle: la pregunta no tiene respuesta.'},
    ], {prompt: 'Seis atados repartidos entre cero familias. ¿Cuánto le toca a cada una?', evaluate: true});
    d.evidence('share-zero', {answer: a});
    // Punto intenta empezar a repartir
    g.setCinematic(true);
    const o = w.get('nz-0');
    p.setMode('still');
    d.describe('Punto levanta un atado para dárselo a la primera familia. Mira a un lado y al otro: no hay nadie. Lo vuelve a dejar.');
    await zip(d, p, o.x, o.y - 50, 0.4);
    const ox = o.x, oy = o.y;
    await d.tween(0.4, q => { o.y = lerp(oy, oy - 60, q); });
    for (const dx of [-160, 220, -60]) {
      await zip(d, p, ox + dx, GROUND - 160, 0.35);
      g.audio.punto('question');
      await d.wait(0.2);
    }
    await d.tween(0.4, q => { o.y = lerp(oy - 60, oy, q); });
    follow(p, s);
    g.setCinematic(false);
    await d.think(a === 'none' ? 'No hay primera familia: el reparto no empieza nunca.'
      : a === '0' ? 'Cero sería si hubiera familias y no les tocara nada. Acá no hay "cada una": el reparto no empieza.'
        : 'Seis, ¿a quién? No hay nadie que los reciba: el reparto no empieza.');
    // bolsas de cero
    await d.say('Rampa', '¿Y en bolsas donde no entra nada? ¿Cuántas se llenan con seis atados?');
    let bags = 0;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá "llenar una bolsa de cero" y mirá el montón. Cuando quieras, pará.']);
      const refresh = () => {
        const spots = [wordSpot('nz-fill', bags ? 'llenar otra bolsa de cero' : 'llenar una bolsa de cero', 13420, GROUND - 170, () => fill())];
        if (bags >= 1) spots.push(wordSpot('nz-stop', 'parar', 13420, GROUND - 310, () => { if (!busy && ctl.alive()) { follow(p, s); resolve(); } }));
        g.ui.setSpots(spots);
      };
      const fill = async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        const [x, y] = bagPos(bags);
        const b = w.add(new Shape(`nzb${bags}`, art4.bag(`nzb${bags}`, false), x, y, {z: 14, progress: 0}));
        try {
          p.setMode('still');
          await zip(d, p, x, y - 70, 0.3);
          await d.tween(0.35, q => { b.progress = q; });
          w.add(new Label(`nzn${bags}`, '0', x, y + 12, {size: 26, align: 'center', z: 16}));
          g.audio.punto('no');
          await pulse(d, w.get('nz-5'), 1, 0.3);
        } catch { return; }
        bags++;
        d.evidence('zero-bag', {n: bags});
        busy = false;
        if (bags >= 8) { follow(p, s); resolve(); } else refresh();
      };
      refresh();
    }));
    g.setHint(null);
    await d.think(`${bags === 1 ? 'Una bolsa' : `${['', '', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho'][bags]} bolsas`}, y el montón sigue igual: seis.`);
    const m = await d.choose([
      {id: '6', text: 'Seis bolsas.'},
      {id: 'inf', text: 'Infinitas bolsas.'},
      {id: 'never', text: 'Ninguna cantidad alcanza: no se termina nunca.'},
    ], {prompt: '¿Cuántas bolsas de cero hacen falta para guardar los seis atados?', evaluate: true});
    d.evidence('measure-zero', {answer: m});
    await d.think(m === 'never' ? 'Cada bolsa se lleva cero. Nunca se termina.'
      : m === 'inf' ? 'Ni siquiera infinitas: cada bolsa se lleva cero, y juntando ceros nunca se llega a seis.'
        : 'Seis bolsas de cero guardan cero atados. El montón sigue ahí.');
    await d.say('student', 'Doce dividido tres era cuatro porque cuatro por tres es doce. Entonces, ¿qué número por cero da seis?');
    const z = await d.choose([
      {id: '0', text: 'El cero.'},
      {id: '6', text: 'El seis.'},
      {id: 'none', text: 'Ninguno: todo por cero da cero.'},
    ], {prompt: '¿Qué número por 0 da 6?', evaluate: true});
    d.evidence('times-zero', {answer: z});
    await d.shot(SHOTS.boardWide, 0.8);
    g.setCinematic(true);
    d.describe('Punto escribe en amarillo: 0 × 0 = 0, 6 × 0 = 0, 100 × 0 = 0.');
    const tries = ['0 × 0 = 0', '6 × 0 = 0', '100 × 0 = 0'];
    for (const [i, t] of tries.entries()) {
      const l = w.add(new Label(`nz-t${i}`, t, BOARD.x + 30, boardTop() + 56 + i * 44, {size: 30, z: 16, ch: YELLOW, reveal: 0}));
      await d.draw(l, 0.4, {key: 'reveal', sound: false});
      g.audio.tap(0.12, 1.5);
    }
    g.setCinematic(false);
    await d.think(z === 'none' ? 'Todo por cero da cero. Ninguno da seis.' : 'No: por cero, todo da cero. Ninguno da seis.');
    await writeLine(d, g, 'nz-l', '6 ÷ 0 → no hay ningún número', 3, {size: 30});
    await d.think('Ni cero ni infinito: la pregunta no tiene respuesta.');
    await d.say('Mara', 'Entonces eso no lo anoto. Ni cero, ni nada: no se reparte entre nadie.');
    g.flags.c4zero = true;
  },
};

// ——————————————————————————————————————————————
// 4.7 Partir el rectángulo (momento)
// ——————————————————————————————————————————————

const CELL = 46;
const GARDEN = {f: 4, c: 5};

function gardenPart(w, id, f, c, x) {
  const list = art4.grid(id, 0, 0, f, c, CELL);
  for (let i = 0; i < f; i++) for (let j = 0; j < c; j++) list.push(...art4.sprout(`${id}-${i}-${j}`, (j + 0.5) * CELL, (i + 0.5) * CELL + 14));
  return w.add(new Shape(id, list, x, boardTop() + 62, {z: 12}));
}

export const partir = {
  id: 'c4.partir',
  title: 'Partir el rectángulo',
  moment: 'Partir el rectángulo',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(nz|bl-|gd-|pt-)/.test(o.id));
    clearSigns(w);
    boardNotes(g, 3);
    cast(g, {sx: BOARD.x - BOARD.w / 2 - 200, mx: BOARD.x - BOARD.w / 2 - 90});
    familiesHome(g);
    family(w, 0, BOARD.x - BOARD.w / 2 - 330, GROUND, {facing: 0.6});
    family(w, 3, BOARD.x - BOARD.w / 2 - 440, GROUND, {facing: 0.6});
    gardenPart(w, 'gd-all', GARDEN.f, GARDEN.c, BOARD.x - GARDEN.c * CELL / 2);
    g.camera.go(SHOTS.boardWide);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.boardWide, 1);
    await d.say('Peldaño', 'El plano de mi huerta: cuatro filas de cinco. Le quiero dar una parte a Balcón, cortando entre dos columnas.');
    const c0 = await d.choose([
      {id: 'yes', text: 'Sí, cambia según dónde se corte.'},
      {id: 'no', text: 'No: siempre son las mismas plantas.'},
      {id: 'dep', text: 'Depende de cuánto le regale.'},
    ], {prompt: 'Después de cortar, sumando las dos partes, ¿cambia el total?', evaluate: true});
    d.evidence('predict-split', {answer: c0});
    const x0 = BOARD.x - GARDEN.c * CELL / 2;
    const y0 = boardTop() + 62;
    const cuts = [];
    let left = null, right = null;
    const doCut = async c => {
      w.remove('gd-all');
      w.removeWhere(o => /^pt-/.test(o.id));
      if (left) w.remove(left.id);
      if (right) w.remove(right.id);
      left = gardenPart(w, 'gd-l', GARDEN.f, c, x0);
      right = gardenPart(w, 'gd-r', GARDEN.f, GARDEN.c - c, x0 + c * CELL);
      const cut = w.add(new Drawing('pt-cut', art4.cutLine('pt-cut', x0 + c * CELL, y0 - 10, y0 + GARDEN.f * CELL + 10), {z: 13, progress: 0}));
      await d.draw(cut, 0.5, {sound: false});
      g.audio.erase(0.4, 0.3);
      await d.tween(0.6, q => { left.x = x0 - q * 40; right.x = x0 + c * CELL + q * 40; }, easeInOut);
      w.remove('pt-cut');
      const sp = split(GARDEN.f, c, GARDEN.c - c);
      const ly = y0 + GARDEN.f * CELL + 36;
      const la = w.add(new Label('pt-a', `4 × ${c} = ${sp.parts[0]}`, x0 - 40 + c * CELL / 2, ly, {size: 28, align: 'center', z: 9, reveal: 0}));
      const lb = w.add(new Label('pt-b', `4 × ${GARDEN.c - c} = ${sp.parts[1]}`, x0 + 40 + c * CELL + (GARDEN.c - c) * CELL / 2, ly, {size: 28, align: 'center', z: 9, reveal: 0}));
      await d.draw(la, 0.4, {key: 'reveal'});
      await d.draw(lb, 0.4, {key: 'reveal'});
      const lt = w.add(new Label('pt-t', `${sp.parts[0]} + ${sp.parts[1]} = ${sp.sum}`, BOARD.x, y0 - 14, {size: 30, align: 'center', z: 9, reveal: 0, ch: YELLOW}));
      await d.draw(lt, 0.5, {key: 'reveal', sound: false});
      cuts.push(c);
      d.evidence('cut', {at: c, parts: sp.parts, sum: sp.sum});
    };
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Tocá una de las líneas entre dos columnas para cortar ahí.', 'Después probá cortar en otro lugar.']);
      const refresh = () => {
        const spots = [];
        for (let c = 1; c < GARDEN.c; c++) {
          if (cuts.includes(c)) continue;
          spots.push(rectSpot(`cut${c}`, `Cortar entre la columna ${c} y la ${c + 1}`, () => ({x: (cuts.length ? x0 : x0) + c * CELL - 12, y: y0, w: 24, h: GARDEN.f * CELL}), () => go(c)));
        }
        g.ui.setSpots(spots);
      };
      const go = async c => {
        if (busy || !ctl.alive()) return;
        busy = true;
        g.ui.setSpots([]);
        try {
          await doCut(c);
        } catch { return; }
        busy = false;
        if (cuts.length >= 2) resolve();
        else {
          // juntar otra vez para el segundo corte
          try {
            await d.think('¿Y cortando en otro lugar?');
            w.removeWhere(o => /^pt-/.test(o.id));
            await d.tween(0.4, q => { left.x = x0 - 40 * (1 - q); right.x = x0 + c * CELL + 40 * (1 - q); });
          } catch { return; }
          refresh();
        }
      };
      refresh();
    }));
    g.setHint(null);
    await d.think(c0 === 'no' ? 'Veinte las dos veces. Se reparten distinto, pero son las mismas plantas.' : 'Veinte las dos veces. Cambia cuánto le toca a cada uno, no el total.');
    const c = cuts.at(-1);
    await d.shot({...SHOTS.boardWide, y: SHOTS.boardWide.y - 60}, 0.6);
    const top = boardTop();
    const eq = w.add(new Label('pt-eq', `4 × 5 = 4 × ${c} + 4 × ${5 - c}`, BOARD.x - 250, top - 110, {size: 34, z: 9, reveal: 0}));
    w.get('mara')?.setPose('write', 0.3);
    await d.draw(eq, 1, {key: 'reveal'});
    w.get('mara')?.setPose('idle', 0.4);
    // transferencia: 4 × 13 con lo que se sabe del depósito
    await d.say('Peldaño', 'Mi otra huerta, la del fondo, es de cuatro filas de trece. ¿Cuántas plantas son?');
    const t = await d.choose([
      {id: '52', text: '52'}, {id: '43', text: '43'}, {id: '17', text: '17'}, {id: '412', text: '412'},
    ], {prompt: '¿Cuánto es 4 × 13?', evaluate: true});
    d.evidence('distributive-transfer', {answer: t});
    g.setCinematic(true);
    await d.all(d.fadeTo(left, 0, 0.5), d.fadeTo(right, 0, 0.5));
    w.removeWhere(o => /^(gd-|pt-[abt])/.test(o.id));
    const cell = 20;
    const gx = BOARD.x - 13 * cell / 2 - 20, gy = top + 60;
    const A = w.add(new Shape('pt-13a', art4.grid('pt-13a', 0, 0, 4, 10, cell), gx, gy, {z: 12, progress: 0}));
    const B = w.add(new Shape('pt-13b', art4.grid('pt-13b', 0, 0, 4, 3, cell), gx + 10 * cell + 40, gy, {z: 12, progress: 0}));
    d.describe('Punto dibuja un rectángulo de 4 filas de 13, partido en 4 filas de 10 y 4 filas de 3.');
    p.setMode('still');
    await zip(d, p, gx + 100, gy - 30, 0.4);
    await d.tween(0.7, q => { A.progress = q; });
    await zip(d, p, gx + 10 * cell + 70, gy - 30, 0.3);
    await d.tween(0.4, q => { B.progress = q; });
    follow(p, s);
    const ly = gy + 4 * cell + 36;
    const la = w.add(new Label('pt-13la', '4 × 10 = 40', gx + 5 * cell, ly, {size: 28, align: 'center', z: 9, reveal: 0}));
    const lb = w.add(new Label('pt-13lb', '4 × 3 = 12', gx + 10 * cell + 40 + 1.5 * cell, ly, {size: 28, align: 'center', z: 9, reveal: 0}));
    const lt = w.add(new Label('pt-13lt', '40 + 12 = 52', BOARD.x, ly + 50, {size: 32, align: 'center', z: 9, reveal: 0, ch: YELLOW}));
    await d.draw(la, 0.5, {key: 'reveal'});
    await d.draw(lb, 0.5, {key: 'reveal'});
    await d.draw(lt, 0.6, {key: 'reveal', sound: false});
    g.setCinematic(false);
    await d.think(t === '52' ? 'Cuarenta y doce.'
      : t === '43' ? 'Cuarenta y tres sería 4 × 10 + 3. El 3 también va cuatro veces, una por fila: cuarenta y doce, cincuenta y dos.'
        : t === '17' ? 'Diecisiete es 4 + 13: sumar no es multiplicar. Cuatro filas de trece: cincuenta y dos.'
          : '412 es pegar el 4 y el 12. Pero 4 × 10 son cuarenta, no cuatro: cincuenta y dos.');
    if (!replay) writeJournal4(g);
    // gancho: lo que sobró
    await d.say('Balcón', 'Mara… ¿y los dos atados que sobraron de la cosecha? Somos cuatro familias.');
    await d.say('Mara', 'Partirlos… Un pedazo de atado. Eso no lo anoté nunca.');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.4);
    d.describe('Punto empuja uno de los atados que sobraron. El atado se raja apenas, por el medio.');
    await d.think('Punto mira la rajadura como si fuera una puerta.');
  },
};

function writeJournal4(g) {
  // sólo lo de este capítulo: hay tipos de evidencia con el mismo nombre en otros (count, cut, scale…)
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1) && (!e.seg || e.seg.startsWith('c4.')));
  const all = k => ev.filter(e => e.kind === k);
  const first = k => all(k)[0];
  const seen = [];
  const pt = first('predict-total');
  if (pt) seen.push(pt.answer === '12' ? 'Anticipaste que las Terrazas debían doce atados: cuatro grupos de tres.' : pt.answer === '7' ? 'Creíste, como Punto, que eran siete (4 + 3); bajando las deudas por filas fueron doce.' : 'Pensaste que había que contarlos de a uno; de a tres alcanzó: tres, seis, nueve, doce.');
  const tp = first('turn-predict');
  if (tp) seen.push(tp.answer === 'same' ? 'Anticipaste que girar el rectángulo no cambiaba el total.' : 'Pensaste que girar el rectángulo cambiaba el total; girado, seguían siendo doce.');
  const tt = first('turn-transfer');
  if (tt) seen.push(tt.answer === 'one' ? 'Con la huerta de 9 × 4, viste que alcanzaba contar una sola vez.' : 'Con la huerta de 9 × 4, quisiste contar las dos maneras; girada era la misma.');
  const sc4 = all('scale-choice').map(e => e.op);
  if (sc4.length) seen.push(sc4[0] === 'times2' ? 'Para el plano al doble elegiste × 2: cada casa al doble de lejos del pozo, y Cornisa de −3 a −6.' : `Para el plano al doble probaste ${sc4.filter(o => o !== 'times2').map(o => ({plus2: '+ 2 (todas se corrieron, no se alejaron)', timesm2: '× (−2) (al doble, pero del otro lado)'}[o])).join(' y ')} antes de × 2.`);
  const fc4 = all('flip-choice').map(e => e.op);
  if (fc4.some(o => o === 'times0')) seen.push('Con × 0 todas las casas cayeron en el pozo: desde ahí no se sabía dónde estaba cada una.');
  const pf = first('predict-flip2');
  if (pf) seen.push(pf.answer === 'back' ? 'Anticipaste que dos medias vueltas devuelven a todos a su lugar: (−1) × (−1) = 1.' : 'Dos medias vueltas devolvieron a todos a su lugar, aunque esperabas otra cosa: (−1) × (−1) = 1.');
  if (all('unfair').length) seen.push('Al repartir, cuando quisiste darle un segundo atado a una familia antes que a las demás, protestó.');
  const ps = first('predict-share');
  if (ps) seen.push(ps.answer === '3r2' ? 'Anticipaste el reparto de 14 entre 4: tres cada una y sobran dos.' : 'Repartiendo 14 entre 4 salieron tres cada una, y sobraron dos.');
  const rest = all('rest').map(e => e.choice);
  if (rest.includes('two')) seen.push('Darle los dos que sobraban a dos familias hizo que el reparto dejara de ser igual.');
  const pm = first('predict-measure');
  if (pm) seen.push(pm.answer === '4' ? 'Anticipaste cuatro bolsas de tres con doce atados.' : 'Con doce atados se llenaron cuatro bolsas de tres.');
  const sz = first('share-zero'), mz = first('measure-zero');
  if (sz || mz) seen.push('Repartir entre nadie no empieza nunca, y llenar bolsas de cero no termina nunca: 6 ÷ 0 no tiene respuesta.' + (mz?.answer === 'inf' ? ' Ni siquiera "infinitas" bolsas alcanzan.' : ''));
  const ps2 = first('predict-split');
  if (ps2) seen.push(ps2.answer === 'no' ? 'Anticipaste que cortar la huerta no cambia el total.' : 'Cortando la huerta en dos lugares distintos, el total fue veinte las dos veces.');
  const dt = first('distributive-transfer');
  if (dt) seen.push(dt.answer === '52' ? 'Calculaste 4 × 13 partiendo en 4 × 10 y 4 × 3: 52.' : `Para 4 × 13 elegiste ${dt.answer}; partido en 4 × 10 y 4 × 3, da 52.`);
  const hints = all('hint').filter(e => e.seg?.startsWith('c4')).length;
  if (hints) seen.push(`Pediste ${hints === 1 ? 'una ayuda' : `${hints} ayudas`}.`);
  const entry = {
    id: 'c4',
    title: 'Veces',
    abbr: 'Multiplicar: grupos iguales o estirar desde el cero. Dividir: repartir o medir.',
    body: [
      'Multiplicar es juntar grupos iguales: 4 × 3 son cuatro grupos de tres. Con deudas, 4 × (−3) = −12.',
      'Un rectángulo de 4 filas de 3, girado, es de 3 filas de 4: 4 × 3 = 3 × 4.',
      'Multiplicar también es estirar la recta desde el cero: por 2, todo se aleja el doble; por 1, nada se mueve; por −1, media vuelta. Dos medias vueltas son una entera: (−1) × (−1) = 1.',
      'Multiplicar no siempre agranda: (−3) × 2 = −6 queda más lejos del cero, pero es menor que −3.',
      'Dividir es repartir (14 entre 4: tres cada una, sobran 2; 14 = 4 × 3 + 2) o medir (12 en bolsas de 3: 4 bolsas). Las dos deshacen una multiplicación: 12 ÷ 3 = 4 porque 4 × 3 = 12.',
      'No se divide por cero: ningún número por 0 da 6. Tampoco 0 ÷ 0: cualquier número por 0 da 0, así que no hay uno solo.',
      'Partir un rectángulo no cambia el total: 4 × 5 = 4 × 3 + 4 × 2. Así, 4 × 13 = 4 × 10 + 4 × 3 = 52.',
      'Dato: Brahmagupta (628) dio reglas para operar con "fortunas" y "deudas"; también escribió que 0 ÷ 0 = 0. Hoy se sabe que 0 ÷ 0 no tiene un resultado.',
    ],
    seen,
    moments: [
      {id: 'c4.estirar', label: 'Desplegar: estirar y dar vuelta'},
      {id: 'c4.partir', label: 'Desplegar: partir el rectángulo'},
    ],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora (≡)');
  g.saveNow();
}
