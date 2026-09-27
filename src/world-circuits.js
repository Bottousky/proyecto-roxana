import { solveDC, measureVoltage } from './electrical.js';
import { PUZZLES, normalizePuzzleSnapshot, evaluatePuzzle } from './puzzle-model.js';

/** Field measurements share the workbench's resistive DC solver. The source
 * contact opens when requested current exceeds its protection. This is an
 * automatically resetting supply protection, not an invented persistent fuse.
 * Mechanical controls change the availability of motion/water/light; they are
 * not silently represented as electrical switches.
 */
const CONTACT = .08;
const resistor = (id, a, b, resistance, enabled = true) => ({ id, a, b, resistance, enabled });
const readFlag = (state, key, initial = false) => typeof state.flags?.[key] === 'boolean' ? state.flags[key] : initial;
const value = (state, puzzle, key, fallback) => Number.isFinite(state.puzzles?.[puzzle]?.values?.[key]) ? Math.max(0, state.puzzles[puzzle].values[key]) : fallback;
const fmt = n => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function makeSupply(voltage, available, protection) {
  return { voltage, available, protection, nodes: ['source+', 'source−', 'bus'],
    sources: [{ id: 'generator', positive: 'source+', negative: 'source−', voltage: available ? voltage : 0 }],
    ground: 'source−', resistors: [resistor('protection', 'source+', 'bus', .04)] };
}

function solveProtected(model) {
  const requested = solveDC(model);
  const requestedCurrent = Math.max(0, requested.sourceCurrents.generator ?? 0);
  const overloaded = model.available && requestedCurrent > model.protection;
  const network = overloaded ? { ...model, resistors: model.resistors.map(r => r.id === 'protection' ? { ...r, enabled: false } : r) } : model;
  return { solution: overloaded ? solveDC(network) : requested, overloaded, requestedCurrent };
}

function fieldResult(model, probe, observation) {
  const { solution, overloaded, requestedCurrent } = solveProtected(model);
  let voltage = measureVoltage(solution, probe.positive, probe.negative ?? 'source−');
  let current = solution.branches[probe.branch]?.current ?? 0;
  if (voltage !== null && Math.abs(voltage) < 1e-8) voltage = 0;
  if (Math.abs(current) < 1e-8) current = 0;
  const sourceCurrent = Math.max(0, solution.sourceCurrents.generator ?? 0);
  const floating = voltage === null;
  // An observation is available before any optional technical interpretation.
  // In particular, an unsettled probe must never be described as a zero reading.
  const notice = overloaded ? 'El indicador da un impulso y la salida deja de responder. Podemos cambiar una sola cosa y volver a mirar.'
    : floating ? 'Ohm no consigue fijar una lectura aquí. Una aguja indecisa no es lo mismo que una aguja en cero.'
    : !model.available ? 'Ohm no registra actividad en la fuente de esta instalación. Todavía no podemos comprobar cómo responde el resto.'
    : Math.abs(current) < 1e-7 ? 'El indicador de paso no responde en este tramo. Eso solo no alcanza para encontrar la causa; podemos comparar otro punto.'
    : 'El indicador de paso responde en este tramo. Queda por observar qué hace el mecanismo cuando lo probamos.';
  const context = { solution, overloaded, requestedCurrent, voltage, current, sourceCurrent, floating };
  const physicalObservation = typeof observation === 'function' ? observation(context) : observation;
  let electricalObservation;
  if (overloaded) electricalObservation = `La protección abrió la salida: el recorrido pedía ${fmt(requestedCurrent)} A y su límite es ${fmt(model.protection)} A. La fuente conserva ${model.voltage} V antes de la protección.`;
  else if (floating) electricalObservation = `El borne está flotante: no tiene un camino conductor hasta la referencia. El instrumento no asigna 0 V a un punto desconocido.${!model.available ? ' Además, la fuente de esta instalación todavía no entrega energía.' : ''}`;
  else if (!model.available) electricalObservation = 'La fuente de esta instalación todavía no entrega energía. Una lectura de cero aquí corresponde al generador detenido o al suministro anterior sin restablecer.';
  else if (Math.abs(current) < 1e-7 && Math.abs(voltage) > .01) electricalObservation = 'Hay tensión en este punto, pero no circula corriente por la rama observada. Una ida presente no reemplaza el retorno.';
  else if (Math.abs(voltage) < .01 && sourceCurrent < 1e-7) electricalObservation = 'Entre estas dos puntas hay 0 V y no circula corriente. La fuente puede conservar tensión en otro punto del recorrido.';
  else electricalObservation = 'La lectura corresponde a estos bornes y a esta rama. Comparar otro punto permite seguir dónde cae la tensión.';
  return { title: probe.title, voltage, current, powered: model.available && !overloaded && Math.abs(current) > 1e-7,
    overloaded, notice, observation: `${physicalObservation} ${electricalObservation}`.trim(),
    reference: probe.reference, unit: 'V', sourceVoltage: model.available ? model.voltage : 0, sourceAvailable: model.available,
    floating, requestedCurrent, sourceCurrent, protectionLimit: model.protection, mechanicalReady: probe.mechanicalReady ?? null,
  };
}

