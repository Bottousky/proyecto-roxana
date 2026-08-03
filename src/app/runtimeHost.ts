// Host puro del shell: monta/desmonta runtimes de experiencias bajo demanda.
// No importa Phaser ni loaders.ts, no toca document/window: debe poder correr en Node
// (los tests le inyectan loaders falsos y un hostEl falso).
import { experienceById } from '../experiences/registry.ts';
import type {
  ExperienceLocation,
  ExperienceRuntime,
  ExperienceRuntimeModule,
  RuntimeContext,
  RuntimeHandle,
  RuntimeLoaderMap,
  RuntimeSnapshot,
} from '../experiences/types.ts';

export interface RuntimeHost {
  /** Monta el runtime de la experiencia destino. Falla si ya hay uno activo. */
  start(location: ExperienceLocation): Promise<void>;
  /** Viaje same-runtime → travelTo; cross-runtime → snapshot + destroy + mount. */
  travel(destination: ExperienceLocation): Promise<void>;
  activeRuntime(): ExperienceRuntime | null;
  /** Último snapshot capturado de un runtime desmontado. */
  lastSnapshot(runtime: ExperienceRuntime): RuntimeSnapshot | undefined;
  destroy(): Promise<void>;
}

export function createRuntimeHost(hostEl: HTMLElement, loaders: RuntimeLoaderMap): RuntimeHost {
  // Módulos ya cargados, cacheados por runtime: dos viajes al mismo runtime
  // llaman al loader una sola vez.
  const modules = new Map<ExperienceRuntime, ExperienceRuntimeModule>();
  const snapshots = new Map<ExperienceRuntime, RuntimeSnapshot>();

  let current: { runtime: ExperienceRuntime; handle: RuntimeHandle } | null = null;

  // Cola de serialización: cualquier transición (start o travel) espera a que
  // termine la anterior antes de empezar. Nunca dos mounts en paralelo.
  let chain: Promise<void> = Promise.resolve();

  function runSerialized<T>(task: () => Promise<T>): Promise<T> {
    const result = chain.then(task, task);
    // Encadenamos ignorando el resultado/error para que la siguiente tarea
    // arranque igual, pero el caller de esta tarea sí recibe el rechazo real.
    chain = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  // Qué runtime sirve una ubicación. El manifest decide salvo que la ubicación nombre otro:
  // durante el slice H3, Ohmdal se juega en `topdown-phaser` y se prototipa en `hd2d-three`
  // sin que el registro de experiencias gane una entrada falsa (`CP-021`).
  function resolveRuntime(location: ExperienceLocation): ExperienceRuntime {
    return location.runtime ?? experienceById(location.experienceId).runtime;
  }

  async function loadModule(runtime: ExperienceRuntime): Promise<ExperienceRuntimeModule> {
    const cached = modules.get(runtime);
    if (cached) return cached;
    const loaded = await loaders[runtime]();
    modules.set(runtime, loaded);
    return loaded;
  }

  function makeContext(initialLocation: ExperienceLocation): RuntimeContext {
    return {
      initialLocation,
      // El runtime pide viajar; pasa por la misma serialización que un travel externo.
      requestTravel: (destination) => runSerialized(() => doTravel(destination)),
    };
  }

  async function mountAt(destination: ExperienceLocation): Promise<void> {
    const runtime = resolveRuntime(destination);
    const module = await loadModule(runtime);
    const handle = await module.mount(hostEl, makeContext(destination));
    current = { runtime, handle };
  }

  async function doStart(location: ExperienceLocation): Promise<void> {
    if (current) throw new Error('RuntimeHost ya está activo');
    await mountAt(location);
  }

  async function doTravel(destination: ExperienceLocation): Promise<void> {
    const targetRuntime = resolveRuntime(destination);

    if (current && current.runtime === targetRuntime) {
      // Viaje dentro del mismo runtime: no desmonta.
      await current.handle.travelTo(destination);
      return;
    }

    if (current) {
      const snapshot = current.handle.snapshot();
      snapshots.set(current.runtime, snapshot);
      const previous = current;
      current = null;
      await previous.handle.destroy();
    }

    // Si el loader o el mount fallan acá, el runtime anterior ya fue destruido:
    // activeRuntime() queda null y el error se relanza al caller. No reintentar solo.
    await mountAt(destination);
  }

  return {
    start(location) {
      return runSerialized(() => doStart(location));
    },
    travel(destination) {
      return runSerialized(() => doTravel(destination));
    },
    activeRuntime() {
      return current?.runtime ?? null;
    },
    lastSnapshot(runtime) {
      return snapshots.get(runtime);
    },
    destroy() {
      return runSerialized(async () => {
        if (!current) return;
        const previous = current;
        current = null;
        await previous.handle.destroy();
      });
    },
  };
}
