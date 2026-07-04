import { pizarronViewModel } from '../src/landing/aulaModel.ts';
import { deriveSchoolState } from '../src/landing/schoolModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${JSON.stringify(expected)}, recibido ${JSON.stringify(actual)}`);
  }
}

function saveWith(flags: Record<string, boolean>): string {
  return JSON.stringify({ room: 'hall', flags });
}

// Caso 1: sin save -> línea de espera
{
  const vm = pizarronViewModel(deriveSchoolState(null, null));
  equal(vm.titulo, 'Plan del curso — Electrónica', 'sin save: titulo');
  equal(vm.lineas, null, 'sin save: lineas');
  equal(vm.vacio, 'El curso espera a su primer estudiante.', 'sin save: vacio');
  equal(vm.pie, undefined, 'sin save: pie');
}

// Caso 2: 1/5 -> U1 completada, resto pendiente
{
  const vm = pizarronViewModel(deriveSchoolState(saveWith({ finished: true }), null));
  equal(vm.lineas?.length, 5, '1/5: cantidad de lineas');
  equal(vm.lineas?.[0]?.texto, 'La corriente no es magia', '1/5: U1 texto');
  equal(vm.lineas?.[0]?.marca, '✓', '1/5: U1 marca');
  equal(vm.lineas?.[1]?.texto, 'El río se reparte', '1/5: U2 texto');
  equal(vm.lineas?.[1]?.marca, '·', '1/5: U2 marca');
  equal(vm.lineas?.[4]?.marca, '·', '1/5: U5 marca');
  equal(vm.pie, undefined, '1/5: pie');
}

// Caso 3: 5/5 sin arco -> todas completadas, sin pie
{
  const vm = pizarronViewModel(
    deriveSchoolState(
      saveWith({
        finished: true,
        unit2Completed: true,
        unit3Completed: true,
        unit4Completed: true,
        unit5Completed: true,
      }),
      null,
    ),
  );
  equal(vm.lineas?.every((linea) => linea.marca === '✓'), true, '5/5 sin arco: marcas');
  equal(vm.pie, undefined, '5/5 sin arco: pie');
}

// Caso 4: 5/5 con arco -> todas completadas y pie final
{
  const vm = pizarronViewModel(
    deriveSchoolState(
      saveWith({
        finished: true,
        unit2Completed: true,
        unit3Completed: true,
        unit4Completed: true,
        unit5Completed: true,
        arcOneCompleted: true,
      }),
      null,
    ),
  );
  equal(vm.lineas?.every((linea) => linea.marca === '✓'), true, '5/5 con arco: marcas');
  equal(vm.pie, 'Curso completado. El pueblo se enciende solo.', '5/5 con arco: pie');
}

console.log('W3 aula pizarron tests: OK');
