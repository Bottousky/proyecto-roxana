/** Identidad estable de cada lenguaje jugable de Proyecto Roxana. */
export type ExperienceId = 'instituto' | 'ohmdal' | 'bitland' | 'physica' | 'arithmos';

/**
 * Un runtime es una gramática técnica, no la identidad del juego completo.
 * Dos experiencias pueden compartirlo durante un prototipo y separarse después.
 */
export type ExperienceRuntime =
  | 'topdown-phaser'
  | 'dataflow-phaser'
  | 'platformer-phaser'
  | 'platformer-three'
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

/** Destino de un viaje entre o dentro de experiencias. */
export interface ExperienceLocation {
  experienceId: ExperienceId;
  /** Sala destino dentro del runtime (si aplica). */
  roomId?: string;
  spawn?: { x: number; y: number };
}

/** Estado espacial privado que un runtime entrega al shell antes de desmontarse. */
export interface RuntimeSnapshot {
  runtime: ExperienceRuntime;
  data: Record<string, unknown>;
}

/** Servicios que el shell presta al runtime. El runtime nunca escribe el save global. */
export interface RuntimeContext {
  /** Dónde debe aparecer el jugador al montar. */
  initialLocation: ExperienceLocation;
  /** Pedir al shell un viaje (puede cruzar de runtime). */
  requestTravel(destination: ExperienceLocation): Promise<void>;
}

export interface RuntimeHandle {
  /** Viaje dentro del mismo runtime, sin desmontar. */
  travelTo(destination: ExperienceLocation): Promise<void>;
  snapshot(): RuntimeSnapshot;
  pause(): void;
  resume(): void;
  destroy(): Promise<void>;
}

export interface ExperienceRuntimeModule {
  runtime: ExperienceRuntime;
  mount(host: HTMLElement, context: RuntimeContext): Promise<RuntimeHandle>;
}

export type RuntimeLoader = () => Promise<ExperienceRuntimeModule>;
export type RuntimeLoaderMap = Record<ExperienceRuntime, RuntimeLoader>;
