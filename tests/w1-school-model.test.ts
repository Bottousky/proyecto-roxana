import { deriveSchoolState } from '../src/landing/schoolModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${JSON.stringify(expected)}, recibido ${JSON.stringify(actual)}`);
  }
}

// Caso 1: ambos null → defaults seguros
{
  const s = deriveSchoolState(null, null);
  equal(s.introVista, false, 'null/null: introVista');
  equal(s.perfilNombre, null, 'null/null: perfilNombre');
  equal(s.aulas.electronica, 'off', 'null/null: aula electronica');
  equal(s.aulas.programacion, 'cerrada', 'null/null: aula programacion');
  equal(s.aulas.fisica, 'off', 'null/null: aula fisica (abierta a Physica)');
  equal(s.aulas.matematica, 'cerrada', 'null/null: aula matematica');
  equal(s.electronica.unidadesCompletadas, 0, 'null/null: unidades completadas');
  equal(s.electronica.totalUnidades, 5, 'null/null: total unidades');
  equal(s.electronica.arcoCompleto, false, 'null/null: arco completo');
}

// Caso 2: save corrupto → defaults seguros, sin throw
{
  const s = deriveSchoolState('{oops', null);
  equal(s.aulas.electronica, 'off', 'save corrupto: aula electronica');
  equal(s.electronica.unidadesCompletadas, 0, 'save corrupto: unidades completadas');
  equal(s.electronica.arcoCompleto, false, 'save corrupto: arco completo');
}

// Caso 3: save U1 terminada → 1/5, enCurso
{
  const save = JSON.stringify({ room: 'hall', flags: { finished: true } });
  const s = deriveSchoolState(save, null);
  equal(s.aulas.electronica, 'enCurso', 'U1 terminada: aula electronica');
  equal(s.electronica.unidadesCompletadas, 1, 'U1 terminada: unidades completadas');
  equal(s.electronica.arcoCompleto, false, 'U1 terminada: arco completo');
}

// Caso 4: save con arco completo (5 flags + arcOneCompleted) → completada
{
  const save = JSON.stringify({
    room: 'hall',
    flags: {
      finished: true,
      unit2Completed: true,
      unit3Completed: true,
      unit4Completed: true,
      unit5Completed: true,
      arcOneCompleted: true,
    },
  });
  const s = deriveSchoolState(save, null);
  equal(s.aulas.electronica, 'completada', 'arco completo: aula electronica');
  equal(s.electronica.unidadesCompletadas, 5, 'arco completo: unidades completadas');
  equal(s.electronica.arcoCompleto, true, 'arco completo: arco completo');
}

// Caso 5: webRaw con introVista y nombre de perfil
{
  const web = JSON.stringify({ introVista: true, perfil: { nombre: 'Ana' } });
  const s = deriveSchoolState(null, web);
  equal(s.introVista, true, 'webRaw: introVista');
  equal(s.perfilNombre, 'Ana', 'webRaw: perfilNombre');
  equal(s.aulas.electronica, 'off', 'webRaw sin save: aula electronica sigue off');
}

console.log('W1 school model tests: OK');
