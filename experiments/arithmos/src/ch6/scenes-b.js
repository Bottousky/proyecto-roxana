// Capítulo 6 — Lo que no se ve (6.5 a 6.8): al cuadrado, dividir por lo que puede ser cero,
// al revés (desigualdades) y dos pasos.

import {Label} from '../engine/world.js';
import {YELLOW} from '../engine/chalk.js';
import {pulse, follow, wordSpot} from '../acting.js';
import {lin, expr, eq, addBoth, mulBoth, divBoth, squareBoth, divBothByExpr, solutions, sameSolutions, solveLinear} from '../logic/equations.js';
import {GROUND, LINE, lx, SHOTS, base, cast, EqView, villager, signed} from './common.js';
import {derivLine, writeDeriv, placeX} from './scenes-a.js';

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
function pickOp(d, g, ops, hint) {
  return d.interact(ctl => new Promise(resolve => {
    g.setHint(() => [hint]);
    g.ui.setSpots(ops.map((o, i) => wordSpot(`op-${o.id}`, o.text, lx(-3 + i * 4.5), GROUND - 330, () => { if (ctl.alive()) { g.ui.setSpots([]); g.setHint(null); resolve(o.id); } }, {label: o.label || o.text})));
  }));
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
    await d.say('student', 'Pero la caja de Oval tenía 3: x = 3. El −3 lo trajo el cuadrado.');
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
    await d.think('Y en la cuenta dividida, con Punto en el 0, los marcadores desaparecen: dividir por cero no da nada.');
    d.evidence('div-by-x', {before: solutions(e0), after: solutions(divBothByExpr(e0, lin(1, 0)))});
    await d.say('student', 'Al dividir por x, se suponía que x no es cero. Y justo el 0 era una de las soluciones. Se perdió.');
    await d.say('Curva', 'O sea que son dos: el 0 y el 1.');
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
    await d.say('Cuña', 'Me dieron un acertijo: −2 por x tiene que quedar debajo de 6. ¿Qué x sirven?');
    await d.think('Ahora no es "igual": es "menor". Cuando se cumple, aparece una tilde sobre Punto.');
    const seen = new Set();
    await placeX(d, g, view, {
      hint: ['Mové a Punto a varios lados: la tilde amarilla aparece donde −2x queda a la izquierda del 6.'],
      done: v => { seen.add(v.holds ? 'yes' : 'no'); return seen.size === 2; },
    });
    await d.think('Algunas x cumplen y otras no.');
    const ops = [
      {id: 'keep', text: '÷ (−2), dejando <', label: 'Dividir por menos dos y dejar el menor'},
      {id: 'flip', text: '÷ (−2), dando vuelta: >', label: 'Dividir por menos dos y dar vuelta el signo'},
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
        await d.think('Con Punto en el 0 se sigue cumpliendo. Las mismas x de antes.');
        d.evidence('ineq', {same});
        break;
      }
      await d.think('Con Punto en el 0: antes se cumplía (0 < 6) y ahora no (0 < −3). Cambiaron las x que sirven.');
      view.set(e0, {L: '−2x', R: '6'});
      await d.wait(0.6);
      ops.splice(ops.findIndex(o => o.id === op), 1);
    }
    await d.say('student', 'Dividir por un negativo da vuelta la recta, como la media vuelta de las Terrazas: lo que estaba a la izquierda queda a la derecha. Por eso el signo se da vuelta.');
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
    let e = eq(lin(2, 1), lin(0, 7));
    const view = new EqView(g, e, 0);
    derivLine(w, 'd6-t0', '2x + 1 = 7', 0);
    let row = 1;
    const opsAll = [
      {id: 'm1', text: '−1 a los dos', f: q => addBoth(q, -1), t: q => ({L: `${q.L.text} − 1`, R: `${q.R.text} − 1`})},
      {id: 'd2', text: '÷ 2 a los dos', f: q => divBoth(q, 2), t: q => ({L: `(${q.L.text}) ÷ 2`, R: `${q.R.text} ÷ 2`})},
      {id: 'm7', text: '−7 a los dos', f: q => addBoth(q, -7), t: q => ({L: `${q.L.text} − 7`, R: `${q.R.text} − 7`})},
    ];
    const path = [];
    for (let guard = 0; guard < 6; guard++) {
      const op = await pickOp(d, g, opsAll, 'Elegí qué hacer a los dos lados. Cualquier camino que deje sola a la x vale.');
      const o = opsAll.find(x => x.id === op);
      const before = e;
      e = o.f(e);
      path.push(op);
      view.set(e, o.t(before));
      await d.wait(1);
      view.set(e);
      d.evidence('two-step', {op, keeps: sameSolutions(before, e)});
      await writeDeriv(d, g, `d6-t${row}`, `${e.L.text} = ${e.R.text}`, row);
      row++;
      if (e.L.a === 1 && e.L.b === 0) break;
      if (op === 'm7') await d.think('Sigue valiendo, pero no ayudó: la x no quedó más sola.');
      if (row > 4) break;
    }
    const sol = solveLinear(e);
    if (!(e.L.a === 1 && e.L.b === 0)) {
      await d.think('Así no termino nunca. Primero lo que está más afuera: el +1. Después, el doble.');
      e = divBoth(addBoth(eq(lin(2, 1), lin(0, 7)), -1), 2);
      view.set(e);
      await writeDeriv(d, g, `d6-t${row}`, 'x = 3', row);
    }
    await d.say('student', path[0] === 'd2' ? 'Dividiendo primero también se llega, con mitades en el camino: x + 1/2 = 7/2, y x = 3.' : 'Primero el +1, después el doble: x = 3.');
    // comprobar moviendo a Punto
    await placeX(d, g, view, {hint: ['Poné a Punto en el 3 para comprobar en la cuenta.'], done: v => v.x === 3});
    view.set(eq(lin(2, 1), lin(0, 7)));
    await d.wait(1);
    await d.think('En la cuenta del principio también: dos por tres, más uno, siete.');
    await d.say('Recta', 'Las dos cajas, de a tres. Ahora me acuerdo.');
    d.evidence('two-step-result', {x: sol.kind === 'one' ? sol.x : null, path});
    // la x a la derecha
    await d.say('Recta', '¿Y si la caja está del otro lado? Tres atados son la cuarta parte de una caja.');
    let e2 = eq(lin(0, 3), lin(1 / 4, 0));
    view.set(e2, {L: '3', R: 'x ÷ 4'});
    derivLine(w, 'd6-t6', '3 = x ÷ 4', 5);
    const op2 = await pickOp(d, g, [
      {id: 'x4', text: '× 4 a los dos'},
      {id: 'd4', text: '÷ 4 a los dos'},
      {id: 'p4', text: '+ 4 a los dos'},
    ], 'La x está a la derecha. ¿Qué la deja sola?');
    d.evidence('right-side', {op: op2});
    if (op2 !== 'x4') {
      e2 = op2 === 'd4' ? divBoth(e2, 4) : addBoth(e2, 4);
      view.set(e2);
      await d.wait(1);
      await d.think(op2 === 'd4' ? 'Siguen juntos, pero ahora es x ÷ 16: más lejos de quedar sola. Lo que la deshace es multiplicar.' : 'Siguen juntos, pero la x no se soltó. Dividir se deshace multiplicando.');
      e2 = eq(lin(0, 3), lin(1 / 4, 0));
    }
    e2 = mulBoth(e2, 4);
    view.set(e2, {L: '12', R: 'x'});
    await d.wait(1);
    await writeDeriv(d, g, 'd6-t7', '12 = x', 6);
    await d.think('La x puede quedar de cualquier lado. Doce.');
    if (!replay) writeJournal6(g);
    view.dispose();
    // gancho: la diagonal
    await d.say('Mara', 'Peldaño vino con la diagonal de su huerta. Dice que el cuadrado dibujado sobre ella ocupa justo dos cuadrados de la huerta.');
    g.setCinematic(true);
    const hk = w.add(new Label('d6-hook', 'x · x = 2', lx(4), GROUND - 330, {size: 44, z: 9, reveal: 0, ch: YELLOW}));
    p.setMode('still');
    await d.draw(hk, 0.8, {key: 'reveal', sound: false});
    g.audio.punto('question');
    await pulse(d, p, 2, 0.4);
    follow(p, w.get('student'));
    g.setCinematic(false);
    await d.think('Un número que por sí mismo da 2. Ni 1,4 ni 1,5. Hay que aprender a hacer crecer los números… y a deshacerlo.');
  },
};

