import { solveDC, checkOperatingRange } from './electrical.js';
import { normalizeBenchEvidence } from './bench-evidence.js';

const port = (id, label, x, y) => ({ id, label, x, y });
const component = (id, label, a, b, resistance, extra = {}) => ({ id, label, a, b, resistance, ...extra });
const sourcePorts = [port('positive', 'Fuente +', 85, 125), port('negative', 'Retorno −', 85, 375)];
const goal = (minVoltage, maxVoltage, minCurrent = 0, maxCurrent = Infinity) => ({ minVoltage, maxVoltage, minCurrent, maxCurrent });

export const PUZZLES = {
  awaken: {
    title: 'Un pequeño latido', place: 'PORTAL Ω · EL CORAZÓN DE OHM', subtitle: "Hay un cable suelto junto al pequeño cuerpo de bronce.", voltage: 6, protection: 1.2,
    ports: [...sourcePorts, port('heartIn', 'Corazón +', 540, 210), port('heartOut', 'Corazón −', 790, 210)],
    components: [component('heart', 'Corazón de Ohm', 'heartIn', 'heartOut', 12, { kind: 'orb', goal: goal(5.6, 6.1, .45, .52) })],
    initialWires: [['positive', 'heartIn']],
    lesson: 'Un receptor necesita un camino completo: desde un borne de la fuente, a través de él, hasta el otro borne.',
    hints: ["Ese extremo quedó solo… ¿se habrá soltado al caer?","Yo miraría las dos piezas redondas de bronce que quedaron libres. Pero es una sospecha.","Tocá una pieza redonda y después otra para probar un cable. Si no pasa nada, podés retirarlo."],
    observation: 'Un filamento dorado tiembla bajo el vidrio. Todavía no hay latido.',
  },
  workshop: {
    title: 'La costura invisible', place: 'TALLER DE LUMEN · BANCO DE PRUEBAS', subtitle: "Lumen ya cambió la lámpara. Sigue sin prender.", voltage: 6, protection: 1.1,
    ports: [...sourcePorts, port('spliceA', 'Costura A', 310, 160), port('spliceB', 'Costura B', 545, 160), port('lampIn', 'Lámpara +', 640, 325), port('lampOut', 'Lámpara −', 860, 325)],
    components: [component('splice', 'Costura de tela', 'spliceA', 'spliceB', Infinity, { kind: 'fault' }), component('lamp', 'Luz del banco', 'lampIn', 'lampOut', 24, { kind: 'lamp', goal: goal(5.5, 6.1, .22, .27) })],
    initialWires: [['positive', 'spliceA'], ['spliceB', 'lampIn'], ['lampOut', 'negative']],
    lesson: 'Una cubierta sana puede esconder un conductor cortado. La continuidad se mide con la fuente apagada; un puente conductor restablece el camino.',
    hints: ["La tela parece entera. Eso solo no demuestra que el camino de cobre esté completo.","El instrumento puede comprobar si hay un camino entre sus dos puntas. La máquina debe estar apagada.","Podemos comparar el camino antes y después de un cambio. Las dos observaciones quedan en la Bitácora."],
    observation: 'Lumen dejó una nota: «No culpes al vidrio antes de seguir el cobre».',
  },
  gate: {
    title: 'El cerrojo que escucha', place: 'CALZADA · MECANISMO DE LA PUERTA', subtitle: "El cerrojo se mueve, pero empuja hacia el lado equivocado.", voltage: 12, protection: 1.5,
    ports: [...sourcePorts, port('trimA', 'Freno A', 300, 165), port('trimB', 'Freno B', 525, 165), port('latchIn', 'Avance +', 635, 325), port('latchOut', 'Avance −', 860, 325)],
    components: [component('trim', 'Freno resistivo', 'trimA', 'trimB', 8, { valueKey: 'brake', kind: 'resistor' }), component('latch', 'Bobina del cerrojo', 'latchIn', 'latchOut', 16, { kind: 'coil', goal: goal(7.3, 9.1, .46, .57) })],
    knobs: [{ key: 'brake', label: 'Freno de la bobina', min: 0, max: 30, step: 2, initial: 8, unit: 'Ω', description: 'Más resistencia deja pasar menos corriente.' }],
    initialWires: [['positive', 'trimA'], ['trimB', 'latchOut'], ['latchIn', 'negative']],
    lesson: 'La polaridad determina el sentido de esta bobina. La resistencia en serie permite regular su corriente sin cambiar el camino.',
    hints: ["El movimiento del cerrojo permite distinguir su sentido de su fuerza.","Las dos marcas del cerrojo miran hacia adelante. Los cables pueden conectarse de más de una manera.","El mando cambia la fuerza. No cambia el sentido. Son dos observaciones distintas."],
    observation: 'Las marcas del cerrojo dicen AVANCE →. Ahora el metal empuja hacia atrás.',
  },
  pump: {
    title: 'Lo que se pierde en el camino', place: 'MANANTIAL · ALIMENTACIÓN DE LA BOMBA', subtitle: "La rueda gira con fuerza. El agua apenas sale.", voltage: 12, protection: 1.6,
    ports: [...sourcePorts, port('lineA', 'Línea · entrada', 300, 165), port('lineB', 'Línea · salida', 560, 165), port('pumpIn', 'Bomba +', 640, 335), port('pumpOut', 'Bomba −', 875, 335)],
    components: [component('line', 'Empalme oxidado', 'lineA', 'lineB', 18, { kind: 'fault' }), component('pump', 'Bomba del manantial', 'pumpIn', 'pumpOut', 12, { kind: 'motor', goal: goal(10.5, 12.2, .87, 1.05) })],
    initialWires: [['positive', 'lineA'], ['lineB', 'pumpIn'], ['pumpOut', 'negative']],
    lesson: 'Un conductor con demasiada resistencia puede tener continuidad y aun así perder tensión y calentarse bajo carga. Medir ambos extremos permite localizar la pérdida.',
    hints: ["Podemos mirar el empalme y la bomba después de cada prueba. Si algo cambia, conviene dejarlo anotado.","Puedo comparar lo que llega a la bomba con lo que sale del generador. La explicación sigue pendiente.","Un cable puede dejar pasar algo y, aun así, estorbar. El instrumento del taller permite comprobar si hay camino; no cuánto trabaja la bomba."],
    observation: 'La rueda del generador gira, pero la bomba apenas impulsa agua. El empalme viejo está tibio.',
  },
  distribution: {
    title: 'Dos luces, un refugio', place: 'CASTILLO · DISTRIBUIDOR DEL PATIO', subtitle: "Dos habitaciones necesitan luz. El archivo está inundado.", voltage: 12, protection: 3.1,
    ports: [...sourcePorts, port('clinicIn', 'Enfermería +', 530, 115), port('clinicOut', 'Enfermería −', 795, 115), port('kitchenIn', 'Cocina +', 530, 270), port('kitchenOut', 'Cocina −', 795, 270), port('archiveIn', 'Archivo +', 330, 410), port('archiveOut', 'Archivo −', 620, 410)],
    components: [component('clinic', 'Enfermería', 'clinicIn', 'clinicOut', 12, { kind: 'lamp', goal: goal(10.7, 12.2, .89, 1.03) }), component('kitchen', 'Cocina', 'kitchenIn', 'kitchenOut', 12, { kind: 'lamp', goal: goal(10.7, 12.2, .89, 1.03) }), component('archive', 'Archivo anegado', 'archiveIn', 'archiveOut', 3, { kind: 'switch', switchKey: 'archive' })],
    switches: [{ key: 'archive', label: 'Rama del archivo', initial: false, external: true, description: 'Aislá esta rama para intervenir sin apagar las demás.' }],
    initialWires: [['positive', 'clinicIn'], ['clinicOut', 'kitchenIn'], ['kitchenOut', 'negative'], ['positive', 'archiveIn'], ['archiveOut', 'negative']],
    lesson: 'En paralelo, los servicios comparten los dos nodos de la fuente. Cada rama funciona de manera independiente; se puede aislar una falla sin interrumpir las otras.',
    hints: ["El archivo se aisló desde el patio. Todavía podemos observar cómo se reparten los dos servicios sanos.","Podemos seguir el camino de cada luz. ¿Alguna necesita atravesar la otra para volver a la fuente?","Puedo medir cada camino por separado. Tener dos lámparas no garantiza tener dos caminos."],
    observation: 'El archivo está aislado desde el patio. Los dos servicios sanos todavía se iluminan poco.',
  },
  irrigation: {
    title: 'La paciencia del invernadero', place: 'TERRAZAS · MESA DE REGULACIÓN', subtitle: "Vega quiere agua suave y raíces tibias. Una cosa por vez.", voltage: 18, protection: 2.6,
    ports: [...sourcePorts, port('warmA', 'Regulador térmico A', 290, 135), port('warmB', 'Regulador térmico B', 505, 135), port('rootIn', 'Raíces +', 635, 135), port('rootOut', 'Raíces −', 860, 135), port('flowA', 'Regulador de agua A', 290, 345), port('flowB', 'Regulador de agua B', 505, 345), port('flowIn', 'Riego +', 635, 345), port('flowOut', 'Riego −', 860, 345)],
    components: [component('warmTrim', 'Regulador de calor', 'warmA', 'warmB', 0, { valueKey: 'warmth', kind: 'resistor' }), component('roots', 'Lecho de raíces', 'rootIn', 'rootOut', 24, { kind: 'heater', goal: { ...goal(10, 13, .4, .55), maxPower: 7 } }), component('flowTrim', 'Regulador de caudal', 'flowA', 'flowB', 0, { valueKey: 'flow', kind: 'resistor' }), component('flow', 'Bomba de riego', 'flowIn', 'flowOut', 18, { kind: 'motor', goal: goal(9.5, 11.8, .52, .66) })],
    knobs: [{ key: 'warmth', label: 'Resistencia del lecho', min: 0, max: 36, step: 2, initial: 0, unit: 'Ω', description: 'La franja fértil requiere entre 4 y 7 W en las raíces.' }, { key: 'flow', label: 'Resistencia del riego', min: 0, max: 36, step: 2, initial: 0, unit: 'Ω', description: 'Una corriente entre 0,52 y 0,66 A mantiene el caudal suave.' }],
    initialWires: [['positive', 'warmA'], ['warmB', 'rootIn'], ['rootOut', 'negative'], ['positive', 'flowA'], ['flowB', 'flowIn'], ['flowOut', 'negative']],
    lesson: 'La potencia eléctrica se transforma en calor o trabajo. Regular cada rama permite cuidar a la vez dos receptores con necesidades diferentes.',
    hints: ["Las hojas y el agua responden al montaje actual. Ambas cosas son observables sin instrumentos.","Al girar un mando, puedo registrar qué cambia y qué permanece igual.","Más no significa mejor. Tampoco significa peor en todas las posiciones. Conviene comparar."],
    observation: 'Las hojas se repliegan con el calor. El agua golpea la tierra demasiado fuerte.',
  },
  beacon_supply: {
    title: 'I · El pulso del Faro', place: 'FARO · CÁMARA DE ALIMENTACIÓN', subtitle: "El núcleo debe sostener su pulso sin que el cobre se caliente.", voltage: 24, protection: 2.2,
    ports: [...sourcePorts, port('lineA', 'Tendido A', 270, 125), port('lineB', 'Tendido B', 490, 125), port('ballastA', 'Regulador A', 630, 125), port('ballastB', 'Regulador B', 850, 125), port('coreIn', 'Núcleo +', 515, 350), port('coreOut', 'Núcleo −', 800, 350)],
    components: [component('line', 'Tendido de cobre · 2 Ω', 'lineA', 'lineB', 2, { kind: 'resistor' }), component('ballast', 'Regulador del generador', 'ballastA', 'ballastB', 20, { kind: 'resistor', valueKey: 'ballast' }), component('core', 'Núcleo de alimentación', 'coreIn', 'coreOut', 12, { kind: 'coil', goal: goal(16.2, 18.2, 1.35, 1.52) })],
    knobs: [{ key: 'ballast', label: 'Regulador del generador', min: 0, max: 24, step: 1, initial: 20, unit: 'Ω', description: 'El núcleo trabaja de 16,2 a 18,2 V. El tendido debe disipar menos de 5,2 W.' }],
    constraints: [{ branch: 'line', maxPower: 5.2 }],
    initialWires: [['positive', 'lineA'], ['lineB', 'ballastA'], ['ballastB', 'coreIn'], ['coreOut', 'negative']],
    lesson: 'La tensión de la fuente se reparte entre tendido, regulador y carga. Una alimentación útil mantiene la carga en su rango y limita las pérdidas del recorrido.',
    hints: ["Podemos mirar cómo responde el núcleo y comparar el tendido antes y después de mover el mando.","Puedo mirar el núcleo y el tendido después de cada ajuste. Una mejora puede traer otra dificultad.","Puede haber más de una posición que el mecanismo sostenga. Las marcas permiten comparar lo que observamos."],
    observation: 'Por debajo del piso, los cables esperan como raíces dormidas.',
  },
  beacon_network: {
    title: 'II · Tres voces en la torre', place: 'FARO · GALERÍA DE DISTRIBUCIÓN', subtitle: "Luz, giro y campana. Ninguno debería depender de los otros.", voltage: 18, protection: 2.3,
    ports: [...sourcePorts, port('opticIn', 'Óptica +', 520, 105), port('opticOut', 'Óptica −', 800, 105), port('bearingIn', 'Giro +', 520, 255), port('bearingOut', 'Giro −', 800, 255), port('signalIn', 'Señales +', 520, 405), port('signalOut', 'Señales −', 800, 405)],
    components: [component('optic', 'Cámara óptica · 18 Ω', 'opticIn', 'opticOut', 18, { kind: 'lamp', goal: goal(16.5, 18.2, .91, 1.03) }), component('bearing', 'Giro de la cúpula · 36 Ω', 'bearingIn', 'bearingOut', 36, { kind: 'motor', goal: goal(16.5, 18.2, .45, .52) }), component('signal', 'Señal de la costa · 72 Ω', 'signalIn', 'signalOut', 72, { kind: 'coil', goal: goal(16.5, 18.2, .22, .26) })],
    initialWires: [['positive', 'opticIn'], ['opticOut', 'bearingIn'], ['bearingOut', 'signalIn'], ['signalOut', 'negative']],
    lesson: 'Tres resistencias diferentes en paralelo reciben la misma tensión y conducen corrientes distintas. La corriente de la fuente es la suma de las corrientes de sus ramas.',
    hints: ["Podemos seguir los tres caminos. ¿Alguno atraviesa otro receptor antes de regresar?","En el castillo encontramos dos luces que podían funcionar por su cuenta. La torre tiene tres servicios.","Puedo comparar sus caminos y medirlos. No todos necesitan que pase la misma cantidad."],
    observation: 'Una inscripción: «Que ninguna voz tenga que atravesar a las otras para llegar al mar».',
  },
  beacon_lens: {
    title: 'III · La luz que sabe volver', place: 'FARO · CORAZÓN DE LA LENTE', subtitle: "La lente encandila. Nereo busca una luz que pueda durar.", voltage: 18, protection: 2.4,
    ports: [...sourcePorts, port('upperA', 'Divisor · entrada', 320, 115), port('tap', 'Toma intermedia', 575, 115), port('lowerB', 'Divisor · retorno', 835, 115), port('lensIn', 'Lente +', 525, 350), port('lensOut', 'Lente −', 815, 350)],
    components: [component('upper', 'Brazo superior', 'upperA', 'tap', 24, { kind: 'resistor', valueKey: 'upper' }), component('lower', 'Brazo inferior · 24 Ω', 'tap', 'lowerB', 24, { kind: 'resistor' }), component('lens', 'Cristal del horizonte · 24 Ω', 'lensIn', 'lensOut', 24, { kind: 'lens', goal: goal(8.7, 9.3, .362, .388) })],
    knobs: [{ key: 'upper', label: 'Brazo superior del divisor', min: 2, max: 40, step: 1, initial: 24, unit: 'Ω', description: 'Calibrá con la lente conectada. Ella también forma parte de la red.' }],
    initialWires: [['positive', 'upperA'], ['lowerB', 'negative'], ['positive', 'lensIn'], ['lensOut', 'negative']],
    lesson: 'La carga cambia un divisor: la lente y el brazo inferior quedan en paralelo. Calibrar con la carga conectada permite obtener la tensión que el sistema necesita en funcionamiento.',
    hints: ["Podemos seguir el cable que alimenta la lente y mirar si pasa por el mando. No hace falta adivinarlo.","Hay una toma entre las dos piezas de cerámica. Podemos comparar cómo responde con otro punto de alimentación.","La lente cambia la lectura cuando está conectada. Conviene ajustar mientras funciona, no mientras falta."],
    observation: 'La lente devuelve una luz blanca, demasiado dura. El mar espera una luz que pueda sostenerse.',
  },
};

