import { readFileSync } from 'node:fs';
import {
  LIGHTHOUSE_TARGET_RHYTHM,
  LIGHTHOUSE_UNIT_MS,
  advanceLighthouse,
  createLighthouseState,
  isBriefDischarge,
  isLighthouseSolution,
  lighthouseChargePeriodMs,
  lighthouseDischargePeriodMs,
  lighthouseRhythm,
  lighthouseTiming,
} from '../src/puzzles/lighthouseModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

for (const [tank, brake, expected] of [
  [1, 1, 1],
  [1, 8, 8],
  [2, 4, 8],
  [4, 8, 32],
] as const) {
  equal(lighthouseRhythm(tank, brake), expected, `ritmo de carga ${tank} × ${brake}`);
}

for (const [tank, chargeBrake] of [
  [4, 2],
  [2, 4],
  [1, 8],
] as const) {
  equal(
    lighthouseRhythm(tank, chargeBrake),
    LIGHTHOUSE_TARGET_RHYTHM,
    `${tank} × ${chargeBrake} da ritmo 8`,
  );
  equal(
    isLighthouseSolution(tank, chargeBrake, 1),
    true,
    `${tank} × ${chargeBrake} con volcado marrón es válido`,
  );
  equal(
    isLighthouseSolution(tank, chargeBrake, 2),
    true,
    `${tank} × ${chargeBrake} con volcado rojo es válido`,
  );
  equal(
    lighthouseChargePeriodMs(tank, chargeBrake),
    2000,
    `${tank} × ${chargeBrake} produce un latido de ~2 s`,
  );
}

equal(isBriefDischarge(1), true, 'la piedra marrón permite un volcado breve');
equal(isBriefDischarge(2), true, 'la piedra roja permite un volcado breve');
equal(isBriefDischarge(4), false, 'la piedra amarilla frena demasiado el volcado');
equal(isBriefDischarge(8), false, 'la piedra gris frena demasiado el volcado');
equal(isLighthouseSolution(2, 4, 4), false, 'ritmo 8 con freno de descarga grande no valida');

equal(lighthouseTiming(1, 4), 'fast', 'ritmo menor que 8 se detecta rápido');
equal(lighthouseTiming(4, 4), 'slow', 'ritmo mayor que 8 se detecta lento');
equal(lighthouseTiming(2, 4), 'just', 'ritmo 8 se detecta justo');

let state = createLighthouseState(2, 4, 1);
state = advanceLighthouse(state, lighthouseChargePeriodMs(2, 4) / 2);
equal(state.level, 50, 'medio período llena medio Estanque');
equal(state.phase, 'charging', 'antes del umbral sigue cargando');
state = advanceLighthouse(state, lighthouseChargePeriodMs(2, 4) / 2);
equal(state.level, 100, 'el umbral inicia el volcado desde lleno');
equal(state.phase, 'dumping', 'al alcanzar el umbral cambia al camino de volcado');
equal(state.flashCount, 1, 'cada umbral produce un destello de la lente');
state = advanceLighthouse(state, lighthouseDischargePeriodMs(1));
equal(state.level, 0, 'el volcado vacía el Estanque');
equal(state.phase, 'charging', 'después del volcado vuelve a cargar');

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const puzzleSource = readFileSync(new URL('../src/puzzles/lighthouse.ts', import.meta.url), 'utf8');

equal(LIGHTHOUSE_UNIT_MS, 250, 'L5 usa 250 ms por unidad');
equal(
  roomsSource.includes("import { abrirLighthouse } from '../puzzles/lighthouse';"),
  true,
  'rooms importa L5',
);
equal(roomsSource.includes("setFlag('solvedLighthouse')"), true, 'L5 marca solvedLighthouse');
equal(
  roomsSource.includes("setFlag('lighthouseRestored')"),
  true,
  'L5 marca lighthouseRestored',
);
equal(
  roomsSource.includes("setFlag('learnedCapacitor')"),
  true,
  'L5 marca learnedCapacitor',
);
equal(
  roomsSource.includes("openBitacora('el-arco-del-rio')"),
  true,
  'L5 abre la entrada reservada para L6',
);
equal(roomsSource.includes('// TODO(L5)'), false, 'L5 reemplaza el placeholder de la linterna');
equal(puzzleSource.includes('createSimTick('), true, 'L5 usa el tick compartido');
equal(puzzleSource.includes('bench.onClose(tick.stop)'), true, 'L5 cancela el tick al cerrar');

for (const text of [
  'El lago entero parpadea con la lente.',
  'Ese. Ese es. …Cuarenta años afinando el oído para esta noche.',
  '¿Ohm…? Tu pecho. Late igual que el Faro.',
  'Dato registrado. Sin explicación disponible. …Todavía.',
]) {
  equal(puzzleSource.includes(text), true, `texto L5: ${text}`);
}

console.log('L5 lighthouse tests: OK');
