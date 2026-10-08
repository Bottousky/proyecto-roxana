// Capítulo 6 — Lo que no se ve (6.5 a 6.8): al cuadrado, dividir por lo que puede ser cero,
// al revés (desigualdades) y dos pasos.

import {Label} from '../engine/world.js';
import {lerp} from '../engine/rng.js';
import {mareaBand} from '../ch1/scenes.js';
import {YELLOW} from '../engine/chalk.js';
import {pulse, follow, wordSpot} from '../acting.js';
import {lin, expr, eq, addBoth, mulBoth, divBoth, squareBoth, divBothByExpr, solutions, sameSolutions, solveLinear} from '../logic/equations.js';
import {GROUND, LINE, lx, SHOTS, base, cast, EqView, villager, signed} from './common.js';
import {derivLine, writeDeriv, placeX, moveX} from './scenes-a.js';

function lineSetup(g, who, head, x0 = 0) {
  const w = g.world;
  base(g);
  w.removeWhere(o => /^(eqv-|d6-|c6-|box)/.test(o.id));
  cast(g);
  if (who) villager(w, who, lx(LINE.to) + 90, head, {facing: -0.6});
  const p = w.get('punto');
  p.setMode('still');
  p.x = lx(x0);
  p.y = GROUND - 26;
  g.camera.go(SHOTS.line);
}

/** Paleta de operaciones sobre la recta; devuelve el id elegido. */
// las operaciones se eligen en el panel de opciones: en el teléfono, botones en fila sobre la recta se pisaban
function pickOp(d, g, ops, hint) {
  return d.choose(ops.map(o => ({id: o.id, text: o.label || o.text})), {prompt: hint});
}

// ——————————————————————————————————————————————
// 6.5 Al cuadrado
// ——————————————————————————————————————————————

export const cuadrado = {
  id: 'c6.cuadrado',
  title: 'Al cuadrado',
  setup(g) { lineSetup(g, 'oval-a', 'oval', 3); },
  async play(d, g) {
    const w = g.world;
    const e0 = eq(lin(1, 0), lin(0, 3));
    const view = new EqView(g, e0, 3);
    derivLine(w, 'd6-q0', 'x = 3', 0);
    await d.shot(SHOTS.line, 1);
    await d.say('Oval', 'A mí me gusta elevar todo al cuadrado: x por x, y 3 por 3. Queda más lindo.');
    g.setCinematic(true);
    const l1 = derivLine(w, 'd6-q1', 'x · x = 9', 1, {reveal: 0});
    await d.draw(l1, 0.6, {key: 'reveal'});
    d.describe('Escrito: x · x = 9.');
    view.set(squareBoth(e0), {L: 'x · x', R: '9'});
    await d.wait(1);
    g.setCinematic(false);
    const c = await d.choose([
      {id: '1', text: 'Una sola: el 3, como antes.'},
      {id: '2', text: 'Dos.'},
      {id: '0', text: 'Ninguna.'},
    ], {prompt: '¿Cuántas x hacen que x · x caiga en el 9?', evaluate: true});
    d.evidence('square-predict', {answer: c});
    const found = new Set([3]);
    await placeX(d, g, view, {
      hint: ['Mové a Punto y buscá todos los lugares donde los dos marcadores caen juntos.', 'Probá también del lado de los negativos.'],
      done: v => { if (v.match) found.add(v.x); return found.has(-3); },
    });
    await d.think('Menos tres por menos tres, nueve. Apareció otra x.');
    const sq = squareBoth(e0);
    d.evidence('square', {before: solutions(e0), after: solutions(sq)});
    // probar el −3 en la cuenta de antes
    view.set(e0, {L: 'x', R: '3'});
    await d.wait(1);
    d.describe('Con Punto en el −3, la cuenta de Oval vuelve a la recta: x = 3. Los marcadores se separan: uno en el −3, otro en el 3.');
    await d.say('student', 'En la cuenta de Oval, x = 3, el −3 no cumple: los marcadores se separan. El −3 lo trajo el cuadrado.');
    await d.think('Al cuadrado, −3 y 3 caen en el mismo 9: no se puede deshacer sin perder cuál era. Después de elevar, hay que probar en la cuenta de antes.');
    await d.say('Oval', 'Más lindo, pero con un invitado de más.');
    view.dispose();
    g.flags.c6square = true;
  },
};

