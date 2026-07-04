import type { ExperienceManifest } from './types.ts';

export const INSTITUTO: ExperienceManifest = {
  id: 'instituto',
  title: 'Escuela Roxana',
  discipline: 'Mundo real / memoria del conocimiento',
  status: 'playable',
  runtime: 'school-hub',
  rooms: ['escuela_hub', 'hall', 'despacho'],
  learningVerb: 'reunir',
  fantasy: 'Volver a encender una escuela que olvidó lo que sabía.',
  visualGrammar: {
    camera: 'hub web modular de salas isométricas',
    style: 'arquitectura web viva, institucional, cálida y evolucionable',
  },
};

export const OHMDAL: ExperienceManifest = {
  id: 'ohmdal',
  title: 'Ohmdal',
  discipline: 'Electricidad y electrónica',
  status: 'playable',
  runtime: 'topdown-phaser',
  rooms: [
    'aula',
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