function workshop(state, object) {
  const repaired = readFlag(state, 'workshop');
  const feed = readFlag(state, 'workshop_feed', repaired), back = readFlag(state, 'workshop_return', repaired);
  const model = makeSupply(6, true, 1.1);
  model.resistors.push(resistor('feed', 'bus', 'bench+', CONTACT, feed), resistor('return', 'bench−', 'source−', CONTACT, back),
    resistor('pilot', 'bench+', 'bench−', 120), resistor('splice', 'bench+', 'lamp+', repaired ? .035 : Infinity), resistor('lamp', 'lamp+', 'bench−', 24));
  const probes = {
    workshop_feed: { title: 'Poste de alimentación de la mesa', positive: 'bus', branch: 'feed', reference: 'Tensión: borne del lado de la fuente respecto del retorno de la celda. Corriente: rama de alimentación hacia la mesa.' },
    workshop_return: { title: 'Poste de retorno de la mesa', positive: 'bench−', branch: 'return', reference: 'Tensión: borne del lado de la mesa respecto del retorno de la celda. Corriente positiva: desde la mesa hacia la celda.' },
    workbench: { title: 'Bornera de entrada del banco', positive: 'bench+', negative: 'bench−', branch: 'lamp', reference: 'Tensión: entre alimentación y retorno del banco, antes de la costura. Corriente: rama de la lámpara.' },
  };
  const probe = probes[object];
  if (!probe) return null;
  return fieldResult(model, probe, !feed && !back ? 'Los dos seccionadores de la mesa están abiertos.' : !feed ? 'El retorno está conectado; falta la alimentación de la mesa.' : !back ? 'La alimentación llega, pero el retorno de la mesa sigue separado.' : repaired ? 'El empalme reparado sostiene la lámpara. La pequeña baliza del banco toma su propia corriente en paralelo.' : 'La baliza confirma alimentación. La lámpara tiene un corte bajo su costura: la corriente de esa rama es cero aunque el banco reciba tensión.');
}

function road(state, object) {
  const repaired = readFlag(state, 'gate');
  const send = readFlag(state, 'road_send', repaired), back = readFlag(state, 'road_return', repaired);
  const bypass = readFlag(state, 'road_bypass', !repaired);
  const model = makeSupply(12, readFlag(state, 'workshop'), 1.6);
  model.resistors.push(resistor('send', 'bus', 'gate+', CONTACT, send), resistor('return', 'gate−', 'source−', CONTACT, back),
    resistor('gate', 'gate+', 'gate−', 16 + value(state, 'gate', 'brake', 8)), resistor('bypass', 'gate+', 'gate−', .12, bypass));
  const probes = {
    road_send: { title: 'Poste oeste · alimentación', positive: 'bus', branch: 'send', reference: 'Tensión: borne de salida protegido del poste oeste respecto del retorno de la fuente. Corriente: conductor de ida.' },
    road_return: { title: 'Poste este · retorno', positive: 'gate−', branch: 'return', reference: 'Tensión: lado de la puerta del contacto de retorno respecto del terminal negativo de la fuente. Corriente positiva: regreso a la fuente.' },
    road_bypass: { title: 'Puente que evita la puerta', positive: 'gate+', negative: 'gate−', branch: 'bypass', reference: 'Tensión: entre las dos líneas del puente. Corriente: sólo la rama del atajo, no la del cerrojo.' },
    gate_panel: { title: 'Llegada al regulador del cerrojo', positive: 'gate+', negative: 'gate−', branch: 'gate', reference: 'Tensión: entre entrada y retorno del regulador. Corriente: rama en serie del regulador y la bobina; su polaridad interna se examina en el panel.' },
  };
  const probe = probes[object];
  if (!probe) return null;
  return fieldResult(model, probe, bypass ? 'El puente auxiliar está cerrado: ofrece un camino de muy baja resistencia que evita el cerrojo. Sólo habrá cortocircuito alimentado cuando también se cierren ida y retorno.' : !send || !back ? 'El atajo ya está abierto. Seguí los dos postes: uno de los extremos del recorrido útil sigue separado.' : repaired ? 'El camino exterior está completo y la bobina fue puesta en servicio. El retorno transporta la misma corriente que la ida.' : 'Las dos líneas alimentan el panel. El regulador y el sentido de actuación de la bobina todavía necesitan inspección.');
}

