import { measureVoltage, measureResistance } from './electrical.js';
import { PUZZLES, initialPuzzleSnapshot, normalizePuzzleSnapshot, puzzleNetwork, evaluatePuzzle, wireNodes, wireRole, wireFlow, isSealed, cablesInHand, canJoin } from './puzzle-model.js';
import { appendBenchEvidence, getBenchEvidence } from './bench-evidence.js';
export { PUZZLES, initialPuzzleSnapshot, normalizePuzzleSnapshot, puzzleNetwork, evaluatePuzzle, getBenchEvidence };
import './puzzles.css';

// The mechanism comes first. Instruments are optional, and each encounter
// introduces just one way of looking before offering previously used tools.
export const BENCH_GUIDANCE = {
  awaken: { subtitle: 'Un cable ya sale de la celda hacia Ohm. Tenés otro en la mano.', tools: [], question: 'Escuchar a Edda', voice: 'EDDA, A TU LADO', hints: ['Ese cable sale de la celda y llega a Ohm. ¿Y después? Para volver, la energía necesita otro camino.', 'Tiene dos piezas redondas de cada lado: una ya está ocupada. La otra quedó sola.', 'Si unís las dos piezas de la celda entre sí, se oye un clic: el camino no pasa por Ohm. No se rompe nada.', 'Un paso para probar: tocá «Ohm −» y después «Celda −»: ese es el camino de vuelta.'] },
  workshop: { subtitle: 'Tres tramos de tela, iguales por fuera. Uno está cortado por dentro.', tools: ['continuity'], question: 'Pedir una observación', voice: 'OHM, A TU LADO', hints: ['Por fuera los tres tramos son iguales. Mirarlos no alcanza: hay que preguntarle al cobre.', 'La prueba de camino dice si hay paso entre dos piezas redondas. Funciona con la mesa apagada.', 'Podés probar un tramo por vez, apoyando las puntas en sus dos extremos. Dos van a tener camino; uno, no.', 'Un paso para probar: apagá, elegí “Comprobar el camino” y apoyá las puntas en los extremos de cada tramo. donde diga “Sin camino”, volvé a “Mover cables” y tendé tu cable entre esos dos extremos.'] },
  gate: { subtitle: 'El cerrojo golpea hacia el lado equivocado.', tools: ['voltage', 'continuity'], question: 'Pedir una observación', voice: 'OHM, A TU LADO', hints: ['El encargo tiene dos partes: hacia dónde empuja y con cuánta fuerza. Conviene resolverlas por separado.', 'El freno cambia la fuerza, nunca el sentido. El sentido depende de por dónde entra la corriente a la bobina.', 'Si la corriente entra por «Avance −», empuja al revés. Invertí los dos cables de la bobina.', 'Un paso para probar: apagá, retirá los dos cables que llegan a la bobina y uní «Freno B» con «Avance +» y «Avance −» con «Retorno −». Encendé y girá el freno de a una posición hasta que el cerrojo ni tiemble ni golpee.'] },
  pump: { subtitle: 'La rueda gira con fuerza. El agua apenas sale.', tools: ['voltage', 'continuity'], question: 'Pedir una observación', voice: 'OHM, A TU LADO', hints: ['Los tres empalmes conducen: la prueba de camino dice que sí en los tres. La pérdida es otra cosa.', 'Con la bomba trabajando, un empalme sano apenas se nota; uno malo se come parte de la fuerza. Y se entibia.', 'Compará los dos extremos de cada empalme con la mesa encendida. Donde haya una diferencia grande, ahí se pierde.', 'Un paso para probar: encendé, elegí “Comparar dos puntos” y apoyá las puntas en los extremos de cada empalme. En el que muestre diferencia, apagá y tendé tu cable entre sus dos extremos.'] },
  distribution: { subtitle: 'Enfermería y cocina comparten un solo camino: las dos brillan a medias.', tools: ['current', 'voltage', 'continuity'], question: 'Pedir una observación', voice: 'OHM, A TU LADO', hints: ['Seguí el camino con el dedo: para volver a la fuente, la enfermería atraviesa la cocina.', 'Si la cocina se aísla, ¿qué le pasa a la enfermería? Ivara va a probar exactamente eso.', 'Cada luz necesita su propia ida desde «Fuente +» y su propia vuelta a «Retorno −».', 'Un paso para probar: apagá, retirá el cable entre «Enfermería −» y «Cocina +». Uní «Enfermería −» con «Retorno −» y «Fuente +» con «Cocina +». Después aislá la cocina para que Ivara lo vea.'] },
  irrigation: { subtitle: 'Horno, raíces y riego tiran del mismo cable de la ladera.', tools: ['current', 'voltage', 'continuity'], question: 'Pedir una observación', voice: 'OHM, A TU LADO', hints: ['Cada freno cuida una sola cosa. El cable de la ladera, en cambio, lo sienten los tres.', 'Podés dejar las raíces y el riego en su punto primero; el encargo te marca cuándo lo están.', 'Si el cable sigue caliente con raíces y riego en su punto, el que tiene que ceder es el horno.', 'Un paso para probar: llevá el freno del calor y el del agua a la posición 3. Después frená el horno hasta que el cable deje de calentarse: posición 2 deja a Yesca fuerte; la 3, más suave. Las dos sirven.'] },
  beacon_supply: { subtitle: 'El núcleo pide más fuerza, pero el tendido norte ya se calienta.', tools: ['voltage', 'current', 'continuity'], question: 'Pedir una observación', voice: 'OHM, A TU LADO', hints: ['Aflojar el regulador le da fuerza al núcleo, pero toda esa corriente pasa por el tendido norte.', 'Con un solo tendido no hay posición buena: o el núcleo queda débil o el cobre se calienta.', 'Dos tendidos lado a lado se reparten la corriente: cada uno lleva la mitad.', 'Un paso para probar: apagá. Junto al generador, uní «Fuente +» con «Tendido sur · A»; junto al núcleo, «Tendido sur · B» con «Regulador A». Encendé y aflojá el regulador hasta que el núcleo sostenga su pulso.'] },
  beacon_network: { subtitle: 'Luz, giro y campana, encadenadas: ninguna recibe lo que necesita.', tools: ['current', 'voltage', 'continuity'], question: 'Pedir una observación', voice: 'OHM, A TU LADO', hints: ['Seguí los caminos: la corriente de la campana atraviesa la luz y el giro antes de volver.', 'En el Castillo, cada luz tuvo su propio camino. Acá son tres.', 'Cada voz necesita ida desde «Fuente +» y vuelta a «Retorno −», sin pasar por las otras.', 'Un paso para probar: apagá y retirá los dos cables que pasan de un receptor al siguiente. Con tus cuatro cables uní «Óptica −» y «Giro −» con «Retorno −», y «Fuente +» con «Giro +» y con «Señales +».'] },
  beacon_lens: { subtitle: 'La lente toma la fuerza entera de la fuente y encandila.', tools: ['voltage', 'current', 'continuity'], question: 'Pedir una observación', voice: 'OHM, A TU LADO', hints: ['La lente está unida directo a «Fuente +». El divisor está listo, pero nadie toma de su toma intermedia.', 'Nereo quiere dos lecturas de la toma: una sin la lente y otra con la lente conectada.', 'Con la lente conectada, la toma baja. Por eso el freno se calibra con la lente puesta, no antes.', 'Un paso para probar: encendé y compará «Toma intermedia» con «Retorno −». Apagá, mové el cable de la lente de «Fuente +» a la «Toma intermedia», encendé y volvé a comparar. Después girá el freno hasta que la luz sea dorada.'] },
};

const simpleLabel = label => label.replace(/\s*·\s*\d[\d,.]*\s*Ω/g, '').replace('Freno resistivo', 'Mando del cerrojo');
const TOOL_NAMES = { wire: 'Mover cables', continuity: 'Comprobar el camino', voltage: 'Comparar dos puntos', current: 'Medir un camino' };