function writeJournal6(g) {
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const first = k => ev.find(e => e.kind === k);
  const all = k => ev.filter(e => e.kind === k);
  const seen = [];
  const sb = first('solve-box');
  if (sb) seen.push(`Moviste a Punto (la x) hasta que x − 3 cayó en el 5: ocho${sb.tries > 3 ? `, después de ${sb.tries} intentos` : ''}. La caja tenía ocho.`);
  const op2 = all('op2').map(e => e.op);
  if (op2.length) seen.push(op2[0] === 'both' ? 'Sumaste 3 a los dos lados: los marcadores siguieron juntos y quedó x = 8.' : `Probaste ${op2.filter(o => o !== 'both').map(o => ({oneL: 'sumar 3 sólo a la izquierda (se separaron)', bothM: 'restar 3 a los dos (siguieron juntos, pero no despejó)'}[o])).join(' y ')} antes de sumar 3 a los dos lados.`);
  const ps = first('pasa-sumando');
  if (ps) seen.push(ps.answer === 'both' ? '"Pasa sumando" quedó como abreviatura de sumar a los dos lados.' : 'Pensaste que "pasa sumando" era mudar el número o una regla sin explicación; es sumar a los dos lados, en corto.');
  if (first('substitute')) seen.push('Comprobaste la cuenta de memoria de Recta poniendo a Punto en el 8: no cumplía. Era x = 2.');
  const tz = first('times-zero-eq');
  if (tz) seen.push('Con el truco de multiplicar por cero, cualquier x parecía servir: por cero se pierde lo que decía la cuenta.');
  const sp = first('square-predict');
  if (sp) seen.push(sp.answer === '2' ? 'Anticipaste que x · x = 9 tiene dos soluciones: 3 y −3.' : 'Al elevar al cuadrado apareció el −3, que la cuenta de antes no tenía.');
  if (first('div-by-x')) seen.push('Dividiendo x · x = x por x se perdió el 0, que sí cumplía.');
  const io = all('ineq-op').map(e => e.op);
  if (io.length) seen.push(io[0] === 'flip' ? 'Al dividir −2 · x < 6 por −2 diste vuelta el signo: x > −3.' : 'Dividiste por −2 sin dar vuelta el signo y cambiaron las x que sirven; dando vuelta, x > −3.');
  const tr = first('two-step-result');
  if (tr) seen.push(`En 2 · x + 1 = 7 tu camino fue: ${tr.path.map(o => ({m1: 'restar 1', d2: 'dividir por 2', m7: 'restar 7'}[o])).join(', ')}. x = 3.`);
  const entry = {
    id: 'c6',
    title: 'Lo que no se ve',
    abbr: 'Una ecuación son dos miembros; resolver es buscar dónde coinciden, sin perder ni inventar soluciones.',
    body: [
      'Una incógnita es un número que está pero no se ve. Se le pone un nombre: x.',
      'Hacer lo mismo a los dos lados con algo que se puede deshacer (sumar, restar, multiplicar o dividir por un número que no sea cero) no cambia dónde coinciden. "Pasa sumando" abrevia eso: sumar a los dos lados y simplificar.',
      'Para comprobar, se pone el valor en la cuenta original. De memoria se puede pasar un número con el signo equivocado.',
      'Lo que no se deshace puede cambiar las soluciones: por cero aparecen todas; al cuadrado pueden aparecer de más (3 y −3); dividiendo por algo que puede valer cero se pueden perder (el 0 en x · x = x).',
      'En una desigualdad, multiplicar o dividir por un negativo da vuelta la recta: el signo se invierte.',
      'Se deshace en el orden contrario al que se armó, pero cualquier camino válido llega.',
      'Dato: al-Khwārizmī (Bagdad, hacia 820) llamó al-jabr a restituir lo que se resta sumándolo en los dos miembros, y al-muqābala a cancelar lo igual de los dos lados. De al-jabr viene "álgebra".',
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
