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
  for (const f of FAMILIES) w.get(`sign-${f.id}`).text = signed(override[f.id] ?? f.value);
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
    const guess = await d.choose([
      {id: '7', text: '7'}, {id: '8', text: '8'}, {id: '1', text: '1'},
    ], {prompt: '¿Cuántos pasos hay de Espiral (−4) a Recta (+3)?', evaluate: true});
    d.evidence('predict-steps', {answer: guess});
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
    await d.think(guess === '7' ? 'Siete, como dije. Las deudas también son pasos.'
      : guess === '8' ? 'Ocho marcas, pero siete pasos: en la primera marca ya estaba parado.'
        : 'Siete, no uno: tres menos cuatro no sirve acá. Los pasos de las deudas también cuentan.');
    // la distancia al cero no tiene lado
    g.setCinematic(true);
    const rc = w.get('recta');
    w.removeWhere(o => /^(arc-|cnt-)/.test(o.id));
    await d.say('Mara', 'Recta, por la cerca que arreglaste ayer: un atado más.');
    rc.face(1);
    await d.walk(rc, lineX(4), GROUND, 160);
    rc.face(0.3);
    w.get('sign-recta').text = signed(4);
    g.setCinematic(false);
    const c = await d.choose([
      {id: 'recta', text: 'Recta, que tiene 4.'},
      {id: 'curva', text: 'Espiral, que debe 4.'},
      {id: 'same', text: 'Están igual de lejos.'},
    ], {prompt: '¿Quién está más lejos del cero: Recta (+4) o Espiral (−4)?', evaluate: true});
    d.evidence('abs', {answer: c});
    // Punto mide de los dos lados
    g.setCinematic(true);
    for (const side of [-1, 1]) {
      await zip(d, p, lineX(0), GROUND - 30, 0.3);
      for (let k = 1; k <= 4; k++) {
        const from = lineX((k - 1) * side), to = lineX(k * side);
        await d.tween(0.25, q => { p.x = lerp(from, to, q); p.y = GROUND - 30 - Math.sin(q * Math.PI) * 34; });
        g.audio.tap(0.15, 1.5 + k * 0.1);
      }
    }
    g.setCinematic(false);
    await d.think(c === 'same' ? 'Cuatro pasos cada uno.' : 'Cuatro pasos cada uno: igual de lejos.');
    await d.say('Mara', 'Lo lejos que está del cero no tiene lado. Se anota con dos barritas: |−4| = 4, y también |+4| = 4.');
    g.flags.c3dist = true;
  },
};

// ——————————————————————————————————————————————
// 3.5 Deudas de más
// ——————————————————————————————————————————————