function spring(state, object) {
  const repaired = readFlag(state, 'pump');
  const water = readFlag(state, 'spring_sluice', repaired), coupled = readFlag(state, 'spring_coupling', repaired);
  const model = makeSupply(12, water && coupled, 1.7);
  model.resistors.push(resistor('indicator', 'bus', 'source−', 120), resistor('wet-splice', 'bus', 'motor+', repaired ? .035 : 18), resistor('motor', 'motor+', 'motor−', 12), resistor('return', 'motor−', 'source−', CONTACT));
  const availability = !water ? 'El agua está desviada: no impulsa la rueda.' : !coupled ? 'El agua mueve la rueda, pero el acople separa su eje del generador.' : 'El agua impulsa la rueda y el acople transmite el movimiento al generador.';
  const probes = {
    spring_sluice: { title: 'Canal y rueda del Manantial', positive: 'source+', branch: 'protection', reference: 'La compuerta controla agua, no contactos eléctricos. Tensión: bornes del generador cercano. Corriente: salida hacia baliza y bomba.', mechanicalReady: water && coupled },
    spring_coupling: { title: 'Acople del generador', positive: 'bus', branch: 'protection', reference: 'Tensión: salida protegida del generador respecto de su retorno. Corriente: alimentación total. El acople transmite movimiento mecánico.', mechanicalReady: water && coupled },
    pump_panel: { title: 'Bornes de la bomba del Manantial', positive: 'motor+', negative: 'motor−', branch: 'motor', reference: 'Tensión: entre los bornes de la bomba, después del empalme húmedo. Corriente: rama del motor, en su sentido de impulsión.', mechanicalReady: water && coupled },
  };
  const probe = probes[object];
  if (!probe) return null;
  return fieldResult(model, probe, `${availability} ${water && coupled ? repaired ? 'El cobre nuevo reduce la pérdida del tendido y la bomba recibe casi toda la tensión disponible.' : 'El empalme oxidado aún conduce, pero su resistencia consume parte de la tensión bajo carga.' : ''}`);
}

function castle(state, object) {
  const repaired = readFlag(state, 'distribution');
  const damaged = readFlag(state, 'castle_branch_closed', !repaired), trunk = readFlag(state, 'castle_service', repaired);
  const model = makeSupply(12, readFlag(state, 'pump'), 3.1);
  model.resistors.push(resistor('west-contact', 'bus', 'west+', CONTACT, damaged), resistor('west-fault', 'west+', 'source−', 1.5), resistor('trunk', 'bus', 'services+', CONTACT, trunk));
  if (repaired) model.resistors.push(resistor('clinic', 'services+', 'source−', 12), resistor('kitchen', 'services+', 'source−', 12));
  else model.resistors.push(resistor('clinic', 'services+', 'series-node', 12), resistor('kitchen', 'series-node', 'source−', 12));
  const probes = {
    castle_isolated: { title: 'Acometida oeste · rama dañada', positive: 'west+', branch: 'west-contact', reference: 'Tensión: borne aguas abajo del seccionador oeste respecto del retorno común. Corriente: acometida del archivo, independiente del troncal sano.' },
    castle_service: { title: 'Troncal de los servicios sanos', positive: 'services+', branch: 'trunk', reference: 'Tensión: entrada de los servicios respecto del retorno común. Corriente: suma de las ramas de enfermería y cocina.' },
    distribution_panel: { title: 'Entrada al tablero del Castillo', positive: 'services+', branch: 'trunk', reference: 'Tensión: entre entrada del tablero y retorno común. Corriente: troncal sano; no incluye la acometida oeste aislada.' },
  };
  const probe = probes[object];
  if (!probe) return null;
  return fieldResult(model, probe, damaged ? 'La acometida oeste sigue conectada a una fuga de baja resistencia. Esa rama puede pedir demasiada corriente incluso con los servicios sanos desconectados.' : !trunk ? 'La rama dañada está aislada. El troncal sano también está abierto: contener la falla todavía no alimenta los servicios.' : repaired ? 'La acometida anegada está separada y los dos servicios tienen ramas en paralelo. La corriente del troncal es la suma de ambas.' : 'La falla exterior está aislada y el tablero recibe energía. Dentro del tablero hay que revisar el reparto entre los servicios.');
}

