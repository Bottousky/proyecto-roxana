import { solveDC, checkOperatingRange } from './electrical.js';
import { normalizeBenchEvidence } from './bench-evidence.js';

const port = (id, label, x, y, zone) => ({ id, label, x, y, ...(zone ? { zone } : {}) });
const component = (id, label, a, b, resistance, extra = {}) => ({ id, label, a, b, resistance, ...extra });
const sourcePorts = [port('positive', 'Fuente +', 85, 125), port('negative', 'Retorno −', 85, 375)];
const goal = (minVoltage, maxVoltage, minCurrent = 0, maxCurrent = Infinity) => ({ minVoltage, maxVoltage, minCurrent, maxCurrent });

// ── Piedras de freno ────────────────────────────────────────────────────────────────────────
// Resistors as Ohmdal keeps them: ceramic stones with painted rings. The rings write the value as two
// digits and how many zeros follow; the gold ring says the stone may lie by 5 %. Each stone has its own
// true value inside that margin: the weighing instrument reads it, and the bench's physics uses it.
export const RING_COLORS = ['negro', 'marron', 'rojo', 'naranja', 'amarillo', 'verde', 'azul', 'violeta', 'gris', 'blanco'];
/** The four rings of a stone: first digit, second digit, how many zeros, and the gold of ±5 %. */
export function stoneRings(nominal) {
  const zeros = Math.max(0, Math.floor(Math.log10(nominal)) - 1), digits = Math.round(nominal / 10 ** zeros);
  return [RING_COLORS[Math.floor(digits / 10)], RING_COLORS[digits % 10], RING_COLORS[zeros], 'oro'];
}
/** Paint for each ring, its name, and the letter Lumen scratches beside it (he can't tell red from green). */
export const RING_HEX = { negro: '#1d1b19', marron: '#6b3d1f', rojo: '#b3261e', naranja: '#d9701c', amarillo: '#e1b52a', verde: '#3d7a3a', azul: '#2c5aa0', violeta: '#6d3d8f', gris: '#8a8a8a', blanco: '#f2efe6', oro: '#c9a23a' };
export const RING_NAMES = { negro: 'negro', marron: 'marrón', rojo: 'rojo', naranja: 'naranja', amarillo: 'amarillo', verde: 'verde', azul: 'azul', violeta: 'violeta', gris: 'gris', blanco: 'blanco', oro: 'oro' };
export const RING_MARKS = { negro: 'N', marron: 'M', rojo: 'R', naranja: 'Na', amarillo: 'A', verde: 'V', azul: 'Az', violeta: 'Vi', gris: 'G', blanco: 'B', oro: 'O' };
/** A stone said by its rings, as someone who can't read them yet would: «marrón, negro, negro y oro». */
export function ringWords(nominal) { const r = stoneRings(nominal).map(c => RING_NAMES[c]); return `${r.slice(0, 3).join(', ')} y ${r[3]}`; }
const stone = (value, actual, extra = {}) => ({ value, actual, ...extra });
/** The stones a player weighed on Lumen's tray, in the order they were weighed (their nominal values). */
export const weighedStones = state => (Array.isArray(state?.weighed) ? state.weighed : []);
/** The riddle stone (red, red, brown) comes out of Lumen's fist once three stones were weighed. */
export const RIDDLE_STONE = 220;
/** An empty socket keeps a copper strap across it: no brake at all. */
const STRAP = { value: 0, actual: 0, strap: true };
/** The positions a control can take: the stones in its socket, or the notches of a dial. */
export function knobChoices(k) { return k.stones ? k.stones.map(st => st.value) : Array.from({ length: Math.round((k.max - k.min) / k.step) + 1 }, (_, i) => k.min + i * k.step); }
/** The stone sitting in a socket, if the control is one. */
export function stoneIn(k, value) { return k?.stones?.find(st => st.value === value) ?? null; }

// Every bench is a designed puzzle, not a sandbox: an explicit brief with checks, the installation's
// own wires soldered in place («sealed»), a fixed number of cables in hand («cables» counts every
// movable wire on the board), and dials with few, meaningful notches. «solve» is the canonical
// repair, used by tests and to carry old saves across a redesign.
/** Every bench offers the same four steps of help, the last one a concrete step to try. */
export const HINT_STEPS = 4;
const on = (r, s) => s.sourceOn && !s.tripped && !r.overloaded;
const branchOf = (r, id) => r.solution.branches[id] ?? { voltage: 0, current: 0, power: 0 };

