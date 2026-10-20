import { PUZZLES, initialPuzzleSnapshot, evaluatePuzzle, wireNodes, isPolarized, puzzleNetwork, pieceResistance } from './puzzle-model.js';
import { solveDC } from './electrical.js';

// When the player asks for help, a good tutor first looks at what they did. These diagnoses read the
// montage and its physics and name a concrete slip, as a question about it. Only slips the player
// caused count: whatever is already wrong when the bench opens is the puzzle itself, and the bench's
// fixed hints cover it. Each diagnosis has a stable key, so the same slip is not explained twice.

const name = c => c.label.replace(/\s*·\s*\d[\d,.]*\s*Ω/g, '').replace('Freno resistivo', 'Mando del cerrojo');
const portName = (p, id) => p.ports.find(n => n.id === id)?.label ?? id;
const BENCHES_OF_OWN_PATHS = new Set(['distribution', 'beacon_network']);

/** Terminals a finger can follow from `start` through copper and through parts that conduct, never through `skip`. */
function reachable(id, state, start, skip) {
  const p = PUZZLES[id];
  const links = [...state.wires, ...p.components.filter(c => c.id !== skip && (!c.switchKey || state.switches[c.switchKey]) && Number.isFinite(pieceResistance(id, c, state))).map(c => [c.a, c.b])];
  const seen = new Set([start]), queue = [start];
  while (queue.length) { const at = queue.shift(); for (const [a, b] of links) for (const [x, y] of [[a, b], [b, a]]) if (x === at && !seen.has(y)) { seen.add(y); queue.push(y); } }
  return seen;
}

/** The circuit's solution with one part taken out of it. */
function currentWithout(id, state, other) {
  const network = puzzleNetwork(id, state);
  network.resistors = network.resistors.map(r => r.id === other ? { ...r, enabled: false } : r);
  return solveDC(network);
}

