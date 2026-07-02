# Spec P1 — Runtime host (hito Delicado)

**Objetivo:** que las cinco experiencias convivan sobre el mismo shell. `main.ts` deja de
conocer Phaser; un `RuntimeHost` monta/desmonta runtimes bajo demanda. El gameplay actual
de Ohmdal/Instituto NO cambia en nada observable.

**Referencia de visión:** `docs/plan-plataforma-cinco-juegos.md` §4 (contrato) y §8 (P1).

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `src/experiences/types.ts` | AGREGAR tipos del contrato (no borrar los existentes) |
| `src/app/runtimeHost.ts` | NUEVO — host puro, sin DOM ni Phaser |
| `src/experiences/loaders.ts` | NUEVO — mapa de loaders lazy por runtime |
| `src/experiences/ohmdal/topdownRuntime.ts` | NUEVO — adaptador Phaser (boot movido desde main.ts) |
| `src/experiences/placeholderRuntime.ts` | NUEVO — runtime DOM para mundos `planned` |
| `src/experiences/registry.ts` | MODIFICAR — extraer helper `activateExperience` |
| `src/main.ts` | REESCRIBIR — usa el host; prohibido `import Phaser` |
| `tests/a1-runtime-host.test.ts` | NUEVO — test del host con runtimes falsos |

No tocar: `src/jugar/*`, `src/state.ts`, `src/ui/*`, `src/puzzles/*`, `src/audio.ts`,
`src/experiences/manifests.ts`.

---

## 1. Tipos nuevos en `src/experiences/types.ts`

Agregar al final, textual:

```ts
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
```

## 2. `src/app/runtimeHost.ts` (nuevo, puro)

Reglas duras: este archivo NO importa Phaser, NO importa `loaders.ts`, NO toca `document`
ni `window`. Solo importa tipos y `experienceById` de `../experiences/registry.ts`.
Debe poder ejecutarse en Node (los tests le inyectan loaders falsos y un hostEl falso).

```ts
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

export function createRuntimeHost(hostEl: HTMLElement, loaders: RuntimeLoaderMap): RuntimeHost;
```

Comportamiento exigido:

- El runtime destino se resuelve con `experienceById(destination.experienceId).runtime`.
- Módulos cargados se cachean: dos viajes al mismo runtime llaman al loader UNA vez.
- `travel` same-runtime: delega en `handle.travelTo(destination)`; no desmonta.
- `travel` cross-runtime: `snapshot()` y guardarlo, `await handle.destroy()`, cargar,
  `mount(hostEl, context)` con `context.initialLocation = destination`.
- `context.requestTravel` delega en `travel` del host (cuidado con la recursión: debe
  pasar por la misma serialización).
- Transiciones serializadas: si llega un `travel` mientras otro está en curso, se encadena
  (await del anterior). Nunca dos mounts en paralelo.
- Error en loader o mount durante un cross-runtime: el runtime anterior ya fue destruido →
  `activeRuntime()` queda `null` y el error se relanza al caller. No reintentar solo.
- `start` sobre host ya activo → `throw new Error('RuntimeHost ya está activo')`.

## 3. `src/experiences/registry.ts` — helper

Refactor mínimo: extraer de `activateExperienceForRoom` un helper exportado
`activateExperience(experience: ExperienceManifest | null, roomId: string | null)` que haga
el `dataset` + `CustomEvent` actuales; `activateExperienceForRoom` lo llama con
`(experienceOfRoom(roomId), roomId)`. Ningún cambio de comportamiento: mismos datasets,
mismo evento `roxana:experiencechange` con el mismo `detail`.

## 4. `src/experiences/ohmdal/topdownRuntime.ts` (nuevo)

Mueve el boot de Phaser que hoy vive en `main.ts` (config idéntica: `type`, `width: W`,
`height: H`, `backgroundColor: '#0e0d12'`, `scene: [ExplorationScene]`, `scale`), con
`parent: hostEl` (Phaser acepta HTMLElement).

```ts
export const topdownRuntime: ExperienceRuntimeModule = {
  runtime: 'topdown-phaser',
  async mount(hostEl, context) { ... }
};
```

- Al montar: `activateExperienceForRoom(state.room)` (igual que hoy en `main.ts`).
  La escena ya lee `state.room`; `context.initialLocation` no se usa todavía —
  dejar comentario: `// P2: initialLocation reemplazará la lectura directa de state.room`.
- Conservar el handle DEV: `if (import.meta.env.DEV) (window as any).__game = game;`.
- Handle:
  - `travelTo({ roomId, spawn })`: si hay `roomId`, `hooks.goto(roomId, spawn)`.
  - `snapshot()`: `{ runtime: 'topdown-phaser', data: { room: state.room } }`.
  - `pause()`: `game.loop.sleep()`; `resume()`: `game.loop.wake()`.
  - `destroy()`: promesa que resuelve en `game.events.once(Phaser.Core.Events.DESTROY, ...)`
    y llama `game.destroy(true)` (true = remover canvas).

