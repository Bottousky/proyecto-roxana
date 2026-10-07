// Capítulo 6 — Lo que no se ve (6.1 a 6.4): la caja cerrada, lo mismo a los dos lados,
// el que despeja de memoria y por cero.

import {Label} from '../engine/world.js';
import {YELLOW} from '../engine/chalk.js';
import {zip, hop, pulse, follow, rectSpot, wordSpot} from '../acting.js';
import {lin, eq, addBoth, addOne, mulBoth, passWrong, sameSolutions, solveLinear} from '../logic/equations.js';
import {GROUND, LINE, lx, BOX, SHOTS, base, box, cast, EqView, villager, item, signed} from './common.js';

/** Un renglón de la cuenta, a la izquierda de la recta (el estudiante lo escribe). */
export function derivLine(w, id, text, row, opts = {}) {
  const l = w.ensure(id, () => new Label(id, text, lx(LINE.from) + 20, GROUND - 400 + row * 44, {size: opts.size ?? 32, z: 9, reveal: opts.reveal ?? 1, ch: opts.ch}));
  l.text = text;
  return l;
}

export async function writeDeriv(d, g, id, text, row, opts = {}) {
  const s = g.world.get('student');
  const l = derivLine(g.world, id, text, row, {...opts, reveal: 0});
  l.reveal = 0;
  g.setCinematic(true);
  s.face(1);
  await d.walk(s, lx(LINE.from) - 40, GROUND, 260);
  s.setPose('write', 0.3);
  await d.draw(l, Math.min(1.4, 0.3 + text.length * 0.05), {key: 'reveal'});
  d.describe(`Escrito: ${text}`);
  s.setPose('idle', 0.4);
  g.setCinematic(false);
  return l;
}

/** Punto (x) va a la marca n. */
export async function moveX(d, g, view, n) {
  const p = g.world.get('punto');
  p.setMode('still');
  await hop(d, p, lx(n), GROUND - 26, {g, h: 50, dur: 0.35, sound: 'hop'});
  view.x = n;
  await d.wait(0.45);
}

/** Interacción: el jugador mueve a Punto hasta que se cumpla `done(view)`. Devuelve los intentos. */
export function placeX(d, g, view, {hint, done, after}) {
  const tries = [];
  return d.interact(ctl => new Promise(resolve => {
    let busy = false;
    g.setHint(() => hint);
    const refresh = () => {
      const spots = [];
      for (let n = LINE.from; n <= LINE.to; n++) {
        if (n === view.x) continue;
        spots.push(rectSpot(`x${n}`, `Poner a Punto, la x, en ${n === 0 ? 'cero' : signed(n)}`, {x: lx(n) - 18, y: GROUND - 34, w: 36, h: 84}, () => go(n)));
      }
      g.ui.setSpots(spots);
    };
    const go = async n => {
      if (busy || !ctl.alive()) return;
      busy = true;
      g.ui.setSpots([]);
      try {
        await moveX(d, g, view, n);
        tries.push(n);
        d.evidence('try-x', {x: n, match: view.match, holds: view.holds});
        if (after) await after(n);
      } catch { return; }
      busy = false;
      if (done(view)) { g.setHint(null); resolve(tries); } else refresh();
    };
    refresh();
  }));
}

// ——————————————————————————————————————————————
// 6.1 La caja cerrada
// ——————————————————————————————————————————————