export const PUZZLES = {
  awaken: {
    title: 'Un pequeño latido', place: 'PORTAL Ω · EL PEQUEÑO DE BRONCE', subtitle: 'Un cable ya sale de la celda hacia Ohm. Tenés otro en la mano.', voltage: 6, protection: 1.2,
    brief: 'Despertá a Ohm. Su corazón necesita un camino que salga de la celda, lo atraviese y vuelva a ella. Tenés un cable.',
    ports: [...sourcePorts, port('heartIn', 'Corazón +', 540, 210), port('heartOut', 'Corazón −', 790, 210)],
    components: [component('heart', 'Corazón de bronce', 'heartIn', 'heartOut', 12, { kind: 'orb', goal: goal(5.6, 6.1, .45, .52) })],
    initialWires: [['positive', 'heartIn']], sealed: [['positive', 'heartIn']], cables: 1,
    criteria: [{ text: 'El corazón de bronce late', met: r => r.operating.heart }],
    solve: s => { s.wires.push(['heartOut', 'negative']); },
    lesson: 'Un receptor necesita un camino completo: desde un borne de la fuente, a través de él, hasta el otro borne.',
    observation: 'Un filamento dorado tiembla bajo el vidrio. Todavía no hay latido.',
  },
  workshop: {
    title: 'La costura invisible', place: 'TALLER DE LUMEN · BANCO DE PRUEBAS', subtitle: 'Tres tramos de tela, iguales por fuera. Uno está cortado por dentro.', voltage: 6, protection: 1.1,
    brief: 'Encendé la luz del banco. Uno de los tres tramos esconde un corte y tenés un solo cable para puentearlo. Lumen no deja reparar a ciegas: quiere ver la medición que muestra dónde está el corte.',
    ports: [...sourcePorts, port('s1a', 'Tramo 1 · A', 215, 150), port('s1b', 'Tramo 1 · B', 365, 150), port('s2a', 'Tramo 2 · A', 425, 150), port('s2b', 'Tramo 2 · B', 575, 150), port('s3a', 'Tramo 3 · A', 635, 150), port('s3b', 'Tramo 3 · B', 785, 150), port('lampIn', 'Lámpara +', 640, 360), port('lampOut', 'Lámpara −', 860, 360)],
    components: [component('seam1', 'Tramo 1', 's1a', 's1b', .2, { kind: 'cloth' }), component('seam2', 'Tramo 2', 's2a', 's2b', Infinity, { kind: 'cloth' }), component('seam3', 'Tramo 3', 's3a', 's3b', .2, { kind: 'cloth' }), component('lamp', 'Luz del banco', 'lampIn', 'lampOut', 24, { kind: 'lamp', goal: goal(5.5, 6.1, .22, .27) })],
    initialWires: [['positive', 's1a'], ['s1b', 's2a'], ['s2b', 's3a'], ['s3b', 'lampIn'], ['lampOut', 'negative']],
    sealed: [['positive', 's1a'], ['s1b', 's2a'], ['s2b', 's3a'], ['s3b', 'lampIn'], ['lampOut', 'negative']], cables: 1,
    // On the bench each end reads just A or B: the section's name is engraved above it.
    boardLabels: { s1a: 'A', s1b: 'B', s2a: 'A', s2b: 'B', s3a: 'A', s3b: 'B' },
    proof: { id: 'foundBreak', who: 'Lumen', continuityOpen: ['s2a', 's2b'], request: 'Lumen quiere ver, con la mesa apagada, la prueba de camino que falla justo en el tramo cortado.', recorded: 'Con la mesa apagada, el instrumento no encontró camino a través del tramo 2: ahí está el corte.' },
    criteria: [{ text: 'Lumen vio dónde está el corte', met: r => r.proven }, { text: 'La luz del banco se enciende', met: r => r.operating.lamp }],
    solve: s => { s.wires.push(['s2a', 's2b']); s.proofs = { ...s.proofs, foundBreak: true }; },
    lesson: 'Una cubierta sana puede esconder un conductor cortado. La continuidad se mide con la fuente apagada; midiendo tramo por tramo se encuentra dónde falta el camino.',
    observation: 'Lumen dejó una nota: «No culpes al vidrio antes de seguir el cobre».',
  },
  gate: {
    title: 'El cerrojo que escucha', place: 'CALZADA · MECANISMO DE LA PUERTA', subtitle: 'El cerrojo golpea hacia el lado equivocado.', voltage: 12, protection: 1.5,
    brief: 'Hacé que el cerrojo avance hacia la marca → con fuerza firme. Podés mover los dos cables de la bobina y girar su freno. Sentido y fuerza son dos cosas distintas.',
    ports: [...sourcePorts, port('trimA', 'Freno A', 300, 165), port('trimB', 'Freno B', 525, 165), port('latchIn', 'Avance +', 635, 325), port('latchOut', 'Avance −', 860, 325)],
    components: [component('trim', 'Piedra de freno', 'trimA', 'trimB', 10, { valueKey: 'brake', kind: 'resistor' }), component('latch', 'Bobina del cerrojo', 'latchIn', 'latchOut', 14, { kind: 'coil', polarized: true, goal: goal(6.3, 7.8, .46, .57) })],
    // The socket holds a copper strap; Edda's pouch has four stones. Only the brown-black-black one gives a firm push.
    knobs: [{ key: 'brake', label: 'Zócalo del freno', socket: 'La bolsa de Edda', stones: [STRAP, stone(10, 10.1), stone(22, 21.7), stone(47, 47.6), stone(100, 98.5)], min: 0, max: 100, initial: 0, unit: 'Ω', description: 'Una piedra con más freno deja pasar menos corriente: el cerrojo empuja con menos fuerza.' }],
    initialWires: [['positive', 'trimA'], ['trimB', 'latchOut'], ['latchIn', 'negative']], sealed: [['positive', 'trimA']], cables: 2,
    criteria: [{ text: 'Empuja hacia la marca de avance →', met: (r, s) => on(r, s) && branchOf(r, 'latch').current > .05 }, { text: 'Con fuerza firme: ni tiembla ni golpea', met: (r, s) => { const i = Math.abs(branchOf(r, 'latch').current); return on(r, s) && i >= .46 && i <= .57; } }],
    solve: s => { s.wires = [['positive', 'trimA'], ['trimB', 'latchIn'], ['latchOut', 'negative']]; s.values.brake = 10; },
    lesson: 'El pestillo de este cerrojo es un imán: por eso el sentido de la corriente en la bobina decide si lo empuja o lo atrae. Una bobina que sólo mueve hierro atrae igual con cualquier sentido. La resistencia en serie regula la fuerza sin cambiar el camino.',
    observation: 'Las marcas del cerrojo dicen AVANCE →. Su pestillo es un imán, y ahora golpea hacia atrás.',
  },
  pump: {
    title: 'Lo que se pierde en el camino', place: 'MANANTIAL · ALIMENTACIÓN DE LA BOMBA', subtitle: 'La rueda gira con fuerza. El agua apenas sale.', voltage: 12, protection: 1.6,
    brief: 'Devolvele la fuerza a la bomba. Uno de los tres empalmes pierde tensión cuando la bomba trabaja y tenés un cable para puentearlo. Vega quiere ver, con la bomba en marcha, en cuál se pierde.',
    ports: [...sourcePorts, port('e1a', 'Empalme 1 · A', 215, 150), port('e1b', 'Empalme 1 · B', 365, 150), port('e2a', 'Empalme 2 · A', 425, 150), port('e2b', 'Empalme 2 · B', 575, 150), port('e3a', 'Empalme 3 · A', 635, 150), port('e3b', 'Empalme 3 · B', 785, 150), port('pumpIn', 'Bomba +', 640, 360), port('pumpOut', 'Bomba −', 875, 360)],
    components: [component('joint1', 'Empalme 1', 'e1a', 'e1b', .2, { kind: 'joint' }), component('joint2', 'Empalme 2', 'e2a', 'e2b', 18, { kind: 'joint' }), component('joint3', 'Empalme 3', 'e3a', 'e3b', .2, { kind: 'joint' }), component('pump', 'Bomba del manantial', 'pumpIn', 'pumpOut', 12, { kind: 'motor', goal: goal(10.5, 12.2, .87, 1.05) })],
    initialWires: [['positive', 'e1a'], ['e1b', 'e2a'], ['e2b', 'e3a'], ['e3b', 'pumpIn'], ['pumpOut', 'negative']],
    sealed: [['positive', 'e1a'], ['e1b', 'e2a'], ['e2b', 'e3a'], ['e3b', 'pumpIn'], ['pumpOut', 'negative']], cables: 1,
    boardLabels: { e1a: 'A', e1b: 'B', e2a: 'A', e2b: 'B', e3a: 'A', e3b: 'B' },
    proof: { id: 'foundLoss', who: 'Vega', voltageAcross: ['e2a', 'e2b'], minVoltage: 2, request: 'Vega quiere ver, con la bomba trabajando, la comparación de los dos extremos del empalme que pierde.', recorded: 'Con la bomba trabajando comparé los extremos del empalme 2: ahí se pierde casi toda la tensión.' },
    // Vega wants to know where the 12 V went: every part of the loop measured on one montage, added up.
    tally: { id: 'loop', kind: 'voltage', who: 'Vega', title: 'La cuenta de la vuelta', parts: ['joint1', 'joint2', 'joint3', 'pump'],
      // Vega sums with the old joint still in place: that is where the 12 V went. A bridged joint is a healthy loop.
      before: ['e2a', 'e2b'],
      request: 'Vega quiere la cuenta con el empalme viejo puesto: retirá un momento tu puente, compará los extremos de cada empalme y de la bomba, y ella suma. Después lo volvés a tender.' },
    criteria: [{ text: 'Vega vio en qué empalme se pierde la fuerza', met: r => r.proven }, { text: 'Vega cerró la cuenta de la vuelta: adónde fue cada voltio', met: (r, s) => s.tally?.closed === true }, { text: 'La bomba recibe toda la fuerza: el agua sale plena', met: r => r.operating.pump }],
    solve: s => { s.wires.push(['e2a', 'e2b']); s.proofs = { ...s.proofs, foundLoss: true }; s.tally = { closed: true, readings: {} }; },
    lesson: 'Un empalme puede tener continuidad y aun así perder tensión y calentarse bajo carga. Comparar los extremos de cada tramo con la carga trabajando localiza la pérdida.',
    observation: 'La rueda del generador gira, pero la bomba apenas impulsa agua. Uno de los empalmes está tibio.',
  },
  distribution: {
    title: 'Dos luces, un refugio', place: 'CASTILLO · DISTRIBUIDOR DEL PATIO', subtitle: 'Enfermería y cocina comparten un solo camino: las dos brillan a medias.', voltage: 12, protection: 3.1,
    brief: 'Enfermería y cocina deben brillar a pleno, cada una por su cuenta. Tenés tres cables; los soldados son de la instalación. Ivara lo comprobará aislando la cocina.',
    ports: [...sourcePorts, port('clinicIn', 'Enfermería +', 530, 115), port('clinicOut', 'Enfermería −', 795, 115), port('kitchenIn', 'Cocina +', 530, 270), port('kitchenOut', 'Cocina −', 795, 270), port('archiveIn', 'Archivo +', 330, 410), port('archiveOut', 'Archivo −', 620, 410)],
    // Each piece's name is engraved above it; its terminals only say which end.
    boardLabels: { clinicIn: '+', clinicOut: '−', kitchenIn: '+', kitchenOut: '−', archiveIn: '+', archiveOut: '−' },
    components: [component('clinic', 'Enfermería', 'clinicIn', 'clinicOut', 12, { kind: 'lamp', goal: goal(10.7, 12.2, .89, 1.03) }), component('kitchen', 'Cocina', 'kitchenIn', 'kitchenOut', 12, { kind: 'lamp', switchKey: 'kitchen', goal: goal(10.7, 12.2, .89, 1.03) }), component('archive', 'Archivo anegado', 'archiveIn', 'archiveOut', 3, { kind: 'switch', switchKey: 'archive' })],
    switches: [{ key: 'archive', label: 'Rama del archivo', initial: false, external: true, description: 'Aislada desde el patio.' }, { key: 'kitchen', label: 'Llave de la cocina', initial: true, description: 'Aislá la cocina, como si hubiera que repararla.' }],
    // Ivara reopens the services only after seeing the infirmary stay lit while the kitchen is isolated.
    proof: { id: 'clinicAlone', who: 'Ivara', component: 'clinic', when: s => !s.switches.kitchen, request: 'Ivara quiere verlo antes de reabrir: la enfermería encendida mientras la cocina está aislada.', recorded: 'Con la cocina aislada, la enfermería siguió encendida.' },
    initialWires: [['positive', 'clinicIn'], ['clinicOut', 'kitchenIn'], ['kitchenOut', 'negative'], ['positive', 'archiveIn'], ['archiveOut', 'negative']],
    sealed: [['positive', 'clinicIn'], ['kitchenOut', 'negative'], ['positive', 'archiveIn'], ['archiveOut', 'negative']], cables: 3,
    criteria: [{ text: 'Enfermería con luz plena', met: r => r.operating.clinic }, { text: 'Cocina con luz plena', met: r => r.operating.kitchen }, { text: 'Ivara vio la enfermería encendida con la cocina aislada', met: r => r.proven }],
    solve: s => { s.wires = [['positive', 'clinicIn'], ['clinicOut', 'negative'], ['positive', 'kitchenIn'], ['kitchenOut', 'negative'], ['positive', 'archiveIn'], ['archiveOut', 'negative']]; s.switches.kitchen = true; s.proofs = { ...s.proofs, clinicAlone: true }; },
    lesson: 'En paralelo, los servicios comparten los dos nodos de la fuente. Cada rama funciona de manera independiente; se puede aislar una falla sin interrumpir las otras.',
    observation: 'El archivo está aislado desde el patio. Los dos servicios sanos todavía se iluminan poco.',
  },
  irrigation: {
    title: 'La paciencia del invernadero', place: 'TERRAZAS · MESA DE REGULACIÓN', subtitle: 'Horno, raíces y riego tiran del mismo cable de la ladera.', voltage: 18, protection: 4,
    brief: 'Tres frenos y un solo cable de la ladera. Encontrá un reparto en el que las raíces estén tibias, el riego salga parejo y Yesca pueda forjar, sin que el cable se caliente. Hay más de un acuerdo posible.',
    ports: [...sourcePorts, port('warmA', 'Regulador térmico A', 290, 105), port('warmB', 'Regulador térmico B', 505, 105), port('rootIn', 'Raíces +', 635, 105), port('rootOut', 'Raíces −', 860, 105), port('flowA', 'Regulador de agua A', 290, 250), port('flowB', 'Regulador de agua B', 505, 250), port('flowIn', 'Riego +', 635, 250), port('flowOut', 'Riego −', 860, 250), port('forgeA', 'Regulador del horno A', 290, 395), port('forgeB', 'Regulador del horno B', 505, 395), port('forgeIn', 'Horno +', 635, 395), port('forgeOut', 'Horno −', 860, 395)],
    // Each piece's name is engraved above it; its terminals only say which end.
    boardLabels: { warmA: 'A', warmB: 'B', flowA: 'A', flowB: 'B', forgeA: 'A', forgeB: 'B', rootIn: '+', rootOut: '−', flowIn: '+', flowOut: '−', forgeIn: '+', forgeOut: '−' },
    components: [component('warmTrim', 'Regulador de calor', 'warmA', 'warmB', 0, { valueKey: 'warmth', kind: 'resistor' }), component('roots', 'Lecho de raíces', 'rootIn', 'rootOut', 24, { kind: 'heater', goal: { ...goal(10, 13, .4, .55), maxPower: 7 } }), component('flowTrim', 'Regulador de caudal', 'flowA', 'flowB', 0, { valueKey: 'flow', kind: 'resistor' }), component('flow', 'Bomba de riego', 'flowIn', 'flowOut', 18, { kind: 'motor', goal: goal(9.5, 11.8, .52, .66) }), component('forgeTrim', 'Regulador del horno', 'forgeA', 'forgeB', 0, { valueKey: 'forge', kind: 'resistor' }), component('forge', 'Horno de Yesca · 12 Ω', 'forgeIn', 'forgeOut', 12, { kind: 'forge', goal: goal(8.4, 18.5, .7, 1.6) })],
    // The hillside line is shared: forge, roots and pump together may draw at most 2.2 A.
    constraints: [{ source: true, maxCurrent: 2.2 }],
    knobs: [{ key: 'warmth', label: 'Freno del calor', min: 0, max: 24, step: 6, initial: 0, unit: 'Ω', description: 'Más freno, menos calor en las raíces.' }, { key: 'flow', label: 'Freno del agua', min: 0, max: 24, step: 6, initial: 0, unit: 'Ω', description: 'Más freno, un caudal más suave.' }, { key: 'forge', label: 'Freno del horno', min: 0, max: 18, step: 6, initial: 0, unit: 'Ω', description: 'Más freno, menos calor para Yesca y más cable para el resto.' }],
    initialWires: [['positive', 'warmA'], ['warmB', 'rootIn'], ['rootOut', 'negative'], ['positive', 'flowA'], ['flowB', 'flowIn'], ['flowOut', 'negative'], ['positive', 'forgeA'], ['forgeB', 'forgeIn'], ['forgeOut', 'negative']],
    sealed: [['positive', 'warmA'], ['warmB', 'rootIn'], ['rootOut', 'negative'], ['positive', 'flowA'], ['flowB', 'flowIn'], ['flowOut', 'negative'], ['positive', 'forgeA'], ['forgeB', 'forgeIn'], ['forgeOut', 'negative']], cables: 0,
    criteria: [{ text: 'Raíces tibias: las hojas se abren', met: r => r.operating.roots }, { text: 'El riego sale parejo', met: r => r.operating.flow }, { text: 'Yesca puede forjar', met: r => r.operating.forge }, { text: 'El cable de la ladera no se calienta', met: (r, s) => on(r, s) && r.requestedCurrent <= 2.2 }],
    solve: s => { s.values.warmth = 12; s.values.flow = 12; s.values.forge = 6; },
    lesson: 'La potencia eléctrica se transforma en calor o trabajo. Una línea compartida tiene un límite: lo que toma una rama no lo toman las otras. Hay más de un reparto que funciona; elegir uno es decidir quién cede.',
    observation: 'Las hojas se repliegan con el calor. El agua golpea la tierra demasiado fuerte.',
  },
  beacon_supply: {
    title: 'I · El pulso del Faro', place: 'FARO · CÁMARA DE ALIMENTACIÓN', subtitle: 'El núcleo pide más fuerza, pero el tendido norte ya se calienta.', voltage: 24, protection: 2.2,
    brief: 'El núcleo debe sostener su pulso sin que ningún tendido se caliente. Con un solo tendido no alcanza. Hay un tendido sur sin conectar y dos cables en la mano.',
    // The two lines run up the tower: a hand cable only joins terminals at the same end of them.
    zones: { generator: 'Junto al generador', core: 'Junto al núcleo' },
    ports: [port('positive', 'Fuente +', 85, 125, 'generator'), port('negative', 'Retorno −', 85, 375, 'generator'), port('lineAa', 'Tendido norte · A', 250, 125, 'generator'), port('lineAb', 'Tendido norte · B', 470, 125, 'core'), port('lineBa', 'Tendido sur · A', 250, 275, 'generator'), port('lineBb', 'Tendido sur · B', 470, 275, 'core'), port('ballastA', 'Regulador A', 610, 125, 'core'), port('ballastB', 'Regulador B', 850, 125, 'core'), port('coreIn', 'Núcleo +', 560, 370, 'core'), port('coreOut', 'Núcleo −', 820, 370, 'core')],
    // Each piece's name is engraved above it; its terminals only say which end.
    boardLabels: { lineAa: 'A', lineAb: 'B', lineBa: 'A', lineBb: 'B', ballastA: 'A', ballastB: 'B', coreIn: '+', coreOut: '−' },
    components: [component('lineA', 'Tendido norte · 6 Ω', 'lineAa', 'lineAb', 6, { kind: 'resistor' }), component('lineB', 'Tendido sur · 6 Ω', 'lineBa', 'lineBb', 6, { kind: 'resistor' }), component('ballast', 'Regulador del generador', 'ballastA', 'ballastB', 3, { kind: 'resistor', valueKey: 'ballast' }), component('core', 'Núcleo de alimentación', 'coreIn', 'coreOut', 12, { kind: 'coil', goal: goal(16.2, 18.2, 1.35, 1.52) })],
    knobs: [{ key: 'ballast', label: 'Regulador del generador', min: 0, max: 5, step: 1, initial: 3, unit: 'Ω', description: 'Menos freno, más fuerza para el núcleo… y más corriente por los tendidos.' }],
    constraints: [{ branch: 'lineA', maxPower: 5.2 }, { branch: 'lineB', maxPower: 5.2 }],
    initialWires: [['positive', 'lineAa'], ['lineAb', 'ballastA'], ['ballastB', 'coreIn'], ['coreOut', 'negative']],
    sealed: [['positive', 'lineAa'], ['lineAb', 'ballastA'], ['ballastB', 'coreIn'], ['coreOut', 'negative']], cables: 2,
    criteria: [{ text: 'El núcleo sostiene su pulso', met: r => r.operating.core }, { text: 'Ningún tendido se calienta', met: (r, s) => on(r, s) && r.current > .05 && ['lineA', 'lineB'].every(id => (branchOf(r, id).power ?? 0) <= 5.2) }],
    solve: s => { s.wires.push(['positive', 'lineBa'], ['lineBb', 'ballastA']); s.values.ballast = 1; },
    lesson: 'Dos conductores en paralelo se reparten la corriente: cada uno lleva la mitad y se calienta mucho menos. Así la carga recibe más tensión sin castigar el tendido.',
    observation: 'Por debajo del piso, los cables esperan como raíces dormidas. Uno está tibio; el otro, suelto.',
  },
  beacon_network: {
    title: 'II · Tres voces en la torre', place: 'FARO · GALERÍA DE DISTRIBUCIÓN', subtitle: 'Luz, giro y campana, encadenadas: ninguna recibe lo que necesita.', voltage: 18, protection: 2.3,
    brief: 'Luz, giro y campana deben funcionar cada una por su cuenta, sin atravesar a las otras. Tenés cuatro cables; los soldados son de la torre.',
    ports: [...sourcePorts, port('opticIn', 'Óptica +', 520, 105), port('opticOut', 'Óptica −', 800, 105), port('bearingIn', 'Giro +', 520, 255), port('bearingOut', 'Giro −', 800, 255), port('signalIn', 'Señales +', 520, 405), port('signalOut', 'Señales −', 800, 405)],
    // Each piece's name is engraved above it; its terminals only say which end.
    boardLabels: { opticIn: '+', opticOut: '−', bearingIn: '+', bearingOut: '−', signalIn: '+', signalOut: '−' },
    components: [component('optic', 'Cámara óptica · 18 Ω', 'opticIn', 'opticOut', 18, { kind: 'lamp', goal: goal(16.5, 18.2, .91, 1.03) }), component('bearing', 'Giro de la cúpula · 36 Ω', 'bearingIn', 'bearingOut', 36, { kind: 'motor', goal: goal(16.5, 18.2, .45, .52) }), component('signal', 'Señal de la costa · 72 Ω', 'signalIn', 'signalOut', 72, { kind: 'coil', goal: goal(16.5, 18.2, .22, .26) })],
    initialWires: [['positive', 'opticIn'], ['opticOut', 'bearingIn'], ['bearingOut', 'signalIn'], ['signalOut', 'negative']],
    sealed: [['positive', 'opticIn'], ['signalOut', 'negative']], cables: 4,
    // Nereo writes numbers for the first time: each voice's current and what leaves the source.
    tally: { id: 'nodes', kind: 'current', who: 'Nereo', title: 'La regla de los nudos', parts: ['optic', 'bearing', 'signal', 'source'], request: 'Nereo quiere anotar la regla de los nudos: con “Medir un camino”, medí cada voz y también lo que sale de la fuente.' },
    criteria: [{ text: 'La cámara óptica brilla', met: r => r.operating.optic }, { text: 'La cúpula gira', met: r => r.operating.bearing }, { text: 'La señal de la costa suena', met: r => r.operating.signal }, { text: 'Nereo anotó cada voz y lo que sale de la fuente', met: (r, s) => s.tally?.closed === true }],
    solve: s => { s.wires = [['positive', 'opticIn'], ['opticOut', 'negative'], ['positive', 'bearingIn'], ['bearingOut', 'negative'], ['positive', 'signalIn'], ['signalOut', 'negative']]; s.tally = { closed: true, readings: {} }; },
    lesson: 'Tres resistencias diferentes en paralelo reciben la misma tensión y conducen corrientes distintas. La corriente de la fuente es la suma de las corrientes de sus ramas.',
    observation: 'Una inscripción: «Que ninguna voz tenga que atravesar a las otras para llegar al mar».',
  },
  beacon_lens: {
    title: 'III · La luz que sabe volver', place: 'FARO · CORAZÓN DE LA LENTE', subtitle: 'La lente toma la fuerza entera de la fuente y encandila.', voltage: 18, protection: 2.4,
    brief: 'La lente debe dar una luz dorada y estable desde la toma del divisor. Tenés que mover su cable y calibrar el freno con la lente conectada. Nereo quiere anotar cuánto cambia la toma al conectarla.',
    ports: [...sourcePorts, port('upperA', 'Divisor · entrada', 320, 115), port('tap', 'Toma intermedia', 575, 115), port('lowerB', 'Divisor · retorno', 835, 115), port('lensIn', 'Lente +', 525, 350), port('lensOut', 'Lente −', 815, 350)],
    components: [component('upper', 'Brazo superior', 'upperA', 'tap', 24, { kind: 'resistor', valueKey: 'upper' }), component('lower', 'Brazo inferior · 24 Ω', 'tap', 'lowerB', 24, { kind: 'resistor' }), component('lens', 'Cristal del horizonte · 24 Ω', 'lensIn', 'lensOut', 24, { kind: 'lens', goal: goal(8.7, 9.3, .362, .388) })],
    constraints: [{ branch: 'lower', minCurrent: .05 }],
    // Nereo needs a rule the next keeper can check: how much the tap drops when the lens is connected.
    proof: { id: 'loadEffect', who: 'Nereo', parts: ['tapUnloaded', 'tapLoaded'], measure: { between: ['tap', 'negative'], load: ['lensIn', 'tap'] }, request: 'Nereo quiere dejar escrito cuánto cambia la toma al conectar la lente: medila sin la lente y con la lente.', recorded: 'Medí la toma sin la lente y con la lente conectada: al cargarla, la tensión baja.' },
    // The upper arm is a socket: the old stone (red-yellow-black) and the keeper's three spares. The 12 Ω one
    // gives the golden light even if it lies its 5 %: that is what the gold ring is for.
    knobs: [{ key: 'upper', label: 'Zócalo del brazo superior', socket: 'La caja del farero', stones: [stone(10, 10.2), stone(12, 12.2), stone(15, 14.7), stone(24, 24)], min: 10, max: 24, initial: 24, unit: 'Ω', description: 'El brazo superior del divisor. Elegí su piedra con la lente conectada: ella también forma parte de la red.' }],
    initialWires: [['positive', 'upperA'], ['lowerB', 'negative'], ['positive', 'lensIn'], ['lensOut', 'negative']],
    sealed: [['positive', 'upperA'], ['lowerB', 'negative'], ['lensOut', 'negative']], cables: 1,
    criteria: [{ text: 'Nereo anotó cuánto baja la toma con la lente', met: r => r.proven }, { text: 'La lente da una luz dorada y estable', met: r => r.solved }],
    solve: s => { s.wires = [['positive', 'upperA'], ['lowerB', 'negative'], ['tap', 'lensIn'], ['lensOut', 'negative']]; s.values.upper = 12; s.proofs = { ...s.proofs, loadEffect: true, tapUnloaded: true, tapLoaded: true }; },
    lesson: 'La carga cambia un divisor: la lente y el brazo inferior quedan en paralelo. Calibrar con la carga conectada permite obtener la tensión que el sistema necesita en funcionamiento.',
    observation: 'La lente devuelve una luz blanca, demasiado dura. El mar espera una luz que pueda sostenerse.',
  },
};

