/** Identidad estable de cada lenguaje jugable de Proyecto Roxana. */
export type ExperienceId = 'instituto' | 'ohmdal' | 'bitland' | 'physica' | 'arithmos';

/**
 * Un runtime es una gramática técnica, no la identidad del juego completo.
 * Dos experiencias pueden compartirlo durante un prototipo y separarse después.
 */
export type ExperienceRuntime =
  | 'topdown-phaser'
  | 'school-webgl'
  | 'dataflow-phaser'
  | 'platformer-phaser'
  | 'cosmos-web';

export interface ExperienceManifest {
  id: ExperienceId;
  title: string;
  discipline: string;
  status: 'playable' | 'planned';
  runtime: ExperienceRuntime;
  /** Salas que hoy pertenecen a esta experiencia. Vacío mientras sea conceptual. */
  rooms: readonly string[];
  /** Verbo que debe dominar la experiencia; evita que la estética sea sólo decoración. */
  learningVerb: string;
  fantasy: string;
  visualGrammar: {
    camera: string;
    style: string;
  };
}
