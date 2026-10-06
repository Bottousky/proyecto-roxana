// Capítulo 3 — Menos que nada (3.4 a 3.7).

import {Drawing, Label, Custom} from '../engine/world.js';
import {YELLOW, stroke, chalkText} from '../engine/chalk.js';
import {lerp} from '../engine/rng.js';
import {zip, hop, pulse, follow, spotOf, rectSpot, wordSpot} from '../acting.js';
import {removeDebts} from '../logic/integers.js';
import {GROUND, LINE, lineX, TABLE, PIT, SHOTS, base, chip, tableSlot, villager, signed, art, pitOn} from './common.js';
import {cast, ledgerRow, FAMILIES, familySigns} from './scenes-a.js';

const WORDS = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];

function placeFamilies(g, override = {}) {
  const w = g.world;
  for (const f of FAMILIES) {
    const v = override[f.id] ?? f.value;
    villager(w, f.id, lineX(v), f.head, {facing: 0.3});
  }
  familySigns(g);
}

// ——————————————————————————————————————————————
// 3.4 Lejos y cerca
// ——————————————————————————————————————————————

export const distancia = {
  id: 'c3.distancia',
  title: 'Lejos y cerca',
  setup(g) {
    const w = g.world;
    base(g, {line: true});
    w.removeWhere(o => /^(arc-|cnt-)/.test(o.id));
    const {s} = cast(g, {at: 'table'});
    s.x = LINE.zero + LINE.from * LINE.step - 180;
    placeFamilies(g);
    g.camera.go(SHOTS.line);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    await d.shot(SHOTS.line, 1);
    await d.say('Espiral', 'Recta, ¿cuánto más que nosotros tenés?');
    // contar pasos de Espiral (−4) a Recta (+3): uno por marca
    await d.think('Pasos, de marca en marca.');
    let at = -4;
    const target = 3;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Desde Espiral, un paso por marca hasta llegar a Recta.', 'Tocá la marca siguiente, a la derecha de la última.']);
      const refresh = () => g.ui.setSpots([rectSpot(`step${at + 1}`, `Marca ${signed(at + 1)}: un paso más`, {x: lineX(at + 1) - 24, y: GROUND - 40, w: 48, h: 90}, () => step())]);
      let busy = false;
      const step = async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        const from = lineX(at), to = lineX(at + 1);
        at++;
        const k = at + 4;
        const arc = [];
        for (let i = 0; i <= 10; i++) arc.push([lerp(from, to, i / 10), GROUND - 30 - Math.sin(i / 10 * Math.PI) * 40]);
        const a = w.add(new Drawing(`arc-${at}`, [art.S(arc, 300 + at, {w: 2.4, p: 0.8, ch: YELLOW})], {z: 8, progress: 0}));
        w.add(new Label(`cnt-${at}`, WORDS[k - 1], (from + to) / 2, GROUND - 82, {size: 22, align: 'center', z: 9}));
        try {
          await d.all(d.draw(a, 0.3, {sound: false}), d.tween(0.3, q => { p.x = lerp(from, to, q); p.y = GROUND - 30 - Math.sin(q * Math.PI) * 40; }));
        } catch { return; }
        g.audio.tap(0.15, 1.5 + k * 0.05);
        d.evidence('step', {at});
        busy = false;
        if (at >= target) resolve();
        else refresh();
      };
      p.setMode('still');
      p.x = lineX(at);
      p.y = GROUND - 30;
      refresh();
    }));
    g.setHint(null);
    await d.think('Siete. Las deudas también son pasos.');
    // la distancia al cero no tiene lado
    g.setCinematic(true);
    const cv = w.get('curva');
    w.removeWhere(o => /^(arc-|cnt-)/.test(o.id));
    await d.say('Curva', 'Me pidieron prestado y ahora debo tres.');
    await d.walk(cv, lineX(-3), GROUND, 200);
    w.get('sign-curva').text = signed(-3);
    const rc = w.get('recta');
    g.setCinematic(false);
    const c = await d.choose([
      {id: 'recta', text: 'Recta, que tiene 3.'},
      {id: 'curva', text: 'Curva, que debe 3.'},
      {id: 'same', text: 'Están igual de lejos.'},
    ], {prompt: '¿Quién está más lejos del cero?', evaluate: true});
    d.evidence('abs', {answer: c});
    // Punto mide de los dos lados
    g.setCinematic(true);
    for (const side of [-1, 1]) {
      await zip(d, p, lineX(0), GROUND - 30, 0.3);
      for (let k = 1; k <= 3; k++) {
        const from = lineX((k - 1) * side), to = lineX(k * side);
        await d.tween(0.25, q => { p.x = lerp(from, to, q); p.y = GROUND - 30 - Math.sin(q * Math.PI) * 34; });
        g.audio.tap(0.15, 1.5 + k * 0.1);
      }
    }
    void rc;
    g.setCinematic(false);
    await d.think(c === 'same' ? 'Tres pasos cada uno.' : 'Tres pasos cada uno: igual de lejos.');
    await d.say('Mara', 'Lo lejos que está del cero no tiene lado. Se anota con dos barritas: |−3| = 3.');
    g.flags.c3dist = true;
  },
};

