import { readFileSync } from 'node:fs';
import {
  FUSE_RATINGS,
  INFIRMARY_MACHINES,
  createInfirmaryState,
  isCorrectFuse,
  repairDemoChannel,
  setMachineFuse,
  startForge,
} from '../src/puzzles/infirmaryModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(FUSE_RATINGS.join('/'), '1/2/4/8', 'el banco ofrece los cuatro calibres');
equal(INFIRMARY_MACHINES.A.workRiver, 1, 'A trabaja con río 1');
equal(INFIRMARY_MACHINES.A.peakRiver, 2, 'A pica a río 2');
equal(INFIRMARY_MACHINES.A.thickness, 'angosto', 'A usa canal angosto');
equal(INFIRMARY_MACHINES.B.workRiver, 2, 'B trabaja con río 2');
equal(INFIRMARY_MACHINES.B.peakRiver, 3, 'B pica a río 3');
equal(INFIRMARY_MACHINES.B.thickness, 'medio', 'B usa canal medio');
equal(INFIRMARY_MACHINES.C.workRiver, 4, 'C trabaja con río 4');
equal(INFIRMARY_MACHINES.C.peakRiver, 5, 'C pica a río 5');
equal(INFIRMARY_MACHINES.C.thickness, 'ancho', 'C usa canal ancho');

equal(isCorrectFuse('A', 2), true, 'A acepta el menor calibre que aguanta pico 2');
equal(isCorrectFuse('B', 4), true, 'B acepta el menor calibre que aguanta pico 3');
equal(isCorrectFuse('C', 8), true, 'C acepta el menor calibre que aguanta pico 5');
equal(isCorrectFuse('A', 4), false, 'un calibre mayor al mínimo no es la elección correcta');

let equalPeak = createInfirmaryState();
equalPeak = setMachineFuse(equalPeak, 'A', 2);
let result = startForge(equalPeak);
equal(result.event, 'incomplete', 'pico igual al calibre se aguanta y no muere joven');
equal(result.state.fuses.A, 2, 'el fusible que iguala el pico sigue engastado');

let young = createInfirmaryState();
young = setMachineFuse(young, 'B', 2);
result = startForge(young);
equal(result.event, 'young-fuse', 'pico mayor al calibre mata al fusible joven');
equal(result.youngMachines.join(','), 'B', 'el resultado identifica la máquina con fusible joven');
equal(result.state.fuses.B, null, 'el fusible joven se consume al arrancar');

let demo = createInfirmaryState();
demo = setMachineFuse(demo, 'A', 8);
result = startForge(demo);
equal(result.event, 'burned-channel-demo', 'A con fusible 8 vive la falla simulada');
equal(result.state.burnedChannelDemo, true, 'la demo queda registrada');
equal(result.state.channelCut, true, 'la falla simulada corta el canal angosto');
const repaired = repairDemoChannel(result.state);
equal(repaired.channelCut, false, 'la Forjadora puede reparar el canal sin castigo');
equal(repaired.fuses.A, 8, 'reparar conserva el fusible elegido');
result = startForge(repaired);
equal(result.event, 'incomplete', 'la demo ocurre una sola vez y no bloquea nuevos arranques');

let canonical = createInfirmaryState();
canonical = setMachineFuse(canonical, 'A', 2);
canonical = setMachineFuse(canonical, 'B', 4);
canonical = setMachineFuse(canonical, 'C', 8);
result = startForge(canonical);
equal(result.event, 'solved', '2/4/8 produce ritmo estable');
equal(result.state.solved, true, 'el modelo queda resuelto');

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const infirmarySource = readFileSync(new URL('../src/puzzles/infirmary.ts', import.meta.url), 'utf8');

equal(
  roomsSource.includes("import { abrirInfirmary } from '../puzzles/infirmary';"),
  true,
  'rooms importa F3',
);
equal(
  roomsSource.includes("setFlag('solvedFuseInfirmary')"),
  true,
  'F3 marca solvedFuseInfirmary',
);
equal(
  roomsSource.includes("setFlag('burnedChannelDemo')"),
  true,
  'la demo registra burnedChannelDemo por callback',
);
equal(
  roomsSource.includes("notifyNewEntry('El mártir y el margen')"),
  true,
  'F3 notifica El mártir y el margen',
);
equal(
  roomsSource.includes('practica: f().solvedFuseInfirmary'),
  true,
  'F3 reabre en modo práctica',
);

for (const text of [
  'Mi enfermería. Bueno… mi cementerio, técnicamente. Cada uno de estos murió por la Forja.',
  'Este murió joven. Este no murió nunca — y dejó morir al canal. Empiezo a sospechar, estudiante, que la santidad era una cuestión de calibre.',
  'Yo necesito que dejen de morirse, Lumen. O al menos que se mueran con sentido.',
  'Corrección: morirse con sentido es la función. Fusible = el que muere a propósito, para que no muera otra cosa.',
  '…Eso es lo más bonito que dijiste nunca, Ohm.',
  'Registro: poesía accidental. No se repetirá.',
]) {
  equal(roomsSource.includes(text), true, `diálogo textual de apertura F3: ${text.slice(0, 38)}`);
}

for (const text of [
  'Arrancar la Forja',
  '¡Otro mártir del amanecer! …Ya ni los velo, fíjate.',
  '¿Y ESO quién lo repone? El fusible cuesta un cobre. El canal, una semana.',
  '…El gordo no era un santo. Era un cómplice.',
  'Un mártir por año es santidad. Uno por semana es mal cálculo.',
  'Cuarenta años venerando el sacrificio y la respuesta era… margen. Elegir el margen.',
]) {
  equal(infirmarySource.includes(text), true, `texto textual del banco F3: ${text.slice(0, 38)}`);
}

console.log('F3 infirmary tests: OK');
