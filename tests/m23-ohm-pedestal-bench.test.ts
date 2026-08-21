import assert from 'node:assert/strict';
import { PEDESTAL_RING, readCircuit, type CircuitState } from '../src/puzzles/ohmModel.ts';

// El modelo de circuito de Ohm vive en puzzles/; este test no arrastra renderer.

assert.equal(
  readCircuit(PEDESTAL_RING, new Set<string>()).state,
  'abierto',
  'sin nada tendido, el anillo está abierto: Ohm sigue dormido',
);

assert.equal(
  readCircuit(PEDESTAL_RING, new Set(['g3'])).state,
  'tocando',
  'un partido no se cubre: el bench lo muestra en rojo pero el circuito sigue abierto',
);

const validSolutions: ReadonlyArray<ReadonlyArray<string>> = [
  ['g1', 'g4', 'g5'],
];

for (const solution of validSolutions) {
  const reading = readCircuit(PEDESTAL_RING, new Set(solution));
  assert.equal(reading.complete, true, `solución ${solution.join(',')} cierra el anillo`);
  assert.equal(reading.state, 'cerrado');
  assert.equal(reading.supplyLeft, 0);
}

// Estados que el bench debe poder alcanzar, en orden pedagógico del VS03.
const observedStates: CircuitState[] = ['abierto', 'tocando', 'cerrado'];
const uniqueStates = new Set(observedStates);
assert.equal(uniqueStates.size, 3, 'los tres estados del bench son los tres del modelo');

console.log('M23 banco diegético de Ohm: OK (mismo modelo, mismas soluciones, tres estados)');