export function initialPuzzleSnapshot(id) {
  const p = PUZZLES[id];
  if (!p) throw new Error(`Unknown puzzle: ${id}`);
  return { version: 1, id, wires: p.initialWires.map(w => [...w]), switches: Object.fromEntries((p.switches ?? []).map(s => [s.key, s.initial])), values: Object.fromEntries((p.knobs ?? []).map(k => [k.key, k.initial])), sourceOn: true, tripped: false, meter: { mode: 'voltage', a: null, b: null, branch: null }, hints: 0, evidence: [], completed: false };
}

export function normalizePuzzleSnapshot(id, saved) {
  const initial = initialPuzzleSnapshot(id), p = PUZZLES[id];
  if (!saved || saved.id !== id || saved.version !== 1) return initial;
  const ids = new Set(p.ports.map(n => n.id));
  const wires = Array.isArray(saved.wires) ? saved.wires.filter(w => Array.isArray(w) && w.length === 2 && w[0] !== w[1] && w.every(n => ids.has(n))).map(w => [...w]) : initial.wires;
  const uniqueWires = wires.filter((w, i) => wires.findIndex(other => [...other].sort().join('|') === [...w].sort().join('|')) === i);
  const normalized = { ...initial, evidence: normalizeBenchEvidence(saved.evidence), wires: uniqueWires, sourceOn: typeof saved.sourceOn === 'boolean' ? saved.sourceOn : initial.sourceOn, tripped: !!saved.tripped, completed: !!saved.completed,
    switches: Object.fromEntries((p.switches ?? []).map(s => [s.key, typeof saved.switches?.[s.key] === 'boolean' ? saved.switches[s.key] : s.initial])),
    values: Object.fromEntries((p.knobs ?? []).map(k => [k.key, Number.isFinite(saved.values?.[k.key]) ? Math.max(k.min, Math.min(k.max, Math.round(saved.values[k.key] / k.step) * k.step)) : k.initial])),
    hints: Number.isFinite(saved.hints) ? Math.max(0, Math.min(p.hints.length, Math.floor(saved.hints))) : 0,
    meter: { mode: ['voltage', 'continuity', 'current'].includes(saved.meter?.mode) ? saved.meter.mode : 'voltage', a: ids.has(saved.meter?.a) ? saved.meter.a : null, b: ids.has(saved.meter?.b) ? saved.meter.b : null, branch: p.components.some(c => c.id === saved.meter?.branch) ? saved.meter.branch : null },
  };
  // A corrupt completed marker must never make a broken installation uneditable.
  normalized.completed = normalized.completed && evaluatePuzzle(id, normalized).solved;
  return normalized;
}