function terraces(state, object) {
  const repaired = readFlag(state, 'irrigation');
  const limited = readFlag(state, 'forge_limited', repaired), channel = readFlag(state, 'irrigation_open', repaired);
  const model = makeSupply(18, readFlag(state, 'distribution'), 4.3);
  // On the shared board the forge draws what the bench's brake leaves it (12 Ω + brake).
  model.resistors.push(resistor('forge', 'bus', 'source−', limited ? 12 + value(state, 'irrigation', 'forge', 12) : 6),
    resistor('root-regulator', 'bus', 'roots+', value(state, 'irrigation', 'warmth', repaired ? 12 : 0)), resistor('roots', 'roots+', 'source−', 24),
    resistor('flow-regulator', 'bus', 'flow+', value(state, 'irrigation', 'flow', repaired ? 12 : 0)), resistor('flow', 'flow+', 'source−', 18));
  const probes = {
    forge_limited: { title: 'Régimen del horno de Yesca', positive: 'bus', branch: 'forge', reference: 'Tensión: bornes de la resistencia calefactora. Corriente: sólo la rama del horno; el lecho y el riego tienen ramas propias.', mechanicalReady: channel && limited },
    irrigation_open: { title: 'Canal de los bancales', positive: 'flow+', branch: 'flow', reference: 'La compuerta controla el paso de agua. Tensión: bornes de la bomba asociada. Corriente: rama de esa bomba; abrir el canal no es cerrar un interruptor.', mechanicalReady: channel && limited },
    irrigation_panel: { title: 'Bomba del invernadero bajo carga', positive: 'flow+', branch: 'flow', reference: 'Tensión: bomba después de su regulador. Corriente: rama de riego; el horno y el calor de raíces toman corriente por otros caminos.', mechanicalReady: channel && limited },
  };
  const probe = probes[object];
  if (!probe) return null;
  return fieldResult(model, probe, `${limited ? 'El horno usa su régimen moderado y reduce su demanda eléctrica.' : 'El horno mantiene su demanda alta, al mismo tiempo que el riego y las raíces.'} ${channel ? 'El canal hidráulico está abierto hacia los cultivos.' : 'El canal está cerrado: puede haber corriente en la bomba sin que el agua alcance los bancales.'} ${repaired ? 'Los dos reguladores del invernadero están verificados bajo carga.' : 'Los reguladores del lecho y del riego aún requieren ajuste.'}`);
}

function lake(state, object) {
  const latched = readFlag(state, 'beacon_supply');
  const send = readFlag(state, 'lake_cable', latched), back = readFlag(state, 'lake_return', latched);
  const model = makeSupply(24, readFlag(state, 'irrigation'), 2.2);
  model.resistors.push(resistor('send-contact', 'bus', 'shore+', CONTACT, send), resistor('long-feed', 'shore+', 'tower+', 1.2), resistor('tower-pilot', 'tower+', 'tower−', 120), resistor('long-return', 'tower−', 'shore−', 1.2), resistor('return-contact', 'shore−', 'source−', CONTACT, back));
  const probes = {
    lake_cable: { title: 'Suministro en la orilla', positive: 'bus', branch: 'send-contact', reference: 'Tensión: borne de alimentación antes del contacto del muelle respecto del retorno de la fuente. Corriente: conductor largo de ida.' },
    lake_return: { title: 'Retorno entre las cañas', positive: 'shore−', branch: 'return-contact', reference: 'Tensión: lado sumergido del contacto respecto del retorno de la fuente. Corriente positiva: desde el Faro hacia la fuente de la orilla.' },
  };
  const probe = probes[object];
  if (!probe) return null;
  return fieldResult(model, probe, !send && !back ? 'Los dos contactos del muelle están abiertos. La línea distante y su baliza quedan aisladas.' : !send ? 'El retorno está unido. Falta el contacto que lleva alimentación hacia la torre.' : !back ? 'La ida conduce hasta la torre, pero el retorno termina abierto entre las cañas. El extremo distante puede tener tensión sin transportar corriente.' : 'La baliza distante tiene ida y vuelta. Los dos conductores largos disipan una pequeña parte de la energía; sus corrientes son iguales.');
}