// ── Optional benches: their own reward, never on the main road ──────────────────────────────
PUZZLES.drawer = {
  title: 'El cajón de Lumen', place: 'TALLER DE LUMEN · EL CAJÓN DE LAS PIEDRAS', subtitle: 'Seis piedras de freno en una bandeja. Lumen guarda una séptima en el puño.', voltage: 6, protection: 1.2, optional: true,
  brief: 'Lumen elige las piedras «por temperamento». Poné cada una en el zócalo y pesala con la mesa apagada: el instrumento dice cuánto frena. Después, Lumen tiene un acertijo.',
  ports: [...sourcePorts, port('trayA', 'Zócalo · A', 330, 125), port('trayB', 'Zócalo · B', 600, 125), port('lampIn', 'Lámpara +', 640, 345), port('lampOut', 'Lámpara −', 860, 345)],
  components: [component('tray', 'Piedra del cajón', 'trayA', 'trayB', 10, { valueKey: 'tray', kind: 'resistor' }), component('lamp', 'Lámpara de prueba', 'lampIn', 'lampOut', 12, { kind: 'lamp' })],
  initialWires: [['positive', 'trayA'], ['trayB', 'lampIn'], ['lampOut', 'negative']],
  sealed: [['positive', 'trayA'], ['trayB', 'lampIn'], ['lampOut', 'negative']], cables: 0,
  knobs: [{ key: 'tray', label: 'Zócalo de prueba', socket: 'El cajón de Lumen', stones: [stone(10, 9.9), stone(12, 11.8), stone(22, 22.3), stone(47, 46.4), stone(100, 101), stone(120, 118), stone(RIDDLE_STONE, 217, { riddle: true })], min: 10, max: RIDDLE_STONE, initial: 10, unit: 'Ω', description: 'La piedra que se pesa.' }],
  criteria: [
    { text: 'Pesaste tres piedras del cajón', met: (r, s) => weighedStones(s).filter(v => v !== RIDDLE_STONE).length >= 3 },
    { text: 'Le dijiste a Lumen cuánto frena la piedra roja, roja, marrón, y la pesaste', met: (r, s) => weighedStones(s).includes(RIDDLE_STONE) },
  ],
  // Done is what was weighed, not a working montage: the stones are weighed with the bench off.
  done: s => weighedStones(s).filter(v => v !== RIDDLE_STONE).length >= 3 && weighedStones(s).includes(RIDDLE_STONE),
  solve: s => { s.weighed = [10, 12, 100, RIDDLE_STONE]; s.values.tray = RIDDLE_STONE; s.estimate = { choice: 'doscientos', settled: true, measured: 217 }; },
  lesson: 'Los anillos escriben un número: dos cifras y cuántos ceros. El anillo dorado dice que el valor real puede correrse un 5 %: el instrumento lo confirma.',
  observation: 'Lumen tiene un cajón de piedras de freno, cada una con anillos pintados. Las elige «por temperamento».',
};

