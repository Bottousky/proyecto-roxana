import { readFileSync } from 'node:fs';
import {
  CHANNEL_TOLERANCES,
  advanceChannelCut,
  heatLevel,
} from '../src/puzzles/common.ts';
import {
  createWarmthState,
  isWarmthSolved,
  observeWarmth,
  setAnvilDoubled,
  warmthReading,
} from '../src/puzzles/warmthModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(CHANNEL_TOLERANCES.angosto, 2, 'el canal angosto tolera río 2');
equal(CHANNEL_TOLERANCES.medio, 4, 'el canal medio tolera río 4');
equal(CHANNEL_TOLERANCES.ancho, 8, 'el canal ancho tolera río 8');

for (const [grosor, tolerancia] of Object.entries(CHANNEL_TOLERANCES)) {
  equal(heatLevel(tolerancia / 2, tolerancia), 'frio', `${grosor}: mitad inclusive es frío`);
  equal(heatLevel(tolerancia / 2 + 0.01, tolerancia), 'tibio', `${grosor}: sobre mitad es tibio`);
  equal(heatLevel(tolerancia, tolerancia), 'tibio', `${grosor}: tolerancia inclusive es tibio`);
  equal(heatLevel(tolerancia + 0.01, tolerancia), 'caliente', `${grosor}: sobre tolerancia es caliente`);
  equal(
    heatLevel(tolerancia * 1.5, tolerancia),
    'caliente',
    `${grosor}: una vez y media inclusive es caliente`,
  );
  equal(heatLevel(tolerancia * 1.5 + 0.01, tolerancia), 'rojo', `${grosor}: sobre 1.5 es rojo`);
}

equal(heatLevel(2, 2), 'tibio', 'un río igual a la tolerancia queda tibio');
equal(heatLevel(4, 2), 'rojo', 'duplicarlo salta de tibio a rojo');

let channel = { insistences: 0, cut: false };
channel = advanceChannelCut(channel, 'rojo');
equal(channel.cut, false, 'la primera insistencia roja avisa');
channel = advanceChannelCut(channel, 'rojo');
equal(channel.cut, false, 'la segunda insistencia roja avisa');
channel = advanceChannelCut(channel, 'rojo');
equal(channel.cut, true, 'la tercera insistencia roja corta el canal');

let state = createWarmthState();
equal(warmthReading(state, 'martillo').level, 'rojo', 'martillo: río 4, angosto, al rojo');
equal(warmthReading(state, 'fuelle').level, 'frio', 'A.3: fuelle río 4, ancho, frío');
equal(warmthReading(state, 'viejo').level, 'frio', 'canal viejo sin río, frío');
equal(warmthReading(state, 'yunque').river, 2, 'yunque: río base 2');
equal(warmthReading(state, 'yunque').level, 'tibio', 'yunque: río 2, angosto, tibio');

state = observeWarmth(state, 'viejo');
state = observeWarmth(state, 'martillo');
state = observeWarmth(state, 'fuelle');
equal(state.experiences.bellowsBase, true, 'medir el fuelle base registra la experiencia');
state = observeWarmth(state, 'yunque');
equal(state.anvilBaseObserved, true, 'medir el yunque base deja visible el nivel tibio');
equal(isWarmthSolved(state), false, 'el yunque base todavía no completa el salto');
state = setAnvilDoubled(state, true);
equal(warmthReading(state, 'yunque').river, 4, 'la llave duplica el río del yunque');
equal(
  warmthReading(state, 'yunque').level,
  'rojo',
  'el yunque salta de tibio a rojo sin pasar por caliente',
);
state = observeWarmth(state, 'yunque');
equal(state.experiences.anvilDoubled, true, 'medir el yunque duplicado registra la experiencia');
equal(isWarmthSolved(state), true, 'las cuatro experiencias resuelven el banco en cualquier orden');

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const warmthSource = readFileSync(new URL('../src/puzzles/warmth.ts', import.meta.url), 'utf8');

equal(roomsSource.includes("import { abrirWarmth } from '../puzzles/warmth';"), true, 'rooms importa F2');
equal(roomsSource.includes("setFlag('solvedWarmChannel')"), true, 'F2 marca solvedWarmChannel');
equal(roomsSource.includes("notifyNewEntry('El peaje')"), true, 'F2 notifica El peaje');
equal(roomsSource.includes('f().solvedWarmChannel,'), true, 'F2 reabre en modo práctica');
equal(
  warmthSource.includes('aria-label="Cuatro canales del patio"'),
  true,
  'F2 muestra cuatro canales',
);
equal(warmthSource.includes('Segundo martillo'), true, 'la llave parte del segundo martillo');
equal(warmthSource.includes('canal del yunque'), true, 'la llave conecta el canal del yunque');

for (const text of [
  'Río: grande. Canal: chico. Peaje: en curso.',
  '¡El mismo río! ¿Por qué este ni se entera?',
  'Mismo río. Más cauce. Menos peaje.',
  'Ese canal tiene cien años y está helado. Así que no es la edad. Mi abuelo SIEMPRE dijo que era la edad.',
  'Doble de río. Cuádruple de peaje. Anótelo.',
  'YA lo anoté. Es mi línea, calderito.',
  'A ver si entendí: el calor no es fantasma ni vejez. Es el precio del paso. Más río por el mismo canal, más caro el peaje.',
  '…¿Y quién lo cobra?',
  'El aire, supongo. Se lo lleva y no da recibo.',
]) {
  equal(warmthSource.includes(text), true, `diálogo textual F2: ${text.slice(0, 36)}`);
}

console.log('F2 warmth tests: OK');