/** The slips visible in this montage, most serious first. History (`ctx`) adds the ones only a sequence shows. */
export function benchSlips(id, state, result = evaluatePuzzle(id, state), ctx = {}) {
  const p = PUZZLES[id], slips = [], powered = state.sourceOn && !state.tripped && !result.overloaded;
  const { nodeOf } = wireNodes(id, state), goals = p.components.filter(c => c.goal);
  // Copper alone from + to −: nothing to cross, the protection trips.
  if (nodeOf.positive && nodeOf.positive === nodeOf.negative)
    slips.push({ kind: 'short', key: 'short', text: 'Tus cables dejan a «Fuente +» y «Retorno −» unidos por puro cobre. Seguí ese camino con el dedo: ¿qué pieza atraviesa la corriente antes de volver? Si no atraviesa ninguna, la mesa salta.' });
  // A cable across the very piece the goal is about: the current takes the copper instead.
  for (const c of goals) if (nodeOf[c.a] === nodeOf[c.b] && nodeOf.positive !== nodeOf.negative)
    slips.push({ kind: 'bypass', key: `bypass:${c.id}`, text: `Un cable tuyo une los dos lados de «${name(c)}». Si la corriente puede pasar por el cobre, ¿qué le queda para atravesar «${name(c)}»?` });
  if (powered) for (const c of goals) {
    const branch = result.solution.branches[c.id];
    if (isPolarized(c) && (branch?.voltage ?? 0) < -.1) {
      slips.push({ kind: 'reversed', key: `reversed:${c.id}`, text: `«${name(c)}» responde al revés. Desde «Fuente +», ¿por cuál de sus bornes entra ahora la corriente: «${portName(p, c.a)}» o «${portName(p, c.b)}»? ¿Por cuál debería entrar?` });
      continue;
    }
    if (Math.abs(branch?.current ?? 0) < .001 && nodeOf[c.a] !== nodeOf[c.b]) {
      const fromSource = reachable(id, state, 'positive', c.id), toReturn = reachable(id, state, 'negative', c.id);
      const through = (fromSource.has(c.a) && toReturn.has(c.b)) || (fromSource.has(c.b) && toReturn.has(c.a));
      if (through) continue;
      const fed = fromSource.has(c.a) || fromSource.has(c.b), back = toReturn.has(c.a) || toReturn.has(c.b);
      if (!fed && !back) slips.push({ kind: 'open', key: `open:${c.id}:both`, text: `«${name(c)}» quedó sin ida ni vuelta: ningún camino lo une a la fuente. ¿Qué cable lo uniría con «Fuente +»? ¿Y cuál con «Retorno −»?` });
      else if (!fed) slips.push({ kind: 'open', key: `open:${c.id}:ida`, text: `«${name(c)}» tiene vuelta, pero no ida. Seguí el cobre desde «Fuente +»: ¿hasta dónde llegás antes de quedarte sin camino?` });
      else slips.push({ kind: 'open', key: `open:${c.id}:vuelta`, text: `A «${name(c)}» le llega la corriente, pero desde ahí no tiene cómo volver a «Retorno −». ¿Por dónde podría volver?` });
    }
  }
  // Where each voice needs its own path, one voice must not return through another.
  if (powered && BENCHES_OF_OWN_PATHS.has(id)) for (const c of goals) for (const other of goals) {
    if (c === other) continue;
    const now = Math.abs(result.solution.branches[c.id]?.current ?? 0);
    if (now < .001) continue;
    const without = Math.abs(currentWithout(id, state, other.id).branches[c.id]?.current ?? 0);
    if (without < .1 * now) slips.push({ kind: 'dependent', key: `dependent:${c.id}:${other.id}`, text: `Para volver a la fuente, la corriente de «${name(c)}» atraviesa «${name(other)}». Si «${name(other)}» se apaga, ¿qué le pasa a «${name(c)}»?` });
  }
  // Both probes on the same copper: there can be no difference between them.
  const m = state.meter;
  if (ctx.measured && ['voltage', 'continuity'].includes(m?.mode) && m.a && m.b && m.a !== m.b && nodeOf[m.a] === nodeOf[m.b])
    slips.push({ kind: 'probe', key: `probe:${[m.a, m.b].sort().join('~')}`, text: m.mode === 'voltage'
      ? `Las dos puntas tocan el mismo cobre: entre «${portName(p, m.a)}» y «${portName(p, m.b)}» no puede haber diferencia. ¿Qué mostraría el instrumento a los dos lados de una pieza?`
      : `Entre «${portName(p, m.a)}» y «${portName(p, m.b)}» hay puro cobre: el camino está, siempre. Lo que conviene preguntar es si hay camino a través de una pieza: ¿dónde apoyarías las puntas?` });
  // The last turn of a knob moved a goal piece further from its point.
  const k = ctx.lastKnob && p.knobs?.find(x => x.key === ctx.lastKnob.key);
  if (powered && k && ctx.lastKnob.from !== state.values[k.key]) {
    const then = evaluatePuzzle(id, { ...state, values: { ...state.values, [k.key]: ctx.lastKnob.from } });
    for (const c of goals) {
      if (result.operating[c.id]) continue;
      const gap = r => { const v = Math.abs(r.solution.branches[c.id]?.voltage ?? 0); return v > c.goal.maxVoltage ? v - c.goal.maxVoltage : v < c.goal.minVoltage ? c.goal.minVoltage - v : 0; };
      if (gap(result) <= gap(then) + .05) continue;
      const braked = state.values[k.key] > ctx.lastKnob.from, strong = Math.abs(result.solution.branches[c.id]?.voltage ?? 0) > c.goal.maxVoltage;
      slips.push({ kind: 'knob', key: `knob:${k.key}:${c.id}:${braked ? 'more' : 'less'}`, text: braked
        ? `Tu último cambio en «${name(k)}» frenó más, y a «${name(c)}» le llega todavía menos fuerza. ¿Qué pasaría si frenaras menos?`
        : `Tu último cambio en «${name(k)}» frenó menos, y «${name(c)}» ${strong ? 'recibe todavía más fuerza de la que conviene' : 'se alejó de su punto'}. ¿Qué pasaría si frenaras más?` });
      break;
    }
  }
  // The same cable laid and taken back again and again: trying without a question.
  for (const [wire, count] of Object.entries(ctx.toggles ?? {})) if (count >= 4) {
    const [a, b] = wire.split('~');
    slips.push({ kind: 'repeat', key: `repeat:${wire}`, text: `Ya pusiste y sacaste el cable entre «${portName(p, a)}» y «${portName(p, b)}» varias veces. Antes de tenderlo otra vez: ¿qué esperás que cambie?` });
  }
  return slips;
}

const openingSlips = new Map();
/** The slip to talk about now, if the player caused one: nothing that was already wrong at the start, nothing said already. */
export function diagnoseBench(id, state, result, ctx = {}, said = []) {
  if (result?.solved) return null;
  if (!openingSlips.has(id)) openingSlips.set(id, new Set(benchSlips(id, initialPuzzleSnapshot(id)).map(s => s.key)));
  const opening = openingSlips.get(id);
  return benchSlips(id, state, result, ctx).find(s => !opening.has(s.key) && !said.includes(s.key)) ?? null;
}