// These observations describe the solved physical state, not proximity to a
// memorized answer. They remain useful for unexpected but valid experiments.
export function observePuzzle(id, state, result = evaluatePuzzle(id, state)) {
  const p = PUZZLES[id];
  if (state.tripped || result.overloaded) return [{ label: 'Se oyó un clic', text: 'La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió.' }];
  if (!state.sourceOn) return [{ label: 'La mesa está en silencio', text: 'La alimentación está apagada. Podés revisar los cables o comprobar si hay camino.' }];
  const observations = p.components.filter(c => c.goal).map(c => {
    const branch = result.solution.branches[c.id];
    const magnitude = Math.abs(branch?.voltage ?? 0);
    const reverse = !['lamp', 'heater', 'forge'].includes(c.kind) && (branch?.voltage ?? 0) < -.1;
    const strong = magnitude > c.goal.maxVoltage || Math.abs(branch?.current ?? 0) > c.goal.maxCurrent || (branch?.power ?? 0) > (c.goal.maxPower ?? Infinity);
    // Close to the working band, the description says so: a knob sweep should feel like progress.
    const nearLow = !strong && magnitude >= .8 * c.goal.minVoltage;
    const nearHigh = strong && magnitude <= 1.12 * c.goal.maxVoltage && Math.abs(branch?.current ?? 0) <= 1.12 * c.goal.maxCurrent && (branch?.power ?? 0) <= (c.goal.maxPower ?? Infinity);
    let text;
    if (result.operating[c.id]) text = ({ orb: 'Una luz tibia late bajo el vidrio. El ojo se abre.', lamp: 'La luz se sostiene, clara y pareja.', motor: 'Gira sin golpes. El agua sale pareja.', heater: 'El lecho está tibio. Las hojas vuelven a abrirse.', lens: 'La luz es dorada y se sostiene. Ya no encandila.', coil: id === 'gate' ? 'El cerrojo avanza sin golpear y deja libre el paso.' : 'El pulso se sostiene sin sacudidas.' })[c.kind];
    else if (reverse) text = c.kind === 'coil' ? 'Se mueve hacia atrás, contra la marca de avance.' : 'Responde en el sentido contrario al marcado.';
    else if (magnitude < .1 || Math.abs(branch?.current ?? 0) < .001) text = c.kind === 'orb' ? 'El ojo sigue cerrado. Bajo el vidrio no hay latido.' : 'No responde. Todo permanece quieto.';
    else if (nearHigh) text = ({ lamp: 'La luz es un poco más blanca de lo que conviene.', motor: 'Gira un poco apurada; el agua sale con algo de fuerza de más.', heater: 'El lecho está algo más caliente de lo necesario.', lens: 'La luz es un poco dura; casi dorada.', coil: 'Empuja un poco de más.', orb: 'El latido es un poco brusco.' })[c.kind];
    else if (nearLow) text = ({ lamp: 'La luz ya se sostiene, pero todavía le falta un poco.', motor: 'Casi alcanza: el agua sale, aunque sin fuerza pareja.', heater: 'El lecho empieza a entibiarse; todavía le falta.', lens: 'La luz asoma dorada, todavía tenue.', coil: 'Casi se sostiene; le falta un poco de fuerza.', orb: 'El latido está por aparecer.' })[c.kind];
    else if (strong) text = ({ lamp: 'La luz es demasiado blanca. El vidrio se calienta.', motor: 'Gira a los golpes. El agua sale demasiado fuerte.', heater: 'El lecho está caliente. Las hojas se encogen.', lens: 'La luz blanca encandila; el cristal se calienta.', coil: 'Golpea con fuerza. El metal empieza a calentarse.', orb: 'El brillo es brusco; todavía no encuentra un latido parejo.' })[c.kind];
    else text = ({ lamp: 'Hay un brillo débil. Apenas ilumina.', motor: 'Se esfuerza, pero apenas mueve el agua.', heater: 'El lecho sigue frío. Las hojas están caídas.', lens: 'La luz apenas atraviesa el cristal.', coil: 'Tiembla, pero no consigue sostener el movimiento.', orb: 'Algo tiembla bajo el vidrio. Todavía no despierta.' })[c.kind];
    if (c.kind === 'forge') text = result.operating[c.id] ? (Math.abs(branch?.power ?? 0) >= 11.5 ? 'El horno ruge parejo. Yesca puede forjar a tandas grandes.' : 'El horno sostiene un calor más bajo. Yesca puede trabajar, más despacio.') : magnitude < .1 ? 'El horno está frío. Así no hay azadas.' : 'El horno apenas entibia el hierro. Así Yesca no puede trabajar.';
    if (id === 'beacon_network' && c.kind === 'motor') text = result.operating[c.id] ? 'La cúpula gira sin detenerse.' : strong ? 'La cúpula gira a los golpes.' : nearLow ? 'La cúpula casi completa sus vueltas.' : 'La cúpula apenas consigue moverse.';
    return { label: simpleLabel(c.label), text };
  });
  // Something along the line warms while the pump works; which joint, the instrument has to say.
  if (p.components.some(c => c.kind === 'joint' && (result.solution.branches[c.id]?.power ?? 0) > 1)) observations.push({ label: 'La línea', text: 'Algo del camino se entibia mientras la bomba trabaja. Al tacto no se sabe bien dónde.' });
  for (const constraint of p.constraints ?? []) {
    if (constraint.source) { if ((result.requestedCurrent ?? 0) > constraint.maxCurrent) observations.push({ label: 'El tendido de la ladera', text: 'El cable de la ladera se calienta: horno, raíces y riego piden más de lo que la línea sostiene. Alguien tiene que ceder.' }); continue; }
    const branch = result.solution.branches[constraint.branch];
    if (constraint.maxPower !== undefined && (branch?.power ?? 0) > constraint.maxPower) observations.push({ label: simpleLabel(p.components.find(c => c.id === constraint.branch)?.label ?? 'El tendido'), text: 'El cobre se está calentando demasiado. Así no puede sostenerse.' });
    // A lens fed without the lower arm drifts with its own heat: the divider holds the tap steadier.
    if (constraint.minCurrent !== undefined && Math.abs(branch?.current ?? 0) < constraint.minCurrent) observations.push({ label: 'El divisor', text: 'El brazo inferior quedó fuera del camino. Así la luz depende sólo del cristal: cuando se calienta y cambia, la luz cambia con él. Con los dos brazos trabajando, la toma se sostiene más firme.' });
  }
  return observations;
}

