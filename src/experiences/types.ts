/** Identidad estable de cada lenguaje jugable de Proyecto Roxana. */
export type ExperienceId = 'instituto' | 'ohmdal' | 'bitland' | 'physica' | 'arithmos';

/**
 * Un runtime es una gramática técnica, no la identidad del juego completo.
 * Dos experiencias pueden compartirlo durante un prototipo y separarse después.
 */
export type ExperienceRuntime =
  | 'topdown-phaser'
  | 'hd2d-three'
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

/** Destino de un viaje entre o dentro de experiencias. */
export interface ExperienceLocation {
  experienceId: ExperienceId;
  /** Sala destino dentro del runtime (si aplica). */
  roomId?: string;
  spawn?: { x: number; y: number };
  /**
   * Qué gramática técnica debe servir esta ubicación. Ausente, gana la del manifest.
   *
   * Existe porque durante el slice H3 una misma experiencia necesita dos runtimes a la vez:
   * Ohmdal se juega en `topdown-phaser` y se prototipa en `hd2d-three`. El registro de
   * experiencias modela los cinco lenguajes jugables, no los laboratorios, así que el
   * laboratorio no gana una entrada propia: la pide quien abre el viaje (`CP-021`).
   *
   * Es aditivo: sin el campo, el comportamiento es idéntico al anterior.
   */
  runtime?: ExperienceRuntime;
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