export const caja = {
  id: 'c6.caja',
  title: 'La caja cerrada',
  setup(g) {
    const w = g.world;
    w.clear();
    base(g);
    w.removeWhere(o => /^(eqv-|d6-|c6-)/.test(o.id));
    cast(g);
    box(w);
    villager(w, 'curva', BOX.x - 270, 'curl', {facing: 0.6, scale: 0.92});
    g.camera.go(SHOTS.box);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    await d.shot(SHOTS.box, 1);
    d.describe('Mara, al lado de una caja cerrada.');
    await d.say('Mara', 'En esta caja guardé atados antes de la Marea. No me acuerdo cuántos, y no la quiero abrir a la intemperie.');
    await d.say('Mara', 'Lo que sí anoté: si saco tres, quedan cinco.');
    await d.think('Un número que está, pero no se ve.');
    // Punto se ofrece a ser ese número
    g.setCinematic(true);
    await d.shot(SHOTS.line, 1.2);
    d.describe('Punto salta sobre la recta larga y se sienta en el cero. Será el número de la caja: x.');
    p.setMode('still');
    await hop(d, p, lx(0), GROUND - 26, {g, h: 120, dur: 0.7, sound: 'hop'});
    g.setCinematic(false);
    await d.say('student', 'Punto, vos hacés de lo que hay en la caja. Mientras no lo sepamos, le decimos x.');
    await writeDeriv(d, g, 'd6-0', 'x − 3 = 5', 0);
    const view = new EqView(g, eq(lin(1, -3), lin(0, 5)), 0);
    await d.wait(0.6);
    d.describe('Sobre la recta, dos marcadores: el de abajo dice x − 3 y está en −3; el de arriba dice 5 y está en 5.');
    await d.think('Abajo, lo que da x − 3. Arriba, el 5. Tienen que caer en el mismo lugar.');
    const tries = await placeX(d, g, view, {
      hint: ['Mové a Punto: el marcador de x − 3 se mueve con él. El 5 se queda.', 'Cuando los dos marcadores caigan juntos, Punto está en el número de la caja.'],
      done: v => v.match,
    });
    d.evidence('solve-box', {tries: tries.length});
    await d.think(tries.length <= 2 ? 'Ocho: ocho menos tres, cinco.' : 'Ocho. Probando, probando: ocho menos tres, cinco.');
    // la caja confirma
    g.setCinematic(true);
    await d.shot(SHOTS.box, 0.9);
    d.describe('Mara abre la caja: adentro hay ocho atados.');
    box(w, true);
    g.audio.cue('found');
    for (let i = 0; i < 8; i++) {
      const o = item(w, 1, BOX.x - 48 + (i % 4) * 32, GROUND - 26 - Math.floor(i / 4) * 46, `c6-a${i}`);
      o.z = 7;
      o.progress = 0;
      await d.tween(0.12, q => { o.progress = q; });
    }
    g.setCinematic(false);
    await d.say('Mara', 'Ocho. Bien.');
    g.flags.c6box = true;
  },
};

// ——————————————————————————————————————————————
// 6.2 Lo mismo a los dos lados
// ——————————————————————————————————————————————

const OPS2 = [
  {id: 'oneL', text: 'Sumar 3 sólo al primer miembro, x − 3.', label: 'Sumarle 3 sólo al primer miembro'},
  {id: 'bothM', text: 'Restar 3 a los dos lados.', label: 'Restarle 3 a los dos lados'},
  {id: 'both', text: 'Sumar 3 a los dos lados.', label: 'Sumarle 3 a los dos lados'},
];