// ——————————————————————————————————————————————
// 6.6 Dividir por lo que puede ser cero
// ——————————————————————————————————————————————

export const dividir = {
  id: 'c6.dividir',
  title: 'Dividir por lo que puede ser cero',
  setup(g) { lineSetup(g, 'curva', 'curl', 1); },
  async play(d, g) {
    const w = g.world;
    const e0 = eq(expr(x => x * x, 'x · x'), lin(1, 0));
    const view = new EqView(g, e0, 1);
    derivLine(w, 'd6-v0', 'x · x = x', 0);
    await d.shot(SHOTS.line, 1);
    await d.say('Curva', 'Esta la saqué rápido: x por x igual a x. Divido los dos lados por x, y queda x = 1.');
    g.setCinematic(true);
    const l1 = derivLine(w, 'd6-v1', '(x · x) ÷ x = x ÷ x', 1, {reveal: 0});
    await d.draw(l1, 0.7, {key: 'reveal'});
    const l2 = derivLine(w, 'd6-v2', 'x = 1', 2, {reveal: 0});
    await d.draw(l2, 0.4, {key: 'reveal'});
    d.describe('Escrito: (x · x) ÷ x = x ÷ x, y abajo, x = 1.');
    g.setCinematic(false);
    const c = await d.choose([
      {id: 'yes', text: 'Sí: 0 · 0 = 0.'},
      {id: 'no', text: 'No: Curva ya encontró la x, es 1.'},
    ], {prompt: '¿x = 0 cumple x · x = x?', evaluate: true});
    d.evidence('zero-root-predict', {answer: c});
    await placeX(d, g, view, {
      hint: ['Poné a Punto en el 0 y mirá la cuenta de arriba, la de Curva antes de dividir.'],
      done: v => v.x === 0,
    });
    await d.think('Con Punto en el 0, los dos dan 0: cumple.');
    // la cuenta después de dividir: en el 0 no está definida
    view.set(divBothByExpr(e0, lin(1, 0)), {L: '(x · x) ÷ x', R: 'x ÷ x'});
    await d.wait(1);
    d.describe('Con la cuenta dividida por x y Punto en el 0, los marcadores desaparecen: dividir por cero no está definido.');
    await d.think('Y en la cuenta dividida, con Punto en el 0, los marcadores desaparecen: dividir por cero no está definido, no hay ningún número.');
    d.evidence('div-by-x', {before: solutions(e0), after: solutions(divBothByExpr(e0, lin(1, 0)))});
    await d.say('student', 'Al dividir por x, se suponía que x no es cero. Y justo el 0 era una de las soluciones. Se perdió.');
    await d.say('student', 'Por partes: si x no es cero, dividir se puede y se deshace, y queda x = 1. Si x es cero, se mira aparte: 0 · 0 = 0, cumple. No hay más.');
    await d.say('Curva', 'Dos, el 0 y el 1. Y yo había encontrado una.');
    view.dispose();
    g.flags.c6div = true;
  },
};

// ——————————————————————————————————————————————
// 6.7 Al revés
// ——————————————————————————————————————————————

