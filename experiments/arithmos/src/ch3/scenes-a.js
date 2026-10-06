// Capítulo 3 — Menos que nada (3.1 a 3.3).

import {Drawing, Label} from '../engine/world.js';
import {YELLOW, stroke} from '../engine/chalk.js';
import {zip, hop, pulse, follow, spotOf, rectSpot, wordSpot} from '../acting.js';
import {combine} from '../logic/integers.js';
import {
  GROUND, LEDGER, LINE, lineX, waitX, TABLE, SHOTS, base, numberLineOn, chip, tableSlot, mara, villager, student, punto, signed,
} from './common.js';

/** Línea del registro de Mara: nombre a la izquierda, número a la derecha. */
export function ledgerRow(w, key, name, value, row, {reveal = 1} = {}) {
  const y = GROUND - 110 - 210 + 52 + row * 46;
  const n = w.ensure(`l3n-${key}`, () => new Label(`l3n-${key}`, name, LEDGER.x - 130, y, {size: 30, z: 9}));
  const v = w.ensure(`l3v-${key}`, () => new Label(`l3v-${key}`, value, LEDGER.x + 80, y, {size: 36, z: 9, reveal}));
  v.text = value;
  void n;
  return v;
}

export function cast(g, {at = 'ledger'} = {}) {
  const w = g.world;
  const s = student(w, at === 'ledger' ? LEDGER.x - 190 : TABLE.x - TABLE.w / 2 - 110);
  const p = punto(w, s.x + 44, GROUND - 150);
  follow(p, s);
  const right = at === 'ledger' ? LEDGER.x + 230 : TABLE.x + TABLE.w / 2 + 70;
  mara(w, right, {facing: -0.8});
  villager(w, 'curva', right + 110, 'curl', {facing: -0.6, scale: 0.92});
  villager(w, 'recta', right + 210, 'square', {facing: -0.6});
  return {s, p};
}

// ——————————————————————————————————————————————
// 3.1 Lo que se debe
// ——————————————————————————————————————————————

export const deuda = {
  id: 'c3.deuda',
  title: 'Lo que se debe',
  setup(g) {
    const w = g.world;
    w.clear();
    base(g);
    cast(g);
    ledgerRow(w, 'recta', 'Recta', '52', 0);
    ledgerRow(w, 'oval', 'Oval', '302', 1);
    ledgerRow(w, 'curva', 'Curva', '', 2);
    g.camera.go(SHOTS.ledger);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const m = w.get('mara');
    const cv = w.get('curva');
    await d.shot(SHOTS.ledger, 1);
    await d.say('Curva', 'Mara… te debo tres atados de ayer. Y no tengo ninguno.');
    m.setPose('think', 0.4);
    await d.say('Mara', 'Lo que no hay no se escribe… pero esto no es "no hay". ¿Cómo lo anoto?');
    m.setPose('idle', 0.4);
    const v = w.get('l3v-curva');
    const opts = [
      {id: 'zero', text: 'Un 0: no tiene nada.'},
      {id: 'three', text: 'Un 3.'},
      {id: 'words', text: 'Con palabras: «debe 3».'},
      {id: 'mark', text: 'Un 3 con una marca nueva delante.'},
    ];
    for (;;) {
      const c = await d.choose(opts, {prompt: '¿Cómo se anota lo que debe Curva?', evaluate: true});
      d.evidence('write-debt', {choice: c});
      if (c === 'mark') break;
      if (c === 'zero') {
        v.text = '0'; v.reveal = 0;
        await d.draw(v, 0.4, {key: 'reveal'});
        g.setCinematic(true);
        await hop(d, cv, cv.x, GROUND, {g, h: 30});
        await hop(d, cv, cv.x, GROUND, {g, h: 30});
        g.setCinematic(false);
        await d.say('Curva', '¡Entonces no debo nada!');
        m.setPose('worry', 0.3);
        await d.think('Con un 0, la deuda desaparece.');
        m.setPose('idle', 0.4);
      } else if (c === 'three') {
        v.text = '3'; v.reveal = 0;
        await d.draw(v, 0.4, {key: 'reveal'});
        g.setCinematic(true);
        m.face(-1);
        const go = m.walkTo(m.x - 160, GROUND, 120);
        await d.wait(go);
        m.arriveNow();
        g.setCinematic(false);
        await d.say('Mara', 'Tres… ¿le tengo que dar tres atados?');
        await d.say('student', '¡No! Es al revés.');
        g.setCinematic(true);
        m.face(1);
        await d.wait(m.walkTo(LEDGER.x + 230, GROUND, 140));
        m.arriveNow();
        m.face(-0.8);
        g.setCinematic(false);
      } else if (c === 'words') {
        v.text = 'debe 3'; v.reveal = 0;
        await d.draw(v, 0.6, {key: 'reveal'});
        await d.say('Mara', 'Eso se entiende. ¿Y si mañana le pagan dos? ¿Hago la cuenta con palabras?');
      }
      v.text = '';
      opts.splice(opts.findIndex(o => o.id === c), 1);
      if (c === 'words') break;
    }
    // Punto pone la marca: su primer signo
    g.setCinematic(true);
    v.text = '3'; v.reveal = 1;
    p.setMode('still');
    const bx = v.x - 22, by = v.y - 13;
    await zip(d, p, bx - 10, by - 30, 0.4);
    d.describe('Punto dibuja una rayita amarilla, acostada, delante del 3.');
    const dash = w.add(new Drawing('l3-dash', [stroke([[bx - 12, by], [bx + 8, by]], {w: 4, p: 0.95, ch: YELLOW, seed: 33, lift: false})], {z: 10, progress: 0}));
    await d.tween(0.4, k => { p.x = bx - 12 + k * 20; p.y = by; dash.progress = k; });
    g.audio.punto('happy');
    await zip(d, p, bx, by - 50, 0.3);
    await pulse(d, p, 2, 0.4);
    follow(p, s);
    g.setCinematic(false);
    await d.say('Mara', 'Una rayita acostada. Menos tres: tres que faltan.');
    await d.think('Tres, pero para el otro lado.');
    g.flags.c3debt = true;
  },
};

