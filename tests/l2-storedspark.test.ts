import { readFileSync } from 'node:fs';
import { createSimTick } from '../src/puzzles/common.ts';
import {
  STORED_SPARK_DRAIN_MS,
  STORED_SPARK_FILL_MS,
  advanceStoredSpark,
  createStoredSparkState,
  setStoredSparkPath,
  storedSparkReading,
} from '../src/puzzles/storedsparkModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

let state = setStoredSparkPath(createStoredSparkState(), true);
state = advanceStoredSpark(state, STORED_SPARK_FILL_MS / 2);
equal(state.level, 50, 'cargar durante medio ciclo sube el nivel a la mitad');
equal(storedSparkReading(state).lampLit, true, 'la lámpara brilla mientras hay flujo de carga');
const halfFlow = storedSparkReading(state).channelFlow;

state = advanceStoredSpark(state, STORED_SPARK_FILL_MS / 2);
equal(state.level, 100, 'cargar un ciclo completo llena el Estanque');
equal(
  storedSparkReading(state).channelFlow < halfFlow,
  true,
  'el río del canal decae al llenarse',
);
equal(storedSparkReading(state).channelFlow, 0, 'el río muere con el Estanque lleno');

state = setStoredSparkPath(state, false);
equal(storedSparkReading(state).lampLit, true, 'al cortar, la descarga enciende la lámpara');
state = advanceStoredSpark(state, STORED_SPARK_DRAIN_MS - 1);
equal(state.level > 0, true, 'la descarga conserva brillo durante un tiempo mayor que cero');
equal(storedSparkReading(state).lampLit, true, 'la lámpara sigue encendida antes del final');
state = advanceStoredSpark(state, 1);
equal(state.level, 0, 'la descarga termina en un tiempo finito');
equal(storedSparkReading(state).lampLit, false, 'la lámpara se apaga al vaciarse');

const originalRequest = globalThis.requestAnimationFrame;
const originalCancel = globalThis.cancelAnimationFrame;
let nextFrameId = 1;
const pendingFrames = new Map<number, FrameRequestCallback>();

globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  const id = nextFrameId++;
  pendingFrames.set(id, callback);
  return id;
};
globalThis.cancelAnimationFrame = (id: number): void => {
  pendingFrames.delete(id);
};

let tickFrames = 0;
const tick = createSimTick(() => {
  tickFrames++;
});
equal(pendingFrames.size, 1, 'el tick mantiene un único frame pendiente');
const [firstId, firstFrame] = [...pendingFrames.entries()][0];
pendingFrames.delete(firstId);
firstFrame(10);
equal(tickFrames, 1, 'el tick ejecuta el callback por frame');
equal(pendingFrames.size, 1, 'el tick programa el siguiente frame');
tick.stop();
equal(pendingFrames.size, 0, 'stop cancela el frame pendiente');
tick.stop();
equal(pendingFrames.size, 0, 'stop es idempotente');

if (originalRequest) globalThis.requestAnimationFrame = originalRequest;
else delete (globalThis as { requestAnimationFrame?: typeof requestAnimationFrame }).requestAnimationFrame;
if (originalCancel) globalThis.cancelAnimationFrame = originalCancel;
else delete (globalThis as { cancelAnimationFrame?: typeof cancelAnimationFrame }).cancelAnimationFrame;

const commonSource = readFileSync(new URL('../src/puzzles/common.ts', import.meta.url), 'utf8');
const benchSource = readFileSync(new URL('../src/ui/bench.ts', import.meta.url), 'utf8');
const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const puzzleSource = readFileSync(new URL('../src/puzzles/storedspark.ts', import.meta.url), 'utf8');

equal(commonSource.includes('export function tankSVG()'), true, 'common exporta tankSVG');
equal(commonSource.includes('export function setTankLevel('), true, 'common exporta setTankLevel');
equal(benchSource.includes('onClose(cleanup: () => void)'), true, 'el bench expone cleanup retrocompatible');
equal(puzzleSource.includes('bench.onClose(tick.stop)'), true, 'el puzzle cancela el tick al cerrar');
equal(roomsSource.includes("import { abrirStoredSpark } from '../puzzles/storedspark';"), true, 'rooms importa L2');
equal(roomsSource.includes("setFlag('solvedStoredSpark')"), true, 'L2 marca solvedStoredSpark');
equal(roomsSource.includes("setFlag('consejeraNotedAnomaly')"), true, 'L2 registra la anomalía');
equal(roomsSource.includes("notifyNewEntry('La chispa que se queda')"), true, 'L2 notifica la entrada');

for (const text of [
  'Ahí está. EXACTAMENTE eso. Tres segundos sin camino.',
  'Camino: cortado. Chispa: presente. Reglas: intactas. Paciencia: detectada.',
  'El estanque no es una pared. Es una pared que primero deja pasar, y después se acuerda.',
  'Registro fuera de término. Cuarenta años haciendo actas y la primera verdad la anoto tarde.',
  '(escribe, con fecha vieja)',
  '«La chispa que se queda.» ...Que conste.',
]) {
  equal(puzzleSource.includes(text), true, `diálogo textual L2: ${text.slice(0, 42)}`);
}

console.log('L2 stored spark tests: OK');