// ——————————————————————————————————————————————
// 3.5 Perdonar una deuda
// ——————————————————————————————————————————————

export const perdon = {
  id: 'c3.perdon',
  title: 'Perdonar una deuda',
  setup(g) {
    const w = g.world;
    base(g, {line: true});
    w.removeWhere(o => /^(arc-|cnt-|cv-|rc-|pz-)/.test(o.id));
    cast(g, {at: 'table'});
    placeFamilies(g, {curva: -1});
    w.get('sign-curva').text = signed(-1);
    g.camera.go(SHOTS.table);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const m = w.get('mara');
    const cv = w.get('curva');
    await d.shot(SHOTS.table, 1);
    await d.say('Curva', 'Ya pagué dos. Debo uno.');
    await d.say('Mara', 'Curva, te perdono dos atados de deuda.');
    await d.say('Curva', 'Pero… si debo uno solo.');
    // en la mesa: una deuda
    const d0 = chip(w, 'debt', ...tableSlot('debt', 0), 'pz-d0');
    let state = {haves: 0, debts: 1};
    let removed = 0;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Perdonar una deuda es quitarla.', 'Si no hay otra deuda para quitar, se puede agregar algo que valga cero.']);
      const refresh = () => {
        const spots = w.objects.filter(o => o.id.startsWith('pz-') && o.kind === 'debt' && !o.gone).map(o => spotOf(o, 'Una deuda: perdonarla', () => forgive(o)));
        if (!spots.length && removed < 2) spots.push(wordSpot('pz-stuck', '¿y la otra?', TABLE.x, TABLE.top - 30, () => stuck()));
        g.ui.setSpots(spots);
      };
      const forgive = async o => {
        if (busy || !ctl.alive()) return;
        busy = true;
        o.gone = true;
        g.audio.erase(0.4, 0.4);
        try { await d.fadeTo(o, 0, 0.4); } catch { return; }
        w.remove(o.id);
        removed++;
        state = {...state, debts: state.debts - 1};
        d.evidence('forgive', {removed});
        busy = false;
        if (removed >= 2) resolve();
        else refresh();
      };
      const stuck = async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        const opts = [
          {id: 'cant', text: 'No se puede: no hay más deudas.'},
          {id: 'take', text: 'Quitarle un atado, en lugar de la deuda.'},
          {id: 'pair', text: 'Agregar un atado y una deuda: juntos valen cero.'},
        ];
        for (;;) {
          const c = await d.choose(opts, {prompt: 'Mara quiere perdonar dos deudas y queda una por perdonar.', evaluate: true});
          d.evidence('forgive-how', {choice: c});
          if (c === 'pair') break;
          if (c === 'cant') {
            await d.say('Mara', 'Dije dos. Algo tiene que poder hacerse.');
            // Punto muestra un par que vale cero
            g.setCinematic(true);
            const a = chip(w, 'have', TABLE.x - 60, TABLE.top - 60, 'pz-demo-h');
            const b = chip(w, 'debt', TABLE.x + 60, TABLE.top - 60, 'pz-demo-d');
            await zip(d, p, TABLE.x, TABLE.top - 110, 0.3);
            await d.all(d.tween(0.4, k => { a.x = lerp(TABLE.x - 60, TABLE.x, k); b.x = lerp(TABLE.x + 60, TABLE.x, k); }));
            g.audio.erase(0.3, 0.3);
            await d.all(d.fadeTo(a, 0, 0.3), d.fadeTo(b, 0, 0.3));
            w.remove(a.id);
            w.remove(b.id);
            g.setCinematic(false);
            await d.think('Un atado y una deuda juntos… no cambian nada.');
          } else {
            await d.say('Curva', '¡Eso es cobrarme, no perdonarme!');
          }
          opts.splice(opts.findIndex(o => o.id === c), 1);
        }
        g.setCinematic(true);
        const h = chip(w, 'have', ...tableSlot('have', 0), 'pz-h0');
        const dd = chip(w, 'debt', ...tableSlot('debt', 0), 'pz-d1');
        h.progress = dd.progress = 0;
        await d.all(d.tween(0.5, k => { h.progress = k; }), d.tween(0.5, k => { dd.progress = k; }));
        state = {haves: state.haves + 1, debts: state.debts + 1};
        g.setCinematic(false);
        await d.think('Vale lo mismo que antes. Pero ahora hay una deuda para perdonar.');
        busy = false;
        refresh();
      };
      refresh();
    }));
    g.setHint(null);
    void d0;
    const r = removeDebts({haves: 0, debts: 1}, 2);
    d.evidence('forgive-result', {value: r.value});
    await d.think('Le quedó un atado.');
    // en la línea: dos pasos a la derecha
    await d.shot(SHOTS.line, 1.2);
    g.setCinematic(true);
    cv.face(1);
    await d.walk(cv, lineX(1), GROUND, 140);
    w.get('sign-curva').text = signed(1);
    g.setCinematic(false);
    m.setPose('write', 0.3);
    const eq = w.add(new Label('pz-eq', '−1 − (−2) = +1', lineX(-3), GROUND - 230, {size: 46, z: 9, reveal: 0}));
    await d.draw(eq, 1, {key: 'reveal'});
    m.setPose('idle', 0.4);
    await d.think('Quitar deudas: hacia la derecha.');
    g.flags.c3forgive = true;
  },
};

