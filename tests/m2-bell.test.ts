import {
  bellReading,
  bellState,
  createBellProgress,
  visitBellState,
} from '../src/puzzles/bellModel.ts';
import { advanceFuse } from '../src/puzzles/common.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(bellState(true, true), 'both-closed', 'ambos cerrados');
equal(bellReading(true, true, 'left'), 'Medio río.', 'izquierdo con ambos cerrados');
equal(bellReading(true, true, 'right'), 'Medio río.', 'derecho con ambos cerrados');
equal(bellReading(true, true, 'trunk'), 'Río entero.', 'Tronco con ambos cerrados');

equal(bellState(false, true), 'one-open', 'un tramo abierto');
equal(bellReading(false, true, 'left'), 'Río: cero.', 'tramo izquierdo abierto');
equal(bellReading(false, true, 'right'), 'Río entero.', 'tramo derecho cerrado');
equal(bellReading(false, true, 'trunk'), 'Río entero.', 'Tronco con un tramo cerrado');

equal(bellState(false, false), 'both-open', 'ambos abiertos');
equal(bellReading(false, false, 'left'), 'Río: cero.', 'izquierdo con ambos abiertos');
equal(bellReading(false, false, 'right'), 'Río: cero.', 'derecho con ambos abiertos');
equal(bellReading(false, false, 'trunk'), 'Río: cero.', 'Tronco con ambos abiertos');

let progress = createBellProgress();
equal(progress.solved, false, 'no empieza resuelto');
progress = visitBellState(progress, 'one-open');
progress = visitBellState(progress, 'both-open');
equal(progress.solved, false, 'no resuelve antes de volver a cerrar');
progress = visitBellState(progress, 'both-closed');
equal(progress.solved, true, 'resuelve al volver a ambos cerrados');

let fuse = { overloads: 0, burned: false };
fuse = advanceFuse(fuse, 9, 8);
equal(fuse.burned, false, 'primera excedencia avisa');
fuse = advanceFuse(fuse, 9, 8);
equal(fuse.burned, false, 'segunda excedencia avisa');
fuse = advanceFuse(fuse, 9, 8);
equal(fuse.burned, true, 'tercera excedencia inmola');

console.log('M2 bell tests: OK');