export const dosLados = {
  id: 'c6.dos-lados',
  title: 'Lo mismo a los dos lados',
  moment: 'Pasa sumando',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(eqv-|d6-|c6-)/.test(o.id));
    cast(g);
    box(w, true);
    villager(w, 'curva', BOX.x - 270, 'curl', {facing: 0.6, scale: 0.92});
    derivLine(w, 'd6-0', 'x − 3 = 5', 0);
    const p = w.get('punto');
    p.setMode('still');
    p.x = lx(8);
    p.y = GROUND - 26;
    g.camera.go(SHOTS.line);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const e0 = eq(lin(1, -3), lin(0, 5));
    const view = new EqView(g, e0, 8);
    await d.shot(SHOTS.line, 1);
    await d.say('Mara', 'Probando se encuentra. Pero si mañana son treinta cajas, me paso la vida moviendo a Punto.');
    await d.say('Curva', 'Mi abuela decía: "el 3 pasa sumando". Nunca supe adónde pasaba.');
    // elegir qué hacer con la ecuación: los marcadores muestran si siguen coincidiendo
    const ops = [...OPS2];
    let chosen;
    for (;;) {
      chosen = await d.choose(ops.map(o => ({id: o.id, text: o.text})), {prompt: '¿Qué le hacés a la cuenta? Después mirá si los dos marcadores siguen cayendo juntos con Punto en el 8.'});
      d.evidence('op2', {op: chosen});
      if (chosen === 'oneL') {
        view.set(addOne(e0, 'L', 3), {L: 'x − 3 + 3', R: '5'});
        await d.wait(1.2);
        d.describe('El marcador de la izquierda se corre tres lugares; el de la derecha se queda. Se separaron.');
        await d.think('Se separaron: con Punto en el 8 ya no cumple. Es otra cuenta, x = 5, con otra solución.');
      } else if (chosen === 'bothM') {
        view.set(addBoth(e0, -3), {L: 'x − 3 − 3', R: '5 − 3'});
        await d.wait(1.2);
        d.describe('Los dos marcadores se corren tres lugares a la izquierda, juntos.');
        await d.think('Siguen juntos… pero quedó x − 6 = 2. La x no quedó sola.');
      } else {
        view.set(addBoth(e0, 3), {L: 'x − 3 + 3', R: '5 + 3'});
        await d.wait(1.2);
        d.describe('Los dos marcadores se corren tres lugares a la derecha, juntos. Siguen cayendo en el mismo lugar.');
        await d.think('Siguen juntos: si a los dos les sumo lo mismo, siguen coincidiendo.');
        break;
      }
      view.set(e0);
      await d.wait(0.8);
      ops.splice(ops.findIndex(o => o.id === chosen), 1);
    }
    await writeDeriv(d, g, 'd6-1', 'x − 3 + 3 = 5 + 3', 1);
    await d.say('student', 'Ir tres para atrás y volver tres es quedarse en el lugar, para cualquier x. Queda x.');
    view.set(addBoth(e0, 3));
    await writeDeriv(d, g, 'd6-2', 'x = 5 + 3 = 8', 2);
    // ¿qué es "pasa sumando"?
    const c = await d.choose([
      {id: 'both', text: 'Sumar lo mismo a los dos lados, y simplificar.'},
      {id: 'move', text: 'Que el 3 se muda al otro lado.'},
      {id: 'rule', text: 'Una regla que no hay que entender.'},
    ], {prompt: 'Entonces, ¿qué quería decir "el 3 pasa sumando"?', evaluate: true});
    d.evidence('pasa-sumando', {answer: c});
    if (c !== 'both') {
      await d.say('student', c === 'move'
        ? 'No se muda: a los dos lados se les suma 3. A la izquierda se cancela y a la derecha queda. Parece que pasó.'
        : 'Se entiende: es sumar 3 a los dos lados, en corto. Si no, el día que lo usás mal, no te das cuenta.');
    }
    g.setCinematic(true);
    const ab = w.add(new Label('d6-ab', '"pasa sumando" = sumar a los dos lados', lx(LINE.from) + 20, GROUND - 270, {size: 24, z: 9, reveal: 0, ch: YELLOW}));
    await d.draw(ab, 0.8, {key: 'reveal', sound: false});
    g.setCinematic(false);
    await d.think('Sumar 3 se puede hacer con cualquier x: ninguna solución se pierde. Y se deshace restando 3: no aparece ninguna nueva. Por eso es la misma cuenta, escrita de otra forma.');
    await d.say('Curva', 'Ah. Así sí.');
    if (!replay) g.flags.c6both = true;
    view.dispose();
  },
};

// ——————————————————————————————————————————————
// 6.3 El que despeja de memoria
// ——————————————————————————————————————————————

