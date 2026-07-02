import type { ExperienceManifest } from './types.ts';

// La escuela 3D es un prototipo gateado por URL: sin ?school3d=1 se conserva
// el prólogo cenital. Node (tests) no tiene location: cae al runtime actual.
const school3dEnabled =
  typeof location !== 'undefined' && new URLSearchParams(location.search).has('school3d');

export const INSTITUTO: ExperienceManifest = {
  id: 'instituto',
  title: 'Instituto Roxana',
  discipline: 'Mundo real / memoria del conocimiento',
  status: 'playable',
  // El prólogo cenital sigue operativo por defecto. El prototipo 3D/2.5D se
  // activa solo con ?school3d=1 hasta que demuestre ser mejor (no se reemplaza
  // el prólogo hasta entonces).
  runtime: school3dEnabled ? 'school-webgl' : 'topdown-phaser',
  rooms: ['hall', 'despacho', 'aula'],
  learningVerb: 'reunir',
  fantasy: 'Volver a encender una escuela que olvidó lo que sabía.',
  visualGrammar: {
    camera: 'actualmente cenital; objetivo: 3D o 2.5D de cámara controlada',
    style: 'realismo estilizado, material, antiguo y cuidado',
  },
};

export const OHMDAL: ExperienceManifest = {
  id: 'ohmdal',
  title: 'Ohmdal',
  discipline: 'Electricidad y electrónica',
  status: 'playable',
  runtime: 'topdown-phaser',
  rooms: [
    'plaza',
    'taller',
    'puerta',
    'manantial_ohm',
    'castle_gate',
    'castle_gallery',
    'castle_branches',
    'castle_heart',
    'forge_yard',
    'forge_infirmary',
    'forge_longchannel',
    'forge_hall',
    'terraces_top',
    'terraces_mid',
    'terraces_mural',
    'terraces_aqueduct',
    'lighthouse_hall',
    'lighthouse_bench',
    'clock_tower',
    'lighthouse_lantern',
  ],
  learningVerb: 'conectar',
  fantasy: 'Recorrer un mundo que responde, conduce y vuelve a encenderse.',
  visualGrammar: {
    camera: 'RPG cenital continuo con bancos de detalle',
    style: 'piedra cálida, cobre, cerámica y luz procedural',
  },
};

export const BITLAND: ExperienceManifest = {
  id: 'bitland',
  title: 'Bitland',
  discipline: 'Programación y pensamiento computacional',
  status: 'planned',
  runtime: 'dataflow-phaser',
  rooms: [],
  learningVerb: 'ejecutar',
  fantasy: 'Habitar un sistema: viajar como dato, guardarse y cambiar su flujo.',
  visualGrammar: {
    camera: 'cenital esquemática dentro de buses, memoria y procesos',
    style: 'digital pixelado, legible y sistémico',
  },
};

export const PHYSICA: ExperienceManifest = {
  id: 'physica',
  title: 'Physica',
  discipline: 'Física',
  status: 'planned',
  runtime: 'platformer-phaser',
  rooms: [],
  learningVerb: 'sentir',
  fantasy: 'Atravesar una naturaleza cuyas leyes pueden observarse y alterarse.',
  visualGrammar: {
    camera: 'plataformero lateral 2D',
    style: 'naturaleza expresiva gobernada por movimiento, fuerza y materia',
  },
};

export const ARITHMOS: ExperienceManifest = {
  id: 'arithmos',
  title: 'Arithmos',
  discipline: 'Matemática',
  status: 'planned',
  runtime: 'cosmos-web',
  rooms: [],
  learningVerb: 'contemplar',
  fantasy: 'Descubrir las estructuras invisibles que sostienen a los otros mundos.',
  visualGrammar: {
    camera: 'aventura gráfica y composición audiovisual de navegación pausada',
    style: 'abstracto, geométrico y cósmico',
  },
};