// ——————————————————————————————————————————————
// 3.6 El pozo
// ——————————————————————————————————————————————

export const pozo = {
  id: 'c3.pozo',
  title: 'El pozo',
  setup(g) {
    const w = g.world;
    base(g, {line: true});
    pitOn(w);
    const {s, p} = cast(g, {at: 'table'});
    s.x = PIT.x - 200;
    p.setMode('still');
    p.x = PIT.x - 100;
    p.y = GROUND - 60;
    g.camera.go(SHOTS.pit);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.pit, 1);
    // Punto juega cerca del borde y cae
    g.setCinematic(true);
    await zip(d, p, PIT.x - 20, GROUND - 40, 0.5);
    await zip(d, p, PIT.x + 30, GROUND - 60, 0.3);
    g.audio.punto('surprise');
    await d.tween(0.6, k => { p.x = PIT.x + 30; p.y = GROUND - 60 + k * k * (3 * PIT.step + 60); });
    g.audio.tap(0.4, 0.9);
    p.tremble = 1;
    await d.shot({x: PIT.x - 220, y: GROUND - 60, w: 480, h: 420}, 0.8);
    g.setCinematic(false);
    await d.say('student', '¡Punto!');
    s.setPose('lean', 0.3);
    const c = await d.choose([
      {id: '+2', text: '+2'}, {id: '-8', text: '−8'}, {id: '+8', text: '+8'}, {id: '-2', text: '−2'},
    ], {prompt: 'Punto está en −3. Si sube cinco marcas, ¿dónde queda?', evaluate: true});
    d.evidence('predict-pit', {answer: c});
    // sube, marca por marca
    await d.shot(SHOTS.pit, 0.8);
    let at = -3;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Una marca por vez, hacia arriba.']);
      let busy = false;
      const refresh = () => g.ui.setSpots([rectSpot('pit-up', 'Subir una marca', {x: PIT.x - 30, y: GROUND - (at + 1) * PIT.step - 24, w: 60, h: 48}, () => up())]);
      const up = async () => {
        if (busy || !ctl.alive()) return;
        busy = true;
        const y0 = GROUND - at * PIT.step, y1 = GROUND - (at + 1) * PIT.step;
        try { await d.tween(0.3, q => { p.y = lerp(y0, y1, q); p.x = PIT.x + 30 + Math.sin(q * Math.PI) * 10; }); } catch { return; }
        at++;
        g.audio.punto('hop');
        busy = false;
        if (at >= 2) resolve();
        else refresh();
      };
      p.x = PIT.x + 30;
      p.y = GROUND - at * PIT.step;
      refresh();
    }));
    g.setHint(null);
    p.tremble = 0;
    s.setPose('idle', 0.4);
    await d.think(c === '+2' ? 'Más dos. Arriba del suelo.' : 'Más dos: tres para llegar al suelo y dos más.');
    g.flags.c3pit = true;
  },
};

// ——————————————————————————————————————————————
// 3.7 Hacia
// ——————————————————————————————————————————————