export const memoria = {
  id: 'c6.memoria',
  title: 'El que despeja de memoria',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(eqv-|d6-|c6-)/.test(o.id));
    cast(g);
    villager(w, 'recta', lx(LINE.to) + 90, 'square', {facing: -0.6});
    const p = w.get('punto');
    p.setMode('still');
    p.x = lx(0);
    p.y = GROUND - 26;
    g.camera.go(SHOTS.line);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const e0 = eq(lin(1, 3), lin(0, 5));
    await d.shot(SHOTS.line, 1);
    await d.say('Recta', 'Yo tengo otra caja: si le agrego tres, son cinco. Eso lo resuelvo de memoria.');
    g.setCinematic(true);
    const r = w.get('recta');
    r.setPose('write', 0.3);
    derivLine(w, 'd6-r0', 'x + 3 = 5', 0).reveal = 0;
    await d.draw(w.get('d6-r0'), 0.6, {key: 'reveal'});
    const wrongLine = derivLine(w, 'd6-r1', 'x = 5 + 3 = 8', 1, {reveal: 0});
    await d.draw(wrongLine, 0.8, {key: 'reveal'});
    r.setPose('idle', 0.4);
    g.setCinematic(false);
    await d.say('Recta', 'El 3 pasa al otro lado. Ocho.');
    const how = await d.choose([
      {id: 'sub', text: 'Poner a Punto en el 8 en la cuenta de arriba.'},
      {id: 'trust', text: 'Creerle: lo hizo de memoria.'},
      {id: 'redo', text: 'Hacerla de memoria otra vez.'},
    ], {prompt: 'Recta dice que x es 8. ¿Cómo lo comprobás?', evaluate: true});
    d.evidence('check-how', {answer: how});
    if (how !== 'sub') await d.think(how === 'trust' ? 'Si me equivoco de memoria, de memoria no me doy cuenta. Mejor probar.' : 'De memoria otra vez da lo mismo, aunque esté mal. Mejor probar en la de arriba.');
    const view = new EqView(g, e0, 0);
    await d.wait(0.5);
    await placeX(d, g, view, {
      hint: ['Poné a Punto en el 8 y mirá si x + 3 cae donde el 5.'],
      done: v => v.x === 8,
    });
    await d.think('Con Punto en el 8, x + 3 da 11. No cae en el 5.');
    g.audio.punto('no');
    d.evidence('substitute', {x: 8, ok: false});
    // encontrar la x de verdad
    await placeX(d, g, view, {
      hint: ['¿Dónde tiene que estar Punto para que x + 3 caiga en el 5?'],
      done: v => v.match,
    });
    await d.think('Dos. Dos más tres, cinco.');
    const w2 = passWrong(e0, 3);
    d.evidence('pass-wrong', {wrong: solveLinear(w2), right: solveLinear(e0), same: sameSolutions(e0, w2)});
    await writeDeriv(d, g, 'd6-r2', 'x + 3 − 3 = 5 − 3', 2);
    await writeDeriv(d, g, 'd6-r3', 'x = 2', 3);
    await d.say('student', 'El 3 sumaba: para sacarlo, se resta a los dos lados. "Pasa restando" es eso.');
    await d.say('Recta', 'De memoria lo pasé con el signo que tenía. Y salió otra cuenta.');
    // la Marea se lleva lo que no se entendía; lo comprobado queda
    g.setCinematic(true);
    d.describe('Pasa una brisa de borrador: el renglón de memoria de Recta, "x = 5 + 3 = 8", se deshace. Los renglones comprobados quedan.');
    g.audio.erase(1.2, 0.5);
    g.camera.shake = 0.15;
    await d.fadeTo(wrongLine, 0, 1.2);
    w.remove('d6-r1');
    g.setCinematic(false);
    view.dispose();
    g.flags.c6memory = true;
  },
};

// ——————————————————————————————————————————————
// 6.4 Por cero
// ——————————————————————————————————————————————