const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n, decimals = 2) => Number.isFinite(n) ? (Math.abs(n) < .5 * 10 ** -decimals ? 0 : n).toLocaleString('es-AR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) : '—';
const copy = value => JSON.parse(JSON.stringify(value));
// Leads to the source follow its terminals; other wires alternate two neutral tones.
const wireTone = (w, i) => { const role = wireRole(w); return role === 'link' ? `wire-link-${i % 2}` : `wire-${role}`; };

export class PuzzleWorkbench {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.state = null;
    this.active = false;
    this.mode = 'wire';
    this.selected = null;
    this.history = [];
    this.handleClick = this.handleClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleSliderCommit = this.handleSliderCommit.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.handleTrace = this.handleTrace.bind(this);
    this.handleTraceEnd = this.handleTraceEnd.bind(this);
  }

  open(id, savedSnapshot) {
    if (this.active) this.close(false);
    this.previousFocus = document.activeElement;
    this.id = id;
    this.puzzle = PUZZLES[id];
    this.state = normalizePuzzleSnapshot(id, savedSnapshot);
    this.practice = null;
    this.proofReadings = {};
    this.active = true;
    this.mode = 'wire';
    this.selected = null;
    this.history = [];
    this.feedback = '';
    this.blockedBySupply = false;
    this.pendingTest = false;
    this.showNumbers = false;
    this.reading = '';
    this.shell = document.createElement('section');
    this.shell.className = 'workbench-overlay';
    this.shell.setAttribute('role', 'dialog');
    this.shell.setAttribute('aria-modal', 'true');
    this.shell.setAttribute('aria-label', this.puzzle.title);
    this.container.appendChild(this.shell);
    this.shell.addEventListener('click', this.handleClick);
    this.shell.addEventListener('input', this.handleInput);
    this.shell.addEventListener('change', this.handleSliderCommit);
    this.shell.addEventListener('pointerover', this.handleTrace);
    this.shell.addEventListener('focusin', this.handleTrace);
    this.shell.addEventListener('pointerout', this.handleTraceEnd);
    this.shell.addEventListener('focusout', this.handleTraceEnd);
    document.addEventListener('keydown', this.handleKey, true);
    this.evaluate(false);
    if (!this.state.evidence.length) this.recordObservation('observation');
    this.render();
    this.shell.querySelector('[data-action="close"]')?.focus({ preventScroll: true });
    this.callbacks.onChange?.(id, copy(this.state));
    this.callbacks.onSound?.('open');
  }

  // Leaving keeps the montage as it is; only an explicit decision puts it into service.
  close(notify = true, { commission = false } = {}) {
    if (!this.active) return;
    if (this.practice) this.endPractice();
    if (notify && commission && !this.state.completed && evaluatePuzzle(this.id, this.state).commissionable) {
      this.state.completed = true;
      appendBenchEvidence(this.state, { kind: 'result', text: 'Dejé la instalación funcionando con este montaje.' });
      this.callbacks.onSound?.('solve');
      this.callbacks.onSolve?.(this.id, { snapshot: copy(this.state), voltage: this.result.voltage, current: this.result.current, power: this.result.power, lesson: this.puzzle.lesson });
      this.callbacks.onChange?.(this.id, copy(this.state));
    }
    this.active = false;
    document.removeEventListener('keydown', this.handleKey, true);
    this.shell.remove();
    this.shell = null;
    this.previousFocus?.focus?.({ preventScroll: true });
    if (notify) this.callbacks.onClose?.();
  }

  // Practice works on a copy: the installation in service is never touched, and what the
  // player tried is kept in the real bench's evidence when the practice ends.
  startPractice() {
    this.practice = { state: copy(this.state), callbacks: this.callbacks };
    this.callbacks = { ...this.callbacks, onChange: null, onSolve: null };
    this.state = { ...copy(this.state), completed: false, sourceOn: false, tripped: false };
    this.history = []; this.mode = 'wire'; this.feedback = 'Práctica: nada de esto cambia la instalación en servicio.';
    appendBenchEvidence(this.state, { kind: 'observation', text: 'Empecé a practicar con una copia del montaje.' });
    this.evaluate(false); this.render();
  }
  endPractice() {
    const { state, callbacks } = this.practice, evidence = this.state.evidence;
    this.practice = null; this.callbacks = callbacks; this.state = state; this.state.evidence = evidence;
    appendBenchEvidence(this.state, { kind: 'observation', text: 'Terminé la práctica. La instalación siguió en servicio con su montaje.' });
    this.history = []; this.mode = 'wire'; this.feedback = '';
    this.evaluate(false); this.callbacks.onChange?.(this.id, copy(this.state));
  }

  evaluate(notify = true) {
    this.result = evaluatePuzzle(this.id, this.state);
    if (this.result.overloaded) {
      this.state.tripped = true;
      this.feedback = 'Se oyó un clic: la protección cortó la alimentación porque pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió: cambiá el montaje y volvé a encender.';
      this.callbacks.onSound?.('error');
      this.result = evaluatePuzzle(this.id, this.state);
    }
    const proof = this.puzzle.proof;
    if (proof && this.result.proofMet && !this.state.proofs?.[proof.id] && !this.practice) {
      (this.state.proofs ??= {})[proof.id] = true;
      appendBenchEvidence(this.state, { kind: 'result', text: proof.recorded });
      this.feedback = `${proof.recorded} ${proof.who} lo vio.`;
      if (notify) this.callbacks.onSound?.('success');
    }
    if (notify && this.result.solved && !this.wasOperating && !this.state.completed) this.callbacks.onSound?.('success');
    this.wasOperating = this.result.solved;
  }

  change(mutate, { history = true, sound = 'click' } = {}) {
    const before = copy(this.state);
    if (history) { this.history.push(copy(this.state)); if (this.history.length > 40) this.history.shift(); }
    mutate(this.state);
    this.callbacks.onSound?.(sound);
    this.evaluate();
    this.recordChanges(before);
    this.recordMeasurement();
    this.callbacks.onChange?.(this.id, copy(this.state));
    this.render();
  }

  recordObservation(kind = 'result') {
    appendBenchEvidence(this.state, { kind, text: observePuzzle(this.id, this.state, this.result).map(o => `${o.label}: ${o.text}`).join(' ') });
  }

  recordChanges(before) {
    const s = this.state;
    let changed = false;
    const note = text => { changed = true; appendBenchEvidence(s, { kind: 'intervention', text }); };
    const sameWire = (a, b) => a.length === b.length && a.every(n => b.includes(n));
    for (const wire of before.wires) if (!s.wires.some(w => sameWire(w, wire))) note(`Retiré el cable entre ${this.portLabel(wire[0])} y ${this.portLabel(wire[1])}.`);
    for (const wire of s.wires) if (!before.wires.some(w => sameWire(w, wire))) note(`Uní ${this.portLabel(wire[0])} con ${this.portLabel(wire[1])}.`);
    for (const knob of this.puzzle.knobs ?? []) if (s.trace?.[knob.key]) { const t = s.trace[knob.key], v = s.values[knob.key]; t.min = Math.min(t.min, v); t.max = Math.max(t.max, v); }
    for (const knob of this.puzzle.knobs ?? []) if (before.values[knob.key] !== s.values[knob.key]) {
      const position = value => Math.round((value - knob.min) / knob.step) + 1;
      note(`${simpleLabel(knob.label)}: pasé de la posición ${position(before.values[knob.key])} a la ${position(s.values[knob.key])}.`);
    }
    for (const sw of this.puzzle.switches ?? []) if (before.switches[sw.key] !== s.switches[sw.key]) note(`${s.switches[sw.key] ? 'Conecté' : 'Aislé'} ${simpleLabel(sw.label)}.`);
    if (before.sourceOn !== s.sourceOn || (before.tripped && !s.tripped)) note(s.sourceOn ? 'Encendí la alimentación para probar el montaje.' : 'Apagué la alimentación.');
    if (changed || (!before.tripped && s.tripped)) this.recordObservation();
  }

  recordMeasurement() {
    const m = this.state.meter;
    if (this.mode === 'wire' || (this.mode === 'current' ? !m.branch : !m.a || !m.b)) return;
    const reading = this.presentedReading();
    const blocked = this.mode === 'continuity' && this.state.sourceOn && !this.state.tripped;
    const reference = this.mode === 'current'
      ? `Medidor en serie con ${simpleLabel(this.puzzle.components.find(c => c.id === m.branch)?.label ?? '')}; sentido ${this.portLabel(this.puzzle.components.find(c => c.id === m.branch)?.a)} → ${this.portLabel(this.puzzle.components.find(c => c.id === m.branch)?.b)}.`
      : `Punta roja: ${this.portLabel(m.a)}; punta negra: ${this.portLabel(m.b)}.`;
    appendBenchEvidence(this.state, { kind: blocked ? 'observation' : 'measurement', text: blocked ? 'La prueba de continuidad quedó pendiente: la alimentación estaba encendida.' : TOOL_NAMES[this.mode], value: `${reading.value}${reading.unit ? ` ${reading.unit}` : ''}`, reference: `${reference} Alimentación ${this.state.sourceOn && !this.state.tripped ? 'encendida' : 'apagada'}.` });
    if (!blocked) this.recordProofMeasurement(reading);
  }

  // A measured proof: the same two points read once unloaded and once loaded,
  // or a single reading across the faulty part (no path with the bench off; a drop under load).
  recordProofMeasurement(reading) {
    const asked = this.puzzle.proof, m = this.state.meter;
    if (asked && !this.practice && !this.state.proofs?.[asked.id] && m.a && m.b && (asked.continuityOpen || asked.voltageAcross)) {
      const { nodeOf } = wireNodes(this.id, this.state), ends = (asked.continuityOpen ?? asked.voltageAcross).map(n => nodeOf[n]), probe = [nodeOf[m.a], nodeOf[m.b]];
      const across = ends[0] !== ends[1] && probe.includes(ends[0]) && probe.includes(ends[1]), powered = this.state.sourceOn && !this.state.tripped;
      const shown = asked.continuityOpen ? this.mode === 'continuity' && !powered && measureResistance(puzzleNetwork(this.id, this.state, false), m.a, m.b) === Infinity
        : this.mode === 'voltage' && powered && Math.abs(measureVoltage(this.result.solution, m.a, m.b) ?? 0) >= asked.minVoltage;
      if (across && shown) { (this.state.proofs ??= {})[asked.id] = true; appendBenchEvidence(this.state, { kind: 'result', text: asked.recorded }); this.feedback = `${asked.recorded} ${asked.who} lo vio.`; this.callbacks.onSound?.('success'); this.result = evaluatePuzzle(this.id, this.state); }
      return;
    }
    const proof = this.puzzle.proof?.measure && this.puzzle.proof;
    if (!proof || this.practice || this.mode !== 'voltage' || !m.a || !m.b || !this.state.sourceOn || this.state.tripped) return;
    const { nodeOf } = wireNodes(this.id, this.state), [x, y] = proof.measure.between.map(n => nodeOf[n]), probe = [nodeOf[m.a], nodeOf[m.b]];
    if (x === y || !probe.includes(x) || !probe.includes(y)) return;
    const loaded = nodeOf[proof.measure.load[0]] === nodeOf[proof.measure.load[1]], proofs = this.state.proofs ??= {};
    const volts = Math.abs(measureVoltage(this.result.solution, m.a, m.b) ?? 0), key = loaded ? 'tapLoaded' : 'tapUnloaded';
    proofs[key] = true; (this.proofReadings ??= {})[key] = { volts, values: JSON.stringify(this.state.values) };
    if (!proofs[proof.id] && proof.parts.every(k => proofs[k])) {
      // Say only what these two readings show: a drop, no change, or a comparison made after recalibrating.
      const u = this.proofReadings.tapUnloaded, l = this.proofReadings.tapLoaded, fmt = v => `${v.toFixed(2).replace('.', ',')} V`;
      const text = !u || !l ? proof.recorded
        : u.values !== l.values ? `Medí la toma sin la lente (${fmt(u.volts)}) y con la lente, después de mover el mando (${fmt(l.volts)}). Con el mismo ajuste todavía no las comparé.`
        : l.volts < u.volts - .05 ? `Medí la toma sin la lente (${fmt(u.volts)}) y con la lente (${fmt(l.volts)}): al cargarla, la tensión baja.`
        : `Medí la toma sin la lente (${fmt(u.volts)}) y con la lente (${fmt(l.volts)}): no cambió.`;
      proofs[proof.id] = true; appendBenchEvidence(this.state, { kind: 'result', text }); this.feedback = `${text} ${proof.who} lo anota.`; this.callbacks.onSound?.('success'); this.result = evaluatePuzzle(this.id, this.state);
    }
  }

  requireIsolated() {
    if (this.id === 'awaken' || !this.state.sourceOn || this.state.tripped) return true;
    this.blockedBySupply = true;
    this.feedback = 'Primero apagá la alimentación. Después podés cambiar los cables y encender para probar.';
    appendBenchEvidence(this.state, { kind: 'observation', text: 'Dejé pendiente un cambio de conexión para apagar primero la alimentación.' });
    this.callbacks.onChange?.(this.id, copy(this.state));
    this.render();
    return false;
  }

  handleKey(event) {
    if (!this.active) return;
    // The world must never receive movement/interaction keys through the bench.
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); if (this.selected) { this.selected = null; this.render(); } else this.close(); }
    if (event.key === 'Tab') {
      const focusables = [...this.shell.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), summary')].filter(el => el.getClientRects().length);
      const first = focusables[0], last = focusables.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }

  handleInput(event) {
    const target = event.target;
    if (!target.dataset.knob || this.state.completed) return;
    const focusKey = target.dataset.knob;
    const value = Number(target.value);
    if (!this.sliderStart) this.sliderStart = copy(this.state);
    this.state.values[focusKey] = value;
    const t = this.state.trace?.[focusKey]; if (t) { t.min = Math.min(t.min, value); t.max = Math.max(t.max, value); }
    this.evaluate(false);
    this.callbacks.onChange?.(this.id, copy(this.state));
    const knob = this.puzzle.knobs.find(k => k.key === focusKey);
    const control = target.closest('.wb-dial-control');
    control.querySelector('output').innerHTML = this.knobValue(knob);
    control.querySelector('.wb-dial').style.setProperty('--angle', `${-135+(value-knob.min)/(knob.max-knob.min)*270}deg`);
    // Keep the active range input mounted throughout a drag. Rebuild the rest of
    // the instrument on release (keyboard arrows also dispatch change).
  }

  handleSliderCommit(event) {
    if (event.target.dataset.meterBranch !== undefined) {
      if (!this.requireIsolated()) return;
      this.change(s => { s.meter.mode = 'current'; s.meter.branch = event.target.value || null; }, { history: false, sound: 'meter' });
      return;
    }
    if (!event.target.dataset.knob || this.state.completed) return;
    const key = event.target.dataset.knob;
    if (this.sliderStart) { this.history.push(this.sliderStart); this.recordChanges(this.sliderStart); this.sliderStart = null; }
    this.evaluate();
    this.recordMeasurement();
    this.callbacks.onChange?.(this.id, copy(this.state));
    this.callbacks.onSound?.('dial');
    this.render();
    [...this.shell.querySelectorAll(`[data-knob="${key}"]`)].find(el => el.getClientRects().length)?.focus({ preventScroll: true });
  }

  handleClick(event) {
    const el = event.target.closest('[data-action], [data-port], [data-terminal], [data-wire], [data-branch]');
    if (!el) return;
    const physicallyChanges = el.dataset.wire !== undefined || ['power','rearm','switch','knob','undo','reset'].includes(el.dataset.action) || ((el.dataset.port || el.dataset.terminal) && this.mode === 'wire');
    if (this.state.completed && physicallyChanges) { this.feedback = 'La instalación está en servicio. Podés medirla, o practicar con una copia para cambiar el montaje.'; this.render(); return; }
    if (el.dataset.port) return this.touchPort(el.dataset.port);
    if (el.dataset.terminal) return this.touchPort(el.dataset.terminal);
    if (el.dataset.wire !== undefined) {
      const i = Number(el.dataset.wire);
      if (this.mode !== 'wire' && el.tagName.toLowerCase() !== 'button') return;
      if (isSealed(this.id, this.state.wires[i])) { this.feedback = 'Ese cable está soldado: es parte de la instalación. Trabajá con los cables que tenés en la mano.'; this.callbacks.onSound?.('error'); this.render(); return; }
      if (!this.requireIsolated()) return;
      this.feedback = 'Cable retirado: vuelve a tu mano.';
      this.pendingTest = !this.state.sourceOn;
      return this.change(s => { s.wires.splice(i, 1); }, { sound: 'disconnect' });
    }
    if (el.dataset.branch) {
      if (this.mode !== 'current') return;
      if (!this.requireIsolated()) return;
      this.mode = 'current';
      this.change(s => { s.meter.mode = 'current'; s.meter.branch = el.dataset.branch; s.meter.a = null; s.meter.b = null; }, { history: false, sound: 'meter' });
      return;
    }
    const action = el.dataset.action;
    if (action === 'close') return this.close();
    if (action === 'commission') return this.close(true, { commission: true });
    if (action === 'practice') return this.startPractice();
    if (action === 'end-practice') { this.endPractice(); return this.render(); }
    if (action === 'numbers') { this.showNumbers = !this.showNumbers; this.recordMeasurement(); this.callbacks.onChange?.(this.id, copy(this.state)); this.render(); return; }
    if (action === 'mode') {
      this.mode = el.dataset.mode; this.selected = null; this.feedback = '';
      return this.change(s => { if (this.mode !== 'wire') s.meter.mode = this.mode; s.meter.a = null; s.meter.b = null; s.meter.branch = null; }, { history: false });
    }
    if (action === 'power' || action === 'rearm') { this.blockedBySupply = false; this.pendingTest = false; }
    if (action === 'power') { this.feedback = ''; return this.change(s => { s.sourceOn = !s.sourceOn; if (!s.sourceOn) s.tripped = false; }, { sound: 'switch' }); }
    if (action === 'rearm') { this.feedback = ''; return this.change(s => { s.tripped = false; s.sourceOn = true; }, { sound: 'switch' }); }
    if (action === 'switch' && this.puzzle.switches?.find(sw => sw.key === el.dataset.key)?.external) return;
    if (action === 'switch') { this.feedback = ''; return this.change(s => { s.switches[el.dataset.key] = !s.switches[el.dataset.key]; }, { sound: 'switch' }); }
    if (action === 'knob') {
      const knob = this.puzzle.knobs.find(k => k.key === el.dataset.key);
      this.feedback = '';
      return this.change(s => { s.values[knob.key] = Math.max(knob.min, Math.min(knob.max, s.values[knob.key] + Number(el.dataset.delta) * knob.step)); }, { sound: 'dial' });
    }
    if (action === 'prediction') {
      const input = this.shell.querySelector('[data-prediction]');
      if (input?.value.trim()) { appendBenchEvidence(this.state, { kind: 'prediction', text: input.value }); this.callbacks.onChange?.(this.id, copy(this.state)); this.feedback = 'La idea quedó anotada. Podés compararla después de probar.'; this.render(); }
      return;
    }
    if (action === 'hint') return this.change(s => { s.hints = Math.min(BENCH_GUIDANCE[this.id].hints.length, s.hints + 1); }, { history: false });
    if (action === 'undo') {
      if (!this.history.length) return;
      if (!this.requireIsolated()) return;
      const completed = this.state.completed;
      const before = copy(this.state), evidence = this.state.evidence;
      const trace = this.state.trace; this.state = this.history.pop(); this.state.completed = completed; this.state.sourceOn = false; this.state.tripped = false; this.state.evidence = evidence; this.state.trace = trace;
      this.feedback = 'Volviste un paso atrás.'; this.selected = null;
      this.evaluate(false); this.recordChanges(before); this.callbacks.onChange?.(this.id, copy(this.state)); this.render(); return;
    }
    if (action === 'reset') {
      if (!this.requireIsolated()) return;
      this.feedback = 'La mesa volvió a su disposición inicial. Podés probar otro camino.'; this.selected = null;
      const completed = this.state.completed;
      return this.change(s => Object.assign(s, initialPuzzleSnapshot(this.id), { completed, evidence: s.evidence, trace: s.trace, sourceOn: false }), { sound: 'switch' });
    }
  }

  touchPort(id) {
    if (this.mode === 'current') { this.feedback = 'Elegí una pieza en el instrumento. Ohm medirá cuánto pasa por ese camino.'; this.render(); return; }
    if (this.mode === 'wire') {
      if (!this.requireIsolated()) return;
      // Taking a cable needs one in hand, and an installation in service only changes in a practice copy.
      if (!this.selected && this.state.completed) { this.feedback = 'La instalación está en servicio: para cambiar cables, practicá con una copia.'; this.render(); return; }
      if (!this.selected && cablesInHand(this.id, this.state) <= 0) { this.feedback = 'No te quedan cables en la mano. Tocá uno de los que tendiste para retirarlo y usarlo en otro lugar.'; this.callbacks.onSound?.('error'); this.render(); return; }
      if (!this.selected) { this.selected = id; this.feedback = `Tomaste un cable. Elegí dónde apoyar el otro extremo.`; this.callbacks.onSound?.('connect'); this.render(); return; }
      if (this.selected === id) { this.selected = null; this.feedback = ''; this.render(); return; }
      const a = this.selected; this.selected = null;
      if (this.state.wires.some(w => w.includes(a) && w.includes(id))) { this.feedback = 'Esos bornes ya están unidos. Tocá su cable para retirarlo.'; this.render(); return; }
      if (!canJoin(this.id, a, id)) { this.feedback = 'Un cable de mano no llega tan lejos: esos bornes están en extremos distintos del tendido.'; this.callbacks.onSound?.('error'); this.render(); return; }
      if (cablesInHand(this.id, this.state) <= 0) { this.feedback = 'No te quedan cables en la mano. Retirá uno de los que tendiste para usarlo en otro lugar.'; this.callbacks.onSound?.('error'); this.render(); return; }
      this.feedback = `Conectaste ${this.portLabel(a)} con ${this.portLabel(id)}.`;
      this.pendingTest = !this.state.sourceOn;
      this.change(s => { s.wires.push([a, id]); }, { sound: 'connect' });
      return;
    }
    this.change(s => {
      s.meter.mode = this.mode;
      if (!s.meter.a || s.meter.b) { s.meter.a = id; s.meter.b = null; }
      else s.meter.b = id;
    }, { history: false, sound: 'meter' });
  }

  portLabel(id) {
    if (this.id === 'awaken') return { positive: 'Celda +', negative: 'Celda −', heartIn: 'Ohm +', heartOut: 'Ohm −' }[id] ?? id;
    return this.puzzle.ports.find(p => p.id === id)?.label ?? id;
  }

  meterReading() {
    const m = this.state.meter, powered = this.state.sourceOn && !this.state.tripped;
    if (this.mode === 'wire') return { value: '— —', unit: '', caption: this.selected ? 'Elegí el borne de llegada' : 'Uní dos bornes para tender un cable' };
    if (this.mode === 'current') {
      if (!m.branch) return { value: '— —', unit: 'A', caption: 'Apagá la alimentación y elegí una pieza para insertar el medidor en serie.' };
      const branch = this.result.solution.branches[m.branch];
      return { value: fmt(branch?.current ?? 0), unit: 'A', caption: `En serie con ${this.puzzle.components.find(c => c.id === m.branch)?.label}. Sentido: borne izquierdo → derecho.` };
    }
    if (!m.a || !m.b) return { value: '— —', unit: this.mode === 'voltage' ? 'V' : 'Ω', caption: m.a ? 'Punta roja apoyada. Elegí el borne de la punta negra.' : 'Elegí dos bornes: primero la punta roja, después la negra.' };
    if (this.mode === 'voltage') {
      const voltage = measureVoltage(this.result.solution, m.a, m.b);
      return { value: voltage === null ? 'FLOT.' : fmt(voltage), unit: 'V', caption: voltage === null ? 'Un borne está flotante. Falta una referencia conductora a la fuente.' : `${this.portLabel(m.a)} respecto de ${this.portLabel(m.b)}` };
    }
    if (powered) return { value: 'APAGÁ', unit: '', caption: 'La continuidad usa la pila del medidor. Desconectá la fuente antes de medir.' };
    const resistance = measureResistance(puzzleNetwork(this.id, this.state, false), m.a, m.b);
    return { value: resistance === Infinity ? 'ABIERTO' : fmt(resistance, resistance < 1 ? 2 : 1), unit: resistance === Infinity ? '' : 'Ω', caption: resistance === Infinity ? 'No hay un camino conductor entre las puntas.' : `${resistance < 2 ? 'Continuidad · ' : 'Hay un camino resistivo · '}${this.portLabel(m.a)} ↔ ${this.portLabel(m.b)}. Lectura de toda la red conectada.` };
  }

  presentedReading() {
    if (this.showNumbers) return this.meterReading();
    const m = this.state.meter;
    if (this.mode === 'current') {
      if (!m.branch) return { value: 'Elegí una pieza', unit: '', caption: 'Apagá y elegí la pieza: el medidor irá dentro de su camino.' };
      const amount = this.result.solution.branches[m.branch]?.current ?? 0;
      return { value: Math.abs(amount) < .001 ? 'No pasa' : amount < 0 ? 'Al revés' : 'Hay paso', unit: '', caption: `Medidor en serie con ${simpleLabel(this.puzzle.components.find(c => c.id === m.branch)?.label ?? '')}. ${this.state.sourceOn && !this.state.tripped ? 'La misma corriente atraviesa ambos.' : 'Encendé para probar este camino.'}` };
    }
    if (!m.a || !m.b) return { value: m.a ? 'Una punta más' : 'Apoyá las puntas', unit: '', caption: m.a ? 'Elegí otra pieza redonda para apoyar la punta negra.' : 'Tocá dos piezas redondas: primero una, después otra.' };
    if (this.mode === 'continuity') {
      if (this.state.sourceOn && !this.state.tripped) return { value: 'Primero, apagá', unit: '', caption: 'Esta prueba usa la pila del instrumento. Apagá la alimentación de la mesa y volvé a mirar.' };
      const resistance = measureResistance(puzzleNetwork(this.id, this.state, false), m.a, m.b);
      return { value: resistance === Infinity ? 'Sin camino' : 'Hay camino', unit: '', caption: resistance === Infinity ? 'Entre esas dos puntas no hay paso. Esa es la observación; la causa todavía puede investigarse.' : 'Las puntas están comunicadas. El instrumento está mirando todos los cables que siguen conectados.' };
    }
    const voltage = measureVoltage(this.result.solution, m.a, m.b);
    return { value: voltage === null ? 'Sin referencia' : Math.abs(voltage) < .01 ? 'Iguales' : voltage < 0 ? 'Al revés' : 'Hay diferencia', unit: '', caption: voltage === null ? 'Una punta quedó aislada. No hay una comparación fiable.' : `Comparación entre ${this.portLabel(m.a)} y ${this.portLabel(m.b)}. Al intercambiar las puntas, cambia el sentido de la lectura.` };
  }

  knobValue(knob) {
    return this.showNumbers ? `${fmt(this.state.values[knob.key], 0)} <small>${knob.unit}</small>` : '<span aria-hidden="true">◁ · · · ▷</span>';
  }

  renderMeter() {
    if (this.mode === 'wire') return '';
    const meter = this.presentedReading(), s = this.state;
    const introduction = { continuity: 'Esta prueba pregunta si hay un camino entre dos lugares. En el taller la llaman continuidad.', voltage: 'Ohm compara dos lugares. Esa diferencia se llama tensión. Todavía no demuestra que una máquina funcione.', current: 'Apagá la alimentación para colocar el medidor en el camino. Al encender, la corriente atravesará el medidor y la pieza, uno después del otro.' }[this.mode];
    return `<section class="wb-meter wb-learning-meter"><div class="wb-meter-top"><span>${TOOL_NAMES[this.mode].toLocaleUpperCase('es')}</span><i class="on"></i></div><p class="wb-tool-intro">${introduction}</p><div class="wb-meter-readout" aria-live="polite"><strong>${escapeHtml(meter.value)}</strong><span>${meter.unit}</span></div><p>${escapeHtml(meter.caption)}</p>${this.mode === 'current' ? `<label class="wb-branch-label">Insertar en serie con<select data-meter-branch aria-label="Rama del amperímetro"><option value="">Elegir una pieza…</option>${this.puzzle.components.map(c => `<option value="${c.id}" ${s.meter.branch === c.id ? 'selected' : ''}>${escapeHtml(simpleLabel(c.label))}</option>`).join('')}</select></label>` : ''}<button class="wb-numbers" data-action="numbers" aria-pressed="${this.showNumbers}">${this.showNumbers ? 'Volver a las observaciones' : 'Ver números'}</button></section>`;
  }

  renderDetails() {
    if (!this.showNumbers) return '';
    const p = this.puzzle, r = this.result, s = this.state;
    return `<details class="wb-notes" data-drawer="ratings"><summary>Leer las marcas de las piezas</summary><p>Son referencias para comparar con tus mediciones. No hace falta memorizarlas.</p>${p.components.filter(c => !['cloth', 'joint'].includes(c.kind)).map(c => `<p><strong>${escapeHtml(simpleLabel(c.label))}</strong> · ${fmt(c.valueKey ? s.values[c.valueKey] : c.resistance, 1)} Ω${c.goal ? `<br>Marca de trabajo: ${fmt(c.goal.minVoltage, 1)}–${fmt(c.goal.maxVoltage, 1)} V.` : ''}</p>`).join('')}${(p.constraints ?? []).filter(c => c.maxPower !== undefined).map(c => `<p>Tendido: ${fmt(r.solution.branches[c.branch]?.power ?? 0,1)} W · marca máxima ${fmt(c.maxPower,1)} W.</p>`).join('')}<details data-drawer="model"><summary>Cómo funciona este instrumento</summary><p>Red resistiva en corriente continua; los receptores representan su carga nominal. Los cables tienen 0,035 Ω. El voltímetro ideal compara dos puntos. El amperímetro ideal ocupa un tramo de la rama elegida en serie: toda su corriente lo atraviesa. Su resistencia es cero y no altera esta red nominal. En un instrumento real hay que escoger conexión y rango adecuados; aquí el rango es automático. La prueba de continuidad mide toda la red conectada, con la alimentación apagada.</p></details></details>`;
  }

  renderExperiments() {
    if (this.id === 'awaken') return '';
    const entries = getBenchEvidence(this.id, this.state).filter(entry => ['measurement', 'result', 'prediction'].includes(entry.kind)).slice(-3);
    return `<details class="wb-notes wb-experiments" data-drawer="experiments"><summary>Comparar mis pruebas</summary>${entries.length ? entries.map(entry => `<p><small>${entry.kind === 'prediction' ? 'Lo que pensé' : entry.kind === 'measurement' ? 'Lo que medí' : 'Lo que pasó'}</small><br>${escapeHtml(entry.text)}${entry.value ? ` <strong>${escapeHtml(entry.value)}</strong>` : ''}${entry.reference ? `<br><small>${escapeHtml(entry.reference)}</small>` : ''}</p>`).join('') : '<p>Las pruebas que hagas quedarán aquí y en la Bitácora.</p>'}${!this.state.completed ? '<label for="wb-prediction">Antes de cambiar algo, podés anotar qué esperás.</label><textarea id="wb-prediction" data-prediction maxlength="180" rows="2" placeholder="Creo que al…"></textarea><button class="wb-numbers" data-action="prediction">Anotar mi idea</button>' : ''}</details>`;
  }

  // Following the copper: pointing at a terminal or a wire lights every terminal
  // joined to it by wires alone. It teaches what a node is without showing voltages.
  handleTrace(event) {
    const node = event.target?.closest?.('[data-node]')?.dataset.node;
    if (!node || !this.shell) return;
    if (node === this.tracedNode) return;
    this.clearTrace();
    this.tracedNode = node;
    const selector = `[data-node="${(globalThis.CSS?.escape ?? String)(node)}"]`;
    this.shell.querySelectorAll(selector).forEach(el => el.classList.add('traced'));
    this.shell.querySelector('.wb-board')?.classList.add('tracing');
    const members = wireNodes(this.id, this.state).members[node] ?? [node];
    const caption = this.shell.querySelector('.wb-node-caption');
    if (caption) caption.textContent = members.length > 1
      ? `Unidos por cobre: ${members.map(id => this.portLabel(id)).join(' · ')}`
      : `${this.portLabel(node)}: ningún cable lo une a otro borne.`;
  }

  handleTraceEnd(event) {
    const next = event.relatedTarget?.closest?.('[data-node]')?.dataset.node;
    if (next && next === this.tracedNode) return;
    this.clearTrace();
  }

  clearTrace() {
    this.tracedNode = null;
    if (!this.shell) return;
    this.shell.querySelectorAll('.traced').forEach(el => el.classList.remove('traced'));
    this.shell.querySelector('.wb-board')?.classList.remove('tracing');
    const caption = this.shell.querySelector('.wb-node-caption');
    if (caption) caption.textContent = '';
  }

  wirePath(a, b, index) {
    const pa = this.puzzle.ports.find(p => p.id === a), pb = this.puzzle.ports.find(p => p.id === b);
    const sag = 30 + (index % 4) * 17;
    return `M ${pa.x} ${pa.y} C ${pa.x + (pb.x - pa.x) * .2} ${pa.y + sag}, ${pb.x - (pb.x - pa.x) * .2} ${pb.y + sag}, ${pb.x} ${pb.y}`;
  }

  ohmSvg(x, y, awake) {
    return `<ellipse cx="${x}" cy="${y+125}" rx="109" ry="17" fill="#0007" filter="url(#wb-shadow)"/>
      <path d="M${x-82} ${y+97} Q${x-104} ${y+112} ${x-94} ${y+126} Q${x-57} ${y+137} ${x-37} ${y+121} L${x-41} ${y+99}Z M${x+82} ${y+97} Q${x+104} ${y+112} ${x+94} ${y+126} Q${x+57} ${y+137} ${x+37} ${y+121} L${x+41} ${y+99}Z" fill="url(#wb-brass)" stroke="#483b27" stroke-width="5"/>
      <ellipse cx="${x}" cy="${y+8}" rx="100" ry="111" fill="url(#wb-brass)" stroke="#403824" stroke-width="6"/>
      <path d="M${x-94} ${y+46} Q${x} ${y+91} ${x+94} ${y+46} Q${x+82} ${y+119} ${x} ${y+119} Q${x-82} ${y+119} ${x-94} ${y+46}Z" fill="url(#wb-darkMetal)" stroke="#957c4d" stroke-width="3"/>
      <ellipse cx="${x}" cy="${y-13}" rx="57" ry="65" fill="url(#wb-brass)" stroke="#f0cd89" stroke-width="3"/>
      <ellipse cx="${x}" cy="${y-13}" rx="47" ry="54" fill="url(#wb-blueGlass)" stroke="#253f35" stroke-width="7"/>
      <ellipse cx="${x}" cy="${y-13}" rx="29" ry="34" fill="${awake ? '#68dce1' : '#344b46'}" class="${awake ? 'wb-eye-awake' : ''}"/>
      ${awake ? `<ellipse cx="${x-8}" cy="${y-24}" rx="11" ry="14" fill="#d5ffff" opacity=".85"/><path d="M${x-28} ${y+14} Q${x} ${y+34} ${x+29} ${y+12}" fill="none" stroke="#83ece3" stroke-width="3"/>` : `<path d="M${x-35} ${y-21} Q${x} ${y+2} ${x+35} ${y-21}" fill="none" stroke="#bc9c60" stroke-width="10" stroke-linecap="round"/>`}
      <path d="M${x-71} ${y-61} Q${x-38} ${y-97} ${x-3} ${y-91}" fill="none" stroke="#f4de99" stroke-width="8" stroke-linecap="round" opacity=".6"/>
      ${[-1,1].map(sign => `<ellipse cx="${x+sign*95}" cy="${y-8}" rx="13" ry="24" fill="url(#wb-brass)" stroke="#463923" stroke-width="4"/><path d="M${x+sign*95-6} ${y-21} l12 26" stroke="#443923" stroke-width="4"/>`).join('')}
      <path d="M${x-19} ${y-102} v-5 q19 -8 38 0 v5" fill="url(#wb-brass)" stroke="#6a5530" stroke-width="4"/>
      <text x="${x}" y="${y+91}" text-anchor="middle" fill="#e3c17d" font-family="Georgia" font-size="29">Ω</text>
      ${[-67,67].map(dx => `<circle cx="${x+dx}" cy="${y+42}" r="4" fill="#c9ae6e" stroke="#5d4b2c" stroke-width="2"/>`).join('')}`;
  }

  // Piece names sit above the copper: a wire crossing a label never hides what the piece is.
  componentLabel(c) {
    const svg = this.componentSvg(c), m = svg.match(/<text x="([\d.-]+)" y="([\d.-]+)" class="wb-engraving">([^<]*)<\/text>/);
    return m ? `<text x="${m[1]}" y="${m[2]}" class="wb-engraving wb-engraving-top">${m[3]}</text>` : '';
  }

  componentSvg(c) {
    const a = this.puzzle.ports.find(p => p.id === c.a), b = this.puzzle.ports.find(p => p.id === c.b);
    const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2, width = Math.min(160, b.x - a.x - 35);
    const live = this.result.operating[c.id], branch = this.result.solution.branches[c.id];
    const glowing = Math.abs(branch?.current ?? 0) > .05 && !this.state.tripped && this.state.sourceOn;
    const nominalCurrent = c.goal ? (c.goal.minCurrent + c.goal.maxCurrent) / 2 : 1;
    const response = glowing ? Math.min(2.4, Math.abs(branch.current) / nominalCurrent) : 0;
    const resistance = c.valueKey ? this.state.values[c.valueKey] : c.resistance;
    const screw = (sx, sy, radius = 5) => `<circle cx="${sx}" cy="${sy}" r="${radius}" fill="url(#wb-brass)" stroke="#332a1b" stroke-width="1"/><path d="M${sx-radius*.6} ${sy+radius*.3} l${radius*1.2} ${-radius*.6}" stroke="#362d21" stroke-width="1.5"/>`;
    const teeth = (radius, count=18) => Array.from({length:count},(_,i)=>`<rect x="${x-4}" y="${y-radius-5}" width="8" height="10" rx="1" fill="url(#wb-brass)" transform="rotate(${i*360/count} ${x} ${y})"/>`).join('');
    let center, labelOffset = 69, specOffset = 69;
    if (c.kind === 'orb') {
      labelOffset = 136; specOffset = 155;
      center = this.ohmSvg(x, y, live);
    } else if (c.kind === 'lens') {
      labelOffset = 98; specOffset = 99;
      center = `<ellipse cx="${x}" cy="${y+67}" rx="93" ry="14" fill="#0007" filter="url(#wb-shadow)"/>${teeth(76,36)}<circle cx="${x}" cy="${y}" r="73" fill="url(#wb-darkMetal)" stroke="url(#wb-brass)" stroke-width="10"/><circle cx="${x}" cy="${y}" r="60" fill="url(#wb-blueGlass)" stroke="#cbbb80" stroke-width="3"/>${[49,39,29,18].map(radius=>`<circle cx="${x}" cy="${y}" r="${radius}" fill="none" stroke="${live?'#dfecd0':'#819f88'}" stroke-width="4" opacity=".65"/><circle cx="${x}" cy="${y}" r="${radius-3}" fill="none" stroke="#142b28" stroke-width="2"/>`).join('')}<circle cx="${x}" cy="${y}" r="13" class="wb-filament ${glowing?'lit':''} ${live?'stable':''}"/><path d="M${x-40} ${y-39} Q${x-14} ${y-59} ${x+20} ${y-50}" fill="none" stroke="#eff8da" stroke-width="7" stroke-linecap="round" opacity=".46"/>${[45,135,225,315].map(angle=>`<g transform="rotate(${angle} ${x} ${y})">${screw(x,y-66,5)}</g>`).join('')}`;
    } else if (c.kind === 'lamp') {
      center = `<ellipse cx="${x}" cy="${y+46}" rx="53" ry="9" fill="#0006"/><path d="M${x-39} ${y+36} L${x-33} ${y-24} Q${x} ${y-49} ${x+33} ${y-24} L${x+39} ${y+36}Z" fill="url(#wb-glass)" stroke="url(#wb-brass)" stroke-width="5"/><circle cx="${x}" cy="${y}" r="24" class="wb-filament ${glowing?'lit':''} ${live?'stable':''}"/><path d="M${x-18} ${y+32} v-25 l9 -13 9 25 9 -25 9 13 v25" fill="none" stroke="${glowing?'#fff0ad':'#948563'}" stroke-width="3"/><path d="M${x-38} ${y-24} Q${x} ${y-55} ${x+38} ${y-24} L${x+47} ${y-16} H${x-47}Z" fill="url(#wb-brass)" stroke="#51432b" stroke-width="2"/><path d="M${x-42} ${y+31} H${x+42} v12 H${x-42}Z" fill="url(#wb-brass)" stroke="#58462d" stroke-width="2"/><path d="M${x-25} ${y-9} v33" stroke="#e6edd488" stroke-width="4" stroke-linecap="round"/>${screw(x-34,y+38,4)}${screw(x+34,y+38,4)}`;
    } else if (c.kind === 'motor') {
      center = `<rect x="${x-56}" y="${y-36}" width="112" height="76" rx="13" fill="url(#wb-brass)" stroke="#403728" stroke-width="4"/><circle cx="${x}" cy="${y}" r="43" fill="url(#wb-darkMetal)" stroke="#ac9567" stroke-width="7"/><circle cx="${x}" cy="${y}" r="34" fill="url(#wb-steel)"/><g class="${glowing?'wb-spinning':''}" style="transform-origin:${x}px ${y}px;animation-duration:${Math.max(.8, 3 / Math.max(.15, response))}s;animation-direction:${branch?.current < 0 ? 'reverse' : 'normal'}">${Array.from({length:7},(_,i)=>`<path d="M${x-5} ${y-5} Q${x-36} ${y-17} ${x-18} ${y-28} L${x+3} ${y-9}Z" fill="url(#wb-brass)" stroke="#53583d" transform="rotate(${i*360/7} ${x} ${y})"/>`).join('')}</g><circle cx="${x}" cy="${y}" r="11" fill="url(#wb-brass)" stroke="#22392a" stroke-width="3"/>${screw(x-46,y-25,4)}${screw(x+46,y-25,4)}${screw(x-46,y+28,4)}${screw(x+46,y+28,4)}<path d="M${x-57} ${y+13} h-13 v-22 M${x+57} ${y+13} h13 v-22" fill="none" stroke="url(#wb-copper)" stroke-width="7"/>`;
    } else if (c.kind === 'coil') {
      center = `<ellipse cx="${x}" cy="${y+39}" rx="86" ry="11" fill="#0007"/><rect x="${x-76}" y="${y-29}" width="152" height="58" rx="8" fill="url(#wb-darkMetal)" stroke="#7d7656" stroke-width="3"/><ellipse cx="${x-64}" cy="${y}" rx="16" ry="35" fill="url(#wb-ceramic)" stroke="#756444" stroke-width="3"/><rect x="${x-62}" y="${y-31}" width="123" height="62" fill="url(#wb-copper)"/>${Array.from({length:18},(_,i)=>`<path d="M${x-59+i*7} ${y-29} C${x-75+i*7} ${y-10} ${x-51+i*7} ${y+15} ${x-58+i*7} ${y+30}" fill="none" stroke="#422a20" stroke-width="3.5"/><path d="M${x-58+i*7} ${y-27} C${x-72+i*7} ${y-9} ${x-49+i*7} ${y+14} ${x-56+i*7} ${y+28}" fill="none" stroke="#e1a365" stroke-width="2"/>`).join('')}<ellipse cx="${x+64}" cy="${y}" rx="15" ry="35" fill="url(#wb-ceramic)" stroke="#786345" stroke-width="3"/><ellipse cx="${x+66}" cy="${y}" rx="8" ry="21" fill="url(#wb-darkMetal)"/><path d="M${x-79} ${y+37} H${x+79}" stroke="url(#wb-brass)" stroke-width="9"/>${screw(x-70,y+36)}${screw(x+70,y+36)}`;
    } else if (c.kind === 'switch') {
      center = `<rect x="${x-64}" y="${y-28}" width="128" height="61" rx="10" fill="url(#wb-ceramic)" stroke="#847859" stroke-width="3"/><rect x="${x-47}" y="${y-14}" width="25" height="34" rx="3" fill="url(#wb-copper)"/><rect x="${x+23}" y="${y-14}" width="25" height="34" rx="3" fill="url(#wb-copper)"/><circle cx="${x-34}" cy="${y}" r="9" fill="url(#wb-brass)"/><circle cx="${x+35}" cy="${y}" r="8" fill="#b2955e"/><path d="M${x-34} ${y} L${x+35} ${this.state.switches[c.switchKey]?y:y-35}" stroke="#332d1c" stroke-width="13" stroke-linecap="round"/><path d="M${x-34} ${y-3} L${x+35} ${this.state.switches[c.switchKey]?y-3:y-38}" stroke="url(#wb-brass)" stroke-width="7" stroke-linecap="round"/>${screw(x-55,y+22,4)}${screw(x+55,y+22,4)}`;
    } else if (c.kind === 'fault') {
      center = `<ellipse cx="${x}" cy="${y+30}" rx="87" ry="10" fill="#0005"/><rect x="${x-73}" y="${y-29}" width="146" height="57" rx="8" fill="url(#wb-darkMetal)" stroke="#8b7755" stroke-width="3"/><rect x="${x-52}" y="${y-21}" width="104" height="42" rx="6" fill="url(#wb-cloth)" stroke="#735b3e"/><path d="M${x-68} ${y} H${x-12} l7 -9 10 17 8 -8 H${x+68}" fill="none" stroke="${Number.isFinite(resistance)?'#7c9d78':'#51351f'}" stroke-width="8"/><path d="M${x-43} ${y-20} l-7 40 M${x-24} ${y-20} l-7 40 M${x+19} ${y-20} l-7 40 M${x+38} ${y-20} l-7 40" stroke="#b1a079" stroke-width="5"/>${[-63,63].map(dx=>`<rect x="${x+dx-7}" y="${y-27}" width="14" height="54" rx="3" fill="url(#wb-brass)"/>${screw(x+dx,y-18,4)}${screw(x+dx,y+18,4)}`).join('')}`;
    } else if (c.kind === 'cloth') {
      center = `<ellipse cx="${x}" cy="${y+28}" rx="${width/2+8}" ry="8" fill="#0005"/><rect x="${x-width/2}" y="${y-20}" width="${width}" height="40" rx="18" fill="url(#wb-cloth)" stroke="#6d5539" stroke-width="3"/>${Array.from({length:7},(_,i)=>`<path d="M${x-width/2+14+i*(width-28)/6} ${y-19} l-9 38" stroke="#a48f68" stroke-width="4" opacity=".7"/>`).join('')}${[-1,1].map(sign=>`<rect x="${x+sign*(width/2)-8}" y="${y-24}" width="16" height="48" rx="4" fill="url(#wb-brass)" stroke="#51432b" stroke-width="2"/>`).join('')}`;
    } else if (c.kind === 'joint') {
      const warm = Math.min(1, Math.abs(branch?.power ?? 0) / 3);
      center = `<ellipse cx="${x}" cy="${y+30}" rx="70" ry="9" fill="#0005"/><path d="M${x-width/2} ${y} H${x+width/2}" stroke="url(#wb-copper)" stroke-width="10"/><rect x="${x-30}" y="${y-24}" width="60" height="48" rx="9" fill="url(#wb-darkMetal)" stroke="url(#wb-brass)" stroke-width="4"/>${[-14,0,14].map(dx=>`<path d="M${x+dx} ${y-20} v40" stroke="#b39a66" stroke-width="3"/>`).join('')}${screw(x-20,y-15,4)}${screw(x+20,y+15,4)}${warm>.05?`<ellipse cx="${x}" cy="${y}" rx="${32+4*warm}" ry="${26+3*warm}" fill="#ff8a3d" fill-opacity="${.06+.1*warm}" class="wb-heat"/>`:''}`;
    } else if (c.kind === 'forge') {
      const heat = Math.min(1, Math.abs(branch?.power ?? 0) / 27);
      center = `<ellipse cx="${x}" cy="${y+36}" rx="84" ry="10" fill="#0007"/><path d="M${x-70} ${y+30} V${y-14} Q${x} ${y-52} ${x+70} ${y-14} V${y+30} Z" fill="url(#wb-darkMetal)" stroke="url(#wb-brass)" stroke-width="5"/><path d="M${x-34} ${y+30} V${y+2} Q${x} ${y-22} ${x+34} ${y+2} V${y+30} Z" fill="#1a0f0a" stroke="#6b5139" stroke-width="3"/><ellipse cx="${x}" cy="${y+18}" rx="${22+10*heat}" ry="${10+6*heat}" fill="rgb(${Math.round(90+165*heat)},${Math.round(40+120*heat)},${Math.round(20+30*heat)})" opacity="${.35+.65*heat}"/>${screw(x-60,y+20,4)}${screw(x+60,y+20,4)}`;
    } else if (c.kind === 'heater') {
      center = `<rect x="${x-76}" y="${y-35}" width="152" height="72" rx="7" fill="url(#wb-darkMetal)" stroke="url(#wb-brass)" stroke-width="5"/>${Array.from({length:8},(_,i)=>`<path d="M${x-56+i*16} ${y-25} v50" stroke="#596a53" stroke-width="8"/>`).join('')}<path d="M${x-65} ${y+20} H${x+55} q10 0 10 -10 v-6 H${x-55} q-10 0 -10 -10 v-8 H${x+62}" fill="none" stroke="url(#wb-copper)" stroke-width="5"/>${screw(x-68,y-28,4)}${screw(x+68,y-28,4)}${screw(x-68,y+29,4)}${screw(x+68,y+29,4)}`;
    } else {
      center = `<ellipse cx="${x}" cy="${y+29}" rx="${width/2+9}" ry="9" fill="#0006"/><rect x="${x-width/2}" y="${y-22}" width="${width}" height="44" rx="16" fill="url(#wb-ceramic)" stroke="#786848" stroke-width="2"/>${[-1,1].map(sign=>`<ellipse cx="${x+sign*(width/2-9)}" cy="${y}" rx="9" ry="23" fill="url(#wb-brass)" stroke="#6a593c" stroke-width="2"/>`).join('')}${Array.from({length:9},(_,i)=>`<path d="M${x-width/2+28+i*(width-56)/8} ${y-21} q-8 21 0 42" fill="none" stroke="url(#wb-copper)" stroke-width="5"/>`).join('')}<path d="M${x-width/2+18} ${y-13} H${x+width/2-18}" stroke="#fff2c777" stroke-width="2"/>`;
    }
    if (c.kind === 'coil' && this.id === 'gate') center += `<path d="M${x+66} ${y} h${glowing ? Math.sign(branch.current)*Math.min(70, 44*response) : 6}" stroke="url(#wb-steel)" stroke-width="12" stroke-linecap="round"/><text x="${x+76}" y="${y+65}" class="wb-spec">AVANCE →</text>`;
    if (this.mode === 'current' && this.state.meter.branch === c.id) center += `<g class="wb-inline-ammeter" aria-label="Medidor insertado en serie"><circle cx="${(a.x+x)/2}" cy="${y}" r="16" fill="#d4c49a" stroke="#594a34" stroke-width="4"/><text x="${(a.x+x)/2}" y="${y+6}" text-anchor="middle" font-family="Georgia" font-size="18" fill="#312a21">A</text></g>`;
    return `<g class="wb-component ${live?'operating':''}" ${this.mode === 'current' ? `data-branch="${c.id}"` : ''} role="img" aria-label="${escapeHtml(this.showNumbers ? c.label : simpleLabel(c.label))}"><path d="M${a.x} ${a.y} L${x} ${y} L${b.x} ${b.y}" stroke="#293427" stroke-width="13"/><path d="M${a.x} ${a.y} L${x} ${y} L${b.x} ${b.y}" stroke="url(#wb-brass)" stroke-width="7"/>${center}<text x="${x}" y="${y-labelOffset}" class="wb-engraving">${escapeHtml(simpleLabel(c.label))}</text>${this.showNumbers ? `<text x="${x}" y="${y+specOffset}" class="wb-spec">${c.kind==='cloth'?'TRAMO DE TELA':c.kind==='joint'?'EMPALME':c.kind==='fault'?'INSPECCIONAR EMPALME':`${Number.isFinite(resistance)?`${fmt(resistance,0)} Ω`:'—'}${c.goal?`  ·  ${fmt(c.goal.minVoltage,1)}–${fmt(c.goal.maxVoltage,1)} V`:''}`}</text>` : ''}</g>`;
  }

  zoneSvg() {
    const zones = this.puzzle.zones; if (!zones) return '';
    return Object.entries(zones).map(([key, label]) => { const ps = this.puzzle.ports.filter(n => n.zone === key), x0 = Math.min(...ps.map(n => n.x)) - 45, x1 = Math.max(...ps.map(n => n.x)) + 45, y0 = Math.min(...ps.map(n => n.y)) - 70, y1 = Math.max(...ps.map(n => n.y)) + 50;
      return `<g class="wb-zone" pointer-events="none"><rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" rx="18"/><text x="${x0+14}" y="${y0+20}">${escapeHtml(label)}</text></g>`; }).join('');
  }

  materialDefs() {
    return `<linearGradient id="wb-brass" x1="0" x2=".35" y1="0" y2="1"><stop stop-color="#e0ca8c"/><stop offset=".18" stop-color="#b59a5f"/><stop offset=".48" stop-color="#7b643c"/><stop offset=".65" stop-color="#c0a571"/><stop offset="1" stop-color="#514329"/></linearGradient><linearGradient id="wb-copper" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#f0bf83"/><stop offset=".25" stop-color="#c68b56"/><stop offset=".54" stop-color="#854c33"/><stop offset=".7" stop-color="#b47147"/><stop offset="1" stop-color="#4b3225"/></linearGradient><linearGradient id="wb-darkMetal" x1="0" x2=".6" y1="0" y2="1"><stop stop-color="#687665"/><stop offset=".28" stop-color="#354b3e"/><stop offset=".6" stop-color="#122922"/><stop offset="1" stop-color="#344839"/></linearGradient><linearGradient id="wb-ceramic" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#c8c9a9"/><stop offset=".3" stop-color="#eee7c1"/><stop offset=".6" stop-color="#b3b49c"/><stop offset="1" stop-color="#686d54"/></linearGradient><radialGradient id="wb-blueGlass" cx=".32" cy=".25"><stop stop-color="#aac6ac" stop-opacity=".85"/><stop offset=".3" stop-color="#628c80"/><stop offset=".6" stop-color="#20463f"/><stop offset="1" stop-color="#102d2a"/></radialGradient><filter id="wb-shadow" x="-40%" y="-70%" width="180%" height="240%"><feGaussianBlur stdDeviation="5"/></filter><filter id="wb-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
  }

  render() {
    if (!this.active || !this.shell) return;
    this.tracedNode = null;
    const focus = document.activeElement;
    const previous = this.shell.contains(focus) ? { ...focus.dataset } : null;
    const predictionDraft = this.shell.querySelector('[data-prediction]')?.value ?? '';
    const scroll = this.shell.querySelector('.wb-case')?.scrollTop ?? 0;
    const asideScroll = this.shell.querySelector('.wb-aside')?.scrollTop ?? 0;
    const drawers = Object.fromEntries([...this.shell.querySelectorAll('[data-drawer]')].map(d => [d.dataset.drawer, d.open]));
    const p = this.puzzle, s = this.state, r = this.result, guidance = BENCH_GUIDANCE[this.id];
    const leaveLabel = this.id === 'awaken' ? 'Seguir con Ohm →' : this.id === 'workshop' ? 'Dejar la lámpara encendida →' : 'Dejar funcionando →';
    const powered = s.sourceOn && !s.tripped;
    const available = s.completed ? ['voltage'] : this.practice ? [...new Set([...guidance.tools, 'voltage', 'continuity'])] : guidance.tools;
    const toolButton = mode => `<button data-action="mode" data-mode="${mode}" class="${this.mode === mode ? 'active' : ''}" aria-pressed="${this.mode === mode}">${TOOL_NAMES[mode]}</button>`;
    const powerNext = !s.completed && this.id !== 'awaken' && this.mode === 'wire' && ((this.blockedBySupply && powered) || (this.pendingTest && !powered) || s.tripped);
    const power = `<button class="wb-power ${powered ? 'on' : ''} ${s.tripped ? 'tripped' : ''} ${powerNext ? 'wb-next-step' : ''}" data-action="${s.tripped ? 'rearm' : 'power'}" aria-pressed="${powered}"><span>⏻</span>${s.tripped ? 'Volver a encender' : powered ? 'Apagar alimentación' : 'Encender alimentación'}</button>`;
    const compactReading = this.mode !== 'wire' ? this.presentedReading() : null;
    const compactMeter = compactReading ? `<div class="wb-compact-meter" role="status"><strong>${escapeHtml(compactReading.value)} <small>${compactReading.unit}</small></strong><span>${escapeHtml(compactReading.caption)}</span></div>` : '';
    const topo = wireNodes(this.id, s);
    const portMarkup = (n, rail = false) => `<button class="${rail ? 'wb-rail-port' : 'wb-terminal'} ${this.selected === n.id ? 'selected' : ''} ${this.mode !== 'wire' && s.meter.a === n.id ? 'probe-red' : ''} ${this.mode !== 'wire' && s.meter.b === n.id ? 'probe-black' : ''}" data-node="${topo.nodeOf[n.id]}" ${rail ? `data-terminal="${n.id}"` : `data-port="${n.id}" style="left:${n.x/10}%;top:${n.y/5}%"`} aria-label="${rail ? 'Conector' : 'Borne'} ${escapeHtml(this.portLabel(n.id))}${this.selected === n.id ? ', seleccionado' : ''}" aria-pressed="${this.selected === n.id}"><span class="wb-terminal-hole"></span><span class="${rail ? '' : 'wb-terminal-label'}">${escapeHtml(rail ? this.portLabel(n.id) : p.boardLabels?.[n.id] ?? this.portLabel(n.id))}</span></button>`;
    const knobs = (p.knobs ?? []).map(k => {
      const label = k.label.replace('Resistencia del lecho', 'Freno del calor').replace('Resistencia del riego', 'Freno del agua').replace('Brazo superior del divisor', 'Freno de la lente');
      return `<div class="wb-dial-control"><div class="wb-dial" style="--angle:${-135+(s.values[k.key]-k.min)/(k.max-k.min)*270}deg" aria-hidden="true"><i></i></div><div class="wb-dial-details"><label for="wb-${k.key}">${escapeHtml(label)}</label><div class="wb-knob-row"><button data-action="knob" data-key="${k.key}" data-delta="-1" aria-label="Girar ${escapeHtml(label)} a la izquierda">−</button><output>${this.knobValue(k)}</output><button data-action="knob" data-key="${k.key}" data-delta="1" aria-label="Girar ${escapeHtml(label)} a la derecha">+</button></div><input id="wb-${k.key}" data-knob="${k.key}" type="range" min="${k.min}" max="${k.max}" step="${k.step}" value="${s.values[k.key]}" aria-label="${escapeHtml(label)}" aria-valuetext="${this.showNumbers ? `${s.values[k.key]} ${k.unit}` : `Posición ${Math.round((s.values[k.key]-k.min)/k.step)+1} de ${Math.round((k.max-k.min)/k.step)+1}`}"/><p>Posición ${Math.round((s.values[k.key]-k.min)/k.step)+1} de ${Math.round((k.max-k.min)/k.step)+1}. Hacia la derecha frena más: pasa menos.</p></div></div>`;
    }).join('');
    const switches = (p.switches ?? []).map(sw => `<button class="wb-switch ${s.switches[sw.key] ? 'on' : ''}" data-action="switch" data-key="${sw.key}" aria-pressed="${s.switches[sw.key]}" ${sw.external ? 'disabled title="Esta rama se aisló en el patio"' : ''}><span class="wb-toggle"><i></i></span><span>${escapeHtml(sw.label)}<small>${sw.external ? 'AISLADA EN EL PATIO' : s.switches[sw.key] ? 'CONECTADA' : 'AISLADA'}</small></span></button>`).join('');
    // With the source on, terminals do not accept changes: say so where the student is looking.
    const lockedBySupply = powered && this.id !== 'awaken' && !s.completed;
    // A bench with no cables in hand is a tuning puzzle: no wiring tool, no wiring instructions.
    const wiring = p.cables !== 0;
    const instruction = this.mode === 'wire' && !wiring ? (s.completed ? 'La instalación está en servicio: podés medirla.' : 'Girá los frenos de a una posición y mirá qué se tilda en el encargo.') : this.mode === 'wire' ? (this.selected ? 'Ahora tocá otra pieza redonda para apoyar el otro extremo.'
      : lockedBySupply ? 'La mesa está encendida: apagá la alimentación para mover cables. Después, encendela para probar.'
      : s.completed ? 'La instalación está en servicio: podés medirla. Para cambiar cables, practicá con una copia.'
      : this.pendingTest ? 'Cuando termines de cambiar cables, encendé la alimentación para probar.'
      : 'Tocá dos piezas redondas para unirlas con un cable. Tocá un cable para retirarlo.') : this.mode === 'current' ? 'Elegí una pieza en el instrumento para mirar su camino.' : 'Tocá dos piezas redondas para apoyar las puntas del instrumento.';
    this.shell.innerHTML = `<div class="wb-case wb-discovery ${this.id === 'awaken' ? 'wb-first' : ''} ${this.showNumbers ? 'wb-with-numbers' : ''} ${s.completed ? 'completed' : ''}">
      <header class="wb-header"><div><p class="wb-eyebrow">${p.place}${this.practice ? ' · PRÁCTICA CON UNA COPIA' : ''}</p><h1>${p.title}</h1>${!getBenchEvidence(this.id,s).some(e => e.kind === 'intervention') ? `<p class="wb-subtitle">${guidance.subtitle}</p>` : ''}${compactMeter}</div>${this.practice ? '<button class="wb-commission-top" data-action="end-practice">Terminar la práctica</button>' : r.commissionable && !s.completed ? `<button class="wb-commission-top" data-action="commission">${leaveLabel}</button>` : ''}<button class="wb-close" data-action="close" aria-label="Volver al mundo">✕ <span>Volver</span></button></header>
      <div class="wb-layout"><main class="wb-main">
        ${available.length ? `<div class="wb-toolstrip"><div class="wb-tools">${wiring ? toolButton('wire') : ''}${toolButton(available[0])}</div>${power}</div>${available.length > 1 ? `<details class="wb-extra-tools" data-drawer="tools"><summary>Otros instrumentos de Ohm</summary><div class="wb-tools">${available.slice(1).map(toolButton).join('')}</div></details>` : ''}` : s.tripped ? `<div class="wb-toolstrip">${power}</div>` : ''}
        <p class="wb-instruction"><span aria-hidden="true">${this.mode === 'wire' ? '⌁' : '⌖'}</span>${instruction}${p.cables && !s.completed ? `<b class="wb-hand">Cables en la mano: ${Math.max(0, cablesInHand(this.id, s))}</b>` : ''}</p>
        <div class="wb-board ${powered ? 'powered' : ''}"><span class="wb-corner tl"></span><span class="wb-corner tr"></span><span class="wb-corner bl"></span><span class="wb-corner br"></span><svg class="wb-schematic" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-label="Mesa con piezas y cables. Las piezas redondas se pueden tocar."><defs>${this.materialDefs()}<radialGradient id="wb-glass" cx=".35" cy=".25"><stop stop-color="#98b5ab" stop-opacity=".65"/><stop offset=".42" stop-color="#283e3b"/><stop offset="1" stop-color="#0c1919"/></radialGradient><radialGradient id="wb-steel"><stop stop-color="#697c70"/><stop offset="1" stop-color="#24362e"/></radialGradient><pattern id="wb-cloth" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#5a4933"/><path d="M0 2H8 M2 0V8" stroke="#756044" stroke-width="1"/></pattern></defs><rect width="1000" height="500" filter="url(#wb-grain)" opacity=".05" pointer-events="none"/><path d="M85 125 V180 M85 320 V375" stroke="#b89b66" stroke-width="6"/><rect x="43" y="185" width="84" height="128" rx="13" fill="#242f2b" stroke="#ac8a53" stroke-width="4"/><rect x="57" y="210" width="56" height="65" rx="4" fill="#111e1b" stroke="#6d714e"/>${this.showNumbers ? `<text x="85" y="238" class="wb-source-value">${p.voltage}</text><text x="85" y="260" class="wb-spec">VOLTIOS</text>` : `<path d="M68 243 h34 M85 226 v34" stroke="#d2b57b" stroke-width="4"/>`}<text x="85" y="299" class="wb-source-mark">Ω</text><circle cx="85" cy="198" r="4" fill="${powered ? '#cfedab' : '#786845'}"/>${this.zoneSvg()}${p.components.map(c => this.componentSvg(c)).join('')}${s.wires.map((w,i) => { const path = this.wirePath(...w,i), flow = wireFlow(r, i, powered); const sealed = isSealed(this.id, w); return `<g class="wb-wire ${sealed ? 'wb-wire-sealed' : ''}" data-wire="${i}" data-node="${topo.nodeOf[w[0]]}"><title>${sealed ? 'Soldado a la instalación' : 'Retirar cable'}: ${escapeHtml(this.portLabel(w[0]))} → ${escapeHtml(this.portLabel(w[1]))}</title><path d="${path}" class="wb-wire-shadow"/><path d="${path}" class="wb-wire-casing ${wireTone(w,i)}"/><path d="${path}" class="wb-wire-highlight"/>${flow ? `<path d="${path}" class="wb-wire-flow${flow.forward ? '' : ' reverse'}" style="--flow-seconds:${flow.seconds}s"/>` : ''}${sealed ? w.map(n => { const q = p.ports.find(o => o.id === n); return `<circle cx="${q.x}" cy="${q.y}" r="15" class="wb-solder"/>`; }).join('') : ''}</g>`; }).join('')}<g class="wb-label-layer" aria-hidden="true" pointer-events="none">${p.components.map(c => this.componentLabel(c)).join('')}</g></svg>${p.ports.map(n => portMarkup(n)).join('')}</div>
        <p class="wb-node-caption" aria-live="polite"></p>
        <details class="wb-terminal-drawer" data-drawer="terminals" open><summary>Tocar las conexiones <span>Las mismas piezas, más cerca</span></summary><div class="wb-terminal-rail">${p.ports.map(n => portMarkup(n, true)).join('')}</div></details>
        <details class="wb-wire-drawer" data-drawer="cables"><summary>Cambiar o deshacer una prueba</summary><div class="wb-wire-list">${s.wires.map((w,i) => [w,i]).filter(([w]) => !isSealed(this.id, w)).map(([w,i]) => `<button data-wire="${i}" aria-label="Retirar cable entre ${escapeHtml(this.portLabel(w[0]))} y ${escapeHtml(this.portLabel(w[1]))}"><i class="${wireTone(w,i)}"></i>${escapeHtml(this.portLabel(w[0]))}<span>↔</span>${escapeHtml(this.portLabel(w[1]))}<b>×</b></button>`).join('') || '<p>Todavía no tendiste cables. Los soldados son parte de la instalación.</p>'}</div><div class="wb-reset-row"><button data-action="undo" ${!this.history.length ? 'disabled' : ''}>↶ Deshacer</button><button data-action="reset">↺ Restablecer mesa</button>${!available.length ? power : ''}<span>Podés probar sin perder nada.</span></div></details>
        ${knobs || switches ? `<div class="wb-controls wb-controls-main">${knobs}${switches}</div>` : ''}
      </main><aside class="wb-aside">
        ${p.brief ? `<section class="wb-brief"><p class="wb-eyebrow">EL ENCARGO</p><p>${escapeHtml(p.brief)}</p><ul class="wb-checks">${r.checks.map(c => `<li class="${c.met || s.completed ? 'met' : ''}"><span aria-hidden="true">${c.met || s.completed ? '✓' : '○'}</span>${escapeHtml(c.text)}<small class="screen-reader-only">${c.met || s.completed ? ' (logrado)' : ' (pendiente)'}</small></li>`).join('')}</ul></section>` : ''}
        ${knobs || switches ? `<div class="wb-controls wb-controls-aside">${knobs}${switches}</div>` : ''}
        <section class="wb-observation" aria-live="polite"><p class="wb-eyebrow">${r.solved ? 'ALGO CAMBIÓ' : 'MIRÁ Y ESCUCHÁ'}</p>${observePuzzle(this.id,s,r).map(o => `<div><h2>${escapeHtml(o.label)}</h2><p>${escapeHtml(o.text)}</p></div>`).join('')}</section>
        ${this.renderMeter()}
        ${!s.completed && !r.solved ? `<div class="wb-ohm wb-question">${s.hints ? `<div><span>${guidance.voice}</span><p>${escapeHtml(guidance.hints[s.hints-1])}</p></div>` : ''}<button data-action="hint" ${s.hints >= guidance.hints.length ? 'disabled' : ''}>${s.hints ? s.hints >= guidance.hints.length ? 'Eso es lo que observamos' : s.hints === guidance.hints.length - 1 ? 'Mostrame un paso para probar' : 'Otra observación' : guidance.question} <span>↗</span></button></div>` : ''}
        ${r.solved && !r.proven && !s.completed && !this.practice ? `<div class="wb-success wb-proof" role="status"><div><strong>Funciona. Falta lo que pidió ${escapeHtml(p.proof.who)}</strong><p>${escapeHtml(p.proof.request)}</p></div></div>` : ''}
        ${(r.solved && r.proven) || s.completed ? `<div class="wb-success" role="status"><div><strong>${this.id === 'awaken' ? 'Un pequeño latido' : this.id === 'beacon_lens' ? 'La luz encuentra su ritmo' : 'Ahora puede sostenerse'}</strong><p>${s.completed ? 'La instalación sigue en servicio. Podés medirla, o practicar con una copia sin tocarla.' : this.practice ? 'En la copia también funciona. La instalación real sigue como la dejaste.' : 'Podés seguir probando o ponerlo en servicio. «Volver» lo deja armado sin encenderlo para el pueblo.'}</p></div>${s.completed ? '<button data-action="practice">Practicar con una copia</button><button data-action="close">Volver al mundo →</button>' : this.practice ? '<button data-action="end-practice">Terminar la práctica</button>' : `<button data-action="commission">${leaveLabel}</button>`}</div>` : ''}
        ${this.renderDetails()}${this.renderExperiments()}<p class="wb-feedback" role="status">${escapeHtml(this.feedback)}</p>
      </aside></div><footer class="wb-footer"><span>UN CAMBIO · UNA OBSERVACIÓN</span><span>Tab para recorrer · Enter para actuar · Esc para volver</span>${available.length && this.mode === 'wire' ? `<button class="wb-numbers" data-action="numbers" aria-pressed="${this.showNumbers}">${this.showNumbers ? 'Ocultar números' : 'Leer las marcas numéricas'}</button>` : ''}</footer>
    </div>`;
    if (this.shell.querySelector('[data-prediction]')) this.shell.querySelector('[data-prediction]').value = predictionDraft;
    this.shell.querySelectorAll('[data-drawer]').forEach(d => { d.open = drawers[d.dataset.drawer] ?? d.hasAttribute('open'); });
    this.shell.querySelector('.wb-case').style.setProperty('--wb-header-height', `${this.shell.querySelector('.wb-header').offsetHeight + 12}px`);
    this.shell.querySelector('.wb-case').scrollTop = scroll;
    this.shell.querySelector('.wb-aside').scrollTop = asideScroll;
    if (s.completed) this.shell.querySelectorAll('[data-action="power"],[data-action="rearm"],[data-action="switch"],[data-action="knob"],[data-action="undo"],[data-action="reset"],input[data-knob],button[data-wire],[data-mode="continuity"]').forEach(el => { el.disabled = true; });
    if (previous) {
      const keys = ['port','terminal','branch','action','knob'];
      const key = keys.find(k => previous[k]);
      if (key) {
        const suffix = ['key','mode'].filter(k => previous[k]).map(k => `[data-${k}="${previous[k]}"]`).join('');
        this.shell.querySelector(`[data-${key}="${previous[key]}"]${suffix}`)?.focus({ preventScroll: true });
      }
    }
  }

}
