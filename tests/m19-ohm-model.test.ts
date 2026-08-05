import assert from 'node:assert/strict';
import {
  PEDESTAL_RING,
  coverRejection,
  readCircuit,
  solutions,
  toggleCover,
  type CircuitDef,
} from '../src/puzzles/ohmModel.ts';

/* ---------- el anillo del pedestal, tal como se juega ---------- */

const vacio = new Set<string>();

assert.equal(
  readCircuit(PEDESTAL_RING, vacio).state,
  'abierto',
  'sin nada tendido, el circuito está abierto',
);
assert.equal(readCircuit(PEDESTAL_RING, vacio).supplyLeft, 3, 'la bandeja arranca con tres');

// El estado B es la lección: hay contacto, no hay camino.
const soloArriba = new Set(['g1']);
assert.equal(readCircuit(PEDESTAL_RING, soloArriba).state, 'tocando');
assert.equal(readCircuit(PEDESTAL_RING, soloArriba).complete, false, 'tocar no es unir');

// La solución que el puzzle enseña: arriba y los dos de la vuelta larga.
const larga = new Set(['g1', 'g4', 'g5']);
assert.equal(readCircuit(PEDESTAL_RING, larga).complete, true);
assert.equal(readCircuit(PEDESTAL_RING, larga).state, 'cerrado');
assert.equal(readCircuit(PEDESTAL_RING, larga).supplyLeft, 0);

// El atajo es un señuelo: aunque se cubra g2, g3 está partido y no hay vuelta.
const atajo = new Set(['g1', 'g2']);
assert.equal(readCircuit(PEDESTAL_RING, atajo).complete, false, 'el atajo no cierra: g3 está partido');

/* ---------- el material y los tramos partidos ---------- */

assert.equal(coverRejection(PEDESTAL_RING, vacio, 'g3'), 'partido');
assert.equal(coverRejection(PEDESTAL_RING, vacio, 'g1'), null);
assert.equal(
  coverRejection(PEDESTAL_RING, new Set(['g1', 'g2', 'g4']), 'g5'),
  'sin-material',
  'con la bandeja vacía no se puede cubrir un tramo nuevo',
);
assert.equal(
  coverRejection(PEDESTAL_RING, new Set(['g1', 'g2', 'g4']), 'g2'),
  null,
  'pero siempre se puede recuperar un puente ya puesto',
);
assert.throws(() => coverRejection(PEDESTAL_RING, vacio, 'g9'), /Tramo desconocido/);

/* ---------- toggle no muta ---------- */

const antes = new Set(['g1']);
const despues = toggleCover(PEDESTAL_RING, antes, 'g4');
assert.deepEqual([...antes], ['g1'], 'toggleCover no toca el conjunto que recibe');
assert.deepEqual([...despues].sort(), ['g1', 'g4']);
assert.deepEqual([...toggleCover(PEDESTAL_RING, despues, 'g4')], ['g1'], 'y sabe retirar');
assert.equal(
  toggleCover(PEDESTAL_RING, vacio, 'g3'),
  vacio,
  'un tramo partido no cambia nada al tocarlo',
);

/* ---------- la solución es única, y por eso el puzzle enseña ---------- */

const encontradas = solutions(PEDESTAL_RING);
assert.deepEqual(
  encontradas.map((combo) => [...combo].sort()),
  [['g1', 'g4', 'g5']],
  'con tres puentes hay una sola forma de cerrar el anillo',
);

/* ---------- la serie es una condición real, no un adorno ---------- */

// Un anillo donde la fuente se cierra sobre sí misma sin pasar por el autómata NO cuenta
// como cerrado: si sacar al autómata no corta la corriente, la corriente no lo atravesaba.
const puenteFalso: CircuitDef = {
  plus: 'MAS',
  minus: 'MENOS',
  through: 'OHM',
  supply: 1,
  segments: [
    { id: 'derivacion', from: 'MAS', to: 'MENOS', gap: true },
    { id: 'por_ohm', from: 'MAS', to: 'OHM', gap: true },
    { id: 's_vuelta', from: 'OHM', to: 'MENOS' },
  ],
};
assert.equal(
  readCircuit(puenteFalso, new Set(['derivacion'])).complete,
  false,
  'un camino que puentea al autómata no lo despierta',
);
assert.equal(readCircuit(puenteFalso, new Set(['por_ohm'])).complete, true);
assert.deepEqual(
  solutions(puenteFalso).map((combo) => [...combo]),
  [['por_ohm']],
  'la derivación no cuenta como solución',
);

console.log('M19 modelo de Ohm: OK (anillo del pedestal, una solución, serie verificada)');