function lighthouse(state, object) {
  const supplyFixed = readFlag(state, 'beacon_supply'), networkFixed = readFlag(state, 'beacon_network'), lensFixed = readFlag(state, 'beacon_lens');
  if (['tower_feed', 'tower_return', 'beacon_supply_panel'].includes(object)) {
    const feed = readFlag(state, 'tower_feed', supplyFixed), back = readFlag(state, 'tower_return', supplyFixed);
    const model = makeSupply(24, readFlag(state, 'beacon_link') || (readFlag(state,'irrigation') && readFlag(state,'lake_cable') && readFlag(state,'lake_return')), 2.2);
    model.resistors.push(resistor('feed', 'bus', 'line+', CONTACT, feed), resistor('line', 'line+', 'regulator+', supplyFixed ? 3 : 6), resistor('regulator', 'regulator+', 'core+', value(state, 'beacon_supply', 'ballast', supplyFixed ? 1 : 3)), resistor('core', 'core+', 'core−', 12), resistor('return', 'core−', 'source−', CONTACT, back));
    const probes = {
      tower_feed: { title: 'Faro I · manivela de alimentación', positive: 'bus', branch: 'feed', reference: 'Tensión: salida protegida de la fuente de la base respecto de su retorno. Corriente: ida al núcleo, antes del tendido y su regulador.' },
      tower_return: { title: 'Faro I · manivela de retorno', positive: 'core−', branch: 'return', reference: 'Tensión: lado del núcleo del contacto de retorno respecto del terminal negativo de la fuente. Corriente: regreso desde el núcleo.' },
      beacon_supply_panel: { title: 'Faro I · bornes del núcleo', positive: 'core+', negative: 'core−', branch: 'core', reference: 'Tensión: núcleo de alimentación después del tendido y del regulador. Corriente: la misma rama en serie que atraviesa los tres elementos.' },
    };
    return fieldResult(model, probes[object], !feed || !back ? 'La etapa de la base necesita ambos contactos para sostener una corriente por el núcleo.' : supplyFixed ? 'La fuente fue puesta en servicio: el núcleo trabaja con la pérdida real del tendido y la regulación ajustada.' : 'El recorrido exterior está completo. Una parte importante de la tensión cae todavía en el regulador del primer panel.');
  }
  if (['tower_isolated', 'tower_motor', 'beacon_network_panel'].includes(object)) {
    const isolated = readFlag(state, 'tower_isolated', networkFixed), coupled = readFlag(state, 'tower_motor', networkFixed);
    const model = makeSupply(18, supplyFixed, 2.3);
    model.resistors.push(resistor('maintenance', 'bus', 'source−', .16, !isolated));
    if (networkFixed) model.resistors.push(resistor('optic', 'bus', 'source−', 18), resistor('motor', 'bus', 'source−', 36), resistor('signal', 'bus', 'source−', 72));
    else model.resistors.push(resistor('optic', 'bus', 'motor+', 18), resistor('motor', 'motor+', 'signal+', 36), resistor('signal', 'signal+', 'source−', 72));
    const probes = {
      tower_isolated: { title: 'Faro II · puente de mantenimiento', positive: 'bus', branch: 'maintenance', reference: 'Tensión: entre las dos barras que el puente une o separa. Corriente: exclusivamente el puente de mantenimiento.' },
      tower_motor: { title: 'Faro II · motor y embrague', positive: networkFixed ? 'bus' : 'motor+', negative: networkFixed ? 'source−' : 'signal+', branch: 'motor', reference: 'Tensión: entre los bornes del motor. Corriente: rama del motor. El embrague transmite movimiento; no abre el circuito eléctrico.', mechanicalReady: coupled },
      beacon_network_panel: { title: 'Faro II · servicio de la óptica', positive: 'bus', negative: networkFixed ? 'source−' : 'motor+', branch: 'optic', reference: 'Tensión: carga de la cámara óptica. Corriente: su rama; comparar con motor y señal permite distinguir serie y paralelo.', mechanicalReady: coupled && isolated },
    };
    return fieldResult(model, probes[object], `${isolated ? 'El puente gastado quedó fuera de la distribución.' : 'El puente de mantenimiento sigue uniendo directamente las barras: evita los receptores.'} ${coupled ? 'El embrague une el motor con la corona.' : 'El motor está desacoplado de la corona; una lectura eléctrica por sí sola no demuestra que la cúpula gire.'} ${networkFixed ? 'Óptica, motor y señal tienen ramas independientes.' : 'El reparto entre los tres receptores todavía necesita revisión.'}`);
  }
  if (['tower_shutter', 'tower_lens_free', 'beacon_lens_panel'].includes(object)) {
    const shutter = readFlag(state, 'tower_shutter', lensFixed), brakeFree = readFlag(state, 'tower_lens_free', lensFixed);
    const model = makeSupply(18, networkFixed, 2.4);
    model.resistors.push(resistor('upper', 'bus', 'tap', value(state, 'beacon_lens', 'upper', lensFixed ? 12 : 24)), resistor('lower', 'tap', 'source−', 24), resistor('lens', lensFixed ? 'tap' : 'bus', 'source−', 24));
    const probe = { title: object === 'tower_shutter' ? 'Faro III · obturador de bronce' : object === 'tower_lens_free' ? 'Faro III · freno del conjunto óptico' : 'Faro III · cristal bajo carga',
      positive: lensFixed ? 'tap' : 'bus', branch: 'lens', mechanicalReady: shutter && brakeFree,
      reference: 'Tensión: entre los bornes eléctricos del cristal de la lente. Corriente: rama del cristal. Obturador y freno actúan sobre luz y movimiento, no sobre los conductores.' };
    return fieldResult(model, probe, `${shutter ? 'Las hojas de bronce dejan salir la luz hacia el lago.' : 'El obturador está cerrado: puede haber luz dentro sin que un haz salga al lago.'} ${brakeFree ? 'La lente puede girar con la corona.' : 'El freno mantiene inmóvil el conjunto óptico.'} ${lensFixed ? 'El divisor está calibrado con el cristal conectado: el propio cristal carga la toma intermedia.' : 'La lente aún necesita su conexión al divisor y la calibración bajo carga.'}`);
  }
  return null;
}

