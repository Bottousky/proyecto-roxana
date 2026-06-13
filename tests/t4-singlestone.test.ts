import { readFileSync } from 'node:fs';
import {
  SINGLE_STONE_NETWORKS,
  SINGLE_STONE_REQUIRED_MATCHES,
  compareSingleStone,
  createSingleStoneState,
  equivalentResistance,
  isSingleStoneSolved,
  parallelEqualResistance,
  recordSingleStoneMatch,
  seriesResistance,
  type SingleStoneNetworkId,
} from '../src/puzzles/singlestoneModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(parallelEqualResistance('roja'), 1, 'roja en paralelo con roja da marrón');
equal(parallelEqualResistance('amarilla'), 2, 'amarilla en paralelo con amarilla da roja');
equal(parallelEqualResistance('gris'), 4, 'gris en paralelo con gris da amarilla');
equal(seriesResistance(1, 1), 2, 'la fila marrón + marrón se suma');
equal(seriesResistance(2, 2), 4, 'la fila roja + roja se suma');

const expectedEquivalents: Record<SingleStoneNetworkId, number> = {
  'parallel-red': 1,
  'parallel-yellow': 2,
  'parallel-gray': 4,
  'brown-series-parallel-red': 2,
  'red-series-parallel-yellow': 4,
};

equal(SINGLE_STONE_NETWORKS.length, 5, 'solo se ofrecen las cinco redes canónicas');
for (const network of SINGLE_STONE_NETWORKS) {
  const equivalent = equivalentResistance(network);
  equal(equivalent, expectedEquivalents[network.id], `equivalente exacto de ${network.id}`);
  equal(Number.isInteger(equivalent), true, `${network.id} conserva equivalente entero`);
  equal(
    compareSingleStone(network.id, network.equivalentStone).distinguishes,
    false,
    `${network.id} no se distingue de su Piedra Única`,
  );
}

const correct = compareSingleStone('parallel-red', 'marron');
equal(correct.leftResistance, 1, 'la red roja en ramales equivale a 1');
equal(correct.rightResistance, 1, 'la piedra marrón vale 1');
equal(correct.leftRiver, correct.rightRiver, 'los ríos coinciden con la piedra correcta');
equal(correct.distinguishes, false, 'Ohm no distingue la piedra correcta');

const incorrect = compareSingleStone('parallel-red', 'roja');
equal(incorrect.leftRiver, 8, 'la red correcta lleva río 8');
equal(incorrect.rightRiver, 4, 'la piedra incorrecta lleva otro río');
equal(incorrect.distinguishes, true, 'Ohm distingue una piedra incorrecta');

equal(SINGLE_STONE_REQUIRED_MATCHES, 2, 'se requieren al menos dos redes distintas');
let state = createSingleStoneState();
state = recordSingleStoneMatch(state, correct);
equal(state.matchedNetworkIds.length, 1, 'la primera red correcta cuenta');
equal(isSingleStoneSolved(state), false, 'una sola red no gana');

state = recordSingleStoneMatch(state, correct);
equal(state.matchedNetworkIds.length, 1, 'repetir la misma red no vuelve a contar');

state = recordSingleStoneMatch(
  state,
  compareSingleStone('parallel-yellow', 'marron'),
);
equal(state.matchedNetworkIds.length, 1, 'una comparación incorrecta no cuenta');

state = recordSingleStoneMatch(
  state,
  compareSingleStone('parallel-yellow', 'roja'),
);
equal(state.matchedNetworkIds.length, 2, 'una segunda red distinta y correcta cuenta');
equal(isSingleStoneSolved(state), true, 'dos redes distintas resuelven el puzzle');

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const singleStoneSource = readFileSync(
  new URL('../src/puzzles/singlestone.ts', import.meta.url),
  'utf8',
);

equal(
  roomsSource.includes("import { abrirSingleStone } from '../puzzles/singlestone';"),
  true,
  'rooms importa T4',
);
equal(roomsSource.includes("setFlag('solvedSingleStone')"), true, 'T4 marca solvedSingleStone');
equal(
  roomsSource.includes("notifyNewEntry('La Piedra Única')"),
  true,
  'T4 notifica la entrada',
);
equal(roomsSource.includes('f().solvedSingleStone,'), true, 'T4 reabre en modo práctica');

for (const text of [
  'Izquierda: río ${formatNumber(comparison.leftRiver)}.',
  'Derecha: río ${formatNumber(comparison.rightRiver)}. No distingo. Son la misma piedra.',
  'La red entera se esconde dentro de una piedra. Y si Ohm no la distingue…',
  '…el río tampoco. Una red es una piedra que todavía no terminaste de mirar.',
  'Entonces el valle entero… es una piedra. Una sola piedra que aprendí a temer.',
]) {
  equal(singleStoneSource.includes(text), true, `diálogo textual T4: ${text.slice(0, 45)}`);
}

console.log('T4 single stone tests: OK');