export const porCero = {
  id: 'c6.por-cero',
  title: 'Por cero',
  setup(g) {
    const w = g.world;
    base(g);
    w.removeWhere(o => /^(eqv-|d6-|c6-)/.test(o.id));
    cast(g);
    box(w, true);
    villager(w, 'cuna', lx(LINE.to) + 90, 'tri', {facing: -0.6});
    const p = w.get('punto');
    p.setMode('still');
    p.x = lx(8);
    p.y = GROUND - 26;
    g.camera.go(SHOTS.line);
  },
  async play(d, g) {
    const w = g.world;
    const e0 = eq(lin(1, -3), lin(0, 5));
    const view = new EqView(g, e0, 8);
    derivLine(w, 'd6-z0', 'x − 3 = 5', 0);
    await d.shot(SHOTS.line, 1);
    await d.say('Cuña', 'Yo tengo un truco más rápido: multiplico los dos lados por cero. Me queda cero igual a cero, y listo.');
    g.setCinematic(true);
    const c = w.get('cuna');
    c.setPose('write', 0.3);
    const l1 = derivLine(w, 'd6-z1', '0 · (x − 3) = 0 · 5', 1, {reveal: 0});
    await d.draw(l1, 0.8, {key: 'reveal'});
    const l2 = derivLine(w, 'd6-z2', '0 = 0', 2, {reveal: 0});
    await d.draw(l2, 0.5, {key: 'reveal'});
    c.setPose('idle', 0.4);
    view.set(mulBoth(e0, 0), {L: '0 · (x − 3)', R: '0 · 5'});
    await d.wait(1.2);
    d.describe('Los dos marcadores caen en el cero.');
    g.setCinematic(false);
    await d.think('Los dos marcadores, en el cero. Y si muevo a Punto…');
    let moves = 0;
    await placeX(d, g, view, {
      hint: ['Mové a Punto a dos o tres lugares distintos y mirá los marcadores.'],
      done: () => ++moves >= 3,
    });
    await d.think('Con Punto en cualquier lado, siguen juntos en el cero. Con esta cuenta, cualquier caja serviría. En el 8 también siguen juntos: que el 8 siga sirviendo no alcanza, tampoco tienen que aparecer otras.');
    const ans = await d.choose([
      {id: 'lost', text: 'Por cero, todo cae en el mismo lugar: se perdió lo que decía la cuenta.'},
      {id: 'all', text: 'Entonces cualquier x es solución de verdad.'},
      {id: 'nothing', text: 'Multiplicar por cero no cambia nada.'},
    ], {prompt: '¿Qué hizo el truco de Cuña?', evaluate: true});
    d.evidence('times-zero-eq', {answer: ans, solutions: solveLinear(mulBoth(e0, 0)).kind});
    await d.say('Mara', ans === 'all' ? 'La caja tiene ocho. No cualquier cosa.' : ans === 'nothing' ? 'Cambió todo: antes servía sólo el 8; ahora, cualquier cosa.' : 'La caja tiene ocho. El truco dice que cualquier cosa.');
    await d.think('Desde 0 = 0 no se puede volver: por cero no se deshace. Y lo que no se deshace puede hacer aparecer soluciones que no estaban.');
    await d.say('student', 'Mara, x − 3 = 5 se cumple sólo con 8. Es una ecuación: pregunta qué x la cumplen. 0 · (x − 3) = 0 · 5 se cumple con cualquier x, como «ir tres para atrás y volver tres»: x − 3 + 3 = x. A una igualdad que vale para cualquier x se le dice identidad.');
    await writeDeriv(d, g, 'd6-z3', 'vale para cualquier x: identidad', 3, {size: 26, ch: YELLOW});
    await d.say('student', 'El truco de Cuña cambió una ecuación por una identidad. Por eso cualquier caja parecía servir.');
    view.dispose();
    g.flags.c6zero = true;
  },
};