export const perdon = {
  id: 'c3.perdon',
  title: 'Deudas de más',
  setup(g) {
    const w = g.world;
    base(g, {line: true});
    w.removeWhere(o => /^(arc-|cnt-|cv-|rc-|pz-)/.test(o.id));
    cast(g, {at: 'table'});
    placeFamilies(g, {recta: 4});
    g.camera.go(SHOTS.table);
  },
  async play(d, g) {
    const w = g.world;
    const p = w.get('punto');
    const m = w.get('mara');
    const cv = w.get('curva');
    await d.shot(SHOTS.table, 1);
    await d.say('Mara', 'Curva, revisé el registro de ayer: dos deudas tuyas las anoté dos veces. Hay que sacarlas.');
    await d.say('Curva', 'Pero… si en la cuenta debo uno solo.');
    // en la mesa: una deuda
    const d0 = chip(w, 'debt', ...tableSlot('debt', 0), 'pz-d0');
    let state = {haves: 0, debts: 1};
    let removed = 0;
    await d.interact(ctl => new Promise(resolve => {
      let busy = false;
      g.setHint(() => ['Hay que sacar dos deudas de la mesa.', 'Si no hay otra deuda para sacar, se puede agregar algo que valga cero.']);
      const refresh = () => {
        const spots = w.objects.filter(o => o.id.startsWith('pz-') && o.kind === 'debt' && !o.gone).map(o => spotOf(o, 'Una deuda: sacarla', () => forgive(o)));
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
          {id: 'cant', text: 'No se puede: no quedan deudas.'},
          {id: 'take', text: 'Quitarle un atado, en lugar de la deuda.'},
          {id: 'pair', text: 'Agregar un atado y una deuda: juntos valen cero.'},
        ];
        for (;;) {
          const c = await d.choose(opts, {prompt: 'Hay que sacar dos deudas y en la mesa no queda ninguna.', evaluate: true});
          d.evidence('forgive-how', {choice: c});
          if (c === 'pair') break;
          if (c === 'cant') {
            await d.say('Mara', 'Las dos están anotadas de más. Algo tiene que poder hacerse.');
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
            await d.say('Curva', '¡Eso es cobrarme! Lo que estaba de más eran deudas, no atados.');
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
        await d.think('Vale lo mismo que antes. Pero ahora hay una deuda para sacar.');
        busy = false;
        refresh();
      };
      refresh();
    }));
    g.setHint(null);
    void d0;
    const r = removeDebts({haves: 0, debts: 1}, 2);
    d.evidence('forgive-result', {value: r.value});
    await d.think('Le quedó un atado. En realidad, Curva no debía: tenía uno.');
    // en la línea: dos pasos a la derecha
    await d.shot(SHOTS.line, 1.2);
    g.setCinematic(true);
    cv.face(1);
    await d.walk(cv, lineX(1), GROUND, 140);
    w.get('sign-curva').text = signed(1);
    g.setCinematic(false);
    // ¿qué otra cosa la habría llevado al mismo lugar?
    const same = await d.choose([
      {id: 'give', text: 'Darle dos atados.'},
      {id: 'take', text: 'Sacarle dos atados.'},
      {id: 'debts', text: 'Anotarle dos deudas más.'},
    ], {prompt: 'Curva pasó de −1 a +1. ¿Qué otra cosa la habría dejado en el mismo lugar?', evaluate: true});
    d.evidence('forgive-same', {answer: same});
    g.setCinematic(true);
    p.setMode('still');
    p.arrow = true;
    const to = same === 'give' ? 1 : -3;
    await zip(d, p, lineX(-1), GROUND - 50, 0.4);
    await zip(d, p, lineX(to), GROUND - 50, 0.6);
    g.audio.punto(same === 'give' ? 'yes' : 'no');
    await d.wait(0.4);
    p.arrow = false;
    follow(p, w.get('student'));
    g.setCinematic(false);
    await d.think(same === 'give' ? 'Lo mismo: sacar dos deudas es como dar dos atados.' : 'Eso la lleva a −3, para el otro lado. Sacar dos deudas es como dar dos atados.');
    m.setPose('write', 0.3);
    const eq = w.add(new Label('pz-eq', '−1 − (−2) = −1 + 2 = +1', lineX(-5), GROUND - 300, {size: 44, z: 9, reveal: 0}));
    await d.draw(eq, 1.2, {key: 'reveal'});
    m.setPose('idle', 0.4);
    // la misma rayita, dos papeles
    const read = await d.choose([
      {id: 'take', text: 'Que se saca algo.'},
      {id: 'debt', text: 'Que es una deuda.'},
      {id: 'same', text: 'Lo mismo que las otras rayitas.'},
    ], {prompt: 'En −1 − (−2), ¿qué dice la rayita del medio, la que está suelta?', evaluate: true});
    d.evidence('read-minus', {answer: read});
    await d.say('Mara', read === 'take'
      ? 'Eso. La suelta dice "sacar". Las pegadas al número dicen "deuda". Por eso el paréntesis: guarda al número con su signo.'
      : 'No: la suelta dice "sacar". Las pegadas al número dicen "deuda". Por eso el paréntesis: guarda al número con su signo.');
    await d.think('El mismo trazo, dos trabajos.');
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
    await d.tween(0.6, k => { p.x = PIT.x + 30; p.y = GROUND - 60 + k * k * (4 * PIT.step + 60); });
    g.audio.tap(0.4, 0.9);
    p.tremble = 1;
    await d.shot({x: PIT.x - 220, y: GROUND - 60, w: 480, h: 420}, 0.8);
    g.setCinematic(false);
    await d.say('student', '¡Punto!');
    s.setPose('lean', 0.3);
    await d.say('Mara', 'Cuatro debajo del suelo… como Espiral, que debe cuatro. El mismo −4.');
    const c = await d.choose([
      {id: '+1', text: '+1'}, {id: '-9', text: '−9'}, {id: '+9', text: '+9'}, {id: '-1', text: '−1'},
    ], {prompt: 'Punto está en −4. Puede subir cinco marcas. ¿Dónde queda?', evaluate: true});
    d.evidence('predict-pit', {answer: c});
    // el jugador elige hasta qué marca sube; Punto cuenta lo que sube
    await d.shot(SHOTS.pit, 0.8);
    const START = -4;
    let tries = 0;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => ['Punto puede subir cinco marcas, ni una más ni una menos.', 'Tocá la marca hasta donde llega.']);
      let busy = false;
      const refresh = () => {
        const spots = [];
        for (let n = START + 1; n <= 5; n++) spots.push(rectSpot(`pit${n}`, `Marca ${n === 0 ? 'cero, el suelo' : signed(n)} del pozo`, {x: PIT.x - 30, y: GROUND - n * PIT.step - 24, w: 60, h: 48}, () => climb(n)));
        g.ui.setSpots(spots);
      };
      const climb = async n => {
        if (busy || !ctl.alive()) return;
        busy = true;
        tries++;
        g.ui.setSpots([]);
        let k = 0;
        try {
          for (let at = START; at < n; at++, k++) {
            const y0 = GROUND - at * PIT.step, y1 = GROUND - (at + 1) * PIT.step;
            await d.tween(0.28, q => { p.y = lerp(y0, y1, q); p.x = PIT.x + 30 + Math.sin(q * Math.PI) * 10; });
            g.audio.punto('hop');
            const lab = w.add(new Label(`pitc-${k}`, WORDS[k] || String(k + 1), PIT.x - 70, y1 + 8, {size: 22, align: 'right', z: 9}));
            void lab;
          }
          d.evidence('pit-climb', {to: n, steps: n - START});
          if (n - START !== 5) {
            await d.think(n - START < 5 ? `Subió ${WORDS[n - START - 1]}. Le quedan pasos.` : `Subió ${WORDS[n - START - 1]}: eso es más de cinco.`);
            w.removeWhere(o => o.id.startsWith('pitc-'));
            await d.tween(0.5, q => { p.y = lerp(GROUND - n * PIT.step, GROUND - START * PIT.step, q * q); });
            g.audio.tap(0.3, 0.9);
            busy = false;
            refresh();
            return;
          }
        } catch { return; }
        resolve();
      };
      p.x = PIT.x + 30;
      p.y = GROUND - START * PIT.step;
      refresh();
    }));
    g.setHint(null);
    w.removeWhere(o => o.id.startsWith('pitc-'));
    p.tremble = 0;
    s.setPose('idle', 0.4);
    await d.think(c === '+1' ? 'Más uno. Arriba del suelo, como dije.' : 'Más uno: cuatro para llegar al suelo y uno más.');
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
    placeFamilies(g, {curva: 1, recta: 4});
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
    await d.say('Mara', 'Ahora cada número dice cuánto… y para qué lado. Menos el cero, que está en el medio.');
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
  const wd = all('write-debt').map(e => e.choice);
  const tried = {zero: 'con "0" la deuda desaparecía', three: 'con "3" parecía que Curva tenía', words: 'con palabras no se podía hacer la cuenta'};
  const wrongs = wd.filter(c => tried[c]).map(c => tried[c]);
  if (wd.length) seen.push(wrongs.length ? `Para anotar la deuda de Curva probaste otras escrituras: ${wrongs.join('; ')}. Punto puso una rayita delante del 3: −3.` : 'Para anotar la deuda de Curva elegiste una marca nueva delante del número: −3.');
  if (all('cancel').length) seen.push(`Emparejaste atados con deudas y se borraron de a pares${all('cancel-same').length ? '; dos iguales no se anulaban' : ''}.`);
  const po = all('predict-order')[0];
  if (po) seen.push(po.answer === 'espiral' ? 'Anticipaste que −4 es menor que −1.' : po.answer === 'curva' ? 'Pensaste que −1 era menor que −4; en la línea, −4 quedó más a la izquierda.' : 'Pensaste que −4 y −1 eran iguales por ser negativos; en la línea quedaron en lugares distintos.');
  if (all('place-wrong').length) seen.push('Cuando una familia quedó en una marca equivocada, te dijo lo que tendría o debería ahí.');
  const ps = all('predict-steps')[0];
  if (ps) seen.push(ps.answer === '7' ? 'Anticipaste siete pasos de −4 a +3, y Punto los dio.' : `Anticipaste ${ps.answer} pasos de −4 a +3; eran siete${ps.answer === '8' ? ': ocho marcas, siete saltos' : ''}.`);
  const a = all('abs')[0];
  if (a) seen.push(a.answer === 'same' ? '+4 y −4 están igual de lejos del cero.' : 'Creíste que uno de +4 y −4 estaba más lejos del cero; midiendo, era igual.');
  const fh = all('forgive-how');
  if (fh.length) seen.push('Para sacar dos deudas cuando quedaba una sola, agregaste un atado y una deuda (valen cero) y sacaste la deuda: −1 − (−2) = +1.');
  const fs = all('forgive-same')[0];
  if (fs) seen.push(fs.answer === 'give' ? 'Viste que sacar dos deudas deja igual que dar dos atados.' : 'Pensaste que sacar deudas era como quitar atados o sumar deudas; en la línea iba para el otro lado.');
  const pp = all('predict-pit')[0];
  if (pp) seen.push(`Desde −4, subir cinco: anticipaste ${pp.answer.replace('-', '−')}; Punto quedó en +1.`);
  const entry = {
    id: 'c3',
    title: 'Menos que nada',
    abbr: 'El signo dice hacia qué lado; un tener y un deber se anulan de a pares.',
    body: [
      'Un número con signo dice cuánto y para qué lado: +3, tres que se tienen; −3, tres que se deben (o tres debajo del cero).',
      'Juntar lo que se tiene con lo que se debe es emparejar: cada par vale cero y se borra; lo que sobra es el resultado.',
      'En la línea, más a la derecha es más: −4 es menos que −1, aunque 4 sea más que 1.',
      'La distancia no tiene signo: de −4 a +3 hay 7 pasos. Lo lejos que está un número del cero se escribe con barritas: |−4| = |+4| = 4.',
      'Sacar una deuda sube el valor, igual que dar un atado: −1 − (−2) = −1 + 2 = +1. Si no hay deudas para sacar, se agregan pares que valen cero.',
      '"Deber 4" y "estar 4 debajo del suelo" son dos lecturas del mismo número: −4.',
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
