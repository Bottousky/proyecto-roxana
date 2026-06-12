import { readFileSync } from 'node:fs';
import {
  FORGE_MACHINE_IDS,
  FORGE_STONES,
  addForgeStone,
  attemptForge,
  createForgeState,
  enumerateStoneRows,
  evaluateForge,
  forgeChannelStock,
  repairForgeChannel,
  setForgeFuse,
  setForgePush,
  setForgeThickness,
  type ForgeFuse,
  type ForgeMachineId,
  type ForgeState,
  type ForgeStone,
} from '../src/puzzles/forgeModel.ts';
import type { ChannelThickness } from '../src/puzzles/common.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

interface BranchSetup {
  stones: ForgeStone[];
  thickness: ChannelThickness;
  fuse: ForgeFuse;
}

function configureBranch(
  state: ForgeState,
  machineId: ForgeMachineId,
  setup: BranchSetup,
): ForgeState {
  let next = state;
  for (const stone of setup.stones) {
    next = addForgeStone(next, machineId, stone);
  }
  next = setForgeThickness(next, machineId, setup.thickness);
  return setForgeFuse(next, machineId, setup.fuse);
}

function canonicalState(): ForgeState {
  let state = setForgePush(createForgeState(), 8);
  state = configureBranch(state, 'martillo', {
    stones: ['roja'],
    thickness: 'ancho',
    fuse: 8,
  });
  state = configureBranch(state, 'fuelle', {
    stones: ['amarilla'],
    thickness: 'medio',
    fuse: 4,
  });
  return configureBranch(state, 'lumbre', {
    stones: ['gris'],
    thickness: 'angosto',
    fuse: 2,
  });
}

const canonical = evaluateForge(canonicalState());
equal(canonical.valid, true, 'la solución canónica es válida');
equal(canonical.machines.martillo.river, 4, 'Martillo recibe río 4');
equal(canonical.machines.martillo.peakRiver, 5, 'Martillo pica a río 5');
equal(canonical.machines.martillo.delivery, 32, 'Martillo recibe entrega 32');
equal(canonical.machines.fuelle.delivery, 16, 'Fuelle recibe entrega 16');
equal(canonical.machines.lumbre.delivery, 8, 'Lumbre recibe entrega 8');
equal(canonical.trunkRiver, 7, 'la solución canónica usa Tronco 7');
equal(canonical.trunkOk, true, 'Tronco 7 respeta la tolerancia 8');

let alternate = setForgePush(createForgeState(), 8);
alternate = configureBranch(alternate, 'martillo', {
  stones: ['roja'],
  thickness: 'ancho',
  fuse: 8,
});
alternate = configureBranch(alternate, 'fuelle', {
  stones: ['amarilla'],
  thickness: 'medio',
  fuse: 4,
});
alternate = configureBranch(alternate, 'lumbre', {
  stones: ['gris'],
  thickness: 'medio',
  fuse: 2,
});
const lumbreInSecondMedium = evaluateForge(alternate);
equal(
  lumbreInSecondMedium.valid,
  true,
  'la alternativa concreta Lumbre en el segundo canal medio con fusible 2 es válida',
);
equal(
  lumbreInSecondMedium.machines.lumbre.peakLevel,
  'frio',
  'el pico 2 de Lumbre queda frío en canal medio',
);
equal(
  lumbreInSecondMedium.machines.lumbre.fuseProtectsChannel,
  true,
  'el fusible 2 de Lumbre salta antes del rojo del canal medio',
);

let hammerInMedium = setForgePush(createForgeState(), 8);
hammerInMedium = configureBranch(hammerInMedium, 'martillo', {
  stones: ['roja'],
  thickness: 'medio',
  fuse: 8,
});
hammerInMedium = configureBranch(hammerInMedium, 'fuelle', {
  stones: ['amarilla'],
  thickness: 'medio',
  fuse: 4,
});
hammerInMedium = configureBranch(hammerInMedium, 'lumbre', {
  stones: ['gris'],
  thickness: 'angosto',
  fuse: 2,
});
const stoppedCase = evaluateForge(hammerInMedium);
equal(stoppedCase.stockOk, true, 'el caso frenado respeta el stock y aísla la regla del fusible');
equal(
  stoppedCase.machines.martillo.peakLevel,
  'caliente',
  'el pico del Martillo todavía no pone al rojo el canal medio',
);
equal(
  stoppedCase.machines.martillo.requiredFuse,
  8,
  'el pico 5 obliga al fusible 8 por la regla general',
);
equal(
  stoppedCase.machines.martillo.fuseProtectsChannel,
  false,
  'el fusible 8 saltaría después del rojo del canal medio',
);
equal(stoppedCase.valid, false, 'Martillo en canal medio es inválido sin caso especial');