## 5. `src/experiences/placeholderRuntime.ts` (nuevo)

Runtime DOM mínimo para mundos `planned`. Exporta una factory:

```ts
export function placeholderRuntime(runtime: ExperienceRuntime, experienceId: ExperienceId): ExperienceRuntimeModule;
```

- `mount`: crea un `<div class="runtime-placeholder">` dentro de `hostEl` con, textual:
  - `<h1>` = `experienceById(experienceId).title`
  - `<p class="fantasy">` = `experienceById(experienceId).fantasy`
  - `<p>` = `Este mundo todavía está en construcción.`
  - `<button>` = `Volver al Instituto` → `context.requestTravel({ experienceId: 'instituto' })`
- Al montar llama `activateExperience(experienceById(experienceId), null)`.
- `destroy()`: remueve el div. `snapshot()`: `{ runtime, data: {} }`. `pause/resume`: no-op.
- Estilos: agregar al final de `src/styles.css` un bloque `.runtime-placeholder` sobrio
  (centrado, tipografía existente, fondo `#0e0d12`). Sin inventar paleta nueva.

## 6. `src/experiences/loaders.ts` (nuevo)

```ts
export const runtimeLoaders: RuntimeLoaderMap = {
  'topdown-phaser': () => import('./ohmdal/topdownRuntime.ts').then((m) => m.topdownRuntime),
  'school-webgl':   () => import('./placeholderRuntime.ts').then((m) => m.placeholderRuntime('school-webgl', 'instituto')),
  'dataflow-phaser':() => import('./placeholderRuntime.ts').then((m) => m.placeholderRuntime('dataflow-phaser', 'bitland')),
  'platformer-phaser':() => import('./placeholderRuntime.ts').then((m) => m.placeholderRuntime('platformer-phaser', 'physica')),
  'cosmos-web':     () => import('./placeholderRuntime.ts').then((m) => m.placeholderRuntime('cosmos-web', 'arithmos')),
};
```

Todos los `import()` dinámicos: visitar Ohmdal no debe descargar código de otros mundos.

## 7. `src/main.ts` (reescritura)

- Se mantiene TODO el flujo de título/continue/new, `initDialog/initBitacora/initAudioButton`,
  `initAudio()` en el gesto de click, `showBitacoraButton()` si `hasBitacora`.
- `startGame()` pasa a:
  ```ts
  const host = createRuntimeHost(el('game'), runtimeLoaders);
  const experience = experienceOfRoom(state.room) ?? experienceById('instituto');
  void host.start({ experienceId: experience.id, roomId: state.room });
  if (import.meta.env.DEV) {
    (window as any).__travel = (experienceId: ExperienceId, roomId?: string) =>
      host.travel({ experienceId, roomId });
  }
  ```
- Prohibido: `import Phaser`, `import { ExplorationScene ... }`.

## 8. `tests/a1-runtime-host.test.ts` (nuevo)

Estilo y arnés: imitar `tests/a0-experience-registry.test.ts` (asserts, `.ts` imports,
corre con `node --experimental-strip-types`). El test NO importa Phaser ni loaders reales:
inyecta un `RuntimeLoaderMap` de mentira con módulos falsos que registran llamadas, y un
`hostEl` falso (`{} as HTMLElement`). Casos mínimos:

1. `start({experienceId:'ohmdal'})` monta el módulo del runtime `topdown-phaser` y
   `activeRuntime() === 'topdown-phaser'`.
2. `travel` same-runtime (`ohmdal`, roomId `plaza`) → `travelTo` llamado, `destroy` NO.
3. `travel` a `bitland` → orden estricto: `snapshot` → `destroy` → `mount` del nuevo;
   `lastSnapshot('topdown-phaser')` devuelve el snapshot.
4. Volver a `ohmdal` → el loader de `topdown-phaser` se llamó UNA sola vez en total (cache).
5. `requestTravel` recibido por un módulo falso viaja de verdad (cross-runtime).
6. Loader que rechaza → `travel` rechaza y `activeRuntime() === null`.
7. `start` dos veces → lanza.

---

## Reglas duras (obligatorias)

- Texto visible al jugador: SOLO el especificado arriba, textual. Nada inventado.
- Sin dependencias nuevas. Sin commit. Español neutro en comentarios.
- Imports dentro de `src/experiences/` con extensión `.ts` (como `registry.ts` actual);
  en `main.ts` respetar el estilo existente del archivo.
- Spec ambigua o contradictoria → frenar y reportar con `// TODO(spec)`, no inventar.
- Verificación del ejecutor antes de reportar: `npm run build` y
  `node --experimental-strip-types tests/a1-runtime-host.test.ts` en verde.
