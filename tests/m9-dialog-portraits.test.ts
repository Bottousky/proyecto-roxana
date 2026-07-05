import { portraitKey } from '../src/ui/portrait.ts';

function equal(actual: string, expected: string, label: string): void {
  if (actual !== expected) throw new Error(`${label}: esperado ${expected}, recibido ${actual}`);
}

const canonicalSpeakers: Record<string, string> = {
  Edda: 'edda',
  Lumen: 'lumen',
  'Maese Lumen': 'lumen',
  Preceptor: 'preceptor',
  Consejera: 'consejera',
  Guardiana: 'guardiana',
  Yesca: 'yesca',
  Forjadora: 'yesca',
  Farero: 'farero',
  Ohm: 'ohm',
  Niño: 'nino',
  Proyector: 'proyector',
  Ciudadano: 'ciudadano',
  Estudiante: 'student',
};

for (const [speaker, portrait] of Object.entries(canonicalSpeakers)) {
  equal(portraitKey(speaker), portrait, `retrato de ${speaker}`);
}

equal(portraitKey(''), '', 'la narración no muestra retrato');
equal(portraitKey('Personaje futuro'), '', 'un hablante desconocido no usa al protagonista');

console.log('M9 dialog portrait tests: OK');