const samePair = (a, b) => (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
/** A wire soldered into the installation: it cannot be removed and does not use a cable in hand. */
/** Declared simplification: only parts with a reason to care about direction are polarized. */
export function isPolarized(component) { return component.polarized ?? ['motor', 'orb', 'lens'].includes(component.kind); }
export function isSealed(id, wire) { return (PUZZLES[id].sealed ?? []).some(w => samePair(w, wire)); }
/** A hand cable is short: where a bench has zones, it only joins terminals in the same one. */
export function canJoin(id, a, b) { const p = PUZZLES[id], za = p.ports.find(n => n.id === a)?.zone, zb = p.ports.find(n => n.id === b)?.zone; return !za || !zb || za === zb; }
/** Cables still in hand: the bench's allowance minus every movable wire already on it. */
export function cablesInHand(id, state) { const p = PUZZLES[id]; return (p.cables ?? Infinity) - state.wires.filter(w => !isSealed(id, w)).length; }

/** Which agreement the terraces bench settled on: the forge keeps its strength (>= 12 W) or the water comes first. */
export function terracesAgreement(state) {
  if (!state) return null;
  const r = evaluatePuzzle('irrigation', state);
  if (!r.solved) return null;
  return Math.abs(r.solution.branches.forge?.power ?? 0) >= 11.5 ? 'forja' : 'riego';
}

export function initialPuzzleSnapshot(id) {
  const p = PUZZLES[id];
  if (!p) throw new Error(`Unknown puzzle: ${id}`);
  return { version: 1, id, proofs: {}, trace: Object.fromEntries((p.knobs ?? []).map(k => [k.key, { min: k.initial, max: k.initial }])), wires: p.initialWires.map(w => [...w]), switches: Object.fromEntries((p.switches ?? []).map(s => [s.key, s.initial])), values: Object.fromEntries((p.knobs ?? []).map(k => [k.key, k.initial])), sourceOn: true, tripped: false, meter: { mode: 'voltage', a: null, b: null, branch: null }, hints: 0, evidence: [], conjuro: false, estimate: null, tally: null, ...(p.done ? { weighed: [] } : {}), completed: false };
}

export function normalizePuzzleSnapshot(id, saved) {
  const initial = initialPuzzleSnapshot(id), p = PUZZLES[id];
  if (!saved || saved.id !== id || saved.version !== 1) return initial;
  const ids = new Set(p.ports.map(n => n.id));
  const wires = Array.isArray(saved.wires) ? saved.wires.filter(w => Array.isArray(w) && w.length === 2 && w[0] !== w[1] && w.every(n => ids.has(n))).map(w => [...w]) : initial.wires;
  const uniqueWires = wires.filter((w, i) => wires.findIndex(other => [...other].sort().join('|') === [...w].sort().join('|')) === i);
  // The installation's soldered wires are always there; movable ones never exceed the cables in hand.
  for (const w of p.sealed ?? []) if (!uniqueWires.some(u => samePair(u, w))) uniqueWires.push([...w]);
  let movable = 0;
  for (let i = uniqueWires.length - 1; i >= 0; i--) if (!isSealed(id, uniqueWires[i]) && (!canJoin(id, ...uniqueWires[i]) || ++movable > (p.cables ?? Infinity))) { if (canJoin(id, ...uniqueWires[i])) movable--; uniqueWires.splice(i, 1); }
  const normalized = { ...initial, evidence: normalizeBenchEvidence(saved.evidence), wires: uniqueWires, sourceOn: typeof saved.sourceOn === 'boolean' ? saved.sourceOn : initial.sourceOn, tripped: !!saved.tripped, completed: !!saved.completed,
    switches: Object.fromEntries((p.switches ?? []).map(s => [s.key, typeof saved.switches?.[s.key] === 'boolean' ? saved.switches[s.key] : s.initial])),
    // A value always sits on a notch, or is a stone the socket has (the nearest one, for saves from before sockets).
    values: Object.fromEntries((p.knobs ?? []).map(k => { const v = saved.values?.[k.key]; return [k.key, Number.isFinite(v) ? knobChoices(k).reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a)) : k.initial]; })),
    hints: Number.isFinite(saved.hints) ? Math.max(0, Math.min(HINT_STEPS, Math.floor(saved.hints))) : 0,
    meter: { mode: ['voltage', 'continuity', 'current', 'weigh'].includes(saved.meter?.mode) ? saved.meter.mode : 'voltage', a: ids.has(saved.meter?.a) ? saved.meter.a : null, b: ids.has(saved.meter?.b) ? saved.meter.b : null, branch: p.components.some(c => c.id === saved.meter?.branch) || (saved.meter?.branch === 'source' && p.tally?.parts.includes('source')) ? saved.meter.branch : null },
  };
  // Whether the copper already put the keeper's inherited conjuro to the test on this bench.
  // A repaired installation already answered it, also in saves from before conjuros existed.
  normalized.conjuro = saved.conjuro === true || saved.completed === true;
  // The keeper's sum (Kirchhoff's laws, in Ohmdal words): readings taken on one montage, and whether it closed.
  // An installation already in service closed it, also in saves from before the sum was asked.
  if (p.tally) {
    const readings = Object.fromEntries(p.tally.parts.filter(k => Number.isFinite(saved.tally?.readings?.[k])).map(k => [k, saved.tally.readings[k]]));
    normalized.tally = { closed: saved.tally?.closed === true || saved.completed === true, readings, ...(typeof saved.tally?.signature === 'string' ? { signature: saved.tally.signature.slice(0, 2000) } : {}) };
  }
  // The stones weighed on an optional tray: only stones the tray has, each once.
  if (p.done) { const tray = p.knobs.flatMap(k => knobChoices(k)); normalized.weighed = weighedStones(saved).filter((v, i, all) => tray.includes(v) && all.indexOf(v) === i); }
  // The mark written in the keepers' book before measuring («skip» if measured without one), and what was read.
  normalized.estimate = saved.estimate && typeof saved.estimate.choice === 'string' && /^[a-z]{1,12}$/.test(saved.estimate.choice)
    ? { choice: saved.estimate.choice, settled: saved.estimate.settled === true, ...(Number.isFinite(saved.estimate.measured) ? { measured: saved.estimate.measured } : {}) } : null;
  // A proof counts once seen. Installations commissioned before a proof was required keep it.
  normalized.proofs = !p.proof ? {} : Object.fromEntries([p.proof.id, ...(p.proof.parts ?? [])].filter(k => saved.proofs?.[k] === true).map(k => [k, true]));
  if (p.proof && saved.completed === true) normalized.proofs[p.proof.id] = true;
  // Saves from before the trace existed stay unknown (null): nothing may be claimed about them.
  normalized.trace = saved.trace && typeof saved.trace === 'object' ? Object.fromEntries((p.knobs ?? []).map(k => { const t = saved.trace[k.key], v = normalized.values[k.key];
    return [k.key, Number.isFinite(t?.min) && Number.isFinite(t?.max) ? { min: Math.max(k.min, Math.min(t.min, v)), max: Math.min(k.max, Math.max(t.max, v)) } : { min: v, max: v }]; })) : null;
  // An installation put in service before a bench was redesigned (its wiring names terminals that no longer
  // exist) stays in service, rebuilt as its canonical repair. A current-design montage is never rebuilt.
  const legacy = Array.isArray(saved.wires) && saved.wires.some(w => Array.isArray(w) && !w.every(n => ids.has(n)));
  if (legacy && normalized.completed && !evaluatePuzzle(id, normalized).solved && p.solve) {
    const rebuilt = initialPuzzleSnapshot(id); p.solve(rebuilt);
    Object.assign(normalized, { wires: rebuilt.wires, values: rebuilt.values, switches: rebuilt.switches, proofs: { ...normalized.proofs, ...rebuilt.proofs }, sourceOn: true, tripped: false });
  }
  // A corrupt completed marker must never make a broken installation uneditable.
  normalized.completed = normalized.completed && evaluatePuzzle(id, normalized).solved;
  return normalized;
}