export function puzzleNetwork(id, state, powered = state.sourceOn && !state.tripped) {
  const p = PUZZLES[id];
  return { nodes: p.ports.map(n => n.id), ground: 'negative',
    sources: powered ? [{ id: 'source', positive: 'positive', negative: 'negative', voltage: p.voltage }] : [],
    resistors: [...p.components.map(c => ({ id: c.id, a: c.a, b: c.b, resistance: c.valueKey ? state.values[c.valueKey] : c.resistance, enabled: c.switchKey ? state.switches[c.switchKey] : true })), ...state.wires.map((w, i) => ({ id: `wire${i}`, a: w[0], b: w[1], resistance: .035 }))],
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
    // Filament lamps and heating elements are not polarized. Actuators and
    // the active optical crystal do depend on the marked operating direction.
    const operatingBranch = ['lamp', 'heater'].includes(c.kind) && branch.voltage !== null ? { ...branch, voltage: Math.abs(branch.voltage), current: Math.abs(branch.current) } : branch;
    return [c.id, powered && checkOperatingRange(operatingBranch, c.goal)];
  }));
  const constraintsMet = (p.constraints ?? []).every(c => (solution.branches[c.branch]?.power ?? Infinity) <= c.maxPower);
  const solved = powered && solution.valid && Object.values(operating).every(Boolean) && constraintsMet;
  return { network, solution, overloaded, requestedCurrent, current, power: current * p.voltage, voltage: powered ? p.voltage : 0, operating, constraintsMet, solved };
}