const MODELS = { workshop, road, spring, castle, terraces, lake, lighthouse };

// Once a panel has been inspected, its saved montage is the source of truth.
// Outer contacts still use the field network while open. With its supply and
// return established, the panel is represented at its nominal supply terminals,
// exactly as on the workbench (including every wire and the local protection).
const PANEL_PROBES = {
  workbench: ['workshop', 'source', 'lamp'], workshop_feed: ['workshop', 'upstream'], workshop_return: ['workshop', 'return'],
  gate_panel: ['gate', 'source'], road_send: ['gate', 'upstream'], road_return: ['gate', 'return'],
  pump_panel: ['pump', 'pump'], spring_sluice: ['pump', 'upstream'], spring_coupling: ['pump', 'upstream'],
  distribution_panel: ['distribution', 'source'], castle_service: ['distribution', 'source'],
  irrigation_panel: ['irrigation', 'flow'], irrigation_open: ['irrigation', 'flow'],
  beacon_supply_panel: ['beacon_supply', 'core'], tower_feed: ['beacon_supply', 'upstream'], tower_return: ['beacon_supply', 'return'],
  beacon_network_panel: ['beacon_network', 'optic'], tower_motor: ['beacon_network', 'bearing'],
  beacon_lens_panel: ['beacon_lens', 'lens'], tower_shutter: ['beacon_lens', 'lens'], tower_lens_free: ['beacon_lens', 'lens'],
};