/** What a piece really brakes on this montage: a stone brakes its own true value, not what its rings say. */
export function pieceResistance(id, c, state) {
  if (!c.valueKey) return c.resistance;
  const v = state.values[c.valueKey], st = stoneIn(PUZZLES[id].knobs?.find(k => k.key === c.valueKey), v);
  return st ? st.actual : v;
}

export function puzzleNetwork(id, state, powered = state.sourceOn && !state.tripped) {
  const p = PUZZLES[id];
  return { nodes: p.ports.map(n => n.id), ground: 'negative',
    sources: powered ? [{ id: 'source', positive: 'positive', negative: 'negative', voltage: p.voltage }] : [],
    resistors: [...p.components.map(c => ({ id: c.id, a: c.a, b: c.b, resistance: pieceResistance(id, c, state), enabled: c.switchKey ? state.switches[c.switchKey] : true })), ...state.wires.map((w, i) => ({ id: `wire${i}`, a: w[0], b: w[1], resistance: .035 }))],
  };
}

export function evaluatePuzzle(id, state) {
  const p = PUZZLES[id];
  const network = puzzleNetwork(id, state);
  let solution = solveDC(network);
  const requestedCurrent = solution.sourceCurrents.source ?? 0;
  const overloaded = state.sourceOn && !state.tripped && requestedCurrent > p.protection;
  if (overloaded) solution = solveDC(puzzleNetwork(id, state, false));
  const current = overloaded || state.tripped ? 0 : requestedCurrent;
  const powered = state.sourceOn && !state.tripped && !overloaded;
  const operating = Object.fromEntries(p.components.filter(c => c.goal).map(c => {
    const branch = solution.branches[c.id];
    // Filament lamps, heating elements and plain coils work either way round. Motors, the gate's
    // magnet latch and the active optical crystal depend on the marked direction (isPolarized).
    const operatingBranch = !isPolarized(c) && branch.voltage !== null ? { ...branch, voltage: Math.abs(branch.voltage), current: Math.abs(branch.current) } : branch;
    return [c.id, powered && checkOperatingRange(operatingBranch, c.goal)];
  }));
  // maxPower limits losses on a line; minCurrent keeps a part in service (the lens divider needs both arms).
  const constraintsMet = (p.constraints ?? []).every(c => { if (c.source) return !powered || requestedCurrent <= c.maxCurrent; const b = solution.branches[c.branch]; return (c.maxPower === undefined || (b?.power ?? Infinity) <= c.maxPower) && Math.abs(b?.current ?? 0) >= (c.minCurrent ?? 0); });
  const solved = p.done ? p.done(state) : powered && solution.valid && Object.values(operating).every(Boolean) && constraintsMet;
  // «solved» is physics. Commissioning may also need a proof the community asked to see.
  const proofMet = !!p.proof?.when && powered && solution.valid && constraintsMet && p.proof.when(state) && operating[p.proof.component];
  const proven = !p.proof || state.proofs?.[p.proof.id] === true || proofMet;
  const tallied = !p.tally || state.tally?.closed === true;
  const result = { network, solution, overloaded, requestedCurrent, current, power: current * p.voltage, voltage: powered ? p.voltage : 0, operating, constraintsMet, solved, proofMet, proven, tallied, commissionable: solved && proven && tallied };
  // The brief's checklist, read from the same physics: what the player sees ticked is what counts.
  result.checks = (p.criteria ?? []).map(c => ({ text: c.text, met: !!c.met(result, state) }));
  return result;
}