export const alReves = {
  id: 'c6.al-reves',
  title: 'Al revés',
  setup(g) { lineSetup(g, 'cuna', 'tri', 0); },
  async play(d, g) {
    const w = g.world;
    const e0 = eq(lin(-2, 0), lin(0, 6), '<');
    const view = new EqView(g, e0, 0);
    derivLine(w, 'd6-i0', '−2x < 6', 0);
    await d.shot(SHOTS.line, 1);
    await d.say('Cuña', 'Me dieron un acertijo: −2 por x tiene que dar menos que 6. ¿Qué x sirven?');
    await d.think('Ahora no es "igual": es "menor". Cuando se cumple, aparece una tilde sobre Punto.');
    const seen = new Set();
    await placeX(d, g, view, {
      hint: ['Mové a Punto a varios lados: la tilde aparece cuando −2x da menos que 6 (su marcador, a la izquierda del de 6 en la recta).'],
      done: v => { seen.add(v.holds ? 'yes' : 'no'); return seen.size === 2; },
    });
    view.showSet = true;
    d.describe('Debajo de la recta se marcan todas las x enteras que cumplen: del −2 para la derecha.');
    await d.think('Algunas x cumplen y otras no. Las que cumplen quedan marcadas debajo de la recta.');
    await moveX(d, g, view, 0);
    d.describe('Punto vuelve al 0, que cumple: −2 · 0 = 0, y 0 es menos que 6.');
    const ops = [
      {id: 'keep', text: '÷ (−2), dejando <', label: 'Dividir por −2 y dejar el «<».'},
      {id: 'flip', text: '÷ (−2), dando vuelta: >', label: 'Dividir por −2 y dar vuelta el signo: «>».'},
    ];
    let op;
    for (;;) {
      op = await pickOp(d, g, ops, 'Dividí los dos lados por −2 para dejar sola a la x. ¿El signo queda igual o se da vuelta?');
      d.evidence('ineq-op', {op});
      const t = divBoth(e0, -2, {flip: op === 'flip'});
      view.set(t, {L: 'x', R: '−3'});
      await d.wait(1.1);
      const same = sameSolutions(e0, t);
      if (op === 'flip') {
        await writeDeriv(d, g, 'd6-i1', 'x > −3', 1);
        await d.think('Las marcas no se movieron: cumplen las mismas x de antes. Y con Punto en el 0, sigue cumpliéndose: 0 > −3.');
        d.evidence('ineq', {same});
        break;
      }
      d.describe('Las marcas de abajo saltan al otro lado: ahora están del −4 para la izquierda.');
      await d.think('Las marcas se fueron al otro lado. Con Punto en el 0: antes se cumplía (0 < 6) y ahora no (0 < −3). Cambiaron las x que sirven.');
      view.set(e0, {L: '−2x', R: '6'});
      await d.wait(0.6);
      ops.splice(ops.findIndex(o => o.id === op), 1);
    }
    await d.say('student', 'Dividir por un negativo da vuelta la recta, como la media vuelta de las Terrazas: lo que estaba a la izquierda queda a la derecha. Por eso el signo se da vuelta.');
    await d.think('Dividir por 2, en cambio, no da vuelta nada: 2x < 6 queda x < 3. Lo que da vuelta es el signo menos del número por el que se divide.');
    view.dispose();
    g.flags.c6ineq = true;
  },
};

// ——————————————————————————————————————————————
// 6.8 Dos pasos (momento)
// ——————————————————————————————————————————————