function panelSupplyReady(id, state) {
  const flag = (key, fallback = false) => readFlag(state, key, fallback);
  const repaired = flag(id);
  return ({
    workshop: () => flag('workshop_feed', repaired) && flag('workshop_return', repaired),
    gate: () => flag('workshop') && flag('road_send', repaired) && flag('road_return', repaired) && !flag('road_bypass', !repaired),
    pump: () => flag('spring_sluice', repaired) && flag('spring_coupling', repaired),
    distribution: () => flag('pump') && flag('castle_service', repaired) && !flag('castle_branch_closed', !repaired),
    irrigation: () => flag('distribution') && flag('forge_limited', repaired),
    beacon_supply: () => (flag('beacon_link') || (flag('irrigation') && flag('lake_cable') && flag('lake_return'))) && flag('tower_feed', repaired) && flag('tower_return', repaired),
    beacon_network: () => flag('beacon_supply') && flag('tower_isolated', repaired),
    beacon_lens: () => flag('beacon_network'),
  })[id]?.() ?? false;
}

function savedPanelReading(state, object, field) {
  const binding = PANEL_PROBES[object];
  if (!field || !binding) return field;
  const [id, reading, currentBranch] = binding, raw = state.puzzles?.[id];
  // Old saves may contain only a few knob values. Keep their established field
  // behavior until a real snapshot exists; never invent a montage for them.
  if (raw?.id !== id || raw.version !== 1 || !Array.isArray(raw.wires) || !panelSupplyReady(id, state)) return field;
  const snapshot = normalizePuzzleSnapshot(id, raw), result = evaluatePuzzle(id, snapshot), puzzle = PUZZLES[id];
  const component = puzzle.components.find(c => c.id === reading);
  const voltage = component ? result.solution.branches[reading]?.voltage ?? null : reading === 'upstream' ? puzzle.voltage : reading === 'return' ? 0 : result.voltage;
  const current = currentBranch ? result.solution.branches[currentBranch]?.current ?? 0 : component ? result.solution.branches[reading]?.current ?? 0 : result.current;
  const overloaded = snapshot.tripped || result.overloaded;
  const sourceAvailable = snapshot.sourceOn && !overloaded;
  const reference = component
    ? `Tensión: ${puzzle.ports.find(p => p.id === component.a).label} respecto de ${puzzle.ports.find(p => p.id === component.b).label}. Corriente: esta pieza en el montaje guardado, en ese mismo sentido.`
    : `${field.reference} Lectura del montaje guardado en sus bornes nominales de alimentación.`;
  const notice = overloaded ? 'La protección del montaje quedó abierta. Podés volver a la instalación, cambiar una cosa y probar otra vez.'
    : !snapshot.sourceOn ? 'La alimentación del montaje está apagada, tal como la dejaste.'
    : voltage === null ? 'Ohm no consigue fijar una lectura en estos bornes. La aguja indecisa no equivale a cero.'
    : Math.abs(current) < 1e-7 ? 'Aquí no registra paso de corriente en el montaje que dejaste. Podemos comparar otro punto.'
    : 'Ohm registra paso de corriente en el montaje que dejaste. Queda por observar cómo responde el mecanismo.';
  return { ...field, voltage, current, reference, notice, observation: notice, floating: voltage === null,
    powered: sourceAvailable && Math.abs(current) > 1e-7, overloaded, sourceAvailable,
    sourceVoltage: sourceAvailable ? puzzle.voltage : 0, sourceCurrent: result.current,
    requestedCurrent: result.requestedCurrent, protectionLimit: puzzle.protection,
  };
}

const readingCache = new Map();
function physicalKey(state) {
  return JSON.stringify([state.flags, Object.entries(state.puzzles ?? {}).map(([id, snapshot]) => [id, snapshot?.version, snapshot?.id, snapshot?.wires, snapshot?.values, snapshot?.switches, snapshot?.sourceOn, snapshot?.tripped])]);
}

/** Return null for scenery/NPCs and areas without a nearby measurable mechanism.
 * voltage is signed (red probe minus black probe); null means floating, not zero.
 * current is the signed current of the branch explicitly named in reference.
 * powered means that branch is actually carrying current with supply available.
 */
export function measureWorld(areaId, state = {}, objId) {
  const model = MODELS[areaId];
  if (!model) return null;
  const key = `${areaId}:${objId}:${physicalKey(state)}`;
  if (readingCache.has(key)) return readingCache.get(key);
  const result = savedPanelReading(state, objId, model(state, objId));
  if (readingCache.size >= 128) readingCache.delete(readingCache.keys().next().value);
  const cached = result ? Object.freeze(result) : null;
  readingCache.set(key, cached);
  return cached;
}