/** Terminals joined by copper alone: wires, never through a component. It is what a
 * student can follow with a finger along the bench, so it reveals no voltage. */
export function wireNodes(id, state) {
  const p = PUZZLES[id];
  const parent = new Map(p.ports.map(n => [n.id, n.id]));
  const find = a => { while (parent.get(a) !== a) { parent.set(a, parent.get(parent.get(a))); a = parent.get(a); } return a; };
  for (const [a, b] of state.wires) if (parent.has(a) && parent.has(b)) parent.set(find(a), find(b));
  const nodeOf = Object.fromEntries(p.ports.map(n => [n.id, find(n.id)]));
  const members = {};
  for (const n of p.ports) (members[nodeOf[n.id]] ??= []).push(n.id);
  return { nodeOf, members };
}

/** Workshop colour convention, decided only by a wire's own ends: copper leaves the
 * source's positive terminal and blue returns to its negative one. */
export function wireRole([a, b]) {
  const supply = a === 'positive' || b === 'positive';
  const back = a === 'negative' || b === 'negative';
  return supply && back ? 'short' : supply ? 'supply' : back ? 'return' : 'link';
}

/** Conventional current along one bench wire, for the flow shown on the copper.
 * Direction follows the wire as drawn (first terminal → second). */
export function wireFlow(result, index, powered) {
  const current = powered && !result.overloaded ? result.solution.branches[`wire${index}`]?.current ?? 0 : 0;
  if (!Number.isFinite(current) || Math.abs(current) < .004) return null;
  const magnitude = Math.min(Math.abs(current), 1.5);
  return { forward: current > 0, current, seconds: +(2.4 - 1.7 * magnitude / 1.5).toFixed(2) };
}


/** What the montage looks like, to know whether readings were all taken on the same one. */
export function montageSignature(state) { return JSON.stringify([[...state.wires].map(w => [...w].sort().join('~')).sort(), state.values, state.switches]); }
/** One reading of a part, as the keeper writes it: a voltage across it, or the current through it (or out of the source). */
export function tallyReading(id, state, result, part) {
  const p = PUZZLES[id];
  if (p.tally.kind === 'current') return Math.abs(part === 'source' ? result.current : result.solution.branches[part]?.current ?? 0);
  return Math.abs(result.solution.branches[part]?.voltage ?? 0);
}
/** Whether the sum closes: the parts of the loop add up to the source; the voices add up to what leaves it. */
export function tallyCloses(id, readings) {
  const p = PUZZLES[id], t = p.tally;
  if (!t.parts.every(k => Number.isFinite(readings[k]))) return false;
  if (t.kind === 'current') { const sum = t.parts.filter(k => k !== 'source').reduce((a, k) => a + readings[k], 0); return readings.source > .05 && Math.abs(sum - readings.source) <= .05 * readings.source + .02; }
  const sum = t.parts.reduce((a, k) => a + readings[k], 0);
  return sum >= .95 * p.voltage && sum <= 1.01 * p.voltage;
}