export const dosPasos = {
  id: 'c6.dos-pasos',
  title: 'Dos pasos',
  moment: 'Dos pasos',
  setup(g) { lineSetup(g, 'recta', 'square', 0); },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const p = w.get('punto');
    await d.shot(SHOTS.line, 1);
    await d.say('Recta', 'Una última: dos cajas iguales y un atado suelto son siete atados.');
    const E0 = eq(lin(2, 1), lin(0, 7));
    let e = E0;
    const view = new EqView(g, e, 0);
    derivLine(w, 'd6-t0', '2x + 1 = 7', 0);
    const solved = q => q.L.a === 1 && q.L.b === 0;
    const OPS = [
      {id: 'm1', text: '− 1', label: 'Restar 1 a los dos lados', name: 'restar 1', f: q => addBoth(q, -1), t: q => ({L: `${q.L.text} − 1`, R: `${q.R.text} − 1`})},
      {id: 'd2', text: '÷ 2', label: 'Dividir los dos lados por 2', name: 'dividir por 2', f: q => divBoth(q, 2), t: q => ({L: `(${q.L.text}) ÷ 2`, R: `${q.R.text} ÷ 2`})},
      {id: 'mh', text: '− 1/2', label: 'Restar un medio a los dos lados', name: 'restar 1/2', f: q => addBoth(q, -1 / 2), t: q => ({L: `${q.L.text} − 1/2`, R: `${q.R.text} − 1/2`})},
      {id: 'm7', text: '− 7', label: 'Restar 7 a los dos lados', name: 'restar 7', f: q => addBoth(q, -7), t: q => ({L: `${q.L.text} − 7`, R: `${q.R.text} − 7`})},
      {id: 'half', text: '÷ 2 sólo al 2x', label: 'Dividir por 2 sólo el término con x', name: 'dividir por 2 sólo el término con x', bad: true},
    ];
    const stack = [];
    const path = [];
    let rescued = false;
    let steps = 0;
    while (!solved(e)) {
      const full = stack.length >= 3;
      const choices = (full ? [] : OPS.filter(o => !o.bad || (e.L.a === 2 && e.L.b !== 0))).concat(stack.length ? [{id: 'undo', text: 'deshacer', label: 'Deshacer el último paso'}] : []);
      const op = await d.choose(choices.map(o => ({id: o.id, text: o.label})), {prompt: full ? 'Ya son muchos renglones: deshacé alguno.' : 'Elegí qué hacerle a la cuenta (si un paso no ayuda, se puede deshacer).'});
      steps++;
      if (op === 'undo') {
        const prev = stack.pop();
        path.push('undo');
        d.evidence('two-step', {op, keeps: true});
        const last = w.get(`d6-t${stack.length + 1}`);
        g.setCinematic(true);
        g.audio.erase(0.5, 0.4);
        if (last) { await d.fadeTo(last, 0, 0.5); w.remove(last.id); }
        g.setCinematic(false);
        e = prev;
        view.set(e);
        await d.wait(0.7);
      } else {
        const o = OPS.find(x => x.id === op);
        if (o.bad) {
          // dividir sólo una parte de un lado: el otro lado no se mueve
          const t = eq(lin(e.L.a / 2, e.L.b), e.R);
          view.set(t, {L: `${t.L.text}`, R: e.R.text});
          await d.wait(1.1);
          d.describe(`Sólo se mueve el marcador del primer miembro; el del ${e.R.text} se queda quieto.`);
          d.evidence('two-step', {op, keeps: sameSolutions(e, t)});
          path.push(op);
          g.audio.punto('no');
          await pulse(d, p, 1, 0.3);
          const s1 = solveLinear(t);
          await d.think(`El ${e.R.text} no se movió: no fue lo mismo a los dos lados, y la mitad de ${e.L.text} no es ${t.L.text}. Esa cuenta pide x = ${s1.kind === 'one' ? fmtNum(s1.x) : '?'}: es otra cuenta.`);
          view.set(e);
          await d.wait(0.7);
          continue;
        }
        const before = e;
        e = o.f(e);
        stack.push(before);
        path.push(op);
        view.set(e, o.t(before));
        await d.wait(1);
        view.set(e);
        d.evidence('two-step', {op, keeps: sameSolutions(before, e)});
        await writeDeriv(d, g, `d6-t${stack.length}`, `${e.L.text} = ${e.R.text}`, stack.length);
        if (op === 'm7' && !solved(e)) await d.think('Sigue valiendo, pero no ayudó: la x no quedó más sola.');
      }
      if (!solved(e) && steps >= 10) {
        rescued = true;
        await d.think('Muchos pasos y la x sigue acompañada. Vuelvo al principio: primero lo que está más afuera, el +1; después, el doble.');
        g.setCinematic(true);
        for (let k = stack.length; k >= 1; k--) w.remove(`d6-t${k}`);
        stack.length = 0;
        e = addBoth(E0, -1);
        stack.push(E0);
        derivLine(w, 'd6-t1', `${e.L.text} = ${e.R.text}`, 1);
        stack.push(e);
        e = divBoth(e, 2);
        derivLine(w, 'd6-t2', `${e.L.text} = ${e.R.text}`, 2);
        view.set(e);
        g.setCinematic(false);
        await d.wait(0.8);
      }
    }
    const sol = solveLinear(e);
    const kept = path.filter(o => o !== 'undo' && o !== 'half');
    const firstDiv = !rescued && !!w.get('d6-t1')?.text.startsWith('x + 1/2');
    await d.say('student', rescued ? 'Primero el +1, después el doble: x = 3.' : firstDiv ? 'Dividiendo primero también se llega, con mitades en el camino: x + 1/2 = 7/2, y x = 3.' : 'Primero el +1, después el doble: x = 3.');
    await d.say('Mara', firstDiv ? '¿Y restando primero?' : '¿Y si dividías primero?');
    await d.say('student', 'También da 3. Sumar, restar, o dividir por un número que no es cero, a los dos lados, no pierde ni agrega soluciones: cualquier camino así que deje sola a la x llega al mismo número.');
    // comprobar moviendo a Punto
    view.set(E0);
    await placeX(d, g, view, {hint: ['Poné a Punto en el 3 para comprobar en la cuenta del principio.'], done: v => v.x === 3});
    await d.think('Dos por tres, más uno: siete. Se cumple.');
    await d.say('Recta', 'Las dos cajas, de a tres. Ahora me acuerdo.');
    d.evidence('two-step-result', {x: sol.kind === 'one' ? sol.x : null, path, rescued, kept});
    // la x a la derecha: se borra la pizarra y se empieza otra
    g.setCinematic(true);
    for (let k = 0; k <= 3; k++) { const l = w.get(`d6-t${k}`); if (l) d.fadeTo(l, 0, 0.6).then(() => w.remove(l.id)).catch(() => {}); }
    await d.wait(0.7);
    g.setCinematic(false);
    await d.say('Recta', '¿Y si la caja está del otro lado? Tres atados son la cuarta parte de una caja.');
    const E2 = eq(lin(0, 3), lin(1 / 4, 0));
    view.set(E2, {L: '3', R: 'x ÷ 4'});
    derivLine(w, 'd6-u0', '3 = x ÷ 4', 0);
    const rops = [
      {id: 'x4', text: '× 4 a los dos', label: 'Multiplicar los dos lados por 4'},
      {id: 'd4', text: '÷ 4 a los dos', label: 'Dividir los dos lados por 4'},
      {id: 'p4', text: '+ 4 a los dos', label: 'Sumar 4 a los dos lados'},
    ];
    for (;;) {
      const op2 = await pickOp(d, g, rops, 'La x está a la derecha. ¿Qué la deja sola?');
      d.evidence('right-side', {op: op2});
      if (op2 === 'x4') break;
      if (op2 === 'd4') view.set(divBoth(E2, 4), {L: '3/4', R: 'x ÷ 16'});
      else view.set(addBoth(E2, 4), {L: '7', R: 'x ÷ 4 + 4'});
      await d.wait(1.1);
      await d.think(op2 === 'd4' ? 'Del lado de la x quedó x ÷ 16: más lejos de quedar sola. Lo que deshace un "÷ 4" es "× 4".' : 'Quedó x ÷ 4 + 4: la x no se soltó. Lo que deshace dividir es multiplicar.');
      view.set(E2, {L: '3', R: 'x ÷ 4'});
      await d.wait(0.6);
      rops.splice(rops.findIndex(o => o.id === op2), 1);
    }
    view.set(mulBoth(E2, 4), {L: '3 · 4', R: 'x ÷ 4 · 4'});
    await d.wait(1);
    view.set(mulBoth(E2, 4), {L: '12', R: 'x'});
    await writeDeriv(d, g, 'd6-u1', '12 = x', 1);
    view.set(E2, {L: '3', R: 'x ÷ 4'});
    await placeX(d, g, view, {hint: ['Poné a Punto en el 12 y mirá la cuenta del principio: 3 = x ÷ 4.'], done: v => v.x === 12});
    await d.think('Doce dividido cuatro, tres: los marcadores caen juntos. La x puede quedar de cualquier lado del igual.');
    if (!replay) writeJournal6(g);
    view.dispose();
    // la Marea pasa por la recta: se lleva las abreviaturas que nadie entiende; los renglones comprobados quedan
    const abbr = [['pasa sumando', lx(6), GROUND - 330], ['se tacha', lx(9), GROUND - 270], ['cambia de lado y de signo', lx(4), GROUND - 210]]
      .map(([t, x, y], i) => w.add(new Label(`d6-ab${i}`, t, x, y, {size: 24, z: 8, fade: 0.45})));
    d.describe('Al costado de la recta, escritas por alguien hace mucho: «pasa sumando», «se tacha», «cambia de lado y de signo», sin ninguna cuenta al lado.');
    await d.think('Esas no son nuestras. Son abreviaturas sueltas, sin la cuenta que abrevian.');
    g.setCinematic(true);
    const x0 = SHOTS.line.x - 200, x1 = SHOTS.line.x + SHOTS.line.w + 200;
    const band = w.add(mareaBand(w, x0));
    band.strength = 0.85;
    band.width = 300;
    g.audio.marea?.(4);
    g.camera.shake = 0.25;
    d.describe('Pasa la Marea por la recta: una franja ancha de borrador. Se lleva las abreviaturas sueltas; los renglones de cuentas que comprobamos quedan.');
    await d.tween(2.6, q => {
      band.x = lerp(x0, x1, q);
      for (const ab of abbr) if (band.x > ab.x) ab.fade = Math.max(0, ab.fade - 0.04);
    });
    w.remove('marea-band');
    abbr.forEach(ab => w.remove(ab.id));
    g.setCinematic(false);
    await d.think('Lo que nadie entendía se lo llevó. Lo que comprobamos, paso por paso, quedó.');
    // gancho: la huerta de dos cuadros
    await d.say('Mara', 'Peldaño anda con otro problema: quiere una huerta cuadrada con justo dos cuadros de tierra. ¿Cuánto mide el lado?');
    g.setCinematic(true);
    const hk = w.add(new Label('d6-hook', 'x · x = 2', lx(4), GROUND - 330, {size: 44, z: 9, reveal: 0, ch: YELLOW}));
    p.setMode('still');
    await d.draw(hk, 0.8, {key: 'reveal', sound: false});
    g.audio.punto('question');
    await pulse(d, p, 2, 0.4);
    follow(p, w.get('student'));
    g.setCinematic(false);
    await d.think('Un número que, multiplicado por sí mismo, da 2. Uno por uno es 1; dos por dos, 4. Está en el medio. Hay que aprender a hacer crecer los números… y a deshacerlo.');
  },
};