const allRows = enumerateStoneRows();
equal(allRows.length > 0, true, 'la enumeración produce filas de piedras');
let push16ExactLumbreRows = 0;
for (const stones of allRows) {
  let state = setForgePush(createForgeState(), 16);
  for (const stone of stones) state = addForgeStone(state, 'lumbre', stone);
  if (evaluateForge(state).machines.lumbre.exactDelivery) push16ExactLumbreRows++;
}
equal(
  push16ExactLumbreRows,
  0,
  'Empuje 16 es inválido en todas las combinaciones iteradas porque Lumbre pediría río medio',
);

let stockState = createForgeState();
stockState = setForgeThickness(stockState, 'martillo', 'ancho');
stockState = setForgeThickness(stockState, 'fuelle', 'ancho');
equal(
  stockState.branches.fuelle.thickness,
  null,
  'el único canal ancho no puede asignarse dos veces',
);
stockState = setForgeThickness(stockState, 'fuelle', 'medio');
stockState = setForgeThickness(stockState, 'lumbre', 'medio');
equal(forgeChannelStock(stockState).medio, 0, 'los dos canales medios salen del stock');
equal(forgeChannelStock(stockState).ancho, 0, 'el canal ancho sale del stock');
equal(forgeChannelStock(stockState).angosto, 2, 'los angostos no asignados siguen disponibles');

let overloaded = setForgePush(createForgeState(), 8);
for (const machineId of FORGE_MACHINE_IDS) {
  overloaded = addForgeStone(overloaded, machineId, 'marron');
}
const overloadedEvaluation = evaluateForge(overloaded);
equal(overloadedEvaluation.trunkRiver, 24, 'el Tronco suma los tres ríos');
equal(overloadedEvaluation.trunkOk, false, 'Tronco mayor que 8 es inválido');

equal(FORGE_STONES.join('/'), 'marron/roja/amarilla/gris', 'se ofrecen las cuatro piedras');

const solvedAttempt = attemptForge(canonicalState());
equal(solvedAttempt.event, 'solved', 'arrancar la canónica resuelve la red');
equal(solvedAttempt.state.solved, true, 'el estado conserva la resolución');

let youngFuse = canonicalState();
youngFuse = setForgeFuse(youngFuse, 'martillo', 4);
const youngAttempt = attemptForge(youngFuse);
equal(youngAttempt.event, 'young-fuse', 'un calibre menor al pico muere al arrancar');
equal(
  youngAttempt.youngMachines.join(','),
  'martillo',
  'el arranque identifica el fusible joven',
);
equal(
  youngAttempt.state.branches.martillo.fuse,
  null,
  'el fusible joven sale del engaste',
);

const unsafeAttempt = attemptForge(hammerInMedium);
equal(unsafeAttempt.event, 'invalid', 'Martillo en medio falla como información');
equal(
  unsafeAttempt.diagnostics.some(
    (diagnostic) =>
      diagnostic.machineId === 'martillo' && diagnostic.code === 'unsafe-fuse',
  ),
  true,
  'el diagnóstico explica que el fusible no protege el canal',
);

let oversizedFuse = alternate;
oversizedFuse = setForgeFuse(oversizedFuse, 'lumbre', 4);
const oversizedAttempt = attemptForge(oversizedFuse);
equal(oversizedAttempt.event, 'invalid', 'un fusible protector pero no mínimo no resuelve');
equal(
  oversizedAttempt.diagnostics.some(
    (diagnostic) =>
      diagnostic.machineId === 'lumbre' && diagnostic.code === 'oversized-fuse',
  ),
  true,
  'el diagnóstico distingue margen excesivo de canal desprotegido',
);

let redChannel = setForgePush(createForgeState(), 8);
redChannel = configureBranch(redChannel, 'martillo', {
  stones: ['roja'],
  thickness: 'angosto',
  fuse: 8,
});
redChannel = configureBranch(redChannel, 'fuelle', {
  stones: ['amarilla'],
  thickness: 'medio',
  fuse: 4,
});
redChannel = configureBranch(redChannel, 'lumbre', {
  stones: ['gris'],
  thickness: 'angosto',
  fuse: 2,
});
let redAttempt = attemptForge(redChannel);
equal(redAttempt.event, 'red-warning', 'la primera insistencia al rojo informa');
redAttempt = attemptForge(redAttempt.state);
equal(redAttempt.event, 'red-warning', 'la segunda insistencia al rojo informa');
redAttempt = attemptForge(redAttempt.state);
equal(redAttempt.event, 'cut', 'la tercera insistencia al rojo corta el canal');
equal(
  redAttempt.state.branches.martillo.channel.cut,
  true,
  'el Martillo conserva su canal cortado',
);
const repaired = repairForgeChannel(redAttempt.state, 'martillo');
equal(
  repaired.branches.martillo.channel.cut,
  false,
  'la Forjadora puede reparar el canal cortado',
);
equal(
  repaired.branches.martillo.channel.insistences,
  0,
  'la reparación reinicia las insistencias',
);

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const forgeSource = readFileSync(new URL('../src/puzzles/forge.ts', import.meta.url), 'utf8');
const audioSource = readFileSync(new URL('../src/audio.ts', import.meta.url), 'utf8');