// ——————————————————————————————————————————————
// 3.2 Pares que se anulan
// ——————————————————————————————————————————————

function setTable(g, prefix, haves, debts) {
  const w = g.world;
  w.removeWhere(o => o.id.startsWith(`${prefix}-`));
  const list = [];
  for (let k = 0; k < haves; k++) list.push(chip(w, 'have', ...tableSlot('have', k), `${prefix}-h${k}`));
  for (let k = 0; k < debts; k++) list.push(chip(w, 'debt', ...tableSlot('debt', k), `${prefix}-d${k}`));
  return list;
}

/** Emparejar lo que se tiene con lo que se debe: cada par se borra. */
async function cancelPairs(d, g, prefix) {
  const w = g.world;
  const live = () => w.objects.filter(o => o.id?.startsWith(`${prefix}-`) && !o.gone);
  let wrong = 0;
  await d.interact(ctl => new Promise(resolve => {
    let sel = null;
    let busy = false;
    g.setHint(() => [
      'Un atado que se tiene paga uno que se debe.',
      'Tocá un atado de arriba y uno punteado de abajo: se borran juntos.',
    ]);
    const done = () => {
      const l = live();
      return !(l.some(o => o.kind === 'have') && l.some(o => o.kind === 'debt'));
    };
    const refresh = () => {
      g.ui.setSpots(live().map(o => spotOf(o, o.kind === 'have' ? 'Un atado que se tiene' : 'Un atado que se debe (punteado)', () => pick(o), {selected: sel === o})));
    };
    const pick = async o => {
      if (busy || !ctl.alive()) return;
      g.audio.tap(0.15, 1.7);
      if (!sel || sel === o) { sel = sel === o ? null : o; return refresh(); }
      if (sel.kind === o.kind) {
        wrong++;
        d.evidence('cancel-same', {kind: o.kind});
        g.note(o.kind === 'have' ? 'Dos atados no se anulan: se suman.' : 'Dos deudas no se anulan: se suman.');
        sel = null;
        return refresh();
      }
      const a = sel, b = o;
      sel = null;
      busy = true;
      a.gone = b.gone = true;
      try {
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        await d.all(d.tween(0.35, k => { a.x += (mx - a.x) * k; a.y += (my - a.y) * k; }), d.tween(0.35, k => { b.x += (mx - b.x) * k; b.y += (my - b.y) * k; }));
        g.audio.erase(0.4, 0.4);
        await d.all(d.fadeTo(a, 0, 0.35), d.fadeTo(b, 0, 0.35));
        d.evidence('cancel', {});
      } catch { return; }
      w.remove(a.id);
      w.remove(b.id);
      busy = false;
      if (done()) resolve();
      else refresh();
    };
    if (done()) resolve();
    else refresh();
  }));
  g.setHint(null);
  const l = live();
  return {haves: l.filter(o => o.kind === 'have').length, debts: l.filter(o => o.kind === 'debt').length, wrong};
}