const fmtNum = n => (Number.isInteger(n) ? String(n).replace('-', '−') : String(n).replace('.', ',').replace('-', '−'));

function writeJournal6(g) {
  // sólo lo de este capítulo: hay tipos de evidencia con el mismo nombre en otros (count, cut, scale…)
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1) && (!e.seg || e.seg.startsWith('c6.')));
  const first = k => ev.find(e => e.kind === k);
  const all = k => ev.filter(e => e.kind === k);
  const seen = [];
  const sb = first('solve-box');
  if (sb) seen.push(`Moviste a Punto (la x) hasta que x − 3 cayó en el 5: con x = 8${sb.tries > 3 ? `, después de ${sb.tries} intentos` : ''}. La caja tenía ocho.`);
  const op2 = all('op2').map(e => e.op);
  if (op2.length) seen.push(op2[0] === 'both' ? 'Sumaste 3 a los dos lados: los marcadores siguieron juntos y quedó x = 8.' : `Probaste ${op2.filter(o => o !== 'both').map(o => ({oneL: 'sumar 3 sólo al primer miembro (se separaron)', bothM: 'restar 3 a los dos (siguieron juntos, pero no despejó)'}[o])).join(' y ')} antes de sumar 3 a los dos lados.`);
  const ps = first('pasa-sumando');
  if (ps) seen.push(ps.answer === 'both' ? '"Pasa sumando" quedó como abreviatura de sumar a los dos lados.' : ps.answer === 'move' ? 'Pensaste que "pasa sumando" era mudar el número de lado; es sumar a los dos lados, en corto.' : 'Pensaste que "pasa sumando" era una regla sin explicación; es sumar a los dos lados, en corto.');
  const ch = first('check-how');
  if (first('substitute')) seen.push(ch?.answer === 'sub' ? 'Punto resolvió de memoria y pasó el 3 con el signo que tenía; elegiste comprobarlo poniéndolo en el 8: no cumplía. Era x = 2, y Punto borró su renglón.' : 'Punto resolvió de memoria y pasó el 3 con el signo que tenía; puesto en el 8, no cumplía. Era x = 2, y Punto borró su renglón.');
  if (first('times-zero-eq')) seen.push('Con el truco de multiplicar por cero, cualquier x parecía servir: por cero se pierde lo que decía la cuenta.');
  const sp = first('square-predict');
  if (sp) seen.push(sp.answer === '2' ? 'Anticipaste que x · x = 9 tiene dos soluciones; buscando, aparecieron el 3 y el −3.' : 'Al elevar al cuadrado apareció el −3, que la cuenta de antes no tenía.');
  if (first('div-by-x')) seen.push('Dividiendo x · x = x por x se perdió el 0, que sí cumplía.');
  const io = all('ineq-op').map(e => e.op);
  if (io.length) seen.push(io[0] === 'flip' ? 'Al dividir −2x < 6 por −2 diste vuelta el signo: x > −3, y las x marcadas no cambiaron.' : 'Dividiste por −2 sin dar vuelta el signo y las x marcadas saltaron al otro lado; dando vuelta, x > −3.');
  const tr = first('two-step-result');
  if (tr) {
    const names = {m1: 'restar 1', d2: 'dividir por 2', mh: 'restar 1/2', m7: 'restar 7', half: 'dividir sólo el 2x (no valía)', undo: 'deshacer'};
    seen.push(tr.rescued ? `En 2x + 1 = 7 probaste ${tr.path.map(o => names[o]).join(', ')}; después de muchos pasos, el camino se hizo junto: restar 1 y dividir por 2. x = 3.` : `En 2x + 1 = 7 tu camino fue: ${tr.path.map(o => names[o]).join(', ')}. x = 3.`);
  }
  const entry = {
    id: 'c6',
    title: 'Lo que no se ve',
    abbr: 'Una ecuación son dos miembros; resolver es buscar para qué x coinciden, sin perder ni inventar soluciones.',
    body: [
      'Una incógnita es un número que está pero no se ve. Se le pone un nombre: x. Resolver es encontrar para qué x los dos miembros dan lo mismo.',
      'Hacer lo mismo a los dos lados no cambia para qué x coinciden si cumple dos cosas: que se pueda hacer con cualquier x (así no se pierde ninguna solución) y que se pueda deshacer (así no aparece ninguna). Sumar o restar cualquier número, o multiplicar o dividir por un número que no sea cero, cumplen las dos. "Pasa sumando" abrevia eso: sumar a los dos lados y simplificar.',
      'Para comprobar, se pone el valor en la cuenta original. De memoria se puede pasar un número con el signo equivocado.',
      'Una ecuación pregunta para qué x se cumple (x − 3 = 5, sólo con 8); una identidad se cumple con cualquier x (x − 3 + 3 = x; 0 = 0). Por cero no se deshace: la ecuación se vuelve una identidad y aparecen todas las x. Al cuadrado no se deshace: pueden aparecer de más (3 y −3). Dividir por algo que vale cero en alguna x no se puede hacer en esa x: ahí se puede perder una solución (el 0 en x · x = x).',
      'En una desigualdad, multiplicar o dividir por un negativo da vuelta la recta: el signo se invierte. Por un positivo, no.',
      'Hay muchos caminos válidos; no todos ayudan, pero todo camino válido que deja sola a la x da el mismo número.',
      'Dato: al-Khwārizmī (Bagdad, hacia 820) llamó al-jabr a restituir lo que se resta, y al-muqābala a cancelar lo igual de los dos lados; lo hacía en palabras, sin símbolos. De al-jabr viene "álgebra".',
    ],
    seen,
    moments: [
      {id: 'c6.dos-lados', label: 'Desplegar: pasa sumando'},
      {id: 'c6.dos-pasos', label: 'Desplegar: dos pasos'},
    ],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora (≡)');
  g.saveNow();
}

export {signed};