export const hacia = {
  id: 'c3.hacia',
  title: 'Hacia',
  moment: 'Cuánto y hacia dónde',
  setup(g) {
    const w = g.world;
    base(g, {line: true});
    w.removeWhere(o => /^(pz-|hacia-)/.test(o.id));
    cast(g, {at: 'table'});
    placeFamilies(g, {curva: 1});
    w.get('sign-curva').text = signed(1);
    g.camera.go(SHOTS.line);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.line, 1);
    // Punto recorre la línea: ahora deja una flecha al moverse
    g.setCinematic(true);
    p.arrow = true;
    d.describe('Punto corre por la línea hacia la derecha y vuelve hacia la izquierda. Ahora, al moverse, lleva una flecha adelante.');
    await zip(d, p, lineX(0), GROUND - 50, 0.5);
    await zip(d, p, lineX(6), GROUND - 50, 0.7);
    const plus = w.add(new Label('hacia-plus', '+', lineX(6) + 70, GROUND - 40, {size: 64, z: 9, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(plus, 0.4, {key: 'reveal'});
    await zip(d, p, lineX(-6), GROUND - 50, 1.1);
    const minus = w.add(new Label('hacia-minus', '−', lineX(-6) - 110, GROUND - 40, {size: 64, z: 9, ch: YELLOW, reveal: 0, weight: 700}));
    await d.draw(minus, 0.4, {key: 'reveal'});
    g.audio.punto('happy');
    follow(p, s);
    g.setCinematic(false);
    await d.say('Mara', 'Ahora cada número dice cuánto… y para qué lado.');
    if (!replay) writeJournal3(g);
    await d.say('Mara', 'Arriba, en el barrio de las Terrazas, cuatro familias deben lo mismo: tres atados cada una.');
    await d.say('Mara', '¿Cuánto se debe, en total?');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.4);
  },
};

function writeJournal3(g) {
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const all = k => ev.filter(e => e.kind === k);
  const seen = [];
  const wd = all('write-debt');
  if (wd.length) seen.push(wd.length > 1 ? 'Para anotar la deuda de Curva probaste otras escrituras antes de la rayita: con "0" desaparecía la deuda y con "3" parecía que tenía.' : 'Para anotar la deuda de Curva elegiste una marca nueva delante del número.');
  if (all('cancel').length) seen.push(`Emparejaste atados con deudas y se borraron de a pares${all('cancel-same').length ? '; dos iguales no se anulaban' : ''}.`);
  const po = all('predict-order')[0];
  if (po) seen.push(po.answer === 'espiral' ? 'Anticipaste que Espiral (−4) tenía menos que Curva (−1).' : 'Pensaste que Curva (−1) tenía menos o igual que Espiral (−4); la línea mostró lo contrario.');
  if (all('step').length) seen.push('Contaste siete pasos de −4 a +3.');
  const a = all('abs')[0];
  if (a) seen.push(a.answer === 'same' ? '+3 y −3 están igual de lejos del cero.' : 'Creíste que uno de +3 y −3 estaba más lejos del cero; midiendo, era igual.');
  const fh = all('forgive-how');
  if (fh.length) seen.push('Para perdonar una deuda que no estaba, agregaste un atado y una deuda (valen cero) y quitaste la deuda: −1 − (−2) = +1.');
  const pp = all('predict-pit')[0];
  if (pp) seen.push(`Desde −3, subir cinco: anticipaste ${pp.answer.replace('-', '−')}; Punto quedó en +2.`);
  const entry = {
    id: 'c3',
    title: 'Menos que nada',
    abbr: 'El signo dice hacia qué lado; un tener y un deber se anulan de a pares.',
    body: [
      'Un número con signo dice cuánto y para qué lado: +3, tres que se tienen; −3, tres que se deben (o tres debajo del cero).',
      'Juntar lo que se tiene con lo que se debe es emparejar: cada par vale cero y se borra; lo que sobra es el resultado.',
      'En la línea, más a la derecha es más: −4 es menos que −1, aunque 4 sea más que 1.',
      'La distancia no tiene signo: de −4 a +3 hay 7. Lo lejos que está un número del cero se escribe |−3| = 3.',
      'Quitar una deuda sube el valor: −1 − (−2) = +1. Si no hay deudas para quitar, se agregan pares que valen cero.',
      'El mismo signo "−" se usa para "menos tres" y para "restar": los paréntesis ayudan a no confundirlos.',
      'Dato: los signos + y − aparecen impresos en 1489 (Widmann) para marcar exceso y faltante en cuentas de comercio.',
    ],
    seen,
    moments: [{id: 'c3.hacia', label: 'Desplegar: cuánto y hacia dónde'}],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora');
  g.saveNow();
}