export const pares = {
  id: 'c3.pares',
  title: 'Pares que se anulan',
  setup(g) {
    const w = g.world;
    base(g);
    cast(g, {at: 'table'});
    ledgerRow(w, 'recta', 'Recta', '52', 0);
    ledgerRow(w, 'oval', 'Oval', '302', 1);
    ledgerRow(w, 'curva', 'Curva', '−3', 2);
    w.ensure('l3-dash', () => new Drawing('l3-dash', [], {z: 10}));
    g.camera.go(SHOTS.table);
  },
  async play(d, g) {
    const w = g.world;
    const rc = w.get('recta');
    await d.shot({...SHOTS.table, x: SHOTS.table.x - 200, w: SHOTS.table.w + 500}, 1);
    await d.say('Recta', 'Curva, tomá: dos atados por la cerca que me arreglaste.');
    g.setCinematic(true);
    setTable(g, 'cv', 0, 3);
    const hs = [0, 1].map(k => chip(w, 'have', rc.x, GROUND - 60, `cv-h${k}`));
    for (const [k, h] of hs.entries()) await hop(d, h, ...tableSlot('have', k), {g, h: 80, dur: 0.6});
    g.setCinematic(false);
    await d.shot(SHOTS.table, 1);
    await d.say('Mara', 'Ahora tiene dos y debe tres. Lo que tiene paga lo que debe: uno contra uno.');
    const r = await cancelPairs(d, g, 'cv');
    d.evidence('cancel-result', {haves: r.haves, debts: r.debts, wrong: r.wrong});
    const opts = [
      {id: '-1', text: '−1'},
      {id: '+1', text: '+1'},
      {id: '5', text: '5'},
      {id: '0', text: '0'},
    ];
    for (;;) {
      const c = await d.choose(opts, {prompt: '¿Cuánto tiene Curva ahora?', evaluate: true});
      d.evidence('read-balance', {answer: c, expect: '-1'});
      if (c === '-1') break;
      const left = w.objects.find(o => o.id.startsWith('cv-') && !o.gone);
      if (left) await pulse(d, left, 2, 0.4);
      await d.think(c === '+1' ? 'Lo que quedó es punteado: se debe.' : c === '5' ? 'Si fueran cinco, no se habría borrado nada.' : 'Quedó uno, punteado.');
      opts.splice(opts.findIndex(o => o.id === c), 1);
    }
    const v = w.get('l3v-curva');
    v.text = '−1'; v.reveal = 0;
    await d.shot({...SHOTS.table, x: SHOTS.table.x - 900, w: SHOTS.table.w + 900}, 1);
    await d.draw(v, 0.5, {key: 'reveal'});
    w.remove('l3-dash');
    // Recta: tiene cuatro y debe uno. Primero anticipar, después comprobar
    await d.shot(SHOTS.table, 1);
    await d.say('Mara', 'Y Recta tiene cuatro y me debe uno.');
    setTable(g, 'cv', 0, 0);
    setTable(g, 'rc', 4, 1);
    const pred = await d.choose([
      {id: '+3', text: '+3'}, {id: '+5', text: '+5'}, {id: '-3', text: '−3'},
    ], {prompt: '¿Cuánto le queda a Recta?', evaluate: true});
    d.evidence('predict-balance', {answer: pred, expect: '+3'});
    await cancelPairs(d, g, 'rc');
    await d.think(pred === '+3' ? 'Tres. Lo anticipé.' : 'Tres: un par se borró y quedaron tres de arriba.');
    g.flags.c3pairs = true;
  },
};

// ——————————————————————————————————————————————
// 3.3 La línea
// ——————————————————————————————————————————————

export const FAMILIES = [
  {id: 'recta', head: 'square', value: 3, name: 'Recta'},
  {id: 'oval-a', head: 'oval', value: 1, name: 'Oval'},
  {id: 'curva', head: 'curl', value: -1, name: 'Curva'},
  {id: 'espiral', head: 'tri', value: -4, name: 'Espiral'},
];

export function familySigns(g) {
  const w = g.world;
  for (const f of FAMILIES) {
    const fig = w.get(f.id);
    w.ensure(`sign-${f.id}`, () => new Label(`sign-${f.id}`, signed(f.value), 0, 0, {size: 30, align: 'center', z: 32, ch: YELLOW}));
    const lab = w.get(`sign-${f.id}`);
    lab.update = () => { const h = fig.headPos(); lab.x = h[0]; lab.y = h[1] - 34; };
  }
}