for (const text of [
  'Cristal de bus',
  'Empuje 8',
  'Empuje 16',
  'Martillo · ENTREGA 32',
  'Fuelle · ENTREGA 16',
  'Lumbre · ENTREGA 8',
  'stock compartido',
  'canal ancho',
  'canal medio',
  'canal angosto',
  'fusibles 1 · 2 · 4 · 8',
  'aguja de Tronco · tolerancia 8',
  'Arrancar la Forja',
  'Reiniciar práctica',
]) {
  equal(forgeSource.includes(text), true, `el banco F5 incluye ${text}`);
}

equal(
  (forgeSource.match(/thermometerSVG/g) ?? []).length >= 1,
  true,
  'el banco crea termómetros por máquina',
);
equal(
  (forgeSource.match(/gaugeSVG/g) ?? []).length >= 2,
  true,
  'el banco crea agujas por rama y para el Tronco',
);
equal(
  forgeSource.includes('forgeChannelStock(state)'),
  true,
  'la vista deriva el stock compartido desde el modelo',
);
equal(
  forgeSource.includes('practica: opts.practica ?? false'),
  true,
  'el banco admite modo práctica después de resolver',
);

equal(
  forgeSource.includes('El Martillo pide y no le llega.'),
  true,
  'el fallo hambriento del Martillo conserva el texto canónico',
);
equal(
  forgeSource.includes('// TODO(guion): fallo de entrega del Fuelle.'),
  true,
  'el fallo del Fuelle queda marcado como texto pendiente',
);
equal(
  forgeSource.includes('// TODO(guion): fallo de entrega de la Lumbre.'),
  true,
  'el fallo de la Lumbre queda marcado como texto pendiente',
);

for (const text of [
  'Ese compás. ESE. Treinta años sin oírlo.',
  'Dile a tu escuela que la Forja paga sus deudas: cuando necesiten hierro bien nacido, es acá.',
  'Entrega del Martillo: treinta y dos. Del Fuelle: dieciséis. De la Lumbre: ocho. Por hora, cincuenta y seis jornales.',
  '…Los lacres ceremoniales del Consejo consumían nueve. La biblioteca, ocho.',
  'Cuarenta años lacrando puertas con más entrega de la que ahorrábamos al lacrarlas. No anote eso, calderito.',
  'Anotado.',
]) {
  equal(forgeSource.includes(text), true, `resolución textual F5: ${text.slice(0, 42)}`);
}

equal(
  roomsSource.includes("import { abrirForge } from '../puzzles/forge';"),
  true,
  'rooms importa el banco F5',
);
equal(
  roomsSource.includes("setFlag('solvedForgeNetwork')"),
  true,
  'F5 marca solvedForgeNetwork',
);
equal(
  roomsSource.includes("setFlag('forgeRestored')"),
  true,
  'F5 marca forgeRestored',
);
equal(
  roomsSource.includes("setFlag('learnedPower')"),
  true,
  'F5 marca learnedPower',
);
equal(
  roomsSource.includes("notifyNewEntry('El Jornal')"),
  true,
  'F5 notifica El Jornal',
);
equal(
  roomsSource.includes("openBitacora('el-jornal')"),
  true,
  'F5 abre la entrada formal El Jornal',
);
equal(
  roomsSource.includes('practica: f().solvedForgeNetwork'),
  true,
  'F5 reabre en modo práctica',
);
equal(
  roomsSource.includes('// TODO(F5)'),
  false,
  'el placeholder F5 fue reemplazado',
);

for (const text of [
  'Todo junto, una vez. Como cuando era niña.',
  'Tres máquinas, un solo tronco, y el cobre que hay: un canal ancho, dos medios, dos angostos. Ni uno más. Repártelo bien.',
  'Y yo anoto la entrega de cada una. Por hora.',
  'Inventario de jornales. Este sí.',
]) {
  equal(roomsSource.includes(text), true, `presentación textual F5: ${text}`);
}

equal(
  (roomsSource.match(/f\(\)\.forgeRestored \?/g) ?? []).length >= 8,
  true,
  'floor y wall de las cuatro salas cambian a una paleta cálida',
);
equal(
  audioSource.includes('export function sfxForgeRhythm(): void'),
  true,
  'audio expone el compás de Martillo, Fuelle y Lumbre',
);
equal(
  forgeSource.includes('sfxForgeRhythm()'),
  true,
  'la resolución dispara el compás procedural',
);

console.log('F5 forge tests: OK');