export const linea = {
  id: 'c3.linea',
  title: 'La línea',
  setup(g) {
    const w = g.world;
    base(g, {line: !!g.scratch('c3.linea').drawn});
    w.removeWhere(o => /^(cv-|rc-)/.test(o.id));
    const {s} = cast(g, {at: 'table'});
    s.x = LINE.zero + LINE.from * LINE.step - 120;
    FAMILIES.forEach((f, i) => {
      const placed = g.scratch('c3.linea').placed?.[f.id];
      villager(w, f.id, placed != null ? lineX(placed) : waitX(i), f.head, {facing: -0.6});
    });
    familySigns(g);
    g.camera.go(SHOTS.line);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const sc = g.scratch();
    sc.placed ??= {};
    await d.shot(SHOTS.line, 1);
    if (!sc.drawn) {
      await d.say('Mara', 'Para ver quién tiene más y quién menos, una línea en el suelo. El cero, acá.');
      g.setCinematic(true);
      s.setPose('writeLow', 0.3);
      const nl = numberLineOn(w, 0);
      const x0 = LINE.zero + LINE.from * LINE.step - 50, x1 = LINE.zero + LINE.to * LINE.step + 50;
      s.x = x0;
      const labels = w.objects.filter(o => o.id.startsWith('nl-'));
      for (const l of labels) l.reveal = 0;
      await d.all(d.shot(SHOTS.line, 3.4), d.draw(nl, 3.4), d.tween(3.4, k => {
        s.x = x0 + (x1 - x0) * k;
        for (const l of labels) if (l.x <= s.x) l.reveal = 1;
      }));
      s.setPose('idle', 0.4);
      g.setCinematic(false);
      sc.drawn = true;
      g.saveNow();
    }
    if (!sc.prediction) {
      sc.prediction = await d.choose([
        {id: 'espiral', text: 'Espiral, que debe 4.'},
        {id: 'curva', text: 'Curva, que debe 1.'},
        {id: 'same', text: 'Igual: los dos deben.'},
      ], {prompt: '¿Quién tiene menos: Espiral (−4) o Curva (−1)?', evaluate: true});
      d.evidence('predict-order', {answer: sc.prediction});
      g.saveNow();
    }
    // ubicar a cada familia en su número
    await d.interact(ctl => new Promise(resolve => {
      let sel = null;
      let busy = false;
      g.setHint(() => ['Cada familia va a la marca de su número.', 'Tocá una familia y después la marca de la línea donde va.']);
      const fams = () => FAMILIES.filter(f => sc.placed[f.id] == null);
      const refresh = () => {
        const spots = fams().map(f => spotOf(w.get(f.id), `Familia ${f.name}, ${signed(f.value)}`, () => pick(f.id), {selected: sel === f.id}));
        for (let n = LINE.from; n <= LINE.to; n++) spots.push(rectSpot(`tick${n}`, `Marca ${n === 0 ? 'cero' : signed(n)} de la línea`, {x: lineX(n) - 24, y: GROUND - 30, w: 48, h: 90}, () => pick(`tick${n}`), {selected: sel === `tick${n}`}));
        g.ui.setSpots(spots);
      };
      const pick = async id => {
        if (busy || !ctl.alive()) return;
        g.audio.tap(0.15, 1.7);
        const isTick = id.startsWith('tick');
        if (!sel || sel === id || sel.startsWith('tick') === isTick) { sel = sel === id ? null : id; return refresh(); }
        const fid = isTick ? sel : id;
        const n = Number((isTick ? id : sel).slice(4));
        sel = null;
        const f = FAMILIES.find(x => x.id === fid);
        const fig = w.get(fid);
        busy = true;
        try {
          fig.face(lineX(n) > fig.x ? 1 : -1);
          await d.walk(fig, lineX(n), GROUND, 260);
          if (n !== f.value) {
            d.evidence('place-wrong', {family: fid, at: n});
            await d.say(f.name, `Acá dice ${n === 0 ? 'cero' : signed(n)}. Yo tengo ${signed(f.value)}.`);
            await d.walk(fig, waitX(FAMILIES.indexOf(f)), GROUND, 300);
          } else {
            sc.placed[fid] = n;
            g.saveNow();
            fig.face(0.3);
            d.evidence('place', {family: fid, at: n});
          }
        } catch { return; }
        busy = false;
        if (!fams().length) resolve();
        else refresh();
      };
      refresh();
    }));
    g.setHint(null);
    await d.shot(SHOTS.line, 1);
    const pred = sc.prediction;
    await d.think(pred === 'espiral' ? 'Más a la izquierda, menos.' : pred === 'curva' ? 'Espiral debe más: está más a la izquierda. Tiene menos.' : 'No: Espiral debe cuatro y Curva uno. Espiral está más a la izquierda.');
    await d.say('Mara', 'Así se ve enseguida: el que está más a la derecha, tiene más.');
    g.flags.c3line = true;
  },
};

export {combine};
